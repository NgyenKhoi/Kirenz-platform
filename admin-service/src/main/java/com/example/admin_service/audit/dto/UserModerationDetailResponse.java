package com.example.admin_service.audit.dto;

import com.example.admin_service.audit.AdminActionType;
import java.time.Instant;
import java.util.UUID;

public record UserModerationDetailResponse(
    UUID id, AdminActionType actionType, String reason, String evidenceUrl, Instant createdAt
) {}
