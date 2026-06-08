package com.kirenz.identity_service.verification.service;

import com.kirenz.identity_service.verification.exception.RateLimitExceededException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

/**
 * Service responsible for OTP lifecycle management including generation, storage,
 * validation, and rate limiting. Uses Redis for temporary OTP storage with TTL.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OTPService {

    private final StringRedisTemplate redisTemplate;
    private final SecureRandom secureRandom = new SecureRandom();

    private static final String OTP_KEY_PREFIX = "otp:verify:";
    private static final String RATE_LIMIT_KEY_PREFIX = "otp:ratelimit:";
    private static final int OTP_LENGTH = 6;
    private static final int OTP_TTL_SECONDS = 300; // 5 minutes
    private static final int RATE_LIMIT_TTL_SECONDS = 60; // 1 minute

    public String generateAndStore(String email) {
        // Generate 6-digit OTP using SecureRandom
        int otpNumber = secureRandom.nextInt(1000000);
        String otp = String.format("%06d", otpNumber);

        // Store OTP in Redis with key format "otp:verify:{email}" and TTL 300 seconds
        String redisKey = OTP_KEY_PREFIX + email;
        redisTemplate.opsForValue().set(redisKey, otp, Duration.ofSeconds(OTP_TTL_SECONDS));

        log.info("OTP generated and stored for email: {}", maskEmail(email));
        return otp;
    }

    public boolean validate(String email, String otp) {
        String redisKey = OTP_KEY_PREFIX + email;
        String storedOtp = redisTemplate.opsForValue().get(redisKey);

        if (storedOtp == null) {
            log.info("OTP validation failed for email: {} - OTP not found or expired", maskEmail(email));
            return false;
        }

        boolean isValid = storedOtp.equals(otp);

        if (isValid) {
            // Delete OTP from Redis after successful validation (single-use)
            redisTemplate.delete(redisKey);
            log.info("OTP validation succeeded for email: {}", maskEmail(email));
        } else {
            log.info("OTP validation failed for email: {} - OTP mismatch", maskEmail(email));
        }

        return isValid;
    }

    public void checkRateLimit(String email) {
        String rateLimitKey = RATE_LIMIT_KEY_PREFIX + email;
        Boolean exists = redisTemplate.hasKey(rateLimitKey);

        if (Boolean.TRUE.equals(exists)) {
            log.warn("Rate limit exceeded for email: {}", maskEmail(email));
            throw new RateLimitExceededException("Please wait 60 seconds before requesting another OTP");
        }
    }

    public void setRateLimit(String email) {
        String rateLimitKey = RATE_LIMIT_KEY_PREFIX + email;
        redisTemplate.opsForValue().set(rateLimitKey, String.valueOf(System.currentTimeMillis()), 
                                        Duration.ofSeconds(RATE_LIMIT_TTL_SECONDS));
        log.info("Rate limit set for email: {}", maskEmail(email));
    }

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
