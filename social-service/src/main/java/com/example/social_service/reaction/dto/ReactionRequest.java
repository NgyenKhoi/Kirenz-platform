package com.example.social_service.reaction.dto;

import com.example.social_service.reaction.model.ReactionType;
import jakarta.validation.constraints.NotNull;

public record ReactionRequest(
    @NotNull ReactionType type
) {
}
