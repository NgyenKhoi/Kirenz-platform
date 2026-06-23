package com.example.chat_service.conversation.model;

import com.example.chat_service.message.model.MessageType;
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
public class LastMessage {
    private String messageId;
    private String content;
    private UUID senderId;
    private String senderName;
    private MessageType type;
    private Instant sentAt;
}
