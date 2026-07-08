package com.kirenz.identity_service.auth.controller;

import com.kirenz.identity_service.auth.dto.GoogleLoginRequestDTO;
import com.kirenz.identity_service.auth.dto.LoginRequestDTO;
import com.kirenz.identity_service.auth.dto.LoginResponseDTO;
import com.kirenz.identity_service.auth.dto.RefreshTokenRequestDTO;
import com.kirenz.identity_service.auth.dto.RegisterRequestDTO;
import com.kirenz.identity_service.auth.dto.RegisterResponseDTO;
import com.kirenz.identity_service.auth.service.AuthService;
import com.kirenz.identity_service.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponseDTO>> register(
            @Valid @RequestBody RegisterRequestDTO request) {
        RegisterResponseDTO response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> login(
            @Valid @RequestBody LoginRequestDTO request) {
        LoginResponseDTO response = authService.login(request);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> loginWithGoogle(
            @Valid @RequestBody GoogleLoginRequestDTO request) {
        LoginResponseDTO response = authService.loginWithGoogle(request);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Google login successful", response));
    }
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> refresh(
            @Valid @RequestBody RefreshTokenRequestDTO request) {
        LoginResponseDTO response = authService.refreshToken(request);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Token refreshed successfully", response));
    }
}
