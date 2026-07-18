package com.example.admin_service.dashboard;

import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.common.exception.DownstreamUnavailableException;
import com.example.admin_service.dashboard.dto.SocialMetricsResponse;
import com.example.admin_service.report.ReportRepository;
import com.example.admin_service.report.ReportStatus;
import com.example.admin_service.user.IdentityAdminClient;
import com.example.admin_service.user.dto.AdminUserSummaryResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock IdentityAdminClient identityAdminClient;
    @Mock SocialAnalyticsClient socialAnalyticsClient;
    @Mock ReportRepository reportRepository;
    private DashboardService service;

    @BeforeEach
    void setUp() {
        service = new DashboardService(
            identityAdminClient,
            socialAnalyticsClient,
            reportRepository,
            Clock.fixed(Instant.parse("2026-07-18T00:00:00Z"), ZoneOffset.UTC),
            Duration.ofSeconds(30)
        );
        when(reportRepository.countByStatus(ReportStatus.PENDING)).thenReturn(4L);
        when(reportRepository.countByStatus(ReportStatus.REVIEWING)).thenReturn(2L);
    }

    @Test
    void aggregatesSummaryFromOwningServices() {
        when(identityAdminClient.getUserSummary()).thenReturn(ApiResponse.success("ok",
            new AdminUserSummaryResponse(100, 3, 10, 20, 2, 1, 1, 4)));
        when(socialAnalyticsClient.getMetrics()).thenReturn(ApiResponse.success("ok",
            new SocialMetricsResponse(50, 80, 120)));

        var result = service.getSummary();

        assertThat(result.totalUsers()).isEqualTo(100);
        assertThat(result.pendingReports()).isEqualTo(4);
        assertThat(result.reactions()).isEqualTo(120);
        assertThat(result.partialData()).isFalse();
    }

    @Test
    void returnsPartialSummaryWhenSocialIsUnavailable() {
        when(identityAdminClient.getUserSummary()).thenReturn(ApiResponse.success("ok",
            new AdminUserSummaryResponse(100, 3, 10, 20, 2, 1, 1, 4)));
        when(socialAnalyticsClient.getMetrics())
            .thenThrow(new DownstreamUnavailableException("Social service", new RuntimeException()));

        var result = service.getSummary();

        assertThat(result.partialData()).isTrue();
        assertThat(result.unavailableComponents()).containsExactly("social");
        assertThat(result.posts()).isZero();
    }
}
