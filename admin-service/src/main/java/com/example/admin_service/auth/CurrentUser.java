package com.example.admin_service.auth;

import com.example.admin_service.common.exception.ForbiddenException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CurrentUser {

    public UUID id() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof JwtPrincipal principal) {
            return principal.userId();
        }
        throw new ForbiddenException("Authentication is required");
    }
}
