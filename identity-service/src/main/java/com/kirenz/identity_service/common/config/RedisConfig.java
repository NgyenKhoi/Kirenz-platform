package com.kirenz.identity_service.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * Redis configuration for OTP storage and rate limiting.
 * Configures Redis connection using Lettuce driver and provides StringRedisTemplate
 * for String-based Redis operations.
 */
@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String host;

    @Value("${spring.data.redis.port}")
    private int port;

    @Value("${spring.data.redis.password}")
    private String password;

    /**
     * Creates Redis connection factory with Lettuce driver.
     * Configures standalone Redis connection with host, port, and password.
     *
     * @return RedisConnectionFactory configured with Lettuce driver
     */
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName(host);
        config.setPort(port);
        config.setPassword(password);
        return new LettuceConnectionFactory(config);
    }

    /**
     * Creates StringRedisTemplate bean for String-based Redis operations.
     * Used for OTP storage and rate limiting with key-value string pairs.
     *
     * @param connectionFactory Redis connection factory
     * @return StringRedisTemplate for Redis operations
     */
    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }
}
