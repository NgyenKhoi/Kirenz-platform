package com.example.admin_service.report;

import com.example.admin_service.common.exception.BadRequestException;
import com.example.admin_service.report.dto.CreateReportRequest;
import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.common.exception.DownstreamUnavailableException;
import com.example.admin_service.social.SocialModerationClient;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private SocialModerationClient socialModerationClient;

    private ReportService reportService;

    @BeforeEach
    void setUp() {
        reportService = new ReportService(reportRepository, new ReportMapper(), socialModerationClient);
    }

    @Test
    void createsNormalizedReport() {
        UUID reporterId = UUID.randomUUID();
        var request = new CreateReportRequest(ReportTargetType.POST, " post-1 ", ReportReason.SPAM, " repeated spam ");
        when(reportRepository.existsByReporterIdAndTargetTypeAndTargetIdAndStatusIn(
            any(), any(), any(), any()
        )).thenReturn(false);
        when(reportRepository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = reportService.create(reporterId, request);

        assertThat(response.reporterId()).isEqualTo(reporterId);
        assertThat(response.targetId()).isEqualTo("post-1");
        assertThat(response.description()).isEqualTo("repeated spam");
        assertThat(response.status()).isEqualTo(ReportStatus.PENDING);
    }

    @Test
    void rejectsDuplicateOpenReport() {
        UUID reporterId = UUID.randomUUID();
        var request = new CreateReportRequest(ReportTargetType.USER, UUID.randomUUID().toString(), ReportReason.HARASSMENT, null);
        when(reportRepository.existsByReporterIdAndTargetTypeAndTargetIdAndStatusIn(
            any(), any(), any(), any()
        )).thenReturn(true);

        assertThatThrownBy(() -> reportService.create(reporterId, request))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("You already have an open report for this target");
        verify(reportRepository, never()).saveAndFlush(any());
    }

    @Test
    void returnsAdminDetailWithAggregateCount() {
        UUID reportId = UUID.randomUUID();
        Report report = Report.builder()
            .id(reportId)
            .reporterId(UUID.randomUUID())
            .targetType(ReportTargetType.COMMENT)
            .targetId("comment-1")
            .reason(ReportReason.HATE_SPEECH)
            .status(ReportStatus.PENDING)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));
        when(reportRepository.countByTargetTypeAndTargetId(ReportTargetType.COMMENT, "comment-1")).thenReturn(3L);
        when(socialModerationClient.getContent("COMMENT", "comment-1"))
            .thenReturn(ApiResponse.success("found", null));

        var detail = reportService.getAdminDetail(reportId);

        assertThat(detail.report().id()).isEqualTo(reportId);
        assertThat(detail.aggregateReportCount()).isEqualTo(3);
        assertThat(detail.partialData()).isFalse();
    }

    @Test
    void returnsPartialAdminDetailWhenSocialServiceIsUnavailable() {
        UUID reportId = UUID.randomUUID();
        Report report = Report.builder()
            .id(reportId)
            .reporterId(UUID.randomUUID())
            .targetType(ReportTargetType.POST)
            .targetId("post-1")
            .reason(ReportReason.SPAM)
            .status(ReportStatus.PENDING)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));
        when(reportRepository.countByTargetTypeAndTargetId(ReportTargetType.POST, "post-1")).thenReturn(2L);
        when(socialModerationClient.getContent("POST", "post-1"))
            .thenThrow(new DownstreamUnavailableException("Social service", new RuntimeException()));

        var detail = reportService.getAdminDetail(reportId);

        assertThat(detail.report().id()).isEqualTo(reportId);
        assertThat(detail.aggregateReportCount()).isEqualTo(2);
        assertThat(detail.partialData()).isTrue();
        assertThat(detail.unavailableComponents()).containsExactly("social-service");
    }
}
