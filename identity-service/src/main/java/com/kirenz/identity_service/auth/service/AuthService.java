package com.kirenz.identity_service.auth.service;

import com.kirenz.identity_service.auth.dto.LoginRequestDTO;
import com.kirenz.identity_service.auth.dto.LoginResponseDTO;
import com.kirenz.identity_service.auth.dto.RefreshTokenRequestDTO;
import com.kirenz.identity_service.auth.dto.RegisterRequestDTO;
import com.kirenz.identity_service.auth.dto.RegisterResponseDTO;
import com.kirenz.identity_service.auth.security.JWTService;
import com.kirenz.identity_service.common.exception.AccountBannedException;
import com.kirenz.identity_service.common.exception.AccountDeactivatedException;
import com.kirenz.identity_service.common.exception.EmailAlreadyExistsException;
import com.kirenz.identity_service.common.exception.ExpiredTokenException;
import com.kirenz.identity_service.common.exception.InvalidCredentialsException;
import com.kirenz.identity_service.common.exception.InvalidTokenException;
import com.kirenz.identity_service.common.exception.UsernameAlreadyExistsException;
import com.kirenz.identity_service.user.mapper.UserMapper;
import com.kirenz.identity_service.user.model.AccountStatus;
import com.kirenz.identity_service.user.model.User;
import com.kirenz.identity_service.user.model.UserRole;
import com.kirenz.identity_service.user.repository.UserRepository;
import com.kirenz.identity_service.verification.exception.EmailSendingException;
import com.kirenz.identity_service.verification.service.VerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final VerificationService verificationService;

    @Transactional
    public RegisterResponseDTO register(RegisterRequestDTO request) {
        // Check if a user with this email already exists
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (Boolean.TRUE.equals(user.getEmailVerified())) {
                throw new EmailAlreadyExistsException("Email already registered");
            } else {
                // If email is not verified, we allow "overwriting" or re-registration.
                // We delete the existing unverified user to avoid constraints and start fresh.
                log.info("Found unverified user with email: {}. Deleting to allow re-registration.", request.getEmail());
                userRepository.delete(user);
                // Flush to ensure the deletion is synchronized with the database 
                // before checking other consistency constraints like username
                userRepository.flush();
            }
        }

        // Now check if username is taken (it might have been cleared by the deletion above, 
        // or it might be taken by a different verified/unverified user)
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UsernameAlreadyExistsException("Username already taken");
        }

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.USER);
        user.setStatus(AccountStatus.ACTIVE);
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);

        // Attempt to send OTP automatically after registration
        boolean otpSent = false;
        try {
            verificationService.sendOTP(savedUser.getEmail());
            otpSent = true;
            log.info("OTP sent automatically after registration for email: {}", savedUser.getEmail());
        } catch (EmailSendingException e) {
            log.warn("Failed to send OTP after registration for email: {}. Error: {}", 
                savedUser.getEmail(), e.getMessage());
            // Continue with registration - OTP failure should not block registration
        } catch (Exception e) {
            log.warn("Unexpected error sending OTP after registration for email: {}. Error: {}", 
                savedUser.getEmail(), e.getMessage());
            // Continue with registration - OTP failure should not block registration
        }

        RegisterResponseDTO response = userMapper.toRegisterResponseDTO(savedUser);
        response.setOtpSent(otpSent);
        return response;
    }

    @Transactional
    public LoginResponseDTO login(LoginRequestDTO request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new InvalidCredentialsException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new InvalidCredentialsException("Password is required");
        }

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (user.getStatus() == AccountStatus.BANNED) {
            throw new AccountBannedException("Account has been banned");
        }
        if (user.getStatus() == AccountStatus.DEACTIVATED) {
            throw new AccountDeactivatedException("Account has been deactivated");
        }

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return LoginResponseDTO.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(900L)
            .build();
    }

    @Transactional
    public LoginResponseDTO refreshToken(RefreshTokenRequestDTO request) {
        String refreshToken = request.getRefreshToken();
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            throw new InvalidTokenException("Refresh token is required");
        }

        String username;
        try {
            username = jwtService.extractUsername(refreshToken);
            if (username == null || username.trim().isEmpty()) {
                throw new InvalidTokenException("Invalid refresh token: username not found");
            }
        } catch (InvalidTokenException e) {
            throw e;
        } catch (Exception e) {
            throw new InvalidTokenException("Invalid refresh token: " + e.getMessage());
        }

        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new InvalidTokenException("Invalid refresh token: user not found"));

        try {
            if (jwtService.isTokenExpired(refreshToken)) {
                throw new ExpiredTokenException("Refresh token has expired");
            }
            
            if (!jwtService.validateToken(refreshToken)) {
                throw new InvalidTokenException("Invalid refresh token signature");
            }
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            throw new ExpiredTokenException("Refresh token has expired");
        } catch (ExpiredTokenException | InvalidTokenException e) {
            throw e;
        } catch (Exception e) {
            throw new InvalidTokenException("Invalid refresh token: " + e.getMessage());
        }

        log.info("Refreshing tokens for user: {}", user.getId());
        
        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        return LoginResponseDTO.builder()
            .accessToken(newAccessToken)
            .refreshToken(newRefreshToken)
            .tokenType("Bearer")
            .expiresIn(900L)
            .build();
    }
}
