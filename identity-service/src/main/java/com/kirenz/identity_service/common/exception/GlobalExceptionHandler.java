package com.kirenz.identity_service.common.exception;

import com.kirenz.identity_service.common.dto.ApiResponse;
import com.kirenz.identity_service.common.dto.ErrorResponse;
import com.kirenz.identity_service.verification.exception.EmailAlreadyVerifiedException;
import com.kirenz.identity_service.verification.exception.EmailSendingException;
import com.kirenz.identity_service.verification.exception.InvalidOTPException;
import com.kirenz.identity_service.verification.exception.RateLimitExceededException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        ErrorResponse errorResponse = ErrorResponse.of("Email already registered");
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("Email already registered", errorResponse));
    }

    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleUsernameAlreadyExists(UsernameAlreadyExistsException ex) {
        ErrorResponse errorResponse = ErrorResponse.of("Username already taken");
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("Username already taken", errorResponse));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleInvalidCredentials(InvalidCredentialsException ex) {
        ErrorResponse errorResponse = ErrorResponse.of("Invalid email or password");
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid email or password", errorResponse));
    }

    @ExceptionHandler(AccountBannedException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleAccountBanned(AccountBannedException ex) {
        ErrorResponse errorResponse = ErrorResponse.of("Account has been banned");
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Account has been banned", errorResponse));
    }

    @ExceptionHandler(AccountDeactivatedException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleAccountDeactivated(AccountDeactivatedException ex) {
        ErrorResponse errorResponse = ErrorResponse.of("Account has been deactivated");
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Account has been deactivated", errorResponse));
    }

    @ExceptionHandler(AccountSuspendedException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleAccountSuspended(AccountSuspendedException ex) {
        String message = "Account is suspended until " + ex.getSuspendedUntil();
        ErrorResponse errorResponse = ErrorResponse.of(message);
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ApiResponse.error(message, errorResponse));
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleUserNotFound(UserNotFoundException ex) {
        ErrorResponse errorResponse = ErrorResponse.of(ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage(), errorResponse));
    }

    @ExceptionHandler(ExpiredTokenException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleExpiredToken(ExpiredTokenException ex) {
        ErrorResponse errorResponse = ErrorResponse.of("Token has expired");
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Token has expired", errorResponse));
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleInvalidToken(InvalidTokenException ex) {
        ErrorResponse errorResponse = ErrorResponse.of("Invalid token");
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid token", errorResponse));
    }

    @ExceptionHandler(EmailAlreadyVerifiedException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleEmailAlreadyVerified(EmailAlreadyVerifiedException ex) {
        ErrorResponse errorResponse = ErrorResponse.of("Email is already verified");
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Email is already verified", errorResponse));
    }

    @ExceptionHandler(InvalidOTPException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleInvalidOTP(InvalidOTPException ex) {
        ErrorResponse errorResponse = ErrorResponse.of(ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage(), errorResponse));
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleRateLimitExceeded(RateLimitExceededException ex) {
        ErrorResponse errorResponse = ErrorResponse.of("Please wait 60 seconds before requesting another OTP");
        return ResponseEntity
                .status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", "60")
                .body(ApiResponse.error("Please wait 60 seconds before requesting another OTP", errorResponse));
    }

    @ExceptionHandler(EmailSendingException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleEmailSendingException(EmailSendingException ex) {
        ErrorResponse errorResponse = ErrorResponse.of("Failed to send OTP email. Please try again later");
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to send OTP email. Please try again later", errorResponse));
    }


    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleBadRequest(BadRequestException ex) {
        ErrorResponse errorResponse = ErrorResponse.of(ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage(), errorResponse));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        ErrorResponse errorResponse = ErrorResponse.of("Validation failed", errors);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Validation failed", errorResponse));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleGenericException(Exception ex) {
        ErrorResponse errorResponse = ErrorResponse.of("Internal server error");
        log.error("Unhandled exception", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal server error", errorResponse));
    }
}
