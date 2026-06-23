package com.kirenz.user_service.identity.listener;

import com.kirenz.user_service.identity.event.UserCreatedEvent;
import com.kirenz.user_service.privacy.service.PrivacySettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventListener {

    private final PrivacySettingService privacySettingService;

    @KafkaListener(topics = "user-created", groupId = "user-service-group")
    public void handleUserCreated(UserCreatedEvent event) {
        log.info("Received user-created event for user: {}", event.getUserId());
        try {
            privacySettingService.initializeDefaultSettings(event.getUserId());
        } catch (Exception e) {
            log.error("Failed to initialize privacy settings for user: {}. Error: {}", 
                event.getUserId(), e.getMessage());
        }
    }
}
