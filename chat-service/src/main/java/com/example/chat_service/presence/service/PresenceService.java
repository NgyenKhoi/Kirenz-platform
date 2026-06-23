package com.example.chat_service.presence.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PresenceService {

    private final StringRedisTemplate redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String PRESENCE_KEY_PREFIX = "presence:user:";
    private static final Duration PRESENCE_TTL = Duration.ofMinutes(5); // Auto-expire if heartbeat fails

    public void markOnline(UUID userId) {
        String key = PRESENCE_KEY_PREFIX + userId;
        redisTemplate.opsForValue().set(key, "ONLINE", PRESENCE_TTL);
        broadcastPresence(userId, true);
        log.info("User {} is now ONLINE", userId);
    }

    public void markOffline(UUID userId) {
        String key = PRESENCE_KEY_PREFIX + userId;
        redisTemplate.delete(key);
        broadcastPresence(userId, false);
        log.info("User {} is now OFFLINE", userId);
    }

    public boolean isOnline(UUID userId) {
        return redisTemplate.hasKey(PRESENCE_KEY_PREFIX + userId);
    }

    public Map<UUID, Boolean> getPresenceMap(Set<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) return Collections.emptyMap();
        
        return userIds.stream().collect(Collectors.toMap(
            id -> id,
            this::isOnline
        ));
    }

    private void broadcastPresence(UUID userId, boolean isOnline) {
        messagingTemplate.convertAndSend("/topic/presence", Map.of(
            "userId", userId,
            "status", isOnline ? "ONLINE" : "OFFLINE"
        ));
    }
}
