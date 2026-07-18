package com.kirenz.identity_service.admin.dto;

import com.kirenz.identity_service.user.model.AccountStatus;
import com.kirenz.identity_service.user.model.UserRole;

import java.time.Instant;
import java.util.UUID;

public record AdminUserResponse(
    UUID id,
    String email,
    String username,
    String displayName,
    String avatarUrl,
    UserRole role,
    AccountStatus status,
    boolean emailVerified,
    Instant createdAt,
    Instant lastLoginAt,
    Instant suspendedUntil
) {
}
