package com.example.admin_service.report;

import com.example.admin_service.audit.AdminActionService;
import com.example.admin_service.audit.AdminActionType;
import com.example.admin_service.audit.AdminTargetType;
import com.example.admin_service.common.exception.BadRequestException;
import com.example.admin_service.common.exception.NotFoundException;
import com.example.admin_service.report.dto.ReportDecisionRequest;
import com.example.admin_service.report.dto.ReportResponse;
import com.example.admin_service.report.dto.ReviewReportRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportWorkflowService {

    private final ReportRepository reportRepository;
    private final ReportMapper reportMapper;
    private final AdminActionService adminActionService;
    private final Clock clock;

    @Transactional
    public ReportResponse startReview(UUID adminId, UUID reportId, ReviewReportRequest request) {
        Report report = load(reportId);
        apply(() -> report.startReview(adminId, normalize(request.adminNote())));
        Report saved = save(report);
        adminActionService.record(adminId, AdminActionType.REPORT_REVIEW_STARTED, AdminTargetType.REPORT,
            reportId.toString(), null, normalize(request.adminNote()));
        return reportMapper.toResponse(saved);
    }

    @Transactional
    public ReportResponse dismiss(UUID adminId, UUID reportId, ReportDecisionRequest request) {
        Report report = load(reportId);
        String note = normalize(request.adminNote());
        apply(() -> report.dismiss(adminId, request.moderationReason(), note, Instant.now(clock)));
        Report saved = save(report);
        adminActionService.record(adminId, AdminActionType.REPORT_DISMISSED, AdminTargetType.REPORT,
            reportId.toString(), request.moderationReason().name(), note);
        return reportMapper.toResponse(saved);
    }

    @Transactional
    public ReportResponse resolveAfterModeration(
        UUID adminId,
        UUID reportId,
        ReportResolution outcome,
        ReportDecisionRequest request
    ) {
        Report report = load(reportId);
        String note = normalize(request.adminNote());
        apply(() -> report.resolve(adminId, outcome, request.moderationReason(), note, Instant.now(clock)));
        Report saved = save(report);
        adminActionService.record(adminId, AdminActionType.REPORT_RESOLVED, AdminTargetType.REPORT,
            reportId.toString(), request.moderationReason().name(), note);
        return reportMapper.toResponse(saved);
    }

    private Report load(UUID reportId) {
        return reportRepository.findById(reportId)
            .orElseThrow(() -> new NotFoundException("Report not found"));
    }

    private Report save(Report report) {
        try {
            return reportRepository.saveAndFlush(report);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new BadRequestException("Report was updated by another administrator; refresh and try again");
        }
    }

    private void apply(Runnable transition) {
        try {
            transition.run();
        } catch (IllegalStateException | IllegalArgumentException ex) {
            throw new BadRequestException(ex.getMessage());
        }
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
