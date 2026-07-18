package com.example.admin_service.audit.dto;

import com.example.admin_service.audit.AdminActionType;
import com.example.admin_service.audit.AdminTargetType;

import java.time.Instant;
import java.util.UUID;

public record AdminActionResponse(
    UUID id,
    UUID adminId,
    AdminActionType actionType,
    AdminTargetType targetType,
    String targetId,
    String reason,
    String note,
    Instant createdAt
) {
}
