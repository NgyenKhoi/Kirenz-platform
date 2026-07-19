package com.example.chat_service.conversation.service;

import com.example.chat_service.common.client.IdentityServiceClient;
import com.example.chat_service.common.client.UserServiceClient;
import com.example.chat_service.common.exception.BadRequestException;
import com.example.chat_service.conversation.dto.CreateConversationRequest;
import com.example.chat_service.conversation.model.Conversation;
import com.example.chat_service.conversation.model.ConversationType;
import com.example.chat_service.conversation.repository.ConversationRepository;
import com.example.chat_service.message.repository.MessageRepository;
import com.example.chat_service.message.service.MessageBroadcastService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConversationServiceTest {

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private IdentityServiceClient identityServiceClient;

    @Mock
    private UserServiceClient userServiceClient;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private MessageBroadcastService messageBroadcastService;

    @InjectMocks
    private ConversationService conversationService;

    @Test
    void createConversationRejectsGroupWithFewerThanThreeUniqueParticipants() {
        UUID creatorId = UUID.randomUUID();
        CreateConversationRequest request = CreateConversationRequest.builder()
            .name("Small group")
            .type(ConversationType.GROUP)
            .participantIds(List.of(UUID.randomUUID()))
            .build();

        assertThatThrownBy(() -> conversationService.createConversation(request, creatorId))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("Group chat must have at least 3 participants");

        verifyNoInteractions(conversationRepository);
    }

    @Test
    void createConversationDoesNotCountDuplicateParticipantIdsTowardGroupMinimum() {
        UUID creatorId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();
        CreateConversationRequest request = CreateConversationRequest.builder()
            .name("Duplicate members")
            .type(ConversationType.GROUP)
            .participantIds(List.of(memberId, memberId))
            .build();

        assertThatThrownBy(() -> conversationService.createConversation(request, creatorId))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("Group chat must have at least 3 participants");

        verifyNoInteractions(conversationRepository);
    }

    @Test
    void directConversationChecksRecipientPrivacyBeforeLookingUpExistingConversation() {
        UUID creatorId = UUID.randomUUID();
        UUID recipientId = UUID.randomUUID();
        CreateConversationRequest request = CreateConversationRequest.builder()
            .type(ConversationType.DIRECT)
            .participantIds(List.of(recipientId))
            .build();
        when(userServiceClient.checkDirectMessagePermission(creatorId, recipientId)).thenReturn(false);

        assertThatThrownBy(() -> conversationService.createConversation(request, creatorId))
            .isInstanceOf(AccessDeniedException.class)
            .hasMessage("This user does not accept messages from people who are not friends.");

        verifyNoInteractions(conversationRepository);
    }

    @Test
    void createGroupConversationRejectsParticipantsBlockedByPrivacy() {
        UUID creatorId = UUID.randomUUID();
        UUID allowedMemberId = UUID.randomUUID();
        UUID restrictedMemberId = UUID.randomUUID();
        CreateConversationRequest request = CreateConversationRequest.builder()
            .name("Privacy aware group")
            .type(ConversationType.GROUP)
            .participantIds(List.of(allowedMemberId, restrictedMemberId))
            .build();

        when(userServiceClient.checkDirectMessagePermission(creatorId, allowedMemberId)).thenReturn(true);
        when(userServiceClient.checkDirectMessagePermission(creatorId, restrictedMemberId)).thenReturn(false);

        assertThatThrownBy(() -> conversationService.createConversation(request, creatorId))
            .isInstanceOf(AccessDeniedException.class)
            .hasMessage("This user does not accept group chat invitations from people who are not friends.");

        verify(conversationRepository, never()).save(any());
    }

    @Test
    void addParticipantRejectsUserBlockedByPrivacy() {
        UUID requesterId = UUID.randomUUID();
        UUID existingMemberId = UUID.randomUUID();
        UUID restrictedMemberId = UUID.randomUUID();
        Conversation conversation = Conversation.builder()
            .id("conversation-1")
            .type(ConversationType.GROUP)
            .participantIds(new ArrayList<>(List.of(requesterId, existingMemberId)))
            .adminIds(new ArrayList<>(List.of(requesterId)))
            .status("ACTIVE")
            .build();

        when(conversationRepository.findById("conversation-1")).thenReturn(Optional.of(conversation));
        when(userServiceClient.checkDirectMessagePermission(requesterId, restrictedMemberId)).thenReturn(false);

        assertThatThrownBy(() -> conversationService.addParticipant("conversation-1", restrictedMemberId, requesterId))
            .isInstanceOf(AccessDeniedException.class)
            .hasMessage("This user does not accept group chat invitations from people who are not friends.");

        verify(conversationRepository, never()).save(any());
    }
}
