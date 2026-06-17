package com.example.social_service.post.dto;

import jakarta.validation.Valid;

import java.util.List;

public record CreatePostRequest(
    String content,
    List<@Valid PostMediaRequest> media
) {
}
