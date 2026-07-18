package com.example.admin_service.monitoring.dto;

import com.example.admin_service.monitoring.HealthStatus;

import java.util.List;

public record ServiceHealthResponse(
    String serviceName,
    HealthStatus status,
    int registeredInstances,
    List<InstanceHealthResponse> instances
) {
}
