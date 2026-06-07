package com.kirenz.identity_service.auth.controller;

import com.kirenz.identity_service.auth.dto.LoginRequestDTO;
import com.kirenz.identity_service.auth.dto.LoginResponseDTO;
import com.kirenz.identity_service.auth.dto.RefreshTokenRequestDTO;
import com.kirenz.identity_service.auth.dto.RegisterRequestDTO;
import com.kirenz.identity_service.auth.dto.RegisterResponseDTO;
import com.kirenz.identity_service.auth.service.AuthService;
import com.kirenz.identity_service.common.dto.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthController Tests")
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private RegisterRequestDTO registerRequest;
    private RegisterResponseDTO registerResponse;
    private LoginRequestDTO loginRequest;
    private LoginResponseDTO loginResponse;
    private RefreshTokenRequestDTO refreshTokenRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequestDTO();
        registerRequest.setEmail("test@example.com");
        registerRequest.setUsername("testuser");
        registerRequest.setPassword("password123");
        registerRequest.setDisplayName("Test User");

        registerResponse = RegisterResponseDTO.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .username("testuser")
                .displayName("Test User")
                .createdAt(Instant.now())
                .build();

        loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        loginResponse = LoginResponseDTO.builder()
                .accessToken("access-token")
                .refreshToken("refresh-token")
                .tokenType("Bearer")
                .expiresIn(900L)
                .build();

        refreshTokenRequest = new RefreshTokenRequestDTO();
        refreshTokenRequest.setRefreshToken("valid-refresh-token");
    }

    @Test
    @DisplayName("Register endpoint should return 201 CREATED with user data")
    void register_shouldReturnCreatedStatusWithUserData() {
        when(authService.register(any(RegisterRequestDTO.class))).thenReturn(registerResponse);

        ResponseEntity<ApiResponse<RegisterResponseDTO>> response = authController.register(registerRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getMessage()).isEqualTo("User registered successfully");
        assertThat(response.getBody().getData()).isEqualTo(registerResponse);
        verify(authService).register(registerRequest);
    }

    @Test
    @DisplayName("Register endpoint should wrap response in ApiResponse.success")
    void register_shouldWrapResponseInApiResponseSuccess() {
        when(authService.register(any(RegisterRequestDTO.class))).thenReturn(registerResponse);

        ResponseEntity<ApiResponse<RegisterResponseDTO>> response = authController.register(registerRequest);

        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getEmail()).isEqualTo("test@example.com");
        assertThat(response.getBody().getData().getUsername()).isEqualTo("testuser");
    }

    @Test
    @DisplayName("Login endpoint should return 200 OK with tokens")
    void login_shouldReturnOkStatusWithTokens() {
        when(authService.login(any(LoginRequestDTO.class))).thenReturn(loginResponse);

        ResponseEntity<ApiResponse<LoginResponseDTO>> response = authController.login(loginRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getMessage()).isEqualTo("Login successful");
        assertThat(response.getBody().getData()).isEqualTo(loginResponse);
        verify(authService).login(loginRequest);
    }

    @Test
    @DisplayName("Login endpoint should return tokens with correct type and expiration")
    void login_shouldReturnTokensWithCorrectTypeAndExpiration() {
        when(authService.login(any(LoginRequestDTO.class))).thenReturn(loginResponse);

        ResponseEntity<ApiResponse<LoginResponseDTO>> response = authController.login(loginRequest);

        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getAccessToken()).isEqualTo("access-token");
        assertThat(response.getBody().getData().getRefreshToken()).isEqualTo("refresh-token");
        assertThat(response.getBody().getData().getTokenType()).isEqualTo("Bearer");
        assertThat(response.getBody().getData().getExpiresIn()).isEqualTo(900L);
    }

    @Test
    @DisplayName("Refresh endpoint should return 200 OK with new tokens")
    void refresh_shouldReturnOkStatusWithNewTokens() {
        LoginResponseDTO newTokenResponse = LoginResponseDTO.builder()
                .accessToken("new-access-token")
                .refreshToken("new-refresh-token")
                .tokenType("Bearer")
                .expiresIn(900L)
                .build();

        when(authService.refreshToken(any(RefreshTokenRequestDTO.class))).thenReturn(newTokenResponse);

        ResponseEntity<ApiResponse<LoginResponseDTO>> response = authController.refresh(refreshTokenRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getMessage()).isEqualTo("Token refreshed successfully");
        assertThat(response.getBody().getData()).isEqualTo(newTokenResponse);
        verify(authService).refreshToken(refreshTokenRequest);
    }

    @Test
    @DisplayName("Refresh endpoint should return new token pair")
    void refresh_shouldReturnNewTokenPair() {
        LoginResponseDTO newTokenResponse = LoginResponseDTO.builder()
                .accessToken("new-access-token")
                .refreshToken("new-refresh-token")
                .tokenType("Bearer")
                .expiresIn(900L)
                .build();

        when(authService.refreshToken(any(RefreshTokenRequestDTO.class))).thenReturn(newTokenResponse);

        ResponseEntity<ApiResponse<LoginResponseDTO>> response = authController.refresh(refreshTokenRequest);

        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getAccessToken()).isEqualTo("new-access-token");
        assertThat(response.getBody().getData().getRefreshToken()).isEqualTo("new-refresh-token");
    }

    @Test
    @DisplayName("All endpoints should use @Valid annotation for input validation")
    void endpoints_shouldValidateInputDTOs() {
        when(authService.register(any(RegisterRequestDTO.class))).thenReturn(registerResponse);
        when(authService.login(any(LoginRequestDTO.class))).thenReturn(loginResponse);
        when(authService.refreshToken(any(RefreshTokenRequestDTO.class))).thenReturn(loginResponse);

        authController.register(registerRequest);
        authController.login(loginRequest);
        authController.refresh(refreshTokenRequest);

        verify(authService).register(registerRequest);
        verify(authService).login(loginRequest);
        verify(authService).refreshToken(refreshTokenRequest);
    }
}
