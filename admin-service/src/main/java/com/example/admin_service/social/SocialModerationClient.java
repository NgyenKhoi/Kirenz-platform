package com.example.admin_service.social;

import com.example.admin_service.common.client.FeignAuthForwardingConfig;
import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.social.dto.SocialModerationCommandResponse;
import com.example.admin_service.social.dto.SocialModerationContentResponse;
import com.example.admin_service.social.dto.SocialModerationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
    name = "social-service",
    configuration = FeignAuthForwardingConfig.class,
    fallbackFactory = SocialModerationFallbackFactory.class
)
public interface SocialModerationClient {

    @GetMapping("/api/admin/internal/content/{targetType}/{targetId}")
    ApiResponse<SocialModerationContentResponse> getContent(
        @PathVariable("targetType") String targetType,
        @PathVariable("targetId") String targetId
    );

    @PostMapping("/api/admin/internal/content/{targetType}/{targetId}/hide")
    ApiResponse<SocialModerationCommandResponse> hide(
        @PathVariable("targetType") String targetType,
        @PathVariable("targetId") String targetId,
        @RequestBody SocialModerationRequest request
    );

    @PostMapping("/api/admin/internal/content/{targetType}/{targetId}/remove")
    ApiResponse<SocialModerationCommandResponse> remove(
        @PathVariable("targetType") String targetType,
        @PathVariable("targetId") String targetId,
        @RequestBody SocialModerationRequest request
    );
}
