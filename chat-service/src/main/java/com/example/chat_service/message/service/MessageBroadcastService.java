package com.example.chat_service.message.service;

import com.example.chat_service.conversation.dto.ConversationUpdateMessage;
import com.example.chat_service.conversation.model.Conversation;
import com.example.chat_service.message.dto.MessageResponse;
import com.example.chat_service.message.model.Message;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;
    private final com.example.chat_service.message.repository.MessageRepository messageRepository;

    public void broadcastMessage(Message message, Conversation conversation, String senderName, String senderAvatar) {
        // 1. Broadcast FULL message to conversation topic
        MessageResponse fullResponse = MessageResponse.builder()
            .id(message.getId())
            .conversationId(message.getConversationId())
            .senderId(message.getSenderId())
            .senderName(senderName)
            .senderAvatar(senderAvatar)
            .content(message.getContent())
            .type(message.getType())
            .attachments(message.getAttachments())
            .sentAt(message.getSentAt())
            .status(message.getStatus())
            .build();

        String topicDestination = "/topic/conversation." + message.getConversationId();
        messagingTemplate.convertAndSend(topicDestination, fullResponse);
        log.debug("Broadcasted full message to topic: {}", topicDestination);

        // 2. Broadcast SUMMARY to each participant's personal queue
        for (UUID participantId : conversation.getParticipantIds()) {
            long unread = messageRepository.countUnreadMessages(conversation.getId(), participantId);
            ConversationUpdateMessage summary = ConversationUpdateMessage.builder()
                .conversationId(conversation.getId())
                .conversationName(conversation.getName())
                .lastMessage(conversation.getLastMessage())
                .updatedAt(conversation.getUpdatedAt())
                .unreadCount((int) unread)
                .build();

            // Spring's convertAndSendToUser prefixes destination with /user/{participantId}
            messagingTemplate.convertAndSendToUser(
                participantId.toString(),
                "/queue/messages",
                summary
            );
        }
        log.debug("Broadcasted summary to {} participants", conversation.getParticipantIds().size());
    }

    public void broadcastConversationRead(Conversation conversation, UUID userId, int unreadCount) {
        ConversationUpdateMessage summary = ConversationUpdateMessage.builder()
            .conversationId(conversation.getId())
            .conversationName(conversation.getName())
            .lastMessage(conversation.getLastMessage())
            .updatedAt(conversation.getUpdatedAt())
            .unreadCount(unreadCount)
            .build();

        messagingTemplate.convertAndSendToUser(
            userId.toString(),
            "/queue/messages",
            summary
        );
    }

    public void broadcastTyping(String conversationId, UUID userId, boolean isTyping) {
        String destination = "/topic/conversation." + conversationId + ".typing";
        messagingTemplate.convertAndSend(destination, java.util.Map.of(
            "userId", userId,
            "isTyping", isTyping
        ));
    }
}
