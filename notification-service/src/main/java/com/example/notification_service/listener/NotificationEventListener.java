package com.example.notification_service.listener;

import com.example.notification_service.event.NotificationEvent;
import com.example.notification_service.event.UserCreatedEvent;
import com.example.notification_service.model.Notification;
import com.example.notification_service.model.NotificationType;
import com.example.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;

    @KafkaListener(topics = "notification-events", groupId = "notification-service-group")
    public void handleNotificationEvent(NotificationEvent event) {
        log.info("Received notification event of type: {}", event.getType());
        try {
            Notification notification = Notification.builder()
                .receiverId(event.getReceiverId())
                .actorId(event.getActorId())
                .type(NotificationType.valueOf(event.getType()))
                .targetId(event.getTargetId())
                .message(event.getMessage())
                .createdAt(event.getCreatedAt() != null ? event.getCreatedAt() : Instant.now())
                .build();

            notificationService.saveAndPushNotification(notification);
        } catch (Exception e) {
            log.error("Failed to process notification event: {}", e.getMessage(), e);
        }
    }
    @KafkaListener(topics = "user-created", groupId = "notification-service-group")
    public void handleUserCreated(UserCreatedEvent event) {
        log.info("Received user-created event for user: {}", event.getUserId());
        try {
            Notification notification = Notification.builder()
                .receiverId(event.getUserId())
                .actorId(null)
                .type(NotificationType.WELCOME)
                .targetId(null)
                .message("Welcome to Kirenz. Complete your profile to help friends recognize you and personalize your experience.")
                .createdAt(Instant.now())
                .build();

            notificationService.saveAndPushNotification(notification);
        } catch (Exception e) {
            log.error("Failed to process user welcome notification: {}", e.getMessage(), e);
        }
    }
}
