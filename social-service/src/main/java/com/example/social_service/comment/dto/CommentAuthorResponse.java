package com.example.social_service.comment.dto;

import java.util.UUID;

public record CommentAuthorResponse(
    UUID id,
    String username,
    String displayName,
    String avatarUrl
) {
}
