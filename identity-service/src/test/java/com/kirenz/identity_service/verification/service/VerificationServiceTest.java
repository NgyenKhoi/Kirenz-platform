package com.kirenz.identity_service.verification.service;

import com.kirenz.identity_service.common.exception.UserNotFoundException;
import com.kirenz.identity_service.user.model.User;
import com.kirenz.identity_service.user.repository.UserRepository;
import com.kirenz.identity_service.verification.dto.SendOTPResponseDTO;
import com.kirenz.identity_service.verification.dto.VerifyOTPResponseDTO;
import com.kirenz.identity_service.verification.exception.EmailAlreadyVerifiedException;
import com.kirenz.identity_service.verification.exception.InvalidOTPException;
import com.kirenz.identity_service.verification.exception.RateLimitExceededException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("VerificationService Tests")
class VerificationServiceTest {

    @Mock
    private OTPService otpService;

    @Mock
    private EmailService emailService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VerificationService verificationService;

    private User testUser;
    private final String testEmail = "test@example.com";
    private final String testOTP = "123456";

    @BeforeEach
    void setUp() {
        testUser = User.builder()
            .email(testEmail)
            .displayName("Test User")
            .emailVerified(false)
            .build();
    }

    @Test
    @DisplayName("sendOTP() should successfully send OTP when user exists and email not verified")
    void sendOTP_Success() {
        // Arrange
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(otpService.generateAndStore(testEmail)).thenReturn(testOTP);
        doNothing().when(otpService).checkRateLimit(testEmail);
        doNothing().when(otpService).setRateLimit(testEmail);
        doNothing().when(emailService).sendOTPEmail(anyString(), anyString(), anyString());

        // Act
        SendOTPResponseDTO response = verificationService.sendOTP(testEmail);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getMessage()).isEqualTo("OTP sent successfully");

        // Verify call order and parameters
        verify(userRepository).findByEmail(testEmail);
        verify(otpService).checkRateLimit(testEmail);
        verify(otpService).generateAndStore(testEmail);
        verify(otpService).setRateLimit(testEmail);
        verify(emailService).sendOTPEmail(testEmail, "Test User", testOTP);
    }

    @Test
    @DisplayName("sendOTP() should use email as display name when displayName is null")
    void sendOTP_NullDisplayName() {
        // Arrange
        testUser.setDisplayName(null);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(otpService.generateAndStore(testEmail)).thenReturn(testOTP);
        doNothing().when(otpService).checkRateLimit(testEmail);
        doNothing().when(otpService).setRateLimit(testEmail);
        doNothing().when(emailService).sendOTPEmail(anyString(), anyString(), anyString());

        // Act
        verificationService.sendOTP(testEmail);

        // Assert
        verify(emailService).sendOTPEmail(testEmail, testEmail, testOTP);
    }

    @Test
    @DisplayName("sendOTP() should throw UserNotFoundException when user does not exist")
    void sendOTP_UserNotFound() {
        // Arrange
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> verificationService.sendOTP(testEmail))
            .isInstanceOf(UserNotFoundException.class)
            .hasMessage("User not found");

        verify(userRepository).findByEmail(testEmail);
        verifyNoInteractions(otpService);
        verifyNoInteractions(emailService);
    }

    @Test
    @DisplayName("sendOTP() should throw EmailAlreadyVerifiedException when email is already verified")
    void sendOTP_EmailAlreadyVerified() {
        // Arrange
        testUser.setEmailVerified(true);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThatThrownBy(() -> verificationService.sendOTP(testEmail))
            .isInstanceOf(EmailAlreadyVerifiedException.class)
            .hasMessage("Email is already verified");

        verify(userRepository).findByEmail(testEmail);
        verifyNoInteractions(otpService);
        verifyNoInteractions(emailService);
    }

    @Test
    @DisplayName("sendOTP() should throw RateLimitExceededException when rate limit exceeded")
    void sendOTP_RateLimitExceeded() {
        // Arrange
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        doThrow(new RateLimitExceededException("Please wait 60 seconds before requesting another OTP"))
            .when(otpService).checkRateLimit(testEmail);

        // Act & Assert
        assertThatThrownBy(() -> verificationService.sendOTP(testEmail))
            .isInstanceOf(RateLimitExceededException.class)
            .hasMessage("Please wait 60 seconds before requesting another OTP");

        verify(userRepository).findByEmail(testEmail);
        verify(otpService).checkRateLimit(testEmail);
        verify(otpService, never()).generateAndStore(anyString());
        verify(otpService, never()).setRateLimit(anyString());
        verifyNoInteractions(emailService);
    }

    @Test
    @DisplayName("verifyOTP() should successfully verify OTP and update user")
    void verifyOTP_Success() {
        // Arrange
        when(otpService.validate(testEmail, testOTP)).thenReturn(true);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        VerifyOTPResponseDTO response = verificationService.verifyOTP(testEmail, testOTP);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getMessage()).isEqualTo("Email verified successfully");
        assertThat(response.getEmailVerifiedAt()).isNotNull();

        // Verify user entity was updated
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getEmailVerified()).isTrue();
        assertThat(savedUser.getEmailVerifiedAt()).isNotNull();
        assertThat(savedUser.getEmailVerifiedAt()).isBeforeOrEqualTo(Instant.now());
    }

    @Test
    @DisplayName("verifyOTP() should throw InvalidOTPException when OTP is invalid")
    void verifyOTP_InvalidOTP() {
        // Arrange
        when(otpService.validate(testEmail, testOTP)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> verificationService.verifyOTP(testEmail, testOTP))
            .isInstanceOf(InvalidOTPException.class)
            .hasMessage("Invalid or expired OTP");

        verify(otpService).validate(testEmail, testOTP);
        verify(userRepository, never()).findByEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("verifyOTP() should throw UserNotFoundException when user does not exist")
    void verifyOTP_UserNotFound() {
        // Arrange
        when(otpService.validate(testEmail, testOTP)).thenReturn(true);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> verificationService.verifyOTP(testEmail, testOTP))
            .isInstanceOf(UserNotFoundException.class)
            .hasMessage("User not found");

        verify(otpService).validate(testEmail, testOTP);
        verify(userRepository).findByEmail(testEmail);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("verifyOTP() should set emailVerifiedAt to current timestamp")
    void verifyOTP_VerifiedAtTimestamp() {
        // Arrange
        Instant beforeVerification = Instant.now();
        when(otpService.validate(testEmail, testOTP)).thenReturn(true);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        VerifyOTPResponseDTO response = verificationService.verifyOTP(testEmail, testOTP);
        Instant afterVerification = Instant.now();

        // Assert
        assertThat(response.getEmailVerifiedAt()).isNotNull();
        assertThat(response.getEmailVerifiedAt()).isBetween(beforeVerification, afterVerification);

        // Verify saved user has correct timestamp
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getEmailVerifiedAt()).isBetween(beforeVerification, afterVerification);
    }
}
