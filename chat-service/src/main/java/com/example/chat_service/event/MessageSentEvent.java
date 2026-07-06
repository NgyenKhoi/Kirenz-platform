package com.example.chat_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageSentEvent {
    private String messageId;
    private String conversationId;
    private UUID senderId;
    private UUID receiverId;
    private String content;
    private String messageType;
    private Instant sentAt;
}
