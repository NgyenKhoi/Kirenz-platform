package com.example.admin_service.social.dto;

public record SocialModerationRequest(
    String moderationReason,
    String note
) {
}
