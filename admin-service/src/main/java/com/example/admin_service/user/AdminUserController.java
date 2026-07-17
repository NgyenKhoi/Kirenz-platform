package com.example.admin_service.user;

import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.user.dto.AdminUserResponse;
import com.example.admin_service.user.dto.AdminUserSummaryResponse;
import com.example.admin_service.user.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final IdentityAdminClient identityAdminClient;

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
}
