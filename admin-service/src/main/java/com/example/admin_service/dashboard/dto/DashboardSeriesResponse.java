package com.example.admin_service.dashboard.dto;

import java.util.List;

public record DashboardSeriesResponse<T>(
    List<T> series,
    boolean partialData,
    List<String> unavailableComponents
) {
}
