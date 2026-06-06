package com.kirenz.identity_service.common.exception;

public class ExpiredTokenException extends RuntimeException {
    
    public ExpiredTokenException(String message) {
        super(message);
    }
}
