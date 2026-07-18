package com.example.social_service.moderation.dto;

import com.example.social_service.moderation.ModerationTargetType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ModerationContentResponse(
    String id,
    ModerationTargetType targetType,
    UUID authorId,
    String content,
    List<ModerationMediaResponse> media,
    String status,
    String parentId,
    Instant createdAt,
    Instant updatedAt
) {
}
