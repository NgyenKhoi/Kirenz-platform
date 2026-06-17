package com.example.social_service.comment.dto;

import com.example.social_service.comment.model.CommentStatus;

import java.time.Instant;

public record CommentResponse(
    String id,
    String postId,
    CommentAuthorResponse author,
    String content,
    CommentStatus status,
    Instant createdAt,
    Instant updatedAt
) {
}
