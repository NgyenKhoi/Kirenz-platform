package com.example.chat_service.conversation.service;

import com.example.chat_service.common.client.IdentityServiceClient;
import com.example.chat_service.common.client.UserServiceClient;
import com.example.chat_service.common.exception.BadRequestException;
import com.example.chat_service.conversation.dto.CreateConversationRequest;
import com.example.chat_service.conversation.model.ConversationType;
import com.example.chat_service.conversation.repository.ConversationRepository;
import com.example.chat_service.message.repository.MessageRepository;
import com.example.chat_service.message.service.MessageBroadcastService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;

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
}
