package com.kirenz.user_service.friend.dto;

import java.time.Instant;
import java.util.UUID;

public record FriendResponse(
    UUID friendshipId,
    UUID friendId,
    Instant createdAt
) {
}
