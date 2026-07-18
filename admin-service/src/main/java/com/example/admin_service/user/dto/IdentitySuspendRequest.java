package com.example.admin_service.user.dto;

import java.time.Instant;

public record IdentitySuspendRequest(
    Instant suspendedUntil,
    String moderationReason
) {
}
