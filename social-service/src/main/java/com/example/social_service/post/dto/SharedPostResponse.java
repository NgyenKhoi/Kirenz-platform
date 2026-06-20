package com.example.social_service.post.dto;

import java.time.Instant;
import java.util.List;

public record SharedPostResponse(
    String id,
    AuthorResponse author,
    String content,
    List<PostMediaResponse> media,
    boolean available,
    Instant createdAt
) {
}
