package com.example.chat_service.conversation.dto;

import com.example.chat_service.conversation.model.ConversationType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversationRequest {

    private String name;

    @NotNull
    private ConversationType type;

    @NotEmpty
    private List<UUID> participantIds;
}
