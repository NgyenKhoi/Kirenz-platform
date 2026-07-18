package com.example.admin_service.user;

import com.example.admin_service.audit.AdminActionService;
import com.example.admin_service.audit.AdminActionType;
import com.example.admin_service.audit.AdminTargetType;
import com.example.admin_service.audit.dto.AdminActionResponse;
import com.example.admin_service.auth.CurrentAdmin;
import com.example.admin_service.notification.NotificationEvent;
import com.example.admin_service.notification.NotificationProducer;
import com.example.admin_service.user.dto.AdminUserActionRequest;
import com.example.admin_service.user.dto.AdminUserResponse;
import com.example.admin_service.user.dto.AdminWarningRequest;
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
        AdminUserResponse user = identityAdminClient.ban(userId).getData();
        adminActionService.record(
            adminId,
            AdminActionType.BAN_ACCOUNT,
            AdminTargetType.USER,
            userId.toString(),
            request.reason(),
            request.note()
        );
        return user;
    }

    public AdminUserResponse unban(UUID userId, AdminUserActionRequest request) {
        UUID adminId = currentAdmin.id();
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
        identityAdminClient.getUser(userId);
        AdminActionResponse action = adminActionService.record(
            adminId,
            AdminActionType.SEND_WARNING,
            AdminTargetType.USER,
            userId.toString(),
            request.reason(),
            request.note()
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
}
