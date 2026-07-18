package com.example.admin_service.dashboard;

import com.example.admin_service.common.exception.DownstreamUnavailableException;
import com.example.admin_service.dashboard.dto.ContentGrowthPointResponse;
import com.example.admin_service.dashboard.dto.DashboardSeriesResponse;
import com.example.admin_service.dashboard.dto.DashboardSummaryResponse;
import com.example.admin_service.dashboard.dto.GrowthPointResponse;
import com.example.admin_service.dashboard.dto.SocialMetricsResponse;
import com.example.admin_service.report.ReportRepository;
import com.example.admin_service.report.ReportStatus;
import com.example.admin_service.user.IdentityAdminClient;
import com.example.admin_service.user.dto.AdminUserSummaryResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

@Service
public class DashboardService {

    private final IdentityAdminClient identityAdminClient;
    private final SocialAnalyticsClient socialAnalyticsClient;
    private final ReportRepository reportRepository;
    private final Clock clock;
    private final Duration cacheTtl;
    private final Map<String, CachedValue<?>> cache = new ConcurrentHashMap<>();

    public DashboardService(
        IdentityAdminClient identityAdminClient,
        SocialAnalyticsClient socialAnalyticsClient,
        ReportRepository reportRepository,
        Clock clock,
        @Value("${admin.dashboard-cache-ttl:PT30S}") Duration cacheTtl
    ) {
        this.identityAdminClient = identityAdminClient;
        this.socialAnalyticsClient = socialAnalyticsClient;
        this.reportRepository = reportRepository;
        this.clock = clock;
        this.cacheTtl = cacheTtl;
    }

    public DashboardSummaryResponse getSummary() {
        return cached("summary", this::loadSummary);
    }

    public DashboardSeriesResponse<GrowthPointResponse> getUserGrowth(
        LocalDate from, LocalDate to, String granularity
    ) {
        validateRange(from, to);
        String key = "users:" + from + ':' + to + ':' + granularity;
        return cached(key, () -> {
            try {
                List<GrowthPointResponse> data = identityAdminClient
                    .getUserGrowth(from, to, normalizeGranularity(granularity)).getData();
                return new DashboardSeriesResponse<>(data, false, List.of());
            } catch (DownstreamUnavailableException ex) {
                return new DashboardSeriesResponse<>(List.of(), true, List.of("identity"));
            }
        });
    }

    public DashboardSeriesResponse<ContentGrowthPointResponse> getContentGrowth(
        LocalDate from, LocalDate to, String granularity
    ) {
        validateRange(from, to);
        String key = "content:" + from + ':' + to + ':' + granularity;
        return cached(key, () -> {
            try {
                List<ContentGrowthPointResponse> data = socialAnalyticsClient
                    .getGrowth(from, to, normalizeGranularity(granularity)).getData();
                return new DashboardSeriesResponse<>(data, false, List.of());
            } catch (DownstreamUnavailableException ex) {
                return new DashboardSeriesResponse<>(List.of(), true, List.of("social"));
            }
        });
    }

    private DashboardSummaryResponse loadSummary() {
        AdminUserSummaryResponse users = null;
        SocialMetricsResponse social = null;
        List<String> unavailable = new java.util.ArrayList<>();
        try {
            users = identityAdminClient.getUserSummary().getData();
        } catch (DownstreamUnavailableException ex) {
            unavailable.add("identity");
        }
        try {
            social = socialAnalyticsClient.getMetrics().getData();
        } catch (DownstreamUnavailableException ex) {
            unavailable.add("social");
        }
        return new DashboardSummaryResponse(
            users == null ? 0 : users.totalRegistered(),
            users == null ? 0 : users.newToday(),
            users == null ? 0 : users.newThisWeek(),
            users == null ? 0 : users.newThisMonth(),
            users == null ? 0 : users.bannedAccounts(),
            users == null ? 0 : users.suspendedAccounts(),
            users == null ? 0 : users.deactivatedAccounts(),
            reportRepository.countByStatus(ReportStatus.PENDING),
            reportRepository.countByStatus(ReportStatus.REVIEWING),
            social == null ? 0 : social.posts(),
            social == null ? 0 : social.comments(),
            social == null ? 0 : social.reactions(),
            !unavailable.isEmpty(),
            List.copyOf(unavailable)
        );
    }

    private void validateRange(LocalDate from, LocalDate to) {
        if (from == null || to == null || to.isBefore(from) || from.plusYears(2).isBefore(to)) {
            throw new IllegalArgumentException("from and to are required, ordered, and limited to two years");
        }
    }

    private String normalizeGranularity(String granularity) {
        if ("DAY".equalsIgnoreCase(granularity) || "MONTH".equalsIgnoreCase(granularity)) {
            return granularity.toUpperCase();
        }
        throw new IllegalArgumentException("granularity must be DAY or MONTH");
    }

    @SuppressWarnings("unchecked")
    private <T> T cached(String key, Supplier<T> loader) {
        Instant now = clock.instant();
        CachedValue<?> current = cache.get(key);
        if (current != null && current.expiresAt().isAfter(now)) {
            return (T) current.value();
        }
        T value = loader.get();
        cache.put(key, new CachedValue<>(value, now.plus(cacheTtl)));
        return value;
    }

    private record CachedValue<T>(T value, Instant expiresAt) {
    }
}
