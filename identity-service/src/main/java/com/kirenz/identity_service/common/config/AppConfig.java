package com.kirenz.identity_service.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * General application configuration.
 * Provides common beans used across the application.
 */
@Configuration
public class AppConfig {

    /**
     * Creates RestTemplate bean for making HTTP requests to external APIs.
     * Used by EmailService to communicate with Brevo API.
     *
     * @return RestTemplate instance for HTTP operations
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
