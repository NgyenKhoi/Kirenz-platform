package com.example.admin_service.dashboard.dto;

import java.util.List;

public record DashboardSummaryResponse(
    long totalUsers,
    long registrationsToday,
    long registrationsThisWeek,
    long registrationsThisMonth,
    long bannedUsers,
    long suspendedUsers,
    long deactivatedUsers,
    long pendingReports,
    long reviewingReports,
    long posts,
    long comments,
    long reactions,
    boolean partialData,
    List<String> unavailableComponents
) {
}
