package com.example.social_service.auth;

import com.example.social_service.common.exception.ForbiddenException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CurrentUserTest {

    private final CurrentUser currentUser = new CurrentUser();

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void unauthenticatedUserCannotResolveCurrentUser() {
        SecurityContextHolder.clearContext();

        assertThatThrownBy(currentUser::id)
            .isInstanceOf(ForbiddenException.class)
            .hasMessage("Authenticated user is required");
    }
}
