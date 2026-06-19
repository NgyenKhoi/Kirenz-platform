package com.example.social_service.reaction.dto;

import com.example.social_service.reaction.model.ReactionType;

import java.util.Map;

public record ReactionSummaryResponse(
    int totalCount,
    ReactionType currentUserReaction,
    Map<ReactionType, Long> breakdown
) {
}
