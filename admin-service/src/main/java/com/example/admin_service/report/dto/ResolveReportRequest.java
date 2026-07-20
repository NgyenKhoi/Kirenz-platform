package com.example.admin_service.report.dto;

import com.example.admin_service.report.ModerationReason;
import com.example.admin_service.report.ReportResolutionAction;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Future;

import java.time.Instant;

public record ResolveReportRequest(
    @NotNull ReportResolutionAction action,
    @NotNull ModerationReason moderationReason,
    @Size(max = 2000) String adminNote,
    @Future Instant suspendedUntil,
    @Size(max = 1000) String evidenceUrl
) {
    public ResolveReportRequest(ReportResolutionAction action, ModerationReason moderationReason,
                                String adminNote, Instant suspendedUntil) {
        this(action, moderationReason, adminNote, suspendedUntil, null);
    }
}
