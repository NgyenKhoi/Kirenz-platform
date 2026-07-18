package com.example.admin_service.report;

import com.example.admin_service.audit.AdminActionService;
import com.example.admin_service.audit.AdminActionType;
import com.example.admin_service.audit.AdminTargetType;
import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.common.exception.BadRequestException;
import com.example.admin_service.report.dto.ReportDecisionRequest;
import com.example.admin_service.report.dto.ReportResponse;
import com.example.admin_service.report.dto.ResolveReportRequest;
import com.example.admin_service.social.SocialModerationClient;
import com.example.admin_service.social.dto.SocialModerationCommandResponse;
import com.example.admin_service.user.AdminUserManagementService;
import com.example.admin_service.user.dto.AdminSuspendRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportResolutionServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private SocialModerationClient socialModerationClient;

    @Mock
    private ReportWorkflowService reportWorkflowService;

    @Mock
    private AdminActionService adminActionService;

    @Mock
    private AdminUserManagementService adminUserManagementService;

    private ReportResolutionService resolutionService;

    @BeforeEach
    void setUp() {
        resolutionService = new ReportResolutionService(reportRepository, socialModerationClient,
            reportWorkflowService, adminActionService, adminUserManagementService);
    }

    @Test
    void removesContentBeforeResolvingAndAuditingReport() {
        UUID adminId = UUID.randomUUID();
        Report report = report(ReportTargetType.POST, ReportStatus.REVIEWING);
        var request = new ResolveReportRequest(ReportResolutionAction.REMOVE_CONTENT,
            ModerationReason.HATE_SPEECH, " confirmed ", null);
        ReportResponse resolved = response(report, ReportResolution.CONTENT_REMOVED);
        when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));
        when(socialModerationClient.remove(eq("POST"), eq("post-1"), any()))
            .thenReturn(ApiResponse.success("removed", new SocialModerationCommandResponse(null, "ACTIVE")));
        when(reportWorkflowService.resolveAfterModeration(eq(adminId), eq(report.getId()),
            eq(ReportResolution.CONTENT_REMOVED), any(ReportDecisionRequest.class))).thenReturn(resolved);

        var result = resolutionService.resolve(adminId, report.getId(), request);

        assertThat(result.resolution()).isEqualTo(ReportResolution.CONTENT_REMOVED);
        verify(adminActionService).record(adminId, AdminActionType.CONTENT_REMOVED, AdminTargetType.POST,
            "post-1", "HATE_SPEECH", "confirmed");
        verify(reportWorkflowService).resolveAfterModeration(eq(adminId), eq(report.getId()),
            eq(ReportResolution.CONTENT_REMOVED), any(ReportDecisionRequest.class));
    }

    @Test
    void doesNotResolveOrAuditWhenSocialCommandFails() {
        UUID adminId = UUID.randomUUID();
        Report report = report(ReportTargetType.COMMENT, ReportStatus.PENDING);
        var request = new ResolveReportRequest(ReportResolutionAction.HIDE_CONTENT,
            ModerationReason.HARASSMENT, null, null);
        when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));
        when(socialModerationClient.hide(eq("COMMENT"), eq("post-1"), any()))
            .thenThrow(new RuntimeException("social unavailable"));

        assertThatThrownBy(() -> resolutionService.resolve(adminId, report.getId(), request))
            .hasMessage("social unavailable");
        verify(adminActionService, never()).record(any(), any(), any(), any(), any(), any());
        verify(reportWorkflowService, never()).resolveAfterModeration(any(), any(), any(), any());
    }

    @Test
    void rejectsContentActionForUserReportBeforeCallingSocial() {
        Report report = report(ReportTargetType.USER, ReportStatus.PENDING);
        when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));

        assertThatThrownBy(() -> resolutionService.resolve(UUID.randomUUID(), report.getId(),
            new ResolveReportRequest(ReportResolutionAction.REMOVE_CONTENT, ModerationReason.OTHER, null, null)))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("only post or comment");
        verify(socialModerationClient, never()).remove(any(), any(), any());
    }

    @Test
    void suspendsReportedUserThenResolvesReport() {
        UUID adminId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Instant suspendedUntil = Instant.now().plusSeconds(3600);
        Report report = userReport(userId);
        var request = new ResolveReportRequest(ReportResolutionAction.SUSPEND_USER,
            ModerationReason.HARASSMENT, "Repeated abuse", suspendedUntil);
        when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));
        when(reportWorkflowService.resolveAfterModeration(eq(adminId), eq(report.getId()),
            eq(ReportResolution.USER_SUSPENDED), any())).thenReturn(response(report, ReportResolution.USER_SUSPENDED));

        var result = resolutionService.resolve(adminId, report.getId(), request);

        assertThat(result.resolution()).isEqualTo(ReportResolution.USER_SUSPENDED);
        verify(adminUserManagementService).suspend(eq(userId), any(AdminSuspendRequest.class));
        verify(reportWorkflowService).resolveAfterModeration(eq(adminId), eq(report.getId()),
            eq(ReportResolution.USER_SUSPENDED), any());
    }

    @Test
    void requiresEndTimeBeforeSuspendingReportedUser() {
        Report report = userReport(UUID.randomUUID());
        when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));

        assertThatThrownBy(() -> resolutionService.resolve(UUID.randomUUID(), report.getId(),
            new ResolveReportRequest(ReportResolutionAction.SUSPEND_USER, ModerationReason.SPAM, null, null)))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("Suspension end time is required");
        verify(adminUserManagementService, never()).suspend(any(), any());
        verify(reportWorkflowService, never()).resolveAfterModeration(any(), any(), any(), any());
    }

    private Report report(ReportTargetType targetType, ReportStatus status) {
        return Report.builder()
            .id(UUID.randomUUID())
            .reporterId(UUID.randomUUID())
            .targetType(targetType)
            .targetId("post-1")
            .reason(ReportReason.HARASSMENT)
            .status(status)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
    }

    private Report userReport(UUID userId) {
        return Report.builder()
            .id(UUID.randomUUID())
            .reporterId(UUID.randomUUID())
            .targetType(ReportTargetType.USER)
            .targetId(userId.toString())
            .reason(ReportReason.HARASSMENT)
            .status(ReportStatus.REVIEWING)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
    }

    private ReportResponse response(Report report, ReportResolution resolution) {
        return new ReportResponse(report.getId(), report.getReporterId(), report.getTargetType(),
            report.getTargetId(), report.getReason(), report.getDescription(), ReportStatus.RESOLVED,
            resolution, report.getCreatedAt(), report.getUpdatedAt());
    }
}
