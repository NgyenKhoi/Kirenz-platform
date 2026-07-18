package com.example.admin_service.monitoring.dto;

import com.example.admin_service.monitoring.HealthStatus;

import java.time.Instant;

public record InstanceHealthResponse(
    String instanceId,
    String host,
    int port,
    HealthStatus status,
    long latencyMs,
    Instant checkedAt
) {
}
