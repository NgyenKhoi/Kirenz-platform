package com.kirenz.identity_service.verification.exception;

/**
 * Exception thrown when attempting to verify an email that has already been verified.
 * This exception is mapped to HTTP status 400 Bad Request in the GlobalExceptionHandler.
 */
public class EmailAlreadyVerifiedException extends RuntimeException {
    
    public EmailAlreadyVerifiedException(String message) {
        super(message);
    }
}
