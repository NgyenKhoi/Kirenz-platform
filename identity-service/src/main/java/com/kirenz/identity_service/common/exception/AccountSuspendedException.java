package com.kirenz.identity_service.common.exception;

import java.time.Instant;

public class AccountSuspendedException extends RuntimeException {

    private final Instant suspendedUntil;

    public AccountSuspendedException(String message, Instant suspendedUntil) {
        super(message);
        this.suspendedUntil = suspendedUntil;
    }

    public Instant getSuspendedUntil() {
        return suspendedUntil;
    }
}
