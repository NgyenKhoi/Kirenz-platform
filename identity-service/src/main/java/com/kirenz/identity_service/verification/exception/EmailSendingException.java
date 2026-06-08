package com.kirenz.identity_service.verification.exception;

/**
 * Exception thrown when email sending via Brevo API fails.
 * This exception is mapped to HTTP status 500 Internal Server Error in the GlobalExceptionHandler.
 */
public class EmailSendingException extends RuntimeException {
    
    public EmailSendingException(String message) {
        super(message);
    }
    
    public EmailSendingException(String message, Throwable cause) {
        super(message, cause);
    }
}
