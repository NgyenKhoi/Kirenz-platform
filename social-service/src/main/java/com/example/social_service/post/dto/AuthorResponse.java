package com.example.social_service.post.dto;

import java.util.UUID;

public record AuthorResponse(
    UUID id,
    String username,
    String displayName,
    String avatarUrl
) {
}
