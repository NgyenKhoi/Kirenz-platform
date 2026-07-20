package com.example.admin_service.report;

import com.example.admin_service.audit.AdminActionService;
import com.example.admin_service.audit.AdminActionType;
import com.example.admin_service.audit.AdminTargetType;
import com.example.admin_service.common.exception.BadRequestException;
import com.example.admin_service.common.exception.NotFoundException;
import com.example.admin_service.report.dto.ReportDecisionRequest;
import com.example.admin_service.report.dto.ReportResponse;
import com.example.admin_service.report.dto.ResolveReportRequest;
import com.example.admin_service.social.SocialModerationClient;
import com.example.admin_service.social.dto.SocialModerationRequest;
import com.example.admin_service.user.AdminUserManagementService;
import com.example.admin_service.user.dto.AdminSuspendRequest;
import com.example.admin_service.user.dto.AdminUserActionRequest;
import com.example.admin_service.user.dto.AdminWarningRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportResolutionService {

    private final ReportRepository reportRepository;
    private final SocialModerationClient socialModerationClient;
    private final ReportWorkflowService reportWorkflowService;
    private final AdminActionService adminActionService;
    private final AdminUserManagementService adminUserManagementService;

    public ReportResponse resolve(UUID adminId, UUID reportId, ResolveReportRequest request) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new NotFoundException("Report not found"));
        validateOpen(report);

        ReportResolution outcome = isContentAction(request.action())
            ? moderateContent(adminId, report, request)
            : moderateUser(report, request);

        return reportWorkflowService.resolveAfterModeration(adminId, reportId, outcome,
            new ReportDecisionRequest(request.moderationReason(), normalize(request.adminNote())));
    }

    private ReportResolution moderateContent(UUID adminId, Report report, ResolveReportRequest request) {
        validateContentTarget(report);

        String targetType = report.getTargetType().name();
        String note = normalize(request.adminNote());
        var socialRequest = new SocialModerationRequest(request.moderationReason().name(), note);

        AdminActionType actionType;
        ReportResolution outcome;
        if (request.action() == ReportResolutionAction.HIDE_CONTENT) {
            socialModerationClient.hide(targetType, report.getTargetId(), socialRequest);
            outcome = ReportResolution.CONTENT_HIDDEN;
            actionType = AdminActionType.CONTENT_HIDDEN;
        } else {
            socialModerationClient.remove(targetType, report.getTargetId(), socialRequest);
            outcome = ReportResolution.CONTENT_REMOVED;
            actionType = AdminActionType.CONTENT_REMOVED;
        }

        adminActionService.record(adminId, actionType, toAuditTarget(report.getTargetType()),
            report.getTargetId(), request.moderationReason().name(), note);
        return outcome;
    }

    private ReportResolution moderateUser(Report report, ResolveReportRequest request) {
        if (report.getTargetType() != ReportTargetType.USER) {
            throw new BadRequestException("This moderation action supports only user reports");
        }
        UUID userId;
        try {
            userId = UUID.fromString(report.getTargetId());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Reported user ID is invalid");
        }

        String reason = request.moderationReason().name();
        String note = normalize(request.adminNote());
        return switch (request.action()) {
            case SEND_WARNING -> {
                adminUserManagementService.sendWarning(userId, new AdminWarningRequest(
                    reason, "Your account received a moderation warning.", note, request.evidenceUrl()));
                yield ReportResolution.USER_WARNED;
            }
            case SUSPEND_USER -> {
                if (request.suspendedUntil() == null) {
                    throw new BadRequestException("Suspension end time is required");
                }
                adminUserManagementService.suspend(userId,
                    new AdminSuspendRequest(request.suspendedUntil(), reason, note, request.evidenceUrl()));
                yield ReportResolution.USER_SUSPENDED;
            }
            case BAN_USER -> {
                adminUserManagementService.ban(userId, new AdminUserActionRequest(reason, note, request.evidenceUrl()));
                yield ReportResolution.USER_BANNED;
            }
            default -> throw new BadRequestException("Unsupported user moderation action");
        };
    }

    private void validateContentTarget(Report report) {
        if (report.getTargetType() != ReportTargetType.POST && report.getTargetType() != ReportTargetType.COMMENT) {
            throw new BadRequestException("This moderation action supports only post or comment reports");
        }
    }

    private void validateOpen(Report report) {
        if (report.getStatus() == ReportStatus.RESOLVED || report.getStatus() == ReportStatus.DISMISSED) {
            throw new BadRequestException("Report is already closed");
        }
    }

    private boolean isContentAction(ReportResolutionAction action) {
        return action == ReportResolutionAction.HIDE_CONTENT || action == ReportResolutionAction.REMOVE_CONTENT;
    }

    private AdminTargetType toAuditTarget(ReportTargetType targetType) {
        return targetType == ReportTargetType.POST ? AdminTargetType.POST : AdminTargetType.COMMENT;
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
