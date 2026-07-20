package com.example.admin_service.user;

import com.example.admin_service.audit.AdminActionService;
import com.example.admin_service.audit.AdminActionType;
import com.example.admin_service.audit.AdminTargetType;
import com.example.admin_service.audit.dto.AdminActionResponse;
import com.example.admin_service.auth.CurrentAdmin;
import com.example.admin_service.notification.NotificationEvent;
import com.example.admin_service.notification.NotificationProducer;
import com.example.admin_service.common.exception.BadRequestException;
import com.example.admin_service.user.dto.AdminUserActionRequest;
import com.example.admin_service.user.dto.AdminUserResponse;
import com.example.admin_service.user.dto.AdminWarningRequest;
import com.example.admin_service.user.dto.AdminSuspendRequest;
import com.example.admin_service.user.dto.IdentitySuspendRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserManagementService {

    private final IdentityAdminClient identityAdminClient;
    private final CurrentAdmin currentAdmin;
    private final AdminActionService adminActionService;
    private final NotificationProducer notificationProducer;

    public AdminUserResponse ban(UUID userId, AdminUserActionRequest request) {
        UUID adminId = currentAdmin.id();
        ensureNotCurrentAdmin(userId, adminId);
        AdminUserResponse user = identityAdminClient.ban(userId).getData();
        AdminActionResponse action = recordModeration(
            adminId,
            AdminActionType.BAN_ACCOUNT,
            AdminTargetType.USER,
            userId.toString(),
            request.reason(),
            request.note(), request.evidenceUrl()
        );
        if (action != null) publishModeration("ADMIN_BAN", userId, adminId, action.id(), "Your account has been banned for " + request.reason() + ".");
        return user;
    }

    public AdminUserResponse unban(UUID userId, AdminUserActionRequest request) {
        UUID adminId = currentAdmin.id();
        ensureNotCurrentAdmin(userId, adminId);
        AdminUserResponse user = identityAdminClient.unban(userId).getData();
        adminActionService.record(
            adminId,
            AdminActionType.UNBAN_ACCOUNT,
            AdminTargetType.USER,
            userId.toString(),
            request.reason(),
            request.note()
        );
        return user;
    }

    public AdminActionResponse sendWarning(UUID userId, AdminWarningRequest request) {
        UUID adminId = currentAdmin.id();
        ensureNotCurrentAdmin(userId, adminId);
        identityAdminClient.getUser(userId);
        AdminActionResponse action = recordModeration(
            adminId,
            AdminActionType.SEND_WARNING,
            AdminTargetType.USER,
            userId.toString(),
            request.reason(),
            request.note(), request.evidenceUrl()
        );

        try {
            notificationProducer.sendWarning(NotificationEvent.builder()
                .type("ADMIN_WARNING")
                .actorId(adminId)
                .receiverId(userId)
                .targetId(action.id().toString())
                .message(request.message())
                .createdAt(Instant.now())
                .build());
        } catch (RuntimeException exception) {
            adminActionService.delete(action.id());
            throw exception;
        }
        return action;
    }

    public AdminUserResponse suspend(UUID userId, AdminSuspendRequest request) {
        UUID adminId = currentAdmin.id();
        ensureNotCurrentAdmin(userId, adminId);
        AdminUserResponse user = identityAdminClient.suspend(userId,
            new IdentitySuspendRequest(request.suspendedUntil(), request.moderationReason())).getData();
        AdminActionResponse action = recordModeration(
            adminId,
            AdminActionType.SUSPEND_ACCOUNT,
            AdminTargetType.USER,
            userId.toString(),
            request.moderationReason(),
            request.note(), request.evidenceUrl()
        );
        if (action != null) publishModeration("ADMIN_SUSPENSION", userId, adminId, action.id(),
            "Your account has been suspended until " + request.suspendedUntil() + ".");
        return user;
    }

    private void publishModeration(String type, UUID userId, UUID adminId, UUID actionId, String message) {
        notificationProducer.sendModeration(NotificationEvent.builder()
            .type(type).actorId(adminId).receiverId(userId).targetId(actionId.toString())
            .message(message).createdAt(Instant.now()).build());
    }

    private AdminActionResponse recordModeration(UUID adminId, AdminActionType actionType, AdminTargetType targetType,
                                                  String targetId, String reason, String note, String evidenceUrl) {
        return evidenceUrl == null || evidenceUrl.isBlank()
            ? adminActionService.record(adminId, actionType, targetType, targetId, reason, note)
            : adminActionService.record(adminId, actionType, targetType, targetId, reason, note, evidenceUrl);
    }

    private void ensureNotCurrentAdmin(UUID userId, UUID adminId) {
        if (userId.equals(adminId)) {
            throw new BadRequestException("Administrators cannot moderate their own account");
        }
    }
}
