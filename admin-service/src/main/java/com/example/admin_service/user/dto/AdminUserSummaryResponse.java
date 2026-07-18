package com.example.admin_service.user.dto;

public record AdminUserSummaryResponse(
    long totalRegistered,
    long newToday,
    long newThisWeek,
    long newThisMonth,
    long bannedAccounts,
    long deactivatedAccounts,
    long restrictedAccounts
) {
}
