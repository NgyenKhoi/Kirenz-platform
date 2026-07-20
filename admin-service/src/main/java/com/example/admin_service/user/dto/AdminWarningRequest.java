package com.example.admin_service.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminWarningRequest(
    @NotBlank(message = "reason is required")
    @Size(max = 50, message = "reason must not exceed 50 characters")
    String reason,

    @NotBlank(message = "message is required")
    @Size(max = 1000, message = "message must not exceed 1000 characters")
    String message,

    @Size(max = 2000, message = "note must not exceed 2000 characters")
    String note,

    @Size(max = 1000, message = "evidenceUrl must not exceed 1000 characters")
    String evidenceUrl
) {
    public AdminWarningRequest(String reason, String message, String note) {
        this(reason, message, note, null);
    }
}
