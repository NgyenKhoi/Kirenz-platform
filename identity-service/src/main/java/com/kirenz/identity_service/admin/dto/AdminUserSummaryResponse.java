package com.kirenz.identity_service.admin.dto;

public record AdminUserSummaryResponse(
    long totalRegistered,
    long newToday,
    long newThisWeek,
    long newThisMonth,
    long bannedAccounts,
    long suspendedAccounts,
    long deactivatedAccounts,
    long restrictedAccounts
) {
}
