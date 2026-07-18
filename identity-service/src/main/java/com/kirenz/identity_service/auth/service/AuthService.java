package com.kirenz.identity_service.auth.service;

import com.kirenz.identity_service.auth.dto.GoogleLoginRequestDTO;
import com.kirenz.identity_service.auth.dto.GoogleTokenInfoDTO;
import com.kirenz.identity_service.auth.dto.LoginRequestDTO;
import com.kirenz.identity_service.auth.dto.LoginResponseDTO;
import com.kirenz.identity_service.auth.dto.RefreshTokenRequestDTO;
import com.kirenz.identity_service.auth.dto.RegisterRequestDTO;
import com.kirenz.identity_service.auth.dto.RegisterResponseDTO;
import com.kirenz.identity_service.auth.event.UserCreatedEvent;
import com.kirenz.identity_service.auth.security.JWTService;
import com.kirenz.identity_service.common.exception.AccountBannedException;
import com.kirenz.identity_service.common.exception.AccountDeactivatedException;
import com.kirenz.identity_service.common.exception.AccountSuspendedException;
import com.kirenz.identity_service.common.exception.EmailAlreadyExistsException;
import com.kirenz.identity_service.common.exception.ExpiredTokenException;
import com.kirenz.identity_service.common.exception.InvalidCredentialsException;
import com.kirenz.identity_service.common.exception.InvalidTokenException;
import com.kirenz.identity_service.common.exception.UserNotFoundException;
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
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

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
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final GoogleTokenVerifierService googleTokenVerifierService;

    @Transactional
    public RegisterResponseDTO register(RegisterRequestDTO request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (Boolean.TRUE.equals(user.getEmailVerified())) {
                throw new EmailAlreadyExistsException("Email already registered");
            } else {
                log.info("Found unverified user with email: {}. Deleting to allow re-registration.", request.getEmail());
                userRepository.delete(user);
                userRepository.flush();
            }
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UsernameAlreadyExistsException("Username already taken");
        }

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.USER);
        user.setStatus(AccountStatus.ACTIVE);
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);
        publishUserCreated(savedUser);

        boolean otpSent = false;
        try {
            verificationService.sendOTP(savedUser.getEmail());
            otpSent = true;
            log.info("OTP sent automatically after registration for email: {}", savedUser.getEmail());
        } catch (EmailSendingException e) {
            log.warn("Failed to send OTP after registration for email: {}. Error: {}", 
                savedUser.getEmail(), e.getMessage());
        } catch (Exception e) {
            log.warn("Unexpected error sending OTP after registration for email: {}. Error: {}", 
                savedUser.getEmail(), e.getMessage());
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

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UserNotFoundException("User or email does not exist"));

        reactivateExpiredSuspension(user);

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (LockedException e) {
            assertLoginAllowed(user);
            throw new InvalidCredentialsException("Invalid email or password");
        } catch (BadCredentialsException e) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        assertLoginAllowed(user);

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        return issueTokens(user);
    }

    @Transactional
    public LoginResponseDTO loginWithGoogle(GoogleLoginRequestDTO request) {
        GoogleTokenInfoDTO tokenInfo = googleTokenVerifierService.verify(request.getIdToken());
        String email = tokenInfo.getEmail().trim().toLowerCase(Locale.ROOT);

        Optional<User> userByGoogleId = userRepository.findByGoogleId(tokenInfo.getSub());
        User user;
        boolean newUser = false;

        if (userByGoogleId.isPresent()) {
            user = userByGoogleId.get();
        } else {
            Optional<User> userByEmail = userRepository.findByEmail(email);
            if (userByEmail.isPresent()) {
                user = userByEmail.get();
                user.setGoogleId(tokenInfo.getSub());
            } else {
                user = User.builder()
                        .email(email)
                        .googleId(tokenInfo.getSub())
                        .username(generateUniqueUsername(email))
                        .password(passwordEncoder.encode(UUID.randomUUID().toString() + UUID.randomUUID()))
                        .displayName(firstNonBlank(tokenInfo.getName(), email.substring(0, email.indexOf('@'))))
                        .avatarUrl(tokenInfo.getPicture())
                        .role(UserRole.USER)
                        .status(AccountStatus.ACTIVE)
                        .emailVerified(true)
                        .emailVerifiedAt(Instant.now())
                        .build();
                newUser = true;
            }
        }

        assertLoginAllowed(user);

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            user.setEmailVerified(true);
            user.setEmailVerifiedAt(Instant.now());
        }
        if (user.getGoogleId() == null || user.getGoogleId().isBlank()) {
            user.setGoogleId(tokenInfo.getSub());
        }
        if ((user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) && tokenInfo.getPicture() != null) {
            user.setAvatarUrl(tokenInfo.getPicture());
        }
        if ((user.getDisplayName() == null || user.getDisplayName().isBlank()) && tokenInfo.getName() != null) {
            user.setDisplayName(tokenInfo.getName());
        }

        user.setLastLoginAt(Instant.now());
        User savedUser = userRepository.save(user);

        if (newUser) {
            publishUserCreated(savedUser);
        }

        return issueTokens(savedUser);
    }

    @Transactional
    public LoginResponseDTO refreshToken(RefreshTokenRequestDTO request) {
        String refreshToken = request.getRefreshToken();
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            throw new InvalidTokenException("Refresh token is required");
        }

        String email;
        try {
            email = jwtService.extractEmail(refreshToken);
            if (email == null || email.trim().isEmpty()) {
                throw new InvalidTokenException("Invalid refresh token: email not found");
            }
        } catch (InvalidTokenException e) {
            throw e;
        } catch (Exception e) {
            throw new InvalidTokenException("Invalid refresh token: " + e.getMessage());
        }

        User user = userRepository.findByEmail(email)
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

        assertLoginAllowed(user);
        log.info("Refreshing tokens for user: {}", user.getId());
        return issueTokens(user);
    }

    private LoginResponseDTO issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return LoginResponseDTO.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(900L)
            .build();
    }

    private void assertLoginAllowed(User user) {
        if (user.getStatus() == AccountStatus.BANNED) {
            throw new AccountBannedException("Account has been banned");
        }
        if (user.getStatus() == AccountStatus.DEACTIVATED) {
            throw new AccountDeactivatedException("Account has been deactivated");
        }
        if (user.getStatus() == AccountStatus.SUSPENDED) {
            if (user.getSuspendedUntil() != null && user.getSuspendedUntil().isAfter(Instant.now())) {
                throw new AccountSuspendedException("Account is temporarily suspended", user.getSuspendedUntil());
            }
            reactivateExpiredSuspension(user);
        }
    }

    private void reactivateExpiredSuspension(User user) {
        if (user.getStatus() == AccountStatus.SUSPENDED
            && (user.getSuspendedUntil() == null || !user.getSuspendedUntil().isAfter(Instant.now()))) {
            user.setStatus(AccountStatus.ACTIVE);
            user.setSuspendedUntil(null);
            user.setModerationReason(null);
            userRepository.save(user);
        }
    }

    private void publishUserCreated(User savedUser) {
        try {
            UserCreatedEvent event = UserCreatedEvent.builder()
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .username(savedUser.getUsername())
                .build();
            kafkaTemplate.send("user-created", event);
            log.info("Published user-created event for user: {}", savedUser.getId());
        } catch (Exception e) {
            log.error("Failed to publish user-created event for user: {}. Error: {}", savedUser.getId(), e.getMessage());
        }
    }

    private String generateUniqueUsername(String email) {
        String localPart = email.substring(0, email.indexOf('@'));
        String base = localPart.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9_]", "_");
        base = base.replaceAll("_+", "_").replaceAll("^_+|_+$", "");
        if (base.length() < 3) {
            base = "user_" + base;
        }
        if (base.length() > 42) {
            base = base.substring(0, 42);
        }

        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + "_" + suffix++;
            if (candidate.length() > 50) {
                candidate = base.substring(0, Math.min(base.length(), 45)) + "_" + suffix;
            }
        }
        return candidate;
    }

    private String firstNonBlank(String preferred, String fallback) {
        return preferred == null || preferred.isBlank() ? fallback : preferred;
    }
}
