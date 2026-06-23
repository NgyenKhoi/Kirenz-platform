package com.example.chat_service.message.dto;

import com.example.chat_service.message.model.Attachment;
import com.example.chat_service.message.model.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private String id;
    private String conversationId;
    private UUID senderId;
    private String senderName;
    private String senderAvatar;
    private String content;
    private MessageType type;
    private List<Attachment> attachments;
    private Instant sentAt;
    private String status; // ACTIVE, DELETED
}
