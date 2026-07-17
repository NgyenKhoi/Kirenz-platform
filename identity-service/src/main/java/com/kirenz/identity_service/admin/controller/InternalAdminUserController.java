package com.kirenz.identity_service.admin.controller;

import com.kirenz.identity_service.admin.dto.AdminUserResponse;
import com.kirenz.identity_service.admin.dto.AdminUserSummaryResponse;
import com.kirenz.identity_service.admin.dto.PageResponse;
import com.kirenz.identity_service.admin.service.AdminUserQueryService;
import com.kirenz.identity_service.common.dto.ApiResponse;
import com.kirenz.identity_service.user.model.AccountStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/internal/admin")
@RequiredArgsConstructor
public class InternalAdminUserController {

    private final AdminUserQueryService adminUserQueryService;

    @GetMapping("/summary")
    public ApiResponse<AdminUserSummaryResponse> getSummary() {
        return ApiResponse.success("Admin user summary retrieved successfully", adminUserQueryService.getSummary());
    }

    @GetMapping
    public ApiResponse<PageResponse<AdminUserResponse>> searchUsers(
        @RequestParam(required = false) String query,
        @RequestParam(required = false) AccountStatus status,
        @RequestParam(required = false) Boolean emailVerified,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<AdminUserResponse> users = adminUserQueryService.searchUsers(
            query,
            status,
            emailVerified,
            page,
            size
        );
        return ApiResponse.success("Admin user list retrieved successfully", users);
    }
}
