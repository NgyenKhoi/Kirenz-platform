package com.kirenz.identity_service.admin.service;

import com.kirenz.identity_service.admin.dto.PageResponse;
import com.kirenz.identity_service.user.model.AccountStatus;
import com.kirenz.identity_service.user.model.User;
import com.kirenz.identity_service.user.model.UserRole;
import com.kirenz.identity_service.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminUserQueryServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminUserQueryService adminUserQueryService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(adminUserQueryService, "metricsZone", "Asia/Bangkok");
    }

    @Test
    void returnsAccountSummary() {
        when(userRepository.count()).thenReturn(120L);
        when(userRepository.countByCreatedAtGreaterThanEqual(any(Instant.class)))
            .thenReturn(3L, 14L, 42L);
        when(userRepository.countByStatus(AccountStatus.BANNED)).thenReturn(4L);
        when(userRepository.countByStatus(AccountStatus.SUSPENDED)).thenReturn(3L);
        when(userRepository.countByStatus(AccountStatus.DEACTIVATED)).thenReturn(2L);

        var result = adminUserQueryService.getSummary();

        assertThat(result.totalRegistered()).isEqualTo(120L);
        assertThat(result.newToday()).isEqualTo(3L);
        assertThat(result.newThisWeek()).isEqualTo(14L);
        assertThat(result.newThisMonth()).isEqualTo(42L);
        assertThat(result.suspendedAccounts()).isEqualTo(3L);
        assertThat(result.restrictedAccounts()).isEqualTo(9L);
    }

    @Test
    void searchesUsersAndCapsPageSize() {
        User user = User.builder()
            .id(UUID.randomUUID())
            .email("member@kirenz.local")
            .username("member")
            .displayName("Member")
            .password("hashed")
            .role(UserRole.USER)
            .status(AccountStatus.ACTIVE)
            .emailVerified(true)
            .createdAt(Instant.now())
            .build();
        when(userRepository.searchForAdmin(
            eq("member"),
            eq(AccountStatus.ACTIVE),
            eq(true),
            any(Pageable.class)
        )).thenAnswer(invocation -> {
            Pageable pageable = invocation.getArgument(3);
            assertThat(pageable.getPageSize()).isEqualTo(100);
            return new PageImpl<>(List.of(user), pageable, 1);
        });

        PageResponse<?> result = adminUserQueryService.searchUsers(
            " member ",
            AccountStatus.ACTIVE,
            true,
            -1,
            500
        );

        assertThat(result.page()).isZero();
        assertThat(result.size()).isEqualTo(100);
        assertThat(result.totalElements()).isEqualTo(1);
        assertThat(result.content()).hasSize(1);
    }

    @Test
    void usesEmptySearchTermWhenQueryIsMissing() {
        when(userRepository.searchForAdmin(eq(""), isNull(), isNull(), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of()));

        adminUserQueryService.searchUsers(null, null, null, 0, 20);

        verify(userRepository).searchForAdmin(eq(""), isNull(), isNull(), any(Pageable.class));
    }

    @Test
    void fillsMissingDailyGrowthPeriodsWithZero() {
        when(userRepository.findCreatedAtBetween(any(Instant.class), any(Instant.class)))
            .thenReturn(List.of(
                Instant.parse("2026-07-01T03:00:00Z"),
                Instant.parse("2026-07-03T03:00:00Z"),
                Instant.parse("2026-07-03T04:00:00Z")
            ));

        var result = adminUserQueryService.getGrowth(
            java.time.LocalDate.parse("2026-07-01"),
            java.time.LocalDate.parse("2026-07-03"),
            "DAY"
        );

        assertThat(result).extracting("count").containsExactly(1L, 0L, 2L);
    }
}
