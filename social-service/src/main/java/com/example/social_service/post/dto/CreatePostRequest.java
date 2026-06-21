package com.example.social_service.post.dto;

import jakarta.validation.Valid;

import com.example.social_service.post.model.PostPrivacy;

import java.util.List;

public record CreatePostRequest(
    String content,
    List<@Valid PostMediaRequest> media,
    PostPrivacy privacy
) {
}
