package com.kirenz.identity_service.verification.exception;

/**
 * Exception thrown when OTP request rate limit is exceeded (1 request per 60 seconds).
 * This exception is mapped to HTTP status 429 Too Many Requests in the GlobalExceptionHandler.
 */
public class RateLimitExceededException extends RuntimeException {
    
    public RateLimitExceededException(String message) {
        super(message);
    }
}
