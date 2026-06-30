package com.example.social_service.comment.dto;

import com.example.social_service.comment.model.CommentStatus;
import com.example.social_service.reaction.dto.ReactionSummaryResponse;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CommentResponse(
    String id,
    String postId,
    String parentCommentId,
    CommentAuthorResponse author,
    String content,
    List<UUID> taggedUserIds,
    Integer reactionsCount,
    ReactionSummaryResponse reactionSummary,
    CommentStatus status,
    Instant createdAt,
    Instant updatedAt
) {
}
