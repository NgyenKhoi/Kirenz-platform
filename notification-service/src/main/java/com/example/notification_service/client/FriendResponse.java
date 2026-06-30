package com.example.notification_service.client;

import java.time.Instant;
import java.util.UUID;

public record FriendResponse(
    UUID id,
    UUID friendId,
    String username,
    String displayName,
    String avatarUrl,
    String bio,
    Instant createdAt
) {
}
