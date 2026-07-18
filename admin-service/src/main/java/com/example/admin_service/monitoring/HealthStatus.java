package com.example.admin_service.monitoring;

public enum HealthStatus {
    UP,
    DOWN,
    UNKNOWN;

    static HealthStatus from(String value) {
        if (value == null) {
            return UNKNOWN;
        }
        try {
            return valueOf(value.toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return UNKNOWN;
        }
    }
}
