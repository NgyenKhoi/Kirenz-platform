package com.example.admin_service.user;

import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.audit.dto.AdminActionResponse;
import com.example.admin_service.audit.AdminActionService;
import com.example.admin_service.audit.AdminTargetType;
import com.example.admin_service.user.dto.AdminUserActionRequest;
import com.example.admin_service.user.dto.AdminUserResponse;
import com.example.admin_service.user.dto.AdminUserSummaryResponse;
import com.example.admin_service.user.dto.AdminWarningRequest;
import com.example.admin_service.user.dto.AdminSuspendRequest;
import com.example.admin_service.user.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final IdentityAdminClient identityAdminClient;
    private final AdminUserManagementService adminUserManagementService;
    private final AdminActionService adminActionService;

    @GetMapping("/summary")
    public ApiResponse<AdminUserSummaryResponse> getSummary() {
        return identityAdminClient.getUserSummary();
    }

    @GetMapping
    public ApiResponse<PageResponse<AdminUserResponse>> searchUsers(
        @RequestParam(required = false) String query,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) Boolean emailVerified,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return identityAdminClient.searchUsers(query, status, emailVerified, page, size);
    }

    @PostMapping("/{userId}/ban")
    public ApiResponse<AdminUserResponse> ban(
        @PathVariable UUID userId,
        @Valid @RequestBody AdminUserActionRequest request
    ) {
        return ApiResponse.success(
            "Account banned successfully",
            adminUserManagementService.ban(userId, request)
        );
    }

    @PostMapping("/{userId}/unban")
    public ApiResponse<AdminUserResponse> unban(
        @PathVariable UUID userId,
        @Valid @RequestBody AdminUserActionRequest request
    ) {
        return ApiResponse.success(
            "Account unbanned successfully",
            adminUserManagementService.unban(userId, request)
        );
    }

    @PostMapping("/{userId}/warnings")
    public ApiResponse<AdminActionResponse> sendWarning(
        @PathVariable UUID userId,
        @Valid @RequestBody AdminWarningRequest request
    ) {
        return ApiResponse.success(
            "Warning sent successfully",
            adminUserManagementService.sendWarning(userId, request)
        );
    }

    @PostMapping("/{userId}/suspend")
    public ApiResponse<AdminUserResponse> suspend(
        @PathVariable UUID userId,
        @Valid @RequestBody AdminSuspendRequest request
    ) {
        return ApiResponse.success(
            "Account suspended successfully",
            adminUserManagementService.suspend(userId, request)
        );
    }

    @GetMapping("/{userId}/actions")
    public ApiResponse<PageResponse<AdminActionResponse>> getActionHistory(
        @PathVariable UUID userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(
            "User moderation history retrieved successfully",
            adminActionService.search(null, AdminTargetType.USER, userId.toString(), page, size)
        );
    }
}
