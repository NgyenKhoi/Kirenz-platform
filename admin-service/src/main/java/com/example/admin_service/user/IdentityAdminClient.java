package com.example.admin_service.user;

import com.example.admin_service.common.client.FeignAuthForwardingConfig;
import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.user.dto.AdminUserResponse;
import com.example.admin_service.user.dto.AdminUserSummaryResponse;
import com.example.admin_service.user.dto.PageResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "identity-service", configuration = FeignAuthForwardingConfig.class)
public interface IdentityAdminClient {

    @GetMapping("/api/users/internal/admin/summary")
    ApiResponse<AdminUserSummaryResponse> getUserSummary();

    @GetMapping("/api/users/internal/admin")
    ApiResponse<PageResponse<AdminUserResponse>> searchUsers(
        @RequestParam(value = "query", required = false) String query,
        @RequestParam(value = "status", required = false) String status,
        @RequestParam(value = "emailVerified", required = false) Boolean emailVerified,
        @RequestParam("page") int page,
        @RequestParam("size") int size
    );
}
