package com.example.social_service.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private boolean success;
    private String message;

    public static ErrorResponse of(String message) {
        return ErrorResponse.builder()
            .success(false)
            .message(message)
            .build();
    }
}
