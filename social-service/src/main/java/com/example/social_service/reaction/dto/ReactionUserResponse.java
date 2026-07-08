package com.example.social_service.reaction.dto;

import com.example.social_service.reaction.model.ReactionType;

import java.time.Instant;
import java.util.UUID;

public record ReactionUserResponse(
    UUID userId,
    String username,
    String displayName,
    String avatarUrl,
    ReactionType type,
    Instant reactedAt
) {
}
