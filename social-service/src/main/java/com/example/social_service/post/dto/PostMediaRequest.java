package com.example.social_service.post.dto;

import com.example.social_service.post.model.MediaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PostMediaRequest(
    @NotNull(message = "Media type is required")
    MediaType type,

    @NotBlank(message = "Media URL is required")
    String url,

    String publicId
) {
}