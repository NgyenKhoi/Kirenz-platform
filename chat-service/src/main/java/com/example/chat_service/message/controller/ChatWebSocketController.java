package com.example.chat_service.message.controller;

import com.example.chat_service.auth.JwtPrincipal;
import com.example.chat_service.message.dto.SendMessageRequest;
import com.example.chat_service.message.service.ChatService;
import com.example.chat_service.message.service.MessageBroadcastService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatService chatService;
    private final MessageBroadcastService broadcastService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, Principal principal) {
        UUID senderId = extractUserId(principal);
        int contentLength = request.getContent() == null ? 0 : request.getContent().length();
        int attachmentCount = request.getAttachments() == null ? 0 : request.getAttachments().size();
        log.info(
            "Received message via WS from user {} for conversation {} (contentLength={}, attachments={})",
            senderId,
            request.getConversationId(),
            contentLength,
            attachmentCount
        );
        chatService.processAndBroadcastMessage(request, senderId);
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload java.util.Map<String, Object> payload, Principal principal) {
        String conversationId = (String) payload.get("conversationId");
        Boolean isTyping = (Boolean) payload.get("isTyping");
        UUID userId = extractUserId(principal);
        
        if (conversationId != null && isTyping != null) {
            broadcastService.broadcastTyping(conversationId, userId, isTyping);
        }
    }

    private UUID extractUserId(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            if (auth.getPrincipal() instanceof JwtPrincipal jwtPrincipal) {
                return jwtPrincipal.userId();
            }
        }
        throw new IllegalStateException("Unauthorized WebSocket message");
    }
}
