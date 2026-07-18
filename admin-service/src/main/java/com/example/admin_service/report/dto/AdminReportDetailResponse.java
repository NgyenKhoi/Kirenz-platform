package com.example.admin_service.report.dto;

import com.example.admin_service.social.dto.SocialModerationContentResponse;

import java.util.List;

public record AdminReportDetailResponse(
    ReportResponse report,
    long aggregateReportCount,
    String moderationReason,
    String adminNote,
    SocialModerationContentResponse targetContent,
    boolean partialData,
    List<String> unavailableComponents
) {
}
