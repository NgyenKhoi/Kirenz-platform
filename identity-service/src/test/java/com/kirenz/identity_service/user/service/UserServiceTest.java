package com.kirenz.identity_service.user.service;

import com.kirenz.identity_service.common.exception.UserNotFoundException;
import com.kirenz.identity_service.user.dto.UserProfileDTO;
import com.kirenz.identity_service.user.mapper.UserMapper;
import com.kirenz.identity_service.user.model.AccountStatus;
import com.kirenz.identity_service.user.model.User;
import com.kirenz.identity_service.user.model.UserRole;
import com.kirenz.identity_service.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UserProfileDTO testUserProfileDTO;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
            .id(UUID.randomUUID())
            .email("test@example.com")
            .username("testuser")
            .password("hashedPassword")
            .displayName("Test User")
            .role(UserRole.USER)
            .status(AccountStatus.ACTIVE)
            .emailVerified(false)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();

        testUserProfileDTO = UserProfileDTO.builder()
            .id(testUser.getId())
            .email(testUser.getEmail())
            .username(testUser.getUsername())
            .displayName(testUser.getDisplayName())
            .role(testUser.getRole())
            .emailVerified(testUser.getEmailVerified())
            .createdAt(testUser.getCreatedAt())
            .updatedAt(testUser.getUpdatedAt())
            .build();

        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void getCurrentUserProfile_WithUserPrincipal_ReturnsUserProfile() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(testUser);
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(userMapper.toUserProfileDTO(testUser)).thenReturn(testUserProfileDTO);

        UserProfileDTO result = userService.getCurrentUserProfile();

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(testUser.getId());
        assertThat(result.getEmail()).isEqualTo(testUser.getEmail());
        assertThat(result.getUsername()).isEqualTo(testUser.getUsername());

        verify(userRepository).findById(testUser.getId());
        verify(userMapper).toUserProfileDTO(testUser);
    }

    @Test
    void getCurrentUserProfile_WithUserDetailsPrincipal_ReturnsUserProfile() {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername(testUser.getEmail())
            .password(testUser.getPassword())
            .authorities("ROLE_USER")
            .build();

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(userMapper.toUserProfileDTO(testUser)).thenReturn(testUserProfileDTO);

        UserProfileDTO result = userService.getCurrentUserProfile();

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(testUser.getId());
        assertThat(result.getEmail()).isEqualTo(testUser.getEmail());

        verify(userRepository).findByEmail(testUser.getEmail());
        verify(userRepository).findById(testUser.getId());
        verify(userMapper).toUserProfileDTO(testUser);
    }

    @Test
    void getCurrentUserProfile_WithUserDetailsPrincipal_UserNotFoundByEmail_ThrowsException() {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername("nonexistent@example.com")
            .password("password")
            .authorities("ROLE_USER")
            .build();

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getCurrentUserProfile())
            .isInstanceOf(UserNotFoundException.class)
            .hasMessageContaining("User not found with email: nonexistent@example.com");

        verify(userRepository).findByEmail("nonexistent@example.com");
        verify(userRepository, never()).findById(any());
        verify(userMapper, never()).toUserProfileDTO(any());
    }

    @Test
    void getCurrentUserProfile_UserNotFoundById_ThrowsException() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(testUser);
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getCurrentUserProfile())
            .isInstanceOf(UserNotFoundException.class)
            .hasMessageContaining("User not found with id: " + testUser.getId());

        verify(userRepository).findById(testUser.getId());
        verify(userMapper, never()).toUserProfileDTO(any());
    }

    @Test
    void getCurrentUserProfile_WithInvalidPrincipal_ThrowsException() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn("InvalidPrincipalType");

        assertThatThrownBy(() -> userService.getCurrentUserProfile())
            .isInstanceOf(UserNotFoundException.class)
            .hasMessageContaining("Unable to extract user from authentication");

        verify(userRepository, never()).findById(any());
        verify(userRepository, never()).findByEmail(any());
        verify(userMapper, never()).toUserProfileDTO(any());
    }
}
