package com.example.chat_service.auth;

import java.util.UUID;

public record JwtPrincipal(
    UUID userId,
    String email,
    String username,
    String role
) {
}
