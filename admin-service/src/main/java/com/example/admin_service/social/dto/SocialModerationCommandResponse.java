package com.example.admin_service.social.dto;

public record SocialModerationCommandResponse(
    SocialModerationContentResponse content,
    String previousStatus
) {
}
