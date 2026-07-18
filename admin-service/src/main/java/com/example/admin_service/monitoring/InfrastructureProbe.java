package com.example.admin_service.monitoring;

import java.util.Map;

public interface InfrastructureProbe {
    Map<String, HealthStatus> probe();
}
