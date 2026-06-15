package com.kirenz.user_service.friend.dto;

import com.kirenz.user_service.friend.model.FriendRequestStatus;

import java.time.Instant;
import java.util.UUID;

public record FriendRequestResponse(
    UUID id,
    UUID requesterId,
    UUID receiverId,
    FriendRequestStatus status,
    Instant createdAt,
    Instant updatedAt,
    Instant respondedAt
) {
}
