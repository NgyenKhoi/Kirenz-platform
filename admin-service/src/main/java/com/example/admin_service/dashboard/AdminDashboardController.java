package com.example.admin_service.dashboard;

import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.dashboard.dto.ContentGrowthPointResponse;
import com.example.admin_service.dashboard.dto.DashboardSeriesResponse;
import com.example.admin_service.dashboard.dto.DashboardSummaryResponse;
import com.example.admin_service.dashboard.dto.GrowthPointResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ApiResponse<DashboardSummaryResponse> summary() {
        return ApiResponse.success("Dashboard summary retrieved successfully", dashboardService.getSummary());
    }

    @GetMapping("/user-growth")
    public ApiResponse<DashboardSeriesResponse<GrowthPointResponse>> userGrowth(
        @RequestParam LocalDate from,
        @RequestParam LocalDate to,
        @RequestParam(defaultValue = "DAY") String granularity
    ) {
        return ApiResponse.success(
            "User growth retrieved successfully",
            dashboardService.getUserGrowth(from, to, granularity)
        );
    }

    @GetMapping("/content-growth")
    public ApiResponse<DashboardSeriesResponse<ContentGrowthPointResponse>> contentGrowth(
        @RequestParam LocalDate from,
        @RequestParam LocalDate to,
        @RequestParam(defaultValue = "DAY") String granularity
    ) {
        return ApiResponse.success(
            "Content growth retrieved successfully",
            dashboardService.getContentGrowth(from, to, granularity)
        );
    }
}
