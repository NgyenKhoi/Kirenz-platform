package com.example.chat_service.auth;

import com.example.chat_service.common.exception.ForbiddenException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@Slf4j
public class CurrentUser {

    public UUID id() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            log.error("No authentication found in SecurityContext");
            throw new ForbiddenException("Authentication required");
        }
        
        Object principal = authentication.getPrincipal();
        log.info("Principal type: {}, Principal: {}", 
            principal != null ? principal.getClass().getName() : "null", 
            principal);
            
        if (principal instanceof JwtPrincipal jwtPrincipal) {
            return jwtPrincipal.userId();
        }
        
        log.error("Principal is not JwtPrincipal, actual type: {}", 
            principal != null ? principal.getClass().getName() : "null");
        throw new ForbiddenException("Authenticated user is required");
    }
}
