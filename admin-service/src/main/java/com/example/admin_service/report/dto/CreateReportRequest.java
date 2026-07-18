package com.example.admin_service.report.dto;

import com.example.admin_service.report.ReportReason;
import com.example.admin_service.report.ReportTargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateReportRequest(
    @NotNull ReportTargetType targetType,
    @NotBlank @Size(max = 255) String targetId,
    @NotNull ReportReason reason,
    @Size(max = 1000) String description
) {
}
