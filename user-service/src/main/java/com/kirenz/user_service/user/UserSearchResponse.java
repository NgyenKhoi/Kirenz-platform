package com.kirenz.user_service.user;

import java.util.UUID;

public record UserSearchResponse(
    UUID id,
    String email,
    String username,
    String displayName,
    String avatarUrl,
    String bio,
    String relationshipStatus
) {
}
