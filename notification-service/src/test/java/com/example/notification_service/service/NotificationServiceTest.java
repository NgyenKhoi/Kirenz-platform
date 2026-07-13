package com.example.notification_service.service;

import com.example.notification_service.client.IdentityServiceClient;
import com.example.notification_service.model.Notification;
import com.example.notification_service.model.NotificationType;
import com.example.notification_service.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private IdentityServiceClient identityServiceClient;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(
            notificationRepository,
            identityServiceClient,
            messagingTemplate
        );
    }

    @Test
    void socialListExcludesLegacyMessageRows() {
        UUID userId = UUID.randomUUID();
        Notification socialNotification = notification(userId, NotificationType.POST_LIKE, false);
        when(notificationRepository.findByReceiverIdAndTypeNotOrderByCreatedAtDesc(
            userId,
            NotificationType.MESSAGE
        )).thenReturn(List.of(socialNotification));

        var result = notificationService.getNotifications(userId);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().type()).isEqualTo(NotificationType.POST_LIKE);
    }

    @Test
    void socialUnreadCountExcludesLegacyMessageRows() {
        UUID userId = UUID.randomUUID();
        when(notificationRepository.countByReceiverIdAndIsReadFalseAndTypeNot(
            userId,
            NotificationType.MESSAGE
        )).thenReturn(3L);

        assertThat(notificationService.getUnreadCount(userId)).isEqualTo(3L);
    }

    @Test
    void markAllOnlyUpdatesSocialNotifications() {
        UUID userId = UUID.randomUUID();
        Notification socialNotification = notification(userId, NotificationType.POST_COMMENT, false);
        when(notificationRepository.findByReceiverIdAndIsReadFalseAndTypeNot(
            userId,
            NotificationType.MESSAGE
        )).thenReturn(List.of(socialNotification));
        when(notificationRepository.saveAll(List.of(socialNotification))).thenReturn(List.of(socialNotification));
        when(notificationRepository.countByReceiverIdAndIsReadFalseAndTypeNot(
            userId,
            NotificationType.MESSAGE
        )).thenReturn(0L);

        notificationService.markAllAsRead(userId);

        assertThat(socialNotification.isRead()).isTrue();
        verify(notificationRepository).saveAll(List.of(socialNotification));
    }

    private Notification notification(UUID receiverId, NotificationType type, boolean read) {
        return Notification.builder()
            .id(UUID.randomUUID())
            .receiverId(receiverId)
            .type(type)
            .message("Notification")
            .isRead(read)
            .createdAt(Instant.now())
            .build();
    }
}
