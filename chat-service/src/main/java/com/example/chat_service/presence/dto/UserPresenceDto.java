package com.example.chat_service.presence.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPresenceDto {
    @JsonProperty("isOnline")
    private boolean isOnline;
    private Long lastSeen;
}
