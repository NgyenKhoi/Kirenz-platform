package com.kirenz.identity_service.common.exception;

public class UsernameAlreadyExistsException extends RuntimeException {
    
    public UsernameAlreadyExistsException(String message) {
        super(message);
    }
}
