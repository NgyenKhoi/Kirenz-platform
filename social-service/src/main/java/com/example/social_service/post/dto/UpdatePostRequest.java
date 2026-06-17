package com.example.social_service.post.dto;

import jakarta.validation.Valid;

import java.util.List;

public record UpdatePostRequest(
    String content,
    List<@Valid PostMediaRequest> media
) {
}
