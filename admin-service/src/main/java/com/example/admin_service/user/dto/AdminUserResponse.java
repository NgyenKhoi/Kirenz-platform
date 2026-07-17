package com.example.admin_service.user.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminUserResponse(
    UUID id,
    String email,
    String username,
    String displayName,
    String avatarUrl,
    String role,
    String status,
    boolean emailVerified,
    Instant createdAt,
    Instant lastLoginAt
) {
}
