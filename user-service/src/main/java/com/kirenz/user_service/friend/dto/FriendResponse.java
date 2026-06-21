package com.kirenz.user_service.friend.dto;

import java.time.Instant;
import java.util.UUID;

public record FriendResponse(
    UUID friendshipId,
    UUID friendId,
    String username,
    String displayName,
    String avatarUrl,
    String bio,
    Instant createdAt
) {
}
