package com.example.admin_service.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.KafkaException;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class NotificationProducer {

    private static final String TOPIC = "notification-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendWarning(NotificationEvent event) {
        sendModeration(event);
    }

    public void sendModeration(NotificationEvent event) {
        try {
            kafkaTemplate.send(TOPIC, event.getReceiverId().toString(), event).get(5, TimeUnit.SECONDS);
        } catch (Exception exception) {
            throw new KafkaException("Failed to publish moderation notification", exception);
        }
    }
}
