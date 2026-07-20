package com.example.admin_service.user.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record AdminSuspendRequest(
    @NotNull @Future Instant suspendedUntil,
    @NotBlank @Size(max = 50) String moderationReason,
    @Size(max = 2000) String note,
    @Size(max = 1000) String evidenceUrl
) {
    public AdminSuspendRequest(Instant suspendedUntil, String moderationReason, String note) {
        this(suspendedUntil, moderationReason, note, null);
    }
}
