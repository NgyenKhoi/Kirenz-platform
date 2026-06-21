package com.example.social_service.post.dto;

import com.example.social_service.post.model.PostPrivacy;

import java.time.Instant;
import java.util.List;

public record SharedPostResponse(
    String id,
    AuthorResponse author,
    String content,
    PostPrivacy privacy,
    List<PostMediaResponse> media,
    boolean available,
    Instant createdAt
) {
}
