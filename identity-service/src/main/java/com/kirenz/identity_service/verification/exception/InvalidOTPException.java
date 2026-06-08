package com.kirenz.identity_service.verification.exception;

/**
 * Exception thrown when an OTP validation fails due to invalid or expired code.
 * This exception is mapped to HTTP status 400 Bad Request in the GlobalExceptionHandler.
 */
public class InvalidOTPException extends RuntimeException {
    
    public InvalidOTPException(String message) {
        super(message);
    }
}
