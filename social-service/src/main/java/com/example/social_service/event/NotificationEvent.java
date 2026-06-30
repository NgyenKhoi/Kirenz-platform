package com.example.social_service.event;

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
    private String type; // e.g. FRIEND_REQUEST, FRIEND_ACCEPT, POST_COMMENT, POST_LIKE, COMMENT_REPLY, POST_MENTION, COMMENT_MENTION, BIRTHDAY, WELCOME
    private UUID actorId;
    private UUID receiverId;
    private String targetId; // e.g. postId, commentId, etc.
    private String message;
    private Instant createdAt;
}
