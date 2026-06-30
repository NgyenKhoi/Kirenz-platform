package com.example.social_service.post.dto;

import jakarta.validation.Valid;

import com.example.social_service.post.model.PostPrivacy;

import java.util.List;
import java.util.UUID;

public record CreatePostRequest(
    String content,
    List<@Valid PostMediaRequest> media,
    PostPrivacy privacy,
    List<UUID> taggedUserIds
) {
}
