package com.example.admin_service.report.dto;

public record AdminReportDetailResponse(
    ReportResponse report,
    long aggregateReportCount,
    String moderationReason,
    String adminNote
) {
}
