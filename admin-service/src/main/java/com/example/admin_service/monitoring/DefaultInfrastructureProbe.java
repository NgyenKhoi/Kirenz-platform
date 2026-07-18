package com.example.admin_service.monitoring;

import org.apache.kafka.clients.admin.Admin;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.kafka.core.KafkaAdmin;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Component
public class DefaultInfrastructureProbe implements InfrastructureProbe {

    private final KafkaAdmin kafkaAdmin;
    private final RedisConnectionFactory redisConnectionFactory;
    private final Duration timeout;

    public DefaultInfrastructureProbe(
        KafkaAdmin kafkaAdmin,
        RedisConnectionFactory redisConnectionFactory,
        @Value("${admin.monitoring.timeout:PT2S}") Duration timeout
    ) {
        this.kafkaAdmin = kafkaAdmin;
        this.redisConnectionFactory = redisConnectionFactory;
        this.timeout = timeout;
    }

    @Override
    public Map<String, HealthStatus> probe() {
        Map<String, HealthStatus> result = new LinkedHashMap<>();
        result.put("kafka", probeKafka());
        result.put("redis", probeRedis());
        return result;
    }

    private HealthStatus probeKafka() {
        try (Admin admin = Admin.create(kafkaAdmin.getConfigurationProperties())) {
            return admin.describeCluster().nodes().get(timeout.toMillis(), TimeUnit.MILLISECONDS).isEmpty()
                ? HealthStatus.DOWN : HealthStatus.UP;
        } catch (Exception ex) {
            return HealthStatus.DOWN;
        }
    }

    private HealthStatus probeRedis() {
        try (RedisConnection connection = redisConnectionFactory.getConnection()) {
            return "PONG".equalsIgnoreCase(connection.ping()) ? HealthStatus.UP : HealthStatus.DOWN;
        } catch (Exception ex) {
            return HealthStatus.DOWN;
        }
    }

}
