package com.example.chat_service.conversation.service;

import com.example.chat_service.common.client.IdentityServiceClient;
import com.example.chat_service.common.dto.ApiResponse;
import com.example.chat_service.common.exception.BadRequestException;
import com.example.chat_service.common.exception.NotFoundException;
import com.example.chat_service.conversation.dto.ConversationResponse;
import com.example.chat_service.conversation.dto.CreateConversationRequest;
import com.example.chat_service.conversation.dto.ParticipantInfo;
import com.example.chat_service.conversation.model.Conversation;
import com.example.chat_service.conversation.model.ConversationType;
import com.example.chat_service.conversation.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final IdentityServiceClient identityServiceClient;
    private final com.example.chat_service.common.client.UserServiceClient userServiceClient;
    private final com.example.chat_service.message.repository.MessageRepository messageRepository;

    public ConversationResponse createConversation(CreateConversationRequest request, UUID createdBy) {
        if (request.getType() == ConversationType.GROUP && (request.getName() == null || request.getName().isBlank())) {
            throw new BadRequestException("Group name is required for group chat");
        }

        List<UUID> participants = new ArrayList<>(request.getParticipantIds());
        if (!participants.contains(createdBy)) {
            participants.add(createdBy);
        }

        if (request.getType() == ConversationType.DIRECT) {
            if (participants.size() != 2) {
                throw new BadRequestException("Direct chat must have exactly 2 participants");
            }
            // Find existing direct conversation
            Optional<Conversation> existing = conversationRepository.findExactDirectConversation(
                participants, 2, ConversationType.DIRECT, "ACTIVE");
            if (existing.isPresent()) {
                return convertToResponse(existing.get(), createdBy);
            }
        }

        if (request.getType() == ConversationType.DIRECT) {
            UUID recipientId = participants.stream()
                .filter(id -> !id.equals(createdBy))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Recipient not found"));

            try {
                boolean canMessage = userServiceClient.checkDirectMessagePermission(createdBy, recipientId);
                log.info("Direct message permission check for sender {} to receiver {}: {}", createdBy, recipientId, canMessage);
                if (!canMessage) {
                    throw new org.springframework.security.access.AccessDeniedException("This user has disabled direct messages.");
                }
            } catch (Exception e) {
                log.error("Error checking direct message permission: {}", e.getMessage(), e);
                throw new BadRequestException("Failed to verify direct message permission: " + e.getMessage());
            }
        }

        Conversation conversation = Conversation.builder()
            .type(request.getType())
            .name(request.getName())
            .participantIds(participants)
            .createdBy(createdBy)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .status("ACTIVE")
            .build();

        Conversation saved = conversationRepository.save(conversation);
        return convertToResponse(saved, createdBy);
    }

    public List<ConversationResponse> getUserConversations(UUID userId) {
        return conversationRepository.findByParticipantIdsContainingAndStatusOrderByUpdatedAtDesc(userId, "ACTIVE")
            .stream()
            .map(conv -> convertToResponse(conv, userId))
            .collect(Collectors.toList());
    }

    public ConversationResponse getConversationById(String id, UUID userId) {
        Conversation conversation = conversationRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Conversation not found"));

        if (!conversation.getParticipantIds().contains(userId)) {
            throw new BadRequestException("You are not a participant of this conversation");
        }

        return convertToResponse(conversation, userId);
    }

    public void addParticipant(String conversationId, UUID userId, UUID requesterId) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new NotFoundException("Conversation not found"));

        if (!conversation.getParticipantIds().contains(requesterId)) {
            throw new BadRequestException("Only participants can add members");
        }

        if (conversation.getType() == ConversationType.DIRECT) {
            throw new BadRequestException("Cannot add participants to a direct chat");
        }

        if (!conversation.getParticipantIds().contains(userId)) {
            conversation.getParticipantIds().add(userId);
            conversation.setUpdatedAt(Instant.now());
            conversationRepository.save(conversation);
        }
    }

    public void removeParticipant(String conversationId, UUID userId, UUID requesterId) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new NotFoundException("Conversation not found"));

        if (!conversation.getParticipantIds().contains(requesterId)) {
            throw new BadRequestException("Only participants can remove members");
        }

        if (conversation.getType() == ConversationType.DIRECT) {
            throw new BadRequestException("Cannot remove participants from a direct chat");
        }

        if (conversation.getParticipantIds().contains(userId)) {
            conversation.getParticipantIds().remove(userId);
            if (conversation.getParticipantIds().isEmpty()) {
                conversation.setStatus("DELETED");
            }
            conversation.setUpdatedAt(Instant.now());
            conversationRepository.save(conversation);
        }
    }

    public ConversationResponse getOrCreateDirectConversation(UUID user1Id, UUID user2Id) {
        List<UUID> participants = Arrays.asList(user1Id, user2Id);
        Optional<Conversation> existing = conversationRepository.findExactDirectConversation(
            participants, 2, ConversationType.DIRECT, "ACTIVE");

        if (existing.isPresent()) {
            return convertToResponse(existing.get(), user1Id);
        }

        CreateConversationRequest request = CreateConversationRequest.builder()
            .type(ConversationType.DIRECT)
            .participantIds(participants)
            .build();

        return createConversation(request, user1Id);
    }

    private ConversationResponse convertToResponse(Conversation conversation, UUID currentUserId) {
        List<ParticipantInfo> participants = fetchParticipantInfos(conversation.getParticipantIds());

        return ConversationResponse.builder()
            .id(conversation.getId())
            .type(conversation.getType())
            .name(conversation.getName())
            .participants(participants)
            .lastMessage(conversation.getLastMessage())
            .createdAt(conversation.getCreatedAt())
            .updatedAt(conversation.getUpdatedAt())
            .unreadCount(calculateUnreadCount(conversation.getId(), currentUserId))
            .build();
    }

    private List<ParticipantInfo> fetchParticipantInfos(List<UUID> ids) {
        try {
            ApiResponse<List<ParticipantInfo>> response = identityServiceClient.getProfilesByIds(ids);
            if (response != null && response.isSuccess()) {
                return response.getData();
            }
        } catch (Exception e) {
            log.error("Failed to fetch participant profiles: {}", e.getMessage());
        }
        // Fallback or empty if identity-service fails
        return ids.stream().map(id -> ParticipantInfo.builder().userId(id).username("Unknown").build()).toList();
    }

    private int calculateUnreadCount(String conversationId, UUID userId) {
        return (int) messageRepository.countUnreadMessages(conversationId, userId);
    }
}
