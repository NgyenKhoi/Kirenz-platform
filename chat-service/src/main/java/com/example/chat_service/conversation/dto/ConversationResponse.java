package com.example.chat_service.conversation.dto;

import com.example.chat_service.conversation.model.ConversationType;
import com.example.chat_service.conversation.model.LastMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {
    private String id;
    private ConversationType type;
    private String name;
    private List<ParticipantInfo> participants;
    private LastMessage lastMessage;
    private Instant createdAt;
    private Instant updatedAt;
    private int unreadCount;
}
