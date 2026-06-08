package com.kirenz.identity_service.verification.service;

import com.kirenz.identity_service.common.exception.UserNotFoundException;
import com.kirenz.identity_service.user.model.User;
import com.kirenz.identity_service.user.repository.UserRepository;
import com.kirenz.identity_service.verification.dto.SendOTPResponseDTO;
import com.kirenz.identity_service.verification.dto.VerifyOTPResponseDTO;
import com.kirenz.identity_service.verification.exception.EmailAlreadyVerifiedException;
import com.kirenz.identity_service.verification.exception.InvalidOTPException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Service responsible for business logic orchestration for email verification flow.
 * Coordinates OTP generation, email sending, and user entity updates.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService {

    private final OTPService otpService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    /**
     * Sends OTP to user's email address for verification.
     * Validates user exists, email is not already verified, and rate limit is not exceeded.
     *
     * @param email The user's email address
     * @return SendOTPResponseDTO with success message
     * @throws UserNotFoundException if user does not exist
     * @throws EmailAlreadyVerifiedException if email is already verified
     * @throws RateLimitExceededException if OTP was sent within last 60 seconds
     */
    public SendOTPResponseDTO sendOTP(String email) {
        log.info("Processing OTP send request for email: {}", maskEmail(email));

        // Validate user exists by email using UserRepository
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> {
                log.warn("OTP send failed - user not found for email: {}", maskEmail(email));
                return new UserNotFoundException("User not found");
            });

        // Check if email is already verified
        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            log.warn("OTP send failed - email already verified: {}", maskEmail(email));
            throw new EmailAlreadyVerifiedException("Email is already verified");
        }

        // Check rate limit (throws RateLimitExceededException if exceeded)
        otpService.checkRateLimit(email);

        // Generate and store OTP
        String otp = otpService.generateAndStore(email);

        // Set rate limit after OTP generation
        otpService.setRateLimit(email);

        // Send OTP email with user's display name (fallback to email if displayName is null)
        String displayName = user.getDisplayName() != null ? user.getDisplayName() : email;
        emailService.sendOTPEmail(email, displayName, otp);

        log.info("OTP sent successfully to email: {}", maskEmail(email));

        return SendOTPResponseDTO.builder()
            .message("OTP sent successfully")
            .build();
    }

    /**
     * Verifies the submitted OTP and marks user's email as verified.
     * Updates user entity with emailVerified=true and emailVerifiedAt=current timestamp.
     *
     * @param email The user's email address
     * @param otp The 6-digit OTP code to validate
     * @return VerifyOTPResponseDTO with success message and emailVerifiedAt timestamp
     * @throws InvalidOTPException if OTP is invalid or expired
     * @throws UserNotFoundException if user does not exist
     */
    public VerifyOTPResponseDTO verifyOTP(String email, String otp) {
        log.info("Processing OTP verification request for email: {}", maskEmail(email));

        // Validate OTP using OTPService
        boolean isValid = otpService.validate(email, otp);
        
        if (!isValid) {
            log.warn("OTP verification failed for email: {}", maskEmail(email));
            throw new InvalidOTPException("Invalid or expired OTP");
        }

        // Retrieve User entity by email
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> {
                log.error("User not found during OTP verification for email: {}", maskEmail(email));
                return new UserNotFoundException("User not found");
            });

        // Set user.emailVerified to true and user.emailVerifiedAt to current timestamp
        user.setEmailVerified(true);
        Instant verifiedAt = Instant.now();
        user.setEmailVerifiedAt(verifiedAt);

        // Persist user entity using userRepository.save()
        userRepository.save(user);

        log.info("Email verified successfully for email: {} at {}", maskEmail(email), verifiedAt);

        return VerifyOTPResponseDTO.builder()
            .message("Email verified successfully")
            .emailVerifiedAt(verifiedAt)
            .build();
    }

    /**
     * Masks email address for logging purposes to protect user privacy.
     * Format: first character + *** + @domain
     *
     * @param email The email address to mask
     * @return Masked email address (e.g., "u***@example.com")
     */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "***";
        }

        String[] parts = email.split("@");
        String localPart = parts[0];
        String domain = parts[1];

        String maskedLocal = localPart.length() > 0 ? localPart.charAt(0) + "***" : "***";
        return maskedLocal + "@" + domain;
    }
}
