package com.kirenz.identity_service.common.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApiResponseTest {

    @Test
    void testSuccessWithData() {
        String testData = "test data";
        ApiResponse<String> response = ApiResponse.success("Operation successful", testData);

        assertTrue(response.isSuccess());
        assertEquals("Operation successful", response.getMessage());
        assertEquals(testData, response.getData());
    }

    @Test
    void testSuccessWithoutData() {
        ApiResponse<String> response = ApiResponse.success("Operation successful");

        assertTrue(response.isSuccess());
        assertEquals("Operation successful", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    void testErrorWithoutDetails() {
        ApiResponse<String> response = ApiResponse.error("Operation failed");

        assertFalse(response.isSuccess());
        assertEquals("Operation failed", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    void testErrorWithDetails() {
        String errorDetails = "Detailed error information";
        ApiResponse<String> response = ApiResponse.error("Operation failed", errorDetails);

        assertFalse(response.isSuccess());
        assertEquals("Operation failed", response.getMessage());
        assertEquals(errorDetails, response.getData());
    }
}
