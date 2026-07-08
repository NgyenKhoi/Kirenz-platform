package com.kirenz.identity_service.auth.service;

import com.kirenz.identity_service.auth.dto.LoginResponseDTO;
import com.kirenz.identity_service.auth.dto.RefreshTokenRequestDTO;
import com.kirenz.identity_service.auth.security.JWTService;
import com.kirenz.identity_service.common.exception.ExpiredTokenException;
import com.kirenz.identity_service.common.exception.InvalidTokenException;
import com.kirenz.identity_service.user.mapper.UserMapper;
import com.kirenz.identity_service.user.model.AccountStatus;
import com.kirenz.identity_service.user.model.User;
import com.kirenz.identity_service.user.model.UserRole;
import com.kirenz.identity_service.user.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService refreshToken functionality.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService RefreshToken Tests")
class AuthServiceRefreshTokenTest {

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

    private RefreshTokenRequestDTO validRefreshRequest;
    private User activeUser;
    private String validRefreshToken;

    @BeforeEach
    void setUp() {
        validRefreshToken = "valid.refresh.token";
        
        validRefreshRequest = new RefreshTokenRequestDTO();
        validRefreshRequest.setRefreshToken(validRefreshToken);

        activeUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .username("test@example.com")
                .password("$2a$12$hashedPassword")
                .role(UserRole.USER)
                .status(AccountStatus.ACTIVE)
                .emailVerified(true)
                .build();
    }

    @Test
    @DisplayName("should successfully refresh tokens with valid refresh token")
    void refreshToken_WithValidToken_ShouldReturnNewTokens() {
        // Arrange
        when(jwtService.extractEmail(validRefreshToken)).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(jwtService.isTokenExpired(validRefreshToken)).thenReturn(false);
        when(jwtService.validateToken(validRefreshToken)).thenReturn(true);
        when(jwtService.generateAccessToken(activeUser)).thenReturn("new-access-token");
        when(jwtService.generateRefreshToken(activeUser)).thenReturn("new-refresh-token");

        // Act
        LoginResponseDTO response = authService.refreshToken(validRefreshRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("new-access-token");
        assertThat(response.getRefreshToken()).isEqualTo("new-refresh-token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getExpiresIn()).isEqualTo(900L);

        verify(jwtService).extractEmail(validRefreshToken);
        verify(userRepository).findByEmail("test@example.com");
        verify(jwtService).isTokenExpired(validRefreshToken);
        verify(jwtService).validateToken(validRefreshToken);
        verify(jwtService).generateAccessToken(activeUser);
        verify(jwtService).generateRefreshToken(activeUser);
    }

    @Test
    @DisplayName("should throw InvalidTokenException when refresh token is null")
    void refreshToken_WithNullToken_ShouldThrowInvalidTokenException() {
        // Arrange
        validRefreshRequest.setRefreshToken(null);

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshToken(validRefreshRequest))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Refresh token is required");

        verify(jwtService, never()).extractEmail(anyString());
    }

    @Test
    @DisplayName("should throw InvalidTokenException when refresh token is empty")
    void refreshToken_WithEmptyToken_ShouldThrowInvalidTokenException() {
        // Arrange
        validRefreshRequest.setRefreshToken("");

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshToken(validRefreshRequest))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Refresh token is required");

        verify(jwtService, never()).extractEmail(anyString());
    }

    @Test
    @DisplayName("should throw InvalidTokenException when refresh token is whitespace")
    void refreshToken_WithWhitespaceToken_ShouldThrowInvalidTokenException() {
        // Arrange
        validRefreshRequest.setRefreshToken("   ");

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshToken(validRefreshRequest))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Refresh token is required");

        verify(jwtService, never()).extractEmail(anyString());
    }

    @Test
    @DisplayName("should throw InvalidTokenException when email extraction fails")
    void refreshToken_WhenEmailExtractionFails_ShouldThrowInvalidTokenException() {
        // Arrange
        when(jwtService.extractEmail(validRefreshToken))
                .thenThrow(new RuntimeException("Token parsing failed"));

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshToken(validRefreshRequest))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("Invalid refresh token:");

        verify(jwtService).extractEmail(validRefreshToken);
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    @DisplayName("should throw InvalidTokenException when extracted email is null")
    void refreshToken_WhenExtractedEmailIsNull_ShouldThrowInvalidTokenException() {
        // Arrange
        when(jwtService.extractEmail(validRefreshToken)).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshToken(validRefreshRequest))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Invalid refresh token: email not found");

        verify(jwtService).extractEmail(validRefreshToken);
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    @DisplayName("should throw InvalidTokenException when extracted email is empty")
    void refreshToken_WhenExtractedEmailIsEmpty_ShouldThrowInvalidTokenException() {
        // Arrange
        when(jwtService.extractEmail(validRefreshToken)).thenReturn("");

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshToken(validRefreshRequest))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Invalid refresh token: email not found");

        verify(jwtService).extractEmail(validRefreshToken);
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    @DisplayName("should throw InvalidTokenException when user not found by email")
    void refreshToken_WhenUserNotFound_ShouldThrowInvalidTokenException() {
        // Arrange
        when(jwtService.extractEmail(validRefreshToken)).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshToken(validRefreshRequest))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Invalid refresh token: user not found");

        verify(jwtService).extractEmail(validRefreshToken);
        verify(userRepository).findByEmail("test@example.com");
        verify(jwtService, never()).isTokenExpired(anyString());
    }

    @Test
    @DisplayName("should throw ExpiredTokenException when token is expired")
    void refreshToken_WhenTokenIsExpired_ShouldThrowExpiredTokenException() {
        // Arrange
        when(jwtService.extractEmail(validRefreshToken)).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(jwtService.isTokenExpired(validRefreshToken)).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshToken(validRefreshRequest))
                .isInstanceOf(ExpiredTokenException.class)
                .hasMessage("Refresh token has expired");

        verify(jwtService).extractEmail(validRefreshToken);
        verify(userRepository).findByEmail("test@example.com");
        verify(jwtService).isTokenExpired(validRefreshToken);
        verify(jwtService, never()).generateAccessToken(any());
    }

    @Test
    @DisplayName("should throw ExpiredTokenException when ExpiredJwtException is thrown during validation")
    void refreshToken_WhenExpiredJwtExceptionThrown_ShouldThrowExpiredTokenException() {
        // Arrange
        when(jwtService.extractEmail(validRefreshToken)).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(jwtService.isTokenExpired(validRefreshToken)).thenReturn(false);
        when(jwtService.validateToken(validRefreshToken)).thenThrow(mock(ExpiredJwtException.class));

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshToken(validRefreshRequest))
                .isInstanceOf(ExpiredTokenException.class)
                .hasMessage("Refresh token has expired");

        verify(jwtService).extractEmail(validRefreshToken);
        verify(userRepository).findByEmail("test@example.com");
        verify(jwtService).isTokenExpired(validRefreshToken);
        verify(jwtService).validateToken(validRefreshToken);
        verify(jwtService, never()).generateAccessToken(any());
    }

    @Test
    @DisplayName("should throw InvalidTokenException when token signature is invalid")
    void refreshToken_WhenTokenSignatureInvalid_ShouldThrowInvalidTokenException() {
        // Arrange
        when(jwtService.extractEmail(validRefreshToken)).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(jwtService.isTokenExpired(validRefreshToken)).thenReturn(false);
        when(jwtService.validateToken(validRefreshToken)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshToken(validRefreshRequest))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Invalid refresh token signature");

        verify(jwtService).extractEmail(validRefreshToken);
        verify(userRepository).findByEmail("test@example.com");
        verify(jwtService).isTokenExpired(validRefreshToken);
        verify(jwtService).validateToken(validRefreshToken);
        verify(jwtService, never()).generateAccessToken(any());
    }

    @Test
    @DisplayName("should throw InvalidTokenException when validation throws unexpected exception")
    void refreshToken_WhenValidationThrowsException_ShouldThrowInvalidTokenException() {
        // Arrange
        when(jwtService.extractEmail(validRefreshToken)).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(jwtService.isTokenExpired(validRefreshToken)).thenReturn(false);
        when(jwtService.validateToken(validRefreshToken))
                .thenThrow(new RuntimeException("Unexpected validation error"));

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshToken(validRefreshRequest))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("Invalid refresh token:");

        verify(jwtService).extractEmail(validRefreshToken);
        verify(userRepository).findByEmail("test@example.com");
        verify(jwtService).isTokenExpired(validRefreshToken);
        verify(jwtService).validateToken(validRefreshToken);
        verify(jwtService, never()).generateAccessToken(any());
    }

    @Test
    @DisplayName("should generate both new access token and refresh token")
    void refreshToken_ShouldGenerateBothNewTokens() {
        // Arrange
        when(jwtService.extractEmail(validRefreshToken)).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(jwtService.isTokenExpired(validRefreshToken)).thenReturn(false);
        when(jwtService.validateToken(validRefreshToken)).thenReturn(true);
        when(jwtService.generateAccessToken(activeUser)).thenReturn("new-access-token");
        when(jwtService.generateRefreshToken(activeUser)).thenReturn("new-refresh-token");

        // Act
        LoginResponseDTO response = authService.refreshToken(validRefreshRequest);

        // Assert
        assertThat(response.getAccessToken()).isNotEqualTo(validRefreshToken);
        assertThat(response.getRefreshToken()).isNotEqualTo(validRefreshToken);
        
        verify(jwtService).generateAccessToken(activeUser);
        verify(jwtService).generateRefreshToken(activeUser);
    }
}
