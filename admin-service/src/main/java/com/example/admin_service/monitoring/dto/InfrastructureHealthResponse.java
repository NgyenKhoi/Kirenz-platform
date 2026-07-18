package com.example.admin_service.monitoring.dto;

import com.example.admin_service.monitoring.HealthStatus;

import java.util.List;

public record InfrastructureHealthResponse(
    String component,
    HealthStatus status,
    List<String> sources
) {
}
