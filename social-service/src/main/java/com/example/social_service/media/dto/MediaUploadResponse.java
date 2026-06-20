package com.example.social_service.media.dto;

import com.example.social_service.post.model.MediaType;

public record MediaUploadResponse(
    MediaType type,
    String url,
    String publicId,
    Integer width,
    Integer height,
    String format,
    Long bytes
) {
}