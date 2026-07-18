package com.example.social_service.moderation.dto;

import com.example.social_service.post.model.MediaType;

public record ModerationMediaResponse(
    MediaType type,
    String url,
    String publicId
) {
}
