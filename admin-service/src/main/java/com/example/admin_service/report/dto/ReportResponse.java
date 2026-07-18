package com.example.admin_service.report.dto;

import com.example.admin_service.report.ReportReason;
import com.example.admin_service.report.ReportResolution;
import com.example.admin_service.report.ReportStatus;
import com.example.admin_service.report.ReportTargetType;

import java.time.Instant;
import java.util.UUID;

public record ReportResponse(
    UUID id,
    UUID reporterId,
    ReportTargetType targetType,
    String targetId,
    ReportReason reason,
    String description,
    ReportStatus status,
    ReportResolution resolution,
    Instant createdAt,
    Instant updatedAt
) {
}
