package com.example.notification_service.auth;

import java.security.Principal;
import java.util.UUID;

public record JwtPrincipal(
    UUID userId,
    String email,
    String username,
    String role
) implements Principal {
    @Override
    public String getName() {
        return userId.toString();
    }
}
