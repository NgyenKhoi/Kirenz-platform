package com.kirenz.user_service.friend.dto;

import java.util.UUID;

public record MutualFriendResponse(
    UUID id,
    String username,
    String displayName,
    String avatarUrl,
    String bio
) {
}
