package com.example.notification_service.service;

import com.example.notification_service.client.IdentityServiceClient;
import com.example.notification_service.client.IdentityUserProfileResponse;
import com.example.notification_service.dto.ApiResponse;
import com.example.notification_service.dto.NotificationResponse;
import com.example.notification_service.model.Notification;
import com.example.notification_service.model.NotificationType;
import com.example.notification_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final IdentityServiceClient identityServiceClient;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(UUID userId) {
        return notificationRepository.findByReceiverIdAndTypeNotOrderByCreatedAtDesc(userId, NotificationType.MESSAGE)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByReceiverIdAndIsReadFalseAndTypeNot(userId, NotificationType.MESSAGE);
    }

    @Transactional
    public NotificationResponse markAsRead(UUID id, UUID userId) {
        Notification notification = notificationRepository.findByIdAndReceiverId(id, userId)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found or unauthorized"));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification = notificationRepository.save(notification);
            // Push updated unread count to WebSocket
            pushUnreadCount(userId);
        }

        return toResponse(notification);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        List<Notification> unread = notificationRepository.findByReceiverIdAndIsReadFalseAndTypeNot(
            userId,
            NotificationType.MESSAGE
        );
        if (!unread.isEmpty()) {
            for (Notification n : unread) {
                n.setRead(true);
            }
            notificationRepository.saveAll(unread);
            // Push updated unread count to WebSocket
            pushUnreadCount(userId);
        }
    }

    @Transactional
    public Notification saveAndPushNotification(Notification notification) {
        // Enrich Actor Profile if possible
        if (notification.getActorId() != null) {
            try {
                ApiResponse<List<IdentityUserProfileResponse>> response = identityServiceClient.getProfilesByIds(List.of(notification.getActorId()));
                if (response != null && response.getData() != null && !response.getData().isEmpty()) {
                    IdentityUserProfileResponse profile = response.getData().get(0);
                    notification.setActorName(profile.displayName() != null ? profile.displayName() : profile.username());
                    notification.setActorAvatar(profile.avatarUrl());
                } else {
                    notification.setActorName("Kirenz User");
                }
            } catch (Exception e) {
                log.warn("Failed to fetch actor profile for notification: {}. Error: {}", notification.getActorId(), e.getMessage());
                notification.setActorName("Kirenz User");
            }
        }

        Notification saved = notificationRepository.save(notification);

        // Push via WebSocket STOMP
        try {
            String receiverStr = saved.getReceiverId().toString();
            NotificationResponse response = toResponse(saved);
            log.info("Pushing notification to user queue: /user/{}/queue/notifications", receiverStr);
            messagingTemplate.convertAndSendToUser(receiverStr, "/queue/notifications", response);
            pushUnreadCount(saved.getReceiverId());
        } catch (Exception e) {
            log.error("Failed to push notification via WebSocket: {}", e.getMessage(), e);
        }

        return saved;
    }

    private void pushUnreadCount(UUID userId) {
        try {
            long count = getUnreadCount(userId);
            messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications/unread-count", Map.of("count", count));
        } catch (Exception e) {
            log.error("Failed to push unread count: {}", e.getMessage());
        }
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
            notification.getId(),
            notification.getReceiverId(),
            notification.getActorId(),
            notification.getActorName(),
            notification.getActorAvatar(),
            notification.getType(),
            notification.getTargetId(),
            notification.getMessage(),
            notification.isRead(),
            notification.getCreatedAt()
        );
    }
}
