package com.example.social_service.post.dto;

import com.example.social_service.post.model.PostStatus;

import java.time.Instant;
import java.util.List;

public record PostResponse(
    String id,
    String slug,
    AuthorResponse author,
    String content,
    List<PostMediaResponse> media,
    Integer reactionsCount,
    Integer commentsCount,
    PostStatus status,
    Instant createdAt,
    Instant updatedAt
) {
}
