package com.kirenz.identity_service.admin.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record SuspendUserRequest(
    @NotNull @Future Instant suspendedUntil,
    @NotBlank @Size(max = 255) String moderationReason
) {
}
