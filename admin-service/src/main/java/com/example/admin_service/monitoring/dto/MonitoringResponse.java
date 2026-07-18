package com.example.admin_service.monitoring.dto;

import java.time.Instant;
import java.util.List;

public record MonitoringResponse(
    List<ServiceHealthResponse> services,
    List<InfrastructureHealthResponse> infrastructure,
    boolean partialData,
    Instant checkedAt
) {
}
