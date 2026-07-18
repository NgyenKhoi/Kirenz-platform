package com.example.admin_service.dashboard;

import com.example.admin_service.common.client.FeignAuthForwardingConfig;
import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.dashboard.dto.ContentGrowthPointResponse;
import com.example.admin_service.dashboard.dto.SocialMetricsResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;

@FeignClient(
    name = "social-service",
    contextId = "socialAnalyticsClient",
    configuration = FeignAuthForwardingConfig.class,
    fallbackFactory = SocialAnalyticsFallbackFactory.class
)
public interface SocialAnalyticsClient {

    @GetMapping("/api/admin/internal/social/metrics")
    ApiResponse<SocialMetricsResponse> getMetrics();

    @GetMapping("/api/admin/internal/social/growth")
    ApiResponse<List<ContentGrowthPointResponse>> getGrowth(
        @RequestParam("from") LocalDate from,
        @RequestParam("to") LocalDate to,
        @RequestParam("granularity") String granularity
    );
}
