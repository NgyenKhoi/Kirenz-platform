package com.kirenz.user_service.common.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ErrorResponse {

    private boolean success;
    private String message;
    private Instant timestamp;

    public static ErrorResponse of(String message) {
        return ErrorResponse.builder()
            .success(false)
            .message(message)
            .timestamp(Instant.now())
            .build();
    }
}
