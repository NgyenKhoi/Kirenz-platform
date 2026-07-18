package com.example.admin_service.monitoring.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ActuatorHealthResponse(
    String status,
    Map<String, ActuatorComponentHealth> components
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ActuatorComponentHealth(String status) {
    }
}
