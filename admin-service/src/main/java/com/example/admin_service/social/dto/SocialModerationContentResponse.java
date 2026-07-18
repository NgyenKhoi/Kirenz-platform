package com.example.admin_service.social.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record SocialModerationContentResponse(
    String id,
    String targetType,
    UUID authorId,
    String content,
    List<SocialModerationMediaResponse> media,
    String status,
    String parentId,
    Instant createdAt,
    Instant updatedAt
) {
}
