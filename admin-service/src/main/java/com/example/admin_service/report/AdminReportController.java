package com.example.admin_service.report;

import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.auth.CurrentAdmin;
import com.example.admin_service.report.dto.AdminReportDetailResponse;
import com.example.admin_service.report.dto.ReportDecisionRequest;
import com.example.admin_service.report.dto.ReportResponse;
import com.example.admin_service.report.dto.ReviewReportRequest;
import com.example.admin_service.report.dto.ResolveReportRequest;
import com.example.admin_service.user.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final ReportService reportService;
    private final ReportWorkflowService reportWorkflowService;
    private final CurrentAdmin currentAdmin;
    private final ReportResolutionService reportResolutionService;

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

    @PostMapping("/{reportId}/review")
    public ApiResponse<ReportResponse> startReview(
        @PathVariable UUID reportId,
        @Valid @RequestBody ReviewReportRequest request
    ) {
        return ApiResponse.success("Report marked as reviewing",
            reportWorkflowService.startReview(currentAdmin.id(), reportId, request));
    }

    @PostMapping("/{reportId}/dismiss")
    public ApiResponse<ReportResponse> dismiss(
        @PathVariable UUID reportId,
        @Valid @RequestBody ReportDecisionRequest request
    ) {
        return ApiResponse.success("Report dismissed successfully",
            reportWorkflowService.dismiss(currentAdmin.id(), reportId, request));
    }

    @PostMapping("/{reportId}/resolve")
    public ApiResponse<ReportResponse> resolve(
        @PathVariable UUID reportId,
        @Valid @RequestBody ResolveReportRequest request
    ) {
        return ApiResponse.success("Report resolved successfully",
            reportResolutionService.resolve(currentAdmin.id(), reportId, request));
    }
}
