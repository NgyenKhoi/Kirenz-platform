package com.example.admin_service.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminUserActionRequest(
    @NotBlank(message = "reason is required")
    @Size(max = 50, message = "reason must not exceed 50 characters")
    String reason,

    @Size(max = 2000, message = "note must not exceed 2000 characters")
    String note,

    @Size(max = 1000) String evidenceUrl
) {
    public AdminUserActionRequest(String reason, String note) { this(reason, note, null); }
}
