package com.example.social_service.comment.dto;

import java.util.List;
import java.util.UUID;

public record CreateCommentRequest(
    String content,
    String parentCommentId,
    List<UUID> taggedUserIds
) {
}
