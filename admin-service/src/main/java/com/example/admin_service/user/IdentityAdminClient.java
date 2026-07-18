package com.example.admin_service.user;

import com.example.admin_service.common.client.FeignAuthForwardingConfig;
import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.user.dto.AdminUserResponse;
import com.example.admin_service.user.dto.AdminUserSummaryResponse;
import com.example.admin_service.user.dto.PageResponse;
import com.example.admin_service.user.dto.IdentitySuspendRequest;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(
    name = "identity-service",
    configuration = FeignAuthForwardingConfig.class,
    fallbackFactory = IdentityAdminFallbackFactory.class
)
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

    @GetMapping("/api/users/internal/admin/{userId}")
    ApiResponse<AdminUserResponse> getUser(@PathVariable("userId") UUID userId);

    @PostMapping("/api/users/internal/admin/{userId}/ban")
    ApiResponse<AdminUserResponse> ban(@PathVariable("userId") UUID userId);

    @PostMapping("/api/users/internal/admin/{userId}/unban")
    ApiResponse<AdminUserResponse> unban(@PathVariable("userId") UUID userId);

    @PostMapping("/api/users/internal/admin/{userId}/suspend")
    ApiResponse<AdminUserResponse> suspend(
        @PathVariable("userId") UUID userId,
        @RequestBody IdentitySuspendRequest request
    );
}
