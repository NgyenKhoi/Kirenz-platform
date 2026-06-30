package com.example.notification_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private String type;
    private UUID actorId;
    private UUID receiverId;
    private String targetId;
    private String message;
    private Instant createdAt;
}
