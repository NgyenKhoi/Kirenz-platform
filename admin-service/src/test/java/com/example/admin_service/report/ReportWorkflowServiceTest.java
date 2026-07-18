package com.example.admin_service.report;

import com.example.admin_service.audit.AdminActionService;
import com.example.admin_service.audit.AdminActionType;
import com.example.admin_service.audit.AdminTargetType;
import com.example.admin_service.common.exception.BadRequestException;
import com.example.admin_service.report.dto.ReportDecisionRequest;
import com.example.admin_service.report.dto.ReviewReportRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
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
class ReportWorkflowServiceTest {

    private static final Instant NOW = Instant.parse("2026-07-18T12:00:00Z");

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private AdminActionService adminActionService;

    private ReportWorkflowService workflowService;

    @BeforeEach
    void setUp() {
        workflowService = new ReportWorkflowService(reportRepository, new ReportMapper(), adminActionService,
            Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void startsReviewAndRecordsAudit() {
        UUID adminId = UUID.randomUUID();
        Report report = report(ReportStatus.PENDING);
        when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));
        when(reportRepository.saveAndFlush(report)).thenReturn(report);

        var response = workflowService.startReview(adminId, report.getId(), new ReviewReportRequest(" checking context "));

        assertThat(response.status()).isEqualTo(ReportStatus.REVIEWING);
        assertThat(report.getAssignedAdminId()).isEqualTo(adminId);
        assertThat(report.getAdminNote()).isEqualTo("checking context");
        verify(adminActionService).record(adminId, AdminActionType.REPORT_REVIEW_STARTED,
            AdminTargetType.REPORT, report.getId().toString(), null, "checking context");
    }

    @Test
    void dismissesOpenReportAndRecordsStructuredReason() {
        UUID adminId = UUID.randomUUID();
        Report report = report(ReportStatus.REVIEWING);
        when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));
        when(reportRepository.saveAndFlush(report)).thenReturn(report);

        var response = workflowService.dismiss(adminId, report.getId(),
            new ReportDecisionRequest(ModerationReason.OTHER, " no violation "));

        assertThat(response.status()).isEqualTo(ReportStatus.DISMISSED);
        assertThat(response.resolution()).isEqualTo(ReportResolution.NO_VIOLATION);
        assertThat(report.getResolvedAt()).isEqualTo(NOW);
        verify(adminActionService).record(adminId, AdminActionType.REPORT_DISMISSED,
            AdminTargetType.REPORT, report.getId().toString(), "OTHER", "no violation");
    }

    @Test
    void rejectsTransitionFromClosedReportWithoutAudit() {
        UUID adminId = UUID.randomUUID();
        Report report = report(ReportStatus.RESOLVED);
        when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));

        assertThatThrownBy(() -> workflowService.dismiss(adminId, report.getId(),
            new ReportDecisionRequest(ModerationReason.SPAM, null)))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("Report is already closed");
        verify(adminActionService, never()).record(any(), any(), any(), any(), any(), any());
    }

    @Test
    void returnsControlledConflictAndDoesNotAudit() {
        UUID adminId = UUID.randomUUID();
        Report report = report(ReportStatus.PENDING);
        when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));
        when(reportRepository.saveAndFlush(report))
            .thenThrow(new ObjectOptimisticLockingFailureException(Report.class, report.getId()));

        assertThatThrownBy(() -> workflowService.startReview(adminId, report.getId(), new ReviewReportRequest(null)))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("updated by another administrator");
        verify(adminActionService, never()).record(any(), any(), any(), any(), any(), any());
    }

    @Test
    void resolvesOnlyAfterSuccessfulModerationOrchestration() {
        UUID adminId = UUID.randomUUID();
        Report report = report(ReportStatus.REVIEWING);
        when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));
        when(reportRepository.saveAndFlush(report)).thenReturn(report);

        var response = workflowService.resolveAfterModeration(adminId, report.getId(),
            ReportResolution.CONTENT_REMOVED,
            new ReportDecisionRequest(ModerationReason.HATE_SPEECH, "confirmed"));

        assertThat(response.status()).isEqualTo(ReportStatus.RESOLVED);
        assertThat(response.resolution()).isEqualTo(ReportResolution.CONTENT_REMOVED);
        verify(adminActionService).record(eq(adminId), eq(AdminActionType.REPORT_RESOLVED),
            eq(AdminTargetType.REPORT), eq(report.getId().toString()), eq("HATE_SPEECH"), eq("confirmed"));
    }

    private Report report(ReportStatus status) {
        return Report.builder()
            .id(UUID.randomUUID())
            .reporterId(UUID.randomUUID())
            .targetType(ReportTargetType.POST)
            .targetId("post-1")
            .reason(ReportReason.SPAM)
            .status(status)
            .createdAt(NOW.minusSeconds(3600))
            .updatedAt(NOW.minusSeconds(3600))
            .build();
    }
}
