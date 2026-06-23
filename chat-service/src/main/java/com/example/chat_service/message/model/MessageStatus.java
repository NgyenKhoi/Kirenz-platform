package com.example.chat_service.message.model;

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
public class MessageStatus {
    private UUID userId;
    private DeliveryStatus status;
    private Instant timestamp;
}
