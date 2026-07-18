package com.example.admin_service.user;

import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.common.exception.DownstreamUnavailableException;
import com.example.admin_service.user.dto.AdminUserResponse;
import com.example.admin_service.user.dto.AdminUserSummaryResponse;
import com.example.admin_service.user.dto.IdentitySuspendRequest;
import com.example.admin_service.user.dto.PageResponse;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.time.LocalDate;
import java.util.List;
import com.example.admin_service.dashboard.dto.GrowthPointResponse;

@Component
public class IdentityAdminFallbackFactory implements FallbackFactory<IdentityAdminClient> {

    @Override
    public IdentityAdminClient create(Throwable cause) {
        return new IdentityAdminClient() {
            @Override
            public ApiResponse<AdminUserSummaryResponse> getUserSummary() {
                throw unavailable(cause);
            }

            @Override
            public ApiResponse<List<GrowthPointResponse>> getUserGrowth(
                LocalDate from, LocalDate to, String granularity
            ) {
                throw unavailable(cause);
            }

            @Override
            public ApiResponse<PageResponse<AdminUserResponse>> searchUsers(
                String query, String status, Boolean emailVerified, int page, int size
            ) {
                throw unavailable(cause);
            }

            @Override
            public ApiResponse<AdminUserResponse> getUser(UUID userId) {
                throw unavailable(cause);
            }

            @Override
            public ApiResponse<AdminUserResponse> ban(UUID userId) {
                throw unavailable(cause);
            }

            @Override
            public ApiResponse<AdminUserResponse> unban(UUID userId) {
                throw unavailable(cause);
            }

            @Override
            public ApiResponse<AdminUserResponse> suspend(UUID userId, IdentitySuspendRequest request) {
                throw unavailable(cause);
            }
        };
    }

    private DownstreamUnavailableException unavailable(Throwable cause) {
        return new DownstreamUnavailableException("Identity service", cause);
    }
}
