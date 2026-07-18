package com.example.admin_service.report.dto;

import com.example.admin_service.report.ModerationReason;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReportDecisionRequest(
    @NotNull ModerationReason moderationReason,
    @Size(max = 2000) String adminNote
) {
}
