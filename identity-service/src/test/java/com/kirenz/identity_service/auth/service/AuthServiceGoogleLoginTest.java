package com.kirenz.identity_service.auth.service;

import com.kirenz.identity_service.auth.dto.GoogleLoginRequestDTO;
import com.kirenz.identity_service.auth.dto.GoogleTokenInfoDTO;
import com.kirenz.identity_service.auth.dto.LoginResponseDTO;
import com.kirenz.identity_service.auth.security.JWTService;
import com.kirenz.identity_service.user.mapper.UserMapper;
import com.kirenz.identity_service.user.model.AccountStatus;
import com.kirenz.identity_service.user.model.User;
import com.kirenz.identity_service.user.model.UserRole;
import com.kirenz.identity_service.user.repository.UserRepository;
import com.kirenz.identity_service.verification.service.VerificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Google Login Tests")
class AuthServiceGoogleLoginTest {

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

    @Mock
    private VerificationService verificationService;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Mock
    private GoogleTokenVerifierService googleTokenVerifierService;

    @InjectMocks
    private AuthService authService;

    private GoogleLoginRequestDTO request;
    private GoogleTokenInfoDTO tokenInfo;

    @BeforeEach
    void setUp() {
        request = new GoogleLoginRequestDTO();
        request.setIdToken("google-id-token");

        tokenInfo = new GoogleTokenInfoDTO();
        tokenInfo.setSub("google-sub-123");
        tokenInfo.setAud("client-id");
        tokenInfo.setEmail("User@Example.com");
        tokenInfo.setEmailVerified("true");
        tokenInfo.setName("Google User");
        tokenInfo.setPicture("https://example.com/avatar.png");
    }

    @Test
    @DisplayName("should link and verify an existing unverified email user")
    void loginWithGoogle_WhenExistingEmailUserIsUnverified_ShouldLinkAndVerifyUser() {
        User existingUser = User.builder()
                .id(UUID.randomUUID())
                .email("user@example.com")
                .username("user")
                .password("hashed-password")
                .role(UserRole.USER)
                .status(AccountStatus.ACTIVE)
                .emailVerified(false)
                .build();

        when(googleTokenVerifierService.verify("google-id-token")).thenReturn(tokenInfo);
        when(userRepository.findByGoogleId("google-sub-123")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(existingUser)).thenReturn(existingUser);
        when(jwtService.generateAccessToken(existingUser)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(existingUser)).thenReturn("refresh-token");

        LoginResponseDTO response = authService.loginWithGoogle(request);

        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(existingUser.getGoogleId()).isEqualTo("google-sub-123");
        assertThat(existingUser.getEmailVerified()).isTrue();
        assertThat(existingUser.getEmailVerifiedAt()).isNotNull();
        verify(kafkaTemplate, never()).send(any(String.class), any(Object.class));
    }

    @Test
    @DisplayName("should create a verified user when Google email does not exist")
    void loginWithGoogle_WhenUserDoesNotExist_ShouldCreateVerifiedUser() {
        when(googleTokenVerifierService.verify("google-id-token")).thenReturn(tokenInfo);
        when(userRepository.findByGoogleId("google-sub-123")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.empty());
        when(userRepository.existsByUsername("user")).thenReturn(false);
        when(passwordEncoder.encode(any(String.class))).thenReturn("hashed-random-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(UUID.randomUUID());
            return user;
        });
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh-token");

        LoginResponseDTO response = authService.loginWithGoogle(request);

        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
        verify(kafkaTemplate).send(any(String.class), any(Object.class));
        verify(userRepository).save(any(User.class));
    }
}