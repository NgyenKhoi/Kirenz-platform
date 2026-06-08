package com.kirenz.identity_service.verification.controller;

import com.kirenz.identity_service.common.dto.ApiResponse;
import com.kirenz.identity_service.verification.dto.SendOTPRequestDTO;
import com.kirenz.identity_service.verification.dto.SendOTPResponseDTO;
import com.kirenz.identity_service.verification.dto.VerifyOTPRequestDTO;
import com.kirenz.identity_service.verification.dto.VerifyOTPResponseDTO;
import com.kirenz.identity_service.verification.service.VerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for email verification endpoints.
 * Provides public endpoints for sending OTP and verifying OTP codes.
 */
@RestController
@RequestMapping("/api/verification")
@RequiredArgsConstructor
@Slf4j
public class VerificationController {

    private final VerificationService verificationService;

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<SendOTPResponseDTO>> sendOTP(
            @Valid @RequestBody SendOTPRequestDTO request) {
        log.info("POST /api/verification/send-otp - Processing request for email");
        
        SendOTPResponseDTO response = verificationService.sendOTP(request.getEmail());
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("OTP sent successfully", response));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<VerifyOTPResponseDTO>> verifyOTP(
            @Valid @RequestBody VerifyOTPRequestDTO request) {
        log.info("POST /api/verification/verify-otp - Processing verification request");
        
        VerifyOTPResponseDTO response = verificationService.verifyOTP(
                request.getEmail(), 
                request.getOtp()
        );
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Email verified successfully", response));
    }
}
