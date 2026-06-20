package com.example.social_service.post.dto;

import com.example.social_service.post.model.MediaType;

public record PostMediaResponse(
    MediaType type,
    String url,
    String publicId
) {
}