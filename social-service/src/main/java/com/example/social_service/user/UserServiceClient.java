package com.example.social_service.user;

import com.example.social_service.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "user-service")
public interface UserServiceClient {

    @GetMapping("/api/friends/status/{targetUserId}")
    ApiResponse<FriendStatusResponse> getFriendStatus(@PathVariable("targetUserId") UUID targetUserId);

    @GetMapping("/api/blocks/status/{targetUserId}")
    ApiResponse<BlockStatusResponse> getBlockStatus(@PathVariable("targetUserId") UUID targetUserId);
}
