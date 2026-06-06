package com.kirenz.identity_service.common.exception;

public class AccountDeactivatedException extends RuntimeException {
    
    public AccountDeactivatedException(String message) {
        super(message);
    }
}
