package com.kirenz.identity_service.verification.service;

import com.kirenz.identity_service.verification.exception.EmailSendingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service responsible for sending emails via Brevo API.
 * Handles OTP email delivery using Thymeleaf templates for professional HTML
 * rendering.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    @Value("${brevo.api-key}")
    private String brevoApiKey;

    @Value("${brevo.base-url}")
    private String brevoBaseUrl;

    @Value("${brevo.sender-email}")
    private String senderEmail;

    @Value("${brevo.sender-name}")
    private String senderName;

    private final RestTemplate restTemplate;
    private final TemplateEngine templateEngine;

    /**
     * Sends OTP verification email to the recipient using Brevo API.
     * Renders email body using Thymeleaf template with OTP and recipient name.
     *
     * @param recipientEmail The recipient's email address
     * @param recipientName  The recipient's display name
     * @param otp            The 6-digit OTP code to include in the email
     * @throws EmailSendingException if Brevo API returns non-2xx status or request
     *                               fails
     */
    public void sendOTPEmail(String recipientEmail, String recipientName, String otp) {
        try {
            log.info("Attempting to send OTP email to: {}", maskEmail(recipientEmail));

            // Create Thymeleaf context with template variables
            Context context = new Context();
            context.setVariable("otp", otp);
            context.setVariable("name", recipientName);

            // Render email body using Thymeleaf template
            String htmlContent = templateEngine.process("email/otp-verification", context);

            // Construct Brevo API request body
            Map<String, Object> requestBody = new HashMap<>();

            // Sender information
            Map<String, String> sender = new HashMap<>();
            sender.put("email", senderEmail);
            sender.put("name", senderName);
            requestBody.put("sender", sender);

            // Recipient information
            Map<String, String> recipient = new HashMap<>();
            recipient.put("email", recipientEmail);
            recipient.put("name", recipientName);
            requestBody.put("to", List.of(recipient));

            // Email content
            requestBody.put("subject", "Verify Your Email - Kirenz Platform");
            requestBody.put("htmlContent", htmlContent);

            // Set up HTTP headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);

            // Create HTTP entity with headers and body
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Send POST request to Brevo API
            ResponseEntity<String> response = restTemplate.exchange(
                    brevoBaseUrl,
                    HttpMethod.POST,
                    entity,
                    String.class);

            // Check response status
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Brevo response: {}", response.getBody());
                log.info("OTP email sent successfully to: {}", maskEmail(recipientEmail));
            } else {
                log.error("Failed to send OTP email to: {}. Status: {}, Response: {}",
                        maskEmail(recipientEmail), response.getStatusCode(), response.getBody());
                throw new EmailSendingException("Failed to send OTP email. Please try again later");
            }

        } catch (EmailSendingException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error sending OTP email to: {}. Error: {}",
                    maskEmail(recipientEmail), e.getMessage(), e);
            throw new EmailSendingException("Failed to send OTP email. Please try again later", e);
        }
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
