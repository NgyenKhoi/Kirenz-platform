package com.example.chat_service.message.service;

import com.example.chat_service.common.dto.ApiResponse;
import com.example.chat_service.common.exception.BadRequestException;
import com.example.chat_service.common.exception.NotFoundException;
import com.example.chat_service.conversation.dto.ParticipantInfo;
import com.example.chat_service.conversation.model.Conversation;
import com.example.chat_service.conversation.model.LastMessage;
import com.example.chat_service.conversation.repository.ConversationRepository;
import com.example.chat_service.conversation.service.ConversationService;
import com.example.chat_service.message.dto.MessageResponse;
import com.example.chat_service.message.dto.SendMessageRequest;
import com.example.chat_service.message.model.*;
import com.example.chat_service.message.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final MessageBroadcastService broadcastService;
    private final ConversationService conversationService;

    @Transactional
    public void processAndBroadcastMessage(SendMessageRequest request, UUID senderId) {
        // 1. Validate conversation
        Conversation conversation = conversationRepository.findById(request.getConversationId())
            .orElseThrow(() -> new NotFoundException("Conversation not found"));

        if (!conversation.getParticipantIds().contains(senderId)) {
            throw new BadRequestException("You are not a participant in this conversation");
        }

        // 2. Determine message type
        MessageType type = MessageType.TEXT;
        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            String primaryType = request.getAttachments().get(0).getType();
            if ("IMAGE".equalsIgnoreCase(primaryType)) type = MessageType.IMAGE;
            else if ("VIDEO".equalsIgnoreCase(primaryType)) type = MessageType.VIDEO;
        }

        // 3. Create & Save Message
        List<MessageStatus> statusList = conversation.getParticipantIds().stream()
            .map(pid -> MessageStatus.builder()
                .userId(pid)
                .status(pid.equals(senderId) ? DeliveryStatus.READ : DeliveryStatus.SENT)
                .timestamp(Instant.now())
                .build())
            .toList();

        Message message = Message.builder()
            .conversationId(request.getConversationId())
            .senderId(senderId)
            .content(request.getContent())
            .type(type)
            .attachments(request.getAttachments())
            .sentAt(Instant.now())
            .statusList(new ArrayList<>(statusList))
            .status("ACTIVE")
            .build();

        Message savedMessage = messageRepository.save(message);

        // 4. Update Conversation's last message
        conversation.setLastMessage(LastMessage.builder()
            .messageId(savedMessage.getId())
            .content(savedMessage.getContent())
            .senderId(senderId)
            .senderName(getSenderName(conversation, senderId))
            .type(savedMessage.getType())
            .sentAt(savedMessage.getSentAt())
            .build());
        conversation.setUpdatedAt(Instant.now());
        conversationRepository.save(conversation);

        // 5. Broadcast via WebSocket
        String senderName = conversation.getLastMessage().getSenderName();
        String senderAvatar = ""; // In a real app, find this from current participant list
        broadcastService.broadcastMessage(savedMessage, conversation, senderName, senderAvatar);
    }

    public List<MessageResponse> getMessageHistory(String conversationId, UUID userId, int page, int size) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new NotFoundException("Conversation not found"));

        if (!conversation.getParticipantIds().contains(userId)) {
            throw new BadRequestException("You are not a participant in this conversation");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messagePage = messageRepository.findByConversationIdAndStatusOrderBySentAtDesc(
            conversationId, "ACTIVE", pageable);

        // Enrich with sender details
        return messagePage.getContent().stream()
            .map(m -> convertToResponse(m, conversation))
            .collect(Collectors.toList());
    }

    private String getSenderName(Conversation conversation, UUID senderId) {
        // This is a simple version; in a full app, you'd fetch from identity-service or use a local cache
        return "User " + senderId.toString().substring(0, 8);
    }

    private MessageResponse convertToResponse(Message message, Conversation conversation) {
        return MessageResponse.builder()
            .id(message.getId())
            .conversationId(message.getConversationId())
            .senderId(message.getSenderId())
            .content(message.getContent())
            .type(message.getType())
            .attachments(message.getAttachments())
            .sentAt(message.getSentAt())
            .status(message.getStatus())
            .build();
    }
}
