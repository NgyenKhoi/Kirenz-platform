package com.example.social_service.comment.dto;

import com.example.social_service.comment.model.CommentStatus;
import com.example.social_service.reaction.dto.ReactionSummaryResponse;

import java.time.Instant;

public record CommentResponse(
    String id,
    String postId,
    CommentAuthorResponse author,
    String content,
    Integer reactionsCount,
    ReactionSummaryResponse reactionSummary,
    CommentStatus status,
    Instant createdAt,
    Instant updatedAt
) {
}
