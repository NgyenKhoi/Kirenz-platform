package com.example.chat_service.presence.listener;

import com.example.chat_service.auth.JwtPrincipal;
import com.example.chat_service.presence.service.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final PresenceService presenceService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        UUID userId = extractUserId(headerAccessor);
        if (userId != null) {
            if (headerAccessor.getSessionAttributes() != null) {
                headerAccessor.getSessionAttributes().put("userId", userId);
            }
            presenceService.markOnline(userId, headerAccessor.getSessionId());
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        UUID userId = extractUserId(headerAccessor);
        if (userId != null) {
            presenceService.markOffline(userId, headerAccessor.getSessionId());
        }
    }

    private UUID extractUserId(StompHeaderAccessor accessor) {
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth) {
            if (auth.getPrincipal() instanceof JwtPrincipal principal) {
                return principal.userId();
            }
        }

        if (accessor.getSessionAttributes() == null) {
            return null;
        }

        Object sessionUserId = accessor.getSessionAttributes().get("userId");
        if (sessionUserId instanceof UUID userId) {
            return userId;
        }
        if (sessionUserId instanceof String userId) {
            return UUID.fromString(userId);
        }

        return null;
    }
}

