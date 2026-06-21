package com.example.social_service.post.dto;

import java.time.Instant;

public record PostImageResponse(
    String postId,
    String url,
    String publicId,
    Instant createdAt
) {
}
