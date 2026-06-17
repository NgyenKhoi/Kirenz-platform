package com.kirenz.user_service.block.dto;

import java.time.Instant;
import java.util.UUID;

public record BlockResponse(
    UUID id,
    UUID blockedUserId,
    Instant createdAt
) {
}
