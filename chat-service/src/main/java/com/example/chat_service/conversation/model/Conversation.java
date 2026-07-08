package com.example.chat_service.conversation.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Document(collection = "conversations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {

    @Id
    private String id;

    private ConversationType type;

    private String name;

    @Indexed
    @Builder.Default
    private List<UUID> participantIds = new ArrayList<>();

    @Builder.Default
    private List<UUID> adminIds = new ArrayList<>();

    @Builder.Default
    private Map<String, String> participantNicknames = new HashMap<>();

    private UUID createdBy;

    private Instant createdAt;

    @Indexed
    private Instant updatedAt;

    private LastMessage lastMessage;

    @Builder.Default
    private String status = "ACTIVE";
}
