package com.kirenz.identity_service.media.dto;

public record MediaUploadResponse(
    String url,
    String publicId,
    Integer width,
    Integer height,
    String format,
    Long bytes
) {
}