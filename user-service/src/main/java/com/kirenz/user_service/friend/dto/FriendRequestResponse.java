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
    Instant respondedAt,
    // Enriched profile fields for the "other" user
    String username,
    String displayName,
    String avatarUrl,
    String bio
) {
    /**
     * Backward-compatible constructor without profile fields.
     */
    public FriendRequestResponse(
        UUID id, UUID requesterId, UUID receiverId,
        FriendRequestStatus status, Instant createdAt, Instant updatedAt, Instant respondedAt
    ) {
        this(id, requesterId, receiverId, status, createdAt, updatedAt, respondedAt,
             null, null, null, null);
    }
}
