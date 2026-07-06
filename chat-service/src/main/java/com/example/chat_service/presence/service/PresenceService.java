package com.example.chat_service.presence.service;

import com.example.chat_service.presence.dto.UserPresenceDto;
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
    private static final String SESSION_KEY_PREFIX = "presence:session:";
    private static final Duration PRESENCE_TTL = Duration.ofHours(24);
    private static final Duration LAST_SEEN_TTL = Duration.ofDays(30);

    public void markOnline(UUID userId, String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return;
        }

        boolean wasOffline = !isOnline(userId);
        String userKey = presenceKey(userId);
        String sessionsKey = sessionsKey(userId);
        String sessionKey = sessionKey(sessionId);

        redisTemplate.opsForSet().add(sessionsKey, sessionId);
        redisTemplate.expire(sessionsKey, PRESENCE_TTL);
        redisTemplate.opsForValue().set(sessionKey, userId.toString(), PRESENCE_TTL);
        redisTemplate.opsForValue().set(userKey, "ONLINE", PRESENCE_TTL);

        if (wasOffline) {
            broadcastPresence(userId, true, null);
            log.info("User {} is now ONLINE", userId);
        } else {
            log.debug("User {} opened another active session {}", userId, sessionId);
        }
    }

    public void markOffline(UUID userId, String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return;
        }

        UUID ownerId = resolveSessionOwner(sessionId);
        if (ownerId != null && !ownerId.equals(userId)) {
            log.debug("WebSocket session {} belongs to {}, disconnect event carried {}", sessionId, ownerId, userId);
            userId = ownerId;
        }

        removeSessionAndMaybeMarkOffline(userId, sessionId);
    }

    public void markOffline(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return;
        }

        UUID userId = resolveSessionOwner(sessionId);
        if (userId == null) {
            log.debug("Ignoring disconnect for unknown WebSocket session {}", sessionId);
            return;
        }

        removeSessionAndMaybeMarkOffline(userId, sessionId);
    }

    private void removeSessionAndMaybeMarkOffline(UUID userId, String sessionId) {
        String sessionsKey = sessionsKey(userId);
        redisTemplate.opsForSet().remove(sessionsKey, sessionId);
        redisTemplate.delete(sessionKey(sessionId));

        if (activeSessionCount(userId) > 0) {
            log.debug("User {} still has active WebSocket sessions", userId);
            return;
        }

        redisTemplate.delete(presenceKey(userId));
        long now = System.currentTimeMillis();
        redisTemplate.opsForValue().set(lastSeenKey(userId), String.valueOf(now), LAST_SEEN_TTL);
        broadcastPresence(userId, false, now);
        log.info("User {} is now OFFLINE", userId);
    }

    private UUID resolveSessionOwner(String sessionId) {
        String userId = redisTemplate.opsForValue().get(sessionKey(sessionId));
        if (userId == null || userId.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(userId);
        } catch (IllegalArgumentException e) {
            log.debug("Invalid session owner value for session {}: {}", sessionId, userId);
            return null;
        }
    }
    public boolean isOnline(UUID userId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(presenceKey(userId))) && activeSessionCount(userId) > 0;
    }

    public Map<UUID, UserPresenceDto> getPresenceMap(Set<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) return Collections.emptyMap();

        return userIds.stream().collect(Collectors.toMap(
            id -> id,
            id -> {
                boolean online = isOnline(id);
                Long lastSeen = null;
                if (!online) {
                    String lastSeenStr = redisTemplate.opsForValue().get(lastSeenKey(id));
                    if (lastSeenStr != null) {
                        try {
                            lastSeen = Long.parseLong(lastSeenStr);
                        } catch (NumberFormatException e) {
                            log.debug("Invalid lastSeen value for user {}: {}", id, lastSeenStr);
                        }
                    }
                }
                return new UserPresenceDto(online, lastSeen);
            }
        ));
    }

    private long activeSessionCount(UUID userId) {
        String sessionsKey = sessionsKey(userId);
        Set<String> sessionIds = redisTemplate.opsForSet().members(sessionsKey);
        if (sessionIds == null || sessionIds.isEmpty()) {
            return 0;
        }

        long activeCount = 0;
        for (String sessionId : sessionIds) {
            if (Boolean.TRUE.equals(redisTemplate.hasKey(sessionKey(sessionId)))) {
                activeCount++;
            } else {
                redisTemplate.opsForSet().remove(sessionsKey, sessionId);
            }
        }

        if (activeCount > 0) {
            redisTemplate.expire(sessionsKey, PRESENCE_TTL);
            redisTemplate.expire(presenceKey(userId), PRESENCE_TTL);
        }

        return activeCount;
    }

    private void broadcastPresence(UUID userId, boolean isOnline, Long lastSeen) {
        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("userId", userId);
        payload.put("status", isOnline ? "ONLINE" : "OFFLINE");
        payload.put("lastSeen", lastSeen != null ? lastSeen : System.currentTimeMillis());
        messagingTemplate.convertAndSend("/topic/presence", payload);
    }

    private String presenceKey(UUID userId) {
        return PRESENCE_KEY_PREFIX + userId;
    }

    private String sessionsKey(UUID userId) {
        return PRESENCE_KEY_PREFIX + userId + ":sessions";
    }

    private String sessionKey(String sessionId) {
        return SESSION_KEY_PREFIX + sessionId;
    }

    private String lastSeenKey(UUID userId) {
        return PRESENCE_KEY_PREFIX + userId + ":last_seen";
    }
}

