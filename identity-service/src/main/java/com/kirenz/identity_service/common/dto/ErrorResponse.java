package com.kirenz.identity_service.common.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@Builder
public class ErrorResponse {
    private boolean success;
    private String message;
    private Instant timestamp;
    private Map<String, String> errors;

    public static ErrorResponse of(String message) {
        return ErrorResponse.builder()
                .success(false)
                .message(message)
                .timestamp(Instant.now())
                .build();
    }

    public static ErrorResponse of(String message, Map<String, String> errors) {
        return ErrorResponse.builder()
                .success(false)
                .message(message)
                .timestamp(Instant.now())
                .errors(errors)
                .build();
    }
}
