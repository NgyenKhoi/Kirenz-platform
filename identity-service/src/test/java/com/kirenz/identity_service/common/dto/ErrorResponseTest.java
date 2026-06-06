package com.kirenz.identity_service.common.dto;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ErrorResponseTest {

    @Test
    void testOfWithMessageOnly() {
        ErrorResponse response = ErrorResponse.of("Error occurred");

        assertFalse(response.isSuccess());
        assertEquals("Error occurred", response.getMessage());
        assertNotNull(response.getTimestamp());
        assertNull(response.getErrors());
    }

    @Test
    void testOfWithMessageAndErrors() {
        Map<String, String> errors = new HashMap<>();
        errors.put("email", "Invalid email format");
        errors.put("password", "Password too short");

        ErrorResponse response = ErrorResponse.of("Validation failed", errors);

        assertFalse(response.isSuccess());
        assertEquals("Validation failed", response.getMessage());
        assertNotNull(response.getTimestamp());
        assertEquals(2, response.getErrors().size());
        assertEquals("Invalid email format", response.getErrors().get("email"));
        assertEquals("Password too short", response.getErrors().get("password"));
    }

    @Test
    void testTimestampIsRecent() {
        Instant before = Instant.now();
        ErrorResponse response = ErrorResponse.of("Error occurred");
        Instant after = Instant.now();

        assertNotNull(response.getTimestamp());
        assertTrue(response.getTimestamp().isAfter(before.minusSeconds(1)));
        assertTrue(response.getTimestamp().isBefore(after.plusSeconds(1)));
    }
}
