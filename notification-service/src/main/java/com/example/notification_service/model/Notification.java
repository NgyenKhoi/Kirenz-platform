package com.example.notification_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notifications_receiver", columnList = "receiverId"),
    @Index(name = "idx_notifications_receiver_unread", columnList = "receiverId, isRead")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID receiverId;

    private UUID actorId;

    private String actorName;

    private String actorAvatar;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    private String targetId; // Reference ID (postId, commentId, friendRequestId etc)

    @Column(nullable = false, length = 1000)
    private String message;

    @Builder.Default
    @Column(nullable = false)
    private boolean isRead = false;

    @Column(nullable = false)
    private Instant createdAt;
}
