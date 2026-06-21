package com.kirenz.user_service.friend.dto;

import java.util.UUID;

public record FriendSuggestionResponse(
    UUID id,
    String username,
    String displayName,
    String avatarUrl,
    String bio,
    int mutualFriendCount
) {
}
