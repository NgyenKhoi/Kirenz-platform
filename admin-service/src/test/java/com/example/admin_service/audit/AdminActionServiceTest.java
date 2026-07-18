package com.example.admin_service.audit;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminActionServiceTest {

    @Mock
    private AdminActionRepository adminActionRepository;

    @InjectMocks
    private AdminActionService adminActionService;

    @Test
    void recordsAdminAction() {
        UUID actionId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        when(adminActionRepository.save(any(AdminAction.class))).thenAnswer(invocation -> {
            AdminAction input = invocation.getArgument(0);
            return AdminAction.builder()
                .id(actionId)
                .adminId(input.getAdminId())
                .actionType(input.getActionType())
                .targetType(input.getTargetType())
                .targetId(input.getTargetId())
                .reason(input.getReason())
                .note(input.getNote())
                .createdAt(Instant.now())
                .build();
        });

        var result = adminActionService.record(
            adminId,
            AdminActionType.BAN_ACCOUNT,
            AdminTargetType.USER,
            UUID.randomUUID().toString(),
            "HARASSMENT",
            "Repeated violation"
        );

        assertThat(result.id()).isEqualTo(actionId);
        assertThat(result.adminId()).isEqualTo(adminId);
        assertThat(result.actionType()).isEqualTo(AdminActionType.BAN_ACCOUNT);
    }

    @Test
    void searchesAndCapsPageSize() {
        when(adminActionRepository.search(
            eq(null),
            eq(AdminTargetType.USER),
            eq("target"),
            any(Pageable.class)
        )).thenAnswer(invocation -> {
            Pageable pageable = invocation.getArgument(3);
            assertThat(pageable.getPageSize()).isEqualTo(100);
            return new PageImpl<>(List.of(), pageable, 0);
        });

        var result = adminActionService.search(null, AdminTargetType.USER, " target ", -2, 1000);

        assertThat(result.page()).isZero();
        assertThat(result.size()).isEqualTo(100);
    }
}
