package com.example.admin_service.dashboard;

import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.common.exception.DownstreamUnavailableException;
import com.example.admin_service.dashboard.dto.ContentGrowthPointResponse;
import com.example.admin_service.dashboard.dto.SocialMetricsResponse;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class SocialAnalyticsFallbackFactory implements FallbackFactory<SocialAnalyticsClient> {
    @Override
    public SocialAnalyticsClient create(Throwable cause) {
        return new SocialAnalyticsClient() {
            @Override
            public ApiResponse<SocialMetricsResponse> getMetrics() {
                throw unavailable(cause);
            }

            @Override
            public ApiResponse<List<ContentGrowthPointResponse>> getGrowth(
                LocalDate from, LocalDate to, String granularity
            ) {
                throw unavailable(cause);
            }
        };
    }

    private DownstreamUnavailableException unavailable(Throwable cause) {
        return new DownstreamUnavailableException("Social service", cause);
    }
}
