package com.example.admin_service.report;

import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.report.dto.AdminReportDetailResponse;
import com.example.admin_service.report.dto.ReportResponse;
import com.example.admin_service.user.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final ReportService reportService;

    @GetMapping
    public ApiResponse<PageResponse<ReportResponse>> search(
        @RequestParam(required = false) ReportStatus status,
        @RequestParam(required = false) ReportTargetType targetType,
        @RequestParam(required = false) ReportReason reason,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success("Reports retrieved successfully",
            reportService.search(status, targetType, reason, page, size));
    }

    @GetMapping("/{reportId}")
    public ApiResponse<AdminReportDetailResponse> getDetail(@PathVariable UUID reportId) {
        return ApiResponse.success("Report retrieved successfully", reportService.getAdminDetail(reportId));
    }
}
