package com.kirenz.identity_service.common.exception;

public class AccountBannedException extends RuntimeException {
    
    public AccountBannedException(String message) {
        super(message);
    }
}
