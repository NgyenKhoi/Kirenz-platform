package com.example.admin_service.report;

import com.example.admin_service.auth.CurrentUser;
import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.report.dto.CreateReportRequest;
import com.example.admin_service.report.dto.ReportResponse;
import com.example.admin_service.user.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final CurrentUser currentUser;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReportResponse> create(@Valid @RequestBody CreateReportRequest request) {
        return ApiResponse.success("Report submitted successfully", reportService.create(currentUser.id(), request));
    }

    @GetMapping("/me")
    public ApiResponse<PageResponse<ReportResponse>> findMine(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success("Reports retrieved successfully", reportService.findMine(currentUser.id(), page, size));
    }
}
