package com.example.social_service.moderation.dto;

public record ModerationCommandResponse(
    ModerationContentResponse content,
    String previousStatus
) {
}
