package com.example.chat_service.presence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPresenceDto {
    private boolean isOnline;
    private Long lastSeen;
}
