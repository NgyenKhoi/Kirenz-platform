package com.example.chat_service.conversation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantInfo {
    @com.fasterxml.jackson.annotation.JsonAlias({"id", "userId"})
    private UUID userId;
    private String username;
    private String displayName;
    private String avatarUrl;
    private Boolean allowDirectMessages;
    private String nickname;
    private Boolean admin;
}
