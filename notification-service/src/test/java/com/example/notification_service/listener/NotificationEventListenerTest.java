package com.example.notification_service.listener;

import com.example.notification_service.event.NotificationEvent;
import com.example.notification_service.model.Notification;
import com.example.notification_service.model.NotificationType;
import com.example.notification_service.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationEventListenerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationEventListener listener;

    @Test
    void savesAdminWarning() {
        UUID adminId = UUID.randomUUID();
        UUID receiverId = UUID.randomUUID();
        String actionId = UUID.randomUUID().toString();
        NotificationEvent event = new NotificationEvent(
            "ADMIN_WARNING",
            adminId,
            receiverId,
            actionId,
            "Please follow the community guidelines.",
            Instant.now()
        );
        when(notificationService.notificationExists(receiverId, NotificationType.ADMIN_WARNING, actionId))
            .thenReturn(false);

        listener.handleNotificationEvent(event);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationService).saveAndPushNotification(captor.capture());
        assertThat(captor.getValue().getType()).isEqualTo(NotificationType.ADMIN_WARNING);
        assertThat(captor.getValue().getActorId()).isEqualTo(adminId);
        assertThat(captor.getValue().getReceiverId()).isEqualTo(receiverId);
    }

    @Test
    void ignoresDuplicateAdminWarning() {
        UUID receiverId = UUID.randomUUID();
        String actionId = UUID.randomUUID().toString();
        NotificationEvent event = new NotificationEvent(
            "ADMIN_WARNING",
            UUID.randomUUID(),
            receiverId,
            actionId,
            "Warning",
            Instant.now()
        );
        when(notificationService.notificationExists(receiverId, NotificationType.ADMIN_WARNING, actionId))
            .thenReturn(true);

        listener.handleNotificationEvent(event);

        verify(notificationService, never()).saveAndPushNotification(org.mockito.ArgumentMatchers.any());
    }
}
