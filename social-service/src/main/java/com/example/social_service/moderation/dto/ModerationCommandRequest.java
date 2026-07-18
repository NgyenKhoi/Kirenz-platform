package com.example.social_service.moderation.dto;

import com.example.social_service.moderation.ModerationReason;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ModerationCommandRequest(
    @NotNull ModerationReason moderationReason,
    @Size(max = 2000) String note
) {
}
