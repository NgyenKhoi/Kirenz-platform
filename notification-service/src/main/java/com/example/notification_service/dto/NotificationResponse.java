package com.example.notification_service.dto;

import com.example.notification_service.model.NotificationType;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
    UUID id,
    UUID receiverId,
    UUID actorId,
    String actorName,
    String actorAvatar,
    NotificationType type,
    String targetId,
    String message,
    boolean isRead,
    Instant createdAt
) {
}
