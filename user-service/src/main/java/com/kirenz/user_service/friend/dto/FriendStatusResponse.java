package com.kirenz.user_service.friend.dto;

import java.util.UUID;

public record FriendStatusResponse(
    UUID userId,
    UUID targetUserId,
    String status
) {
}
