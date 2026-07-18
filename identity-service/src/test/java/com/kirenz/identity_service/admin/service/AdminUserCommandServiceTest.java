package com.kirenz.identity_service.admin.service;

import com.kirenz.identity_service.common.exception.BadRequestException;
import com.kirenz.identity_service.user.model.AccountStatus;
import com.kirenz.identity_service.user.model.User;
import com.kirenz.identity_service.user.model.UserRole;
import com.kirenz.identity_service.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminUserCommandServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminUserCommandService adminUserCommandService;

    @Test
    void bansActiveUser() {
        UUID adminId = UUID.randomUUID();
        User user = user(AccountStatus.ACTIVE, UserRole.USER);
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        var result = adminUserCommandService.ban(user.getId(), adminId);

        assertThat(result.status()).isEqualTo(AccountStatus.BANNED);
        assertThat(result.username()).isEqualTo("kirenz_user");
        verify(userRepository).save(user);
    }

    @Test
    void unbansBannedUser() {
        UUID adminId = UUID.randomUUID();
        User user = user(AccountStatus.BANNED, UserRole.USER);
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        var result = adminUserCommandService.unban(user.getId(), adminId);

        assertThat(result.status()).isEqualTo(AccountStatus.ACTIVE);
    }

    @Test
    void rejectsRepeatedBan() {
        UUID adminId = UUID.randomUUID();
        User user = user(AccountStatus.BANNED, UserRole.USER);
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> adminUserCommandService.ban(user.getId(), adminId))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("Account is already banned");
        verify(userRepository, never()).save(user);
    }

    @Test
    void rejectsManagingAnotherAdmin() {
        UUID adminId = UUID.randomUUID();
        User user = user(AccountStatus.ACTIVE, UserRole.ADMIN);
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> adminUserCommandService.ban(user.getId(), adminId))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("Administrator accounts cannot be managed from this action");
    }

    @Test
    void rejectsSelfBanBeforeDatabaseLookup() {
        UUID adminId = UUID.randomUUID();

        assertThatThrownBy(() -> adminUserCommandService.ban(adminId, adminId))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("Administrators cannot change their own account status");
        verify(userRepository, never()).findById(adminId);
    }

    private User user(AccountStatus status, UserRole role) {
        return User.builder()
            .id(UUID.randomUUID())
            .email("user@kirenz.local")
            .username("kirenz_user")
            .password("hashed")
            .status(status)
            .role(role)
            .emailVerified(true)
            .build();
    }
}
