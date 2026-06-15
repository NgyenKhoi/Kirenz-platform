package com.kirenz.user_service.identity;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record IdentityUserProfileResponse(
    UUID id,
    String email,
    String username,
    String displayName,
    String avatarUrl,
    String bio,
    LocalDate birthDate,
    String gender,
    String location,
    String website,
    String role,
    Boolean emailVerified,
    Instant createdAt,
    Instant updatedAt
) {
}
