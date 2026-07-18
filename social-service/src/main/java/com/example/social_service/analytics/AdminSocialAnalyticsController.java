package com.example.social_service.analytics;

import com.example.social_service.analytics.dto.ContentGrowthPointResponse;
import com.example.social_service.analytics.dto.SocialMetricsResponse;
import com.example.social_service.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/internal/social")
@RequiredArgsConstructor
public class AdminSocialAnalyticsController {

    private final SocialAnalyticsService socialAnalyticsService;

    @GetMapping("/metrics")
    public ApiResponse<SocialMetricsResponse> metrics() {
        return ApiResponse.success("Social metrics retrieved successfully", socialAnalyticsService.getMetrics());
    }

    @GetMapping("/growth")
    public ApiResponse<List<ContentGrowthPointResponse>> growth(
        @RequestParam(required = false) LocalDate from,
        @RequestParam(required = false) LocalDate to,
        @RequestParam(defaultValue = "DAY") String granularity
    ) {
        return ApiResponse.success(
            "Social growth retrieved successfully",
            socialAnalyticsService.getGrowth(from, to, granularity)
        );
    }
}
