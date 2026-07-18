package com.example.admin_service.user;

import com.example.admin_service.audit.AdminActionService;
import com.example.admin_service.audit.AdminActionType;
import com.example.admin_service.audit.AdminTargetType;
import com.example.admin_service.audit.dto.AdminActionResponse;
import com.example.admin_service.auth.CurrentAdmin;
import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.notification.NotificationEvent;
import com.example.admin_service.notification.NotificationProducer;
import com.example.admin_service.user.dto.AdminUserActionRequest;
import com.example.admin_service.user.dto.AdminUserResponse;
import com.example.admin_service.user.dto.AdminWarningRequest;
import com.example.admin_service.user.dto.AdminSuspendRequest;
import com.example.admin_service.user.dto.IdentitySuspendRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class AdminUserManagementServiceTest {

    @Mock
    private IdentityAdminClient identityAdminClient;

    @Mock
    private CurrentAdmin currentAdmin;

    @Mock
    private AdminActionService adminActionService;

    @Mock
    private NotificationProducer notificationProducer;

    @InjectMocks
    private AdminUserManagementService adminUserManagementService;

    @Test
    void bansUserThenRecordsAudit() {
        UUID adminId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        AdminUserResponse user = user(userId, "BANNED");
        when(currentAdmin.id()).thenReturn(adminId);
        when(identityAdminClient.ban(userId)).thenReturn(ApiResponse.success("banned", user));

        var result = adminUserManagementService.ban(
            userId,
            new AdminUserActionRequest("HARASSMENT", "Repeated violation")
        );

        assertThat(result.status()).isEqualTo("BANNED");
        verify(adminActionService).record(
            adminId,
            AdminActionType.BAN_ACCOUNT,
            AdminTargetType.USER,
            userId.toString(),
            "HARASSMENT",
            "Repeated violation"
        );
    }

    @Test
    void recordsAndPublishesWarning() {
        UUID adminId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID actionId = UUID.randomUUID();
        when(currentAdmin.id()).thenReturn(adminId);
        when(identityAdminClient.getUser(userId)).thenReturn(ApiResponse.success("found", user(userId, "ACTIVE")));
        when(adminActionService.record(
            adminId,
            AdminActionType.SEND_WARNING,
            AdminTargetType.USER,
            userId.toString(),
            "SPAM",
            null
        )).thenReturn(new AdminActionResponse(
            actionId,
            adminId,
            AdminActionType.SEND_WARNING,
            AdminTargetType.USER,
            userId.toString(),
            "SPAM",
            null,
            Instant.now()
        ));

        adminUserManagementService.sendWarning(
            userId,
            new AdminWarningRequest("SPAM", "Please stop posting repeated content.", null)
        );

        ArgumentCaptor<NotificationEvent> eventCaptor = ArgumentCaptor.forClass(NotificationEvent.class);
        verify(notificationProducer).sendWarning(eventCaptor.capture());
        assertThat(eventCaptor.getValue().getType()).isEqualTo("ADMIN_WARNING");
        assertThat(eventCaptor.getValue().getReceiverId()).isEqualTo(userId);
        assertThat(eventCaptor.getValue().getTargetId()).isEqualTo(actionId.toString());
    }

    @Test
    void suspendsUserThenRecordsAudit() {
        UUID adminId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Instant suspendedUntil = Instant.now().plusSeconds(3600);
        AdminUserResponse suspended = user(userId, "SUSPENDED");
        when(currentAdmin.id()).thenReturn(adminId);
        when(identityAdminClient.suspend(eq(userId), any(IdentitySuspendRequest.class)))
            .thenReturn(ApiResponse.success("suspended", suspended));

        var result = adminUserManagementService.suspend(userId,
            new AdminSuspendRequest(suspendedUntil, "HARASSMENT", "Repeated abuse"));

        assertThat(result.status()).isEqualTo("SUSPENDED");
        verify(adminActionService).record(adminId, AdminActionType.SUSPEND_ACCOUNT,
            AdminTargetType.USER, userId.toString(), "HARASSMENT", "Repeated abuse");
    }

    @Test
    void rejectsModerationAgainstCurrentAdminBeforeCallingDownstreamServices() {
        UUID adminId = UUID.randomUUID();
        when(currentAdmin.id()).thenReturn(adminId);

        assertThatThrownBy(() -> adminUserManagementService.sendWarning(
            adminId,
            new AdminWarningRequest("SPAM", "Warning", null)
        )).isInstanceOf(com.example.admin_service.common.exception.BadRequestException.class)
            .hasMessage("Administrators cannot moderate their own account");

        verifyNoInteractions(identityAdminClient, adminActionService, notificationProducer);
    }

    private AdminUserResponse user(UUID userId, String status) {
        return new AdminUserResponse(
            userId,
            "user@kirenz.local",
            "user",
            "User",
            null,
            "USER",
            status,
            true,
            Instant.now(),
            null,
            null
        );
    }
}
