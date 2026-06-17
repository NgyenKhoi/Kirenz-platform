package com.kirenz.identity_service.common.exception;

import com.kirenz.identity_service.common.dto.ApiResponse;
import com.kirenz.identity_service.common.dto.ErrorResponse;
import com.kirenz.identity_service.verification.exception.EmailAlreadyVerifiedException;
import com.kirenz.identity_service.verification.exception.EmailSendingException;
import com.kirenz.identity_service.verification.exception.InvalidOTPException;
import com.kirenz.identity_service.verification.exception.RateLimitExceededException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void handleEmailAlreadyExists_shouldReturn409WithErrorMessage() {
        EmailAlreadyExistsException exception = new EmailAlreadyExistsException("test message");

        ResponseEntity<ApiResponse<ErrorResponse>> response = exceptionHandler.handleEmailAlreadyExists(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).isEqualTo("Email already registered");
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getMessage()).isEqualTo("Email already registered");
    }

    @Test
    void handleUsernameAlreadyExists_shouldReturn409WithErrorMessage() {
        UsernameAlreadyExistsException exception = new UsernameAlreadyExistsException("test message");

        ResponseEntity<ApiResponse<ErrorResponse>> response = exceptionHandler.handleUsernameAlreadyExists(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).isEqualTo("Username already taken");
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getMessage()).isEqualTo("Username already taken");
    }

    @Test
    void handleInvalidCredentials_shouldReturn401WithErrorMessage() {
        InvalidCredentialsException exception = new InvalidCredentialsException("test message");

        ResponseEntity<ApiResponse<ErrorResponse>> response = exceptionHandler.handleInvalidCredentials(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).isEqualTo("Invalid email or password");
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getMessage()).isEqualTo("Invalid email or password");
    }

    @Test
    void handleAccountBanned_shouldReturn403WithErrorMessage() {
        AccountBannedException exception = new AccountBannedException("test message");

        ResponseEntity<ApiResponse<ErrorResponse>> response = exceptionHandler.handleAccountBanned(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).isEqualTo("Account has been banned");
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getMessage()).isEqualTo("Account has been banned");
    }

    @Test
    void handleAccountDeactivated_shouldReturn403WithErrorMessage() {
        AccountDeactivatedException exception = new AccountDeactivatedException("test message");

        ResponseEntity<ApiResponse<ErrorResponse>> response = exceptionHandler.handleAccountDeactivated(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).isEqualTo("Account has been deactivated");
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getMessage()).isEqualTo("Account has been deactivated");
    }

    @Test
    void handleUserNotFound_shouldReturn404WithErrorMessage() {
        UserNotFoundException exception = new UserNotFoundException("test message");

        ResponseEntity<ApiResponse<ErrorResponse>> response = exceptionHandler.handleUserNotFound(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).isEqualTo("test message");
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getMessage()).isEqualTo("test message");
    }

    @Test
    void handleExpiredToken_shouldReturn401WithErrorMessage() {
        ExpiredTokenException exception = new ExpiredTokenException("test message");

        ResponseEntity<ApiResponse<ErrorResponse>> response = exceptionHandler.handleExpiredToken(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).isEqualTo("Token has expired");
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getMessage()).isEqualTo("Token has expired");
    }

    @Test
    void handleInvalidToken_shouldReturn401WithErrorMessage() {
        InvalidTokenException exception = new InvalidTokenException("test message");

        ResponseEntity<ApiResponse<ErrorResponse>> response = exceptionHandler.handleInvalidToken(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).isEqualTo("Invalid token");
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getMessage()).isEqualTo("Invalid token");
    }

    @Test
    void handleValidationErrors_shouldReturn400WithFieldErrors() {
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError1 = new FieldError("object", "email", "Email is required");
        FieldError fieldError2 = new FieldError("object", "username", "Username must be at least 3 characters");
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError1, fieldError2));

        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<ApiResponse<ErrorResponse>> response = exceptionHandler.handleValidationErrors(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).isEqualTo("Validation failed");
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getErrors()).hasSize(2);
        assertThat(response.getBody().getData().getErrors()).containsEntry("email", "Email is required");
        assertThat(response.getBody().getData().getErrors()).containsEntry("username", "Username must be at least 3 characters");
    }

    @Test
    void handleGenericException_shouldReturn500WithErrorMessage() {
        Exception exception = new Exception("Unexpected error");

        ResponseEntity<ApiResponse<ErrorResponse>> response = exceptionHandler.handleGenericException(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).isEqualTo("Internal server error");
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getMessage()).isEqualTo("Internal server error");
    }

    @Test
    void handleEmailAlreadyVerified_shouldReturn400WithErrorMessage() {
        EmailAlreadyVerifiedException exception = new EmailAlreadyVerifiedException("test message");

        ResponseEntity<ApiResponse<ErrorResponse>> response = exceptionHandler.handleEmailAlreadyVerified(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).isEqualTo("Email is already verified");
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getMessage()).isEqualTo("Email is already verified");
    }

    @Test
    void handleInvalidOTP_shouldReturn400WithExceptionMessage() {
        InvalidOTPException exception = new InvalidOTPException("Invalid or expired OTP");

        ResponseEntity<ApiResponse<ErrorResponse>> response = exceptionHandler.handleInvalidOTP(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).isEqualTo("Invalid or expired OTP");
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getMessage()).isEqualTo("Invalid or expired OTP");
    }

    @Test
    void handleRateLimitExceeded_shouldReturn429WithRetryAfterHeader() {
        RateLimitExceededException exception = new RateLimitExceededException("test message");

        ResponseEntity<ApiResponse<ErrorResponse>> response = exceptionHandler.handleRateLimitExceeded(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        assertThat(response.getHeaders().getFirst("Retry-After")).isEqualTo("60");
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).isEqualTo("Please wait 60 seconds before requesting another OTP");
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getMessage()).isEqualTo("Please wait 60 seconds before requesting another OTP");
    }

    @Test
    void handleEmailSendingException_shouldReturn500WithErrorMessage() {
        EmailSendingException exception = new EmailSendingException("test message");

        ResponseEntity<ApiResponse<ErrorResponse>> response = exceptionHandler.handleEmailSendingException(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).isEqualTo("Failed to send OTP email. Please try again later");
        assertThat(response.getBody().getData()).isNotNull();
        assertThat(response.getBody().getData().getMessage()).isEqualTo("Failed to send OTP email. Please try again later");
    }
}
