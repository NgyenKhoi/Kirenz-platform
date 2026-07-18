package com.kirenz.identity_service.auth.service;

import com.kirenz.identity_service.auth.dto.LoginRequestDTO;
import com.kirenz.identity_service.auth.dto.LoginResponseDTO;
import com.kirenz.identity_service.auth.security.JWTService;
import com.kirenz.identity_service.common.exception.AccountBannedException;
import com.kirenz.identity_service.common.exception.AccountDeactivatedException;
import com.kirenz.identity_service.common.exception.AccountSuspendedException;
import com.kirenz.identity_service.common.exception.InvalidCredentialsException;
import com.kirenz.identity_service.common.exception.UserNotFoundException;
import com.kirenz.identity_service.user.mapper.UserMapper;
import com.kirenz.identity_service.user.model.AccountStatus;
import com.kirenz.identity_service.user.model.User;
import com.kirenz.identity_service.user.model.UserRole;
import com.kirenz.identity_service.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService login functionality.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Login Tests")
class AuthServiceLoginTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JWTService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthService authService;

    private LoginRequestDTO validLoginRequest;
    private User activeUser;

    @BeforeEach
    void setUp() {
        validLoginRequest = new LoginRequestDTO();
        validLoginRequest.setEmail("test@example.com");
        validLoginRequest.setPassword("password123");

        activeUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .username("testuser")
                .password("$2a$12$hashedPassword")
                .role(UserRole.USER)
                .status(AccountStatus.ACTIVE)
                .emailVerified(true)
                .build();
    }

    @Test
    @DisplayName("should successfully login with valid credentials")
    void login_WithValidCredentials_ShouldReturnLoginResponse() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("password123", activeUser.getPassword())).thenReturn(true);
        when(jwtService.generateAccessToken(activeUser)).thenReturn("access-token-123");
        when(jwtService.generateRefreshToken(activeUser)).thenReturn("refresh-token-456");
        when(userRepository.save(any(User.class))).thenReturn(activeUser);

        // Act
        LoginResponseDTO response = authService.login(validLoginRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access-token-123");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token-456");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getExpiresIn()).isEqualTo(900L);

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder).matches("password123", activeUser.getPassword());
        verify(jwtService).generateAccessToken(activeUser);
        verify(jwtService).generateRefreshToken(activeUser);
        verify(userRepository).save(argThat(user -> user.getLastLoginAt() != null));
    }

    @Test
    @DisplayName("should throw InvalidCredentialsException when email is null")
    void login_WithNullEmail_ShouldThrowInvalidCredentialsException() {
        // Arrange
        validLoginRequest.setEmail(null);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(validLoginRequest))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Email is required");

        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("should throw InvalidCredentialsException when email is empty")
    void login_WithEmptyEmail_ShouldThrowInvalidCredentialsException() {
        // Arrange
        validLoginRequest.setEmail("");

        // Act & Assert
        assertThatThrownBy(() -> authService.login(validLoginRequest))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Email is required");

        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("should throw InvalidCredentialsException when email is whitespace")
    void login_WithWhitespaceEmail_ShouldThrowInvalidCredentialsException() {
        // Arrange
        validLoginRequest.setEmail("   ");

        // Act & Assert
        assertThatThrownBy(() -> authService.login(validLoginRequest))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Email is required");

        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("should throw InvalidCredentialsException when password is null")
    void login_WithNullPassword_ShouldThrowInvalidCredentialsException() {
        // Arrange
        validLoginRequest.setPassword(null);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(validLoginRequest))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Password is required");

        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("should throw InvalidCredentialsException when password is empty")
    void login_WithEmptyPassword_ShouldThrowInvalidCredentialsException() {
        // Arrange
        validLoginRequest.setPassword("");

        // Act & Assert
        assertThatThrownBy(() -> authService.login(validLoginRequest))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Password is required");

        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("should throw InvalidCredentialsException when password is whitespace")
    void login_WithWhitespacePassword_ShouldThrowInvalidCredentialsException() {
        // Arrange
        validLoginRequest.setPassword("   ");

        // Act & Assert
        assertThatThrownBy(() -> authService.login(validLoginRequest))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Password is required");

        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("should throw UserNotFoundException when user not found by email")
    void login_WithNonexistentEmail_ShouldThrowUserNotFoundException() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.login(validLoginRequest))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessage("User or email does not exist");

        verify(userRepository).findByEmail("test@example.com");
        verify(authenticationManager, never()).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("should throw InvalidCredentialsException when password does not match")
    void login_WithWrongPassword_ShouldThrowInvalidCredentialsException() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("password123", activeUser.getPassword())).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(validLoginRequest))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid email or password");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder).matches("password123", activeUser.getPassword());
        verify(jwtService, never()).generateAccessToken(any());
    }

    @Test
    @DisplayName("should throw AccountBannedException when account status is BANNED")
    void login_WithBannedAccount_ShouldThrowAccountBannedException() {
        // Arrange
        activeUser.setStatus(AccountStatus.BANNED);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("password123", activeUser.getPassword())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(validLoginRequest))
                .isInstanceOf(AccountBannedException.class)
                .hasMessage("Account has been banned");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder).matches("password123", activeUser.getPassword());
        verify(jwtService, never()).generateAccessToken(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("should throw AccountDeactivatedException when account status is DEACTIVATED")
    void login_WithDeactivatedAccount_ShouldThrowAccountDeactivatedException() {
        // Arrange
        activeUser.setStatus(AccountStatus.DEACTIVATED);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("password123", activeUser.getPassword())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(validLoginRequest))
                .isInstanceOf(AccountDeactivatedException.class)
                .hasMessage("Account has been deactivated");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder).matches("password123", activeUser.getPassword());
        verify(jwtService, never()).generateAccessToken(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("should reject login while account suspension is active")
    void login_WithSuspendedAccount_ShouldThrowAccountSuspendedException() {
        activeUser.setStatus(AccountStatus.SUSPENDED);
        activeUser.setSuspendedUntil(Instant.now().plusSeconds(3600));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("password123", activeUser.getPassword())).thenReturn(true);

        assertThatThrownBy(() -> authService.login(validLoginRequest))
            .isInstanceOf(AccountSuspendedException.class)
            .hasMessage("Account is temporarily suspended");
        verify(jwtService, never()).generateAccessToken(any());
    }

    @Test
    @DisplayName("should reactivate expired suspension during login")
    void login_WithExpiredSuspension_ShouldReactivateAccount() {
        activeUser.setStatus(AccountStatus.SUSPENDED);
        activeUser.setSuspendedUntil(Instant.now().minusSeconds(1));
        activeUser.setModerationReason("SPAM");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("password123", activeUser.getPassword())).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(activeUser);
        when(jwtService.generateAccessToken(activeUser)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(activeUser)).thenReturn("refresh-token");

        authService.login(validLoginRequest);

        assertThat(activeUser.getStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(activeUser.getSuspendedUntil()).isNull();
        assertThat(activeUser.getModerationReason()).isNull();
    }

    @Test
    @DisplayName("should update lastLoginAt timestamp on successful login")
    void login_WithValidCredentials_ShouldUpdateLastLoginAt() {
        // Arrange
        Instant beforeLogin = Instant.now();
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("password123", activeUser.getPassword())).thenReturn(true);
        when(jwtService.generateAccessToken(activeUser)).thenReturn("access-token-123");
        when(jwtService.generateRefreshToken(activeUser)).thenReturn("refresh-token-456");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            assertThat(savedUser.getLastLoginAt()).isNotNull();
            assertThat(savedUser.getLastLoginAt()).isAfterOrEqualTo(beforeLogin);
            return savedUser;
        });

        // Act
        authService.login(validLoginRequest);

        // Assert
        verify(userRepository).save(argThat(user -> 
            user.getLastLoginAt() != null && !user.getLastLoginAt().isBefore(beforeLogin)
        ));
    }

    @Test
    @DisplayName("should use AuthenticationManager to authenticate credentials")
    void login_ShouldUseAuthenticationManager() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("password123", activeUser.getPassword())).thenReturn(true);
        when(jwtService.generateAccessToken(activeUser)).thenReturn("access-token-123");
        when(jwtService.generateRefreshToken(activeUser)).thenReturn("refresh-token-456");
        when(userRepository.save(any(User.class))).thenReturn(activeUser);

        // Act
        authService.login(validLoginRequest);

        // Assert
        verify(authenticationManager).authenticate(argThat(token -> 
            token instanceof UsernamePasswordAuthenticationToken &&
            token.getPrincipal().equals("test@example.com") &&
            token.getCredentials().equals("password123")
        ));
    }
}
