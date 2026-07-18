package com.kirenz.identity_service.admin.service;

import com.kirenz.identity_service.admin.dto.AdminUserResponse;
import com.kirenz.identity_service.admin.dto.AdminUserSummaryResponse;
import com.kirenz.identity_service.admin.dto.PageResponse;
import com.kirenz.identity_service.admin.dto.GrowthPointResponse;
import com.kirenz.identity_service.common.exception.UserNotFoundException;
import com.kirenz.identity_service.user.model.AccountStatus;
import com.kirenz.identity_service.user.model.User;
import com.kirenz.identity_service.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserQueryService {

    private final UserRepository userRepository;

    @Value("${admin.metrics-zone:Asia/Bangkok}")
    private String metricsZone;

    public AdminUserSummaryResponse getSummary() {
        ZoneId zoneId = ZoneId.of(metricsZone);
        LocalDate today = LocalDate.now(zoneId);
        Instant todayStart = today.atStartOfDay(zoneId).toInstant();
        Instant weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
            .atStartOfDay(zoneId)
            .toInstant();
        Instant monthStart = today.withDayOfMonth(1).atStartOfDay(zoneId).toInstant();
        long banned = userRepository.countByStatus(AccountStatus.BANNED);
        long suspended = userRepository.countByStatus(AccountStatus.SUSPENDED);
        long deactivated = userRepository.countByStatus(AccountStatus.DEACTIVATED);

        return new AdminUserSummaryResponse(
            userRepository.count(),
            userRepository.countByCreatedAtGreaterThanEqual(todayStart),
            userRepository.countByCreatedAtGreaterThanEqual(weekStart),
            userRepository.countByCreatedAtGreaterThanEqual(monthStart),
            banned,
            suspended,
            deactivated,
            banned + suspended + deactivated
        );
    }

    public PageResponse<AdminUserResponse> searchUsers(
        String query,
        AccountStatus status,
        Boolean emailVerified,
        int page,
        int size
    ) {
        String normalizedQuery = query == null || query.isBlank() ? "" : query.trim();
        int normalizedPage = Math.max(page, 0);
        int normalizedSize = Math.max(1, Math.min(size, 100));
        PageRequest pageable = PageRequest.of(
            normalizedPage,
            normalizedSize,
            Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<AdminUserResponse> result = userRepository
            .searchForAdmin(normalizedQuery, status, emailVerified, pageable)
            .map(this::toResponse);
        return PageResponse.from(result);
    }

    public AdminUserResponse getUser(UUID userId) {
        return userRepository.findById(userId)
            .map(this::toResponse)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
    }

    public List<GrowthPointResponse> getGrowth(LocalDate from, LocalDate to, String granularity) {
        ZoneId zoneId = ZoneId.of(metricsZone);
        LocalDate normalizedFrom = from == null ? LocalDate.now(zoneId).minusDays(29) : from;
        LocalDate normalizedTo = to == null ? LocalDate.now(zoneId) : to;
        if (normalizedTo.isBefore(normalizedFrom) || normalizedFrom.plusYears(2).isBefore(normalizedTo)) {
            throw new IllegalArgumentException("Growth range must be ordered and no longer than two years");
        }

        boolean monthly = "MONTH".equalsIgnoreCase(granularity);
        Map<String, Long> buckets = new LinkedHashMap<>();
        LocalDate cursor = monthly ? normalizedFrom.withDayOfMonth(1) : normalizedFrom;
        LocalDate last = monthly ? normalizedTo.withDayOfMonth(1) : normalizedTo;
        while (!cursor.isAfter(last)) {
            buckets.put(monthly ? cursor.toString().substring(0, 7) : cursor.toString(), 0L);
            cursor = monthly ? cursor.plusMonths(1) : cursor.plusDays(1);
        }

        Instant start = normalizedFrom.atStartOfDay(zoneId).toInstant();
        Instant endExclusive = normalizedTo.plusDays(1).atStartOfDay(zoneId).toInstant();
        userRepository.findCreatedAtBetween(start, endExclusive).forEach(createdAt -> {
            LocalDate date = createdAt.atZone(zoneId).toLocalDate();
            String key = monthly ? date.toString().substring(0, 7) : date.toString();
            buckets.computeIfPresent(key, (ignored, count) -> count + 1);
        });
        return buckets.entrySet().stream()
            .map(entry -> new GrowthPointResponse(entry.getKey(), entry.getValue()))
            .toList();
    }

    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
            user.getId(),
            user.getEmail(),
            user.getProfileUsername(),
            user.getDisplayName(),
            user.getAvatarUrl(),
            user.getRole(),
            user.getStatus(),
            Boolean.TRUE.equals(user.getEmailVerified()),
            user.getCreatedAt(),
            user.getLastLoginAt(),
            user.getSuspendedUntil()
        );
    }
}
