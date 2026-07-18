package com.example.chat_service.message.service;

import com.example.chat_service.common.client.IdentityServiceClient;
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
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final MessageBroadcastService broadcastService;
    private final IdentityServiceClient identityServiceClient;
    private final ConversationService conversationService;
    private final org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    @Transactional
    public void processAndBroadcastMessage(SendMessageRequest request, UUID senderId) {
        // 1. Validate conversation
        Conversation conversation = conversationRepository.findById(request.getConversationId())
            .orElseThrow(() -> new NotFoundException("Conversation not found"));

        if (!conversation.getParticipantIds().contains(senderId)) {
            throw new BadRequestException("You are not a participant in this conversation");
        }

        if (conversation.getType() == com.example.chat_service.conversation.model.ConversationType.DIRECT) {
            UUID recipientId = conversation.getParticipantIds().stream()
                .filter(id -> !id.equals(senderId))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Recipient not found"));
            conversationService.ensureCanSendDirectMessage(senderId, recipientId);
        }

        // 2. Validate payload and determine message type
        validateMessageRequest(request);
        String content = request.getContent() == null ? "" : request.getContent().trim();

        // 3. Determine message type
        MessageType type = MessageType.TEXT;
        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            String primaryType = request.getAttachments().get(0).getType();
            if ("IMAGE".equalsIgnoreCase(primaryType)) type = MessageType.IMAGE;
            else if ("VIDEO".equalsIgnoreCase(primaryType)) type = MessageType.VIDEO;
            else if ("FILE".equalsIgnoreCase(primaryType)) type = MessageType.FILE;
        }

        // 4. Create & Save Message
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
            .content(content)
            .type(type)
            .attachments(request.getAttachments())
            .sentAt(Instant.now())
            .statusList(new ArrayList<>(statusList))
            .status("ACTIVE")
            .build();

        Message savedMessage = messageRepository.save(message);

        // 5. Update Conversation's last message
        conversation.setLastMessage(LastMessage.builder()
            .messageId(savedMessage.getId())
            .content(lastMessageContent(savedMessage))
            .senderId(senderId)
            .senderName(getSenderName(conversation, senderId))
            .type(savedMessage.getType())
            .sentAt(savedMessage.getSentAt())
            .build());
        conversation.setUpdatedAt(Instant.now());
        conversationRepository.save(conversation);

        // 6. Broadcast via WebSocket
        ParticipantInfo senderProfile = fetchSenderProfile(senderId);
        String senderName = senderDisplayName(conversation, senderId, senderProfile);
        String senderAvatar = senderProfile == null ? "" : senderProfile.getAvatarUrl();
        broadcastService.broadcastMessage(savedMessage, conversation, senderName, senderAvatar);
    }

    public List<MessageResponse> getMessageHistory(String conversationId, UUID userId, int page, int size) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new NotFoundException("Conversation not found"));

        if (!conversation.getParticipantIds().contains(userId)) {
            throw new BadRequestException("You are not a participant in this conversation");
        }

        markMessagesAsRead(conversationId, userId);

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messagePage = messageRepository.findByConversationIdAndStatusOrderBySentAtDesc(
            conversationId, "ACTIVE", pageable);

        List<Message> messages = messagePage.getContent();
        Map<UUID, ParticipantInfo> senderProfiles = fetchSenderProfiles(messages);

        return messages.stream()
            .map(m -> convertToResponse(m, conversation, senderProfiles))
            .collect(Collectors.toList());
    }

    private void validateMessageRequest(SendMessageRequest request) {
        boolean hasContent = request.getContent() != null && !request.getContent().trim().isEmpty();
        boolean hasAttachments = request.getAttachments() != null && !request.getAttachments().isEmpty();

        if (!hasContent && !hasAttachments) {
            throw new BadRequestException("Message must include text or media");
        }

        if (!hasAttachments) {
            return;
        }

        long imageCount = request.getAttachments().stream()
            .filter(attachment -> "IMAGE".equalsIgnoreCase(attachment.getType()))
            .count();

        if (imageCount > 10) {
            throw new BadRequestException("You can send up to 10 images in one message");
        }

        request.getAttachments().forEach(attachment -> {
            if (attachment.getUrl() == null || attachment.getUrl().isBlank()) {
                throw new BadRequestException("Attachment url is required");
            }
            if (!"IMAGE".equalsIgnoreCase(attachment.getType())
                && !"VIDEO".equalsIgnoreCase(attachment.getType())
                && !"FILE".equalsIgnoreCase(attachment.getType())) {
                throw new BadRequestException("Only image, video, and file attachments are supported");
            }
        });
    }

    private String lastMessageContent(Message message) {
        if (message.getContent() != null && !message.getContent().isBlank()) {
            return message.getContent();
        }
        if (message.getType() == MessageType.VIDEO) {
            return "Sent a video";
        }
        if (message.getType() == MessageType.FILE) {
            int count = message.getAttachments() == null ? 0 : message.getAttachments().size();
            return count > 1 ? "Sent " + count + " files" : "Sent a file";
        }
        if (message.getType() == MessageType.IMAGE) {
            int count = message.getAttachments() == null ? 0 : message.getAttachments().size();
            return count > 1 ? "Sent " + count + " media files" : "Sent media";
        }
        return "";
    }

    private String getSenderName(Conversation conversation, UUID senderId) {
        return senderDisplayName(conversation, senderId, fetchSenderProfile(senderId));
    }

    private MessageResponse convertToResponse(Message message, Conversation conversation, Map<UUID, ParticipantInfo> senderProfiles) {
        ParticipantInfo sender = senderProfiles.get(message.getSenderId());
        return MessageResponse.builder()
            .id(message.getId())
            .conversationId(message.getConversationId())
            .senderId(message.getSenderId())
            .senderName(senderDisplayName(conversation, message.getSenderId(), sender))
            .senderAvatar(sender == null ? null : sender.getAvatarUrl())
            .content(message.getContent())
            .type(message.getType())
            .attachments(message.getAttachments())
            .sentAt(message.getSentAt())
            .status(message.getStatus())
            .build();
    }

    private Map<UUID, ParticipantInfo> fetchSenderProfiles(List<Message> messages) {
        List<UUID> senderIds = messages.stream()
            .map(Message::getSenderId)
            .filter(Objects::nonNull)
            .distinct()
            .toList();
        if (senderIds.isEmpty()) {
            return Map.of();
        }
        try {
            var response = identityServiceClient.getProfilesByIds(senderIds);
            if (response != null && response.isSuccess() && response.getData() != null) {
                return response.getData().stream()
                    .filter(profile -> profile.getUserId() != null)
                    .collect(Collectors.toMap(ParticipantInfo::getUserId, Function.identity(), (left, right) -> left));
            }
        } catch (RuntimeException ex) {
            log.warn("Failed to fetch message sender profiles: {}", ex.getMessage());
        }
        return Map.of();
    }

    private ParticipantInfo fetchSenderProfile(UUID senderId) {
        if (senderId == null) {
            return null;
        }
        return fetchSenderProfiles(List.of(Message.builder().senderId(senderId).build())).get(senderId);
    }

    private String senderDisplayName(Conversation conversation, UUID senderId, ParticipantInfo sender) {
        if (senderId != null && conversation.getParticipantNicknames() != null) {
            String nickname = conversation.getParticipantNicknames().get(senderId.toString());
            if (nickname != null && !nickname.isBlank()) {
                return nickname;
            }
        }
        if (sender != null) {
            if (sender.getDisplayName() != null && !sender.getDisplayName().isBlank()) {
                return sender.getDisplayName();
            }
            if (sender.getUsername() != null && !sender.getUsername().isBlank()) {
                return sender.getUsername();
            }
        }
        return senderId == null ? "Unknown" : "User " + senderId.toString().substring(0, 8);
    }

    @Transactional
    public void markMessagesAsRead(String conversationId, UUID userId) {
        org.springframework.data.mongodb.core.query.Query query = new org.springframework.data.mongodb.core.query.Query(
            org.springframework.data.mongodb.core.query.Criteria.where("conversationId").is(conversationId)
                .and("status").is("ACTIVE")
                .and("statusList").elemMatch(
                    org.springframework.data.mongodb.core.query.Criteria.where("userId").is(userId)
                        .and("status").ne(DeliveryStatus.READ.name())
                )
        );

        org.springframework.data.mongodb.core.query.Update update = new org.springframework.data.mongodb.core.query.Update()
            .set("statusList.$.status", DeliveryStatus.READ)
            .set("statusList.$.timestamp", Instant.now());

        // Use updateMulti with positional operator - updates first matching element per document
        // Run in a loop until no more documents match
        long modified;
        do {
            var result = mongoTemplate.updateMulti(query, update, Message.class);
            modified = result.getModifiedCount();
        } while (modified > 0);

        Conversation conversation = conversationRepository.findById(conversationId).orElse(null);
        if (conversation != null) {
            broadcastService.broadcastConversationRead(conversation, userId, 0);
        }
    }
}
