package com.example.social_service.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String TOPIC = "notification-events";

    public void sendNotification(NotificationEvent event) {
        try {
            log.info("Sending notification event of type {} to topic {}", event.getType(), TOPIC);
            kafkaTemplate.send(TOPIC, event);
        } catch (Exception e) {
            log.error("Failed to send notification event of type {} to Kafka: {}", event.getType(), e.getMessage(), e);
        }
    }
}
