package com.example.chat_service.conversation.dto;

import com.example.chat_service.conversation.model.LastMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationUpdateMessage {
    private String conversationId;
    private String conversationName;
    private LastMessage lastMessage;
    private int unreadCount;
    private Instant updatedAt;
}
