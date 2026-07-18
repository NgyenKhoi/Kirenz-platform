package com.kirenz.identity_service.admin.security;

import com.kirenz.identity_service.common.exception.BadRequestException;
import com.kirenz.identity_service.user.model.User;
import com.kirenz.identity_service.user.model.UserRole;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CurrentAdmin {

    public UUID id() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null
            && authentication.getPrincipal() instanceof User user
            && user.getRole() == UserRole.ADMIN) {
            return user.getId();
        }
        throw new BadRequestException("Authenticated administrator is required");
    }
}
