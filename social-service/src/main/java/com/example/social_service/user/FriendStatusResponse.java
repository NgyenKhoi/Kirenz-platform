package com.example.social_service.user;

import java.util.UUID;

public record FriendStatusResponse(
    UUID userId,
    UUID targetUserId,
    String status
) {
}
