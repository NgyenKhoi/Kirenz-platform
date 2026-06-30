package com.example.notification_service.client;

import com.example.notification_service.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "user-service", url = "${services.user.url}", configuration = FeignAuthForwardingConfig.class)
public interface UserServiceClient {

    @GetMapping("/api/friends/user/{userId}")
    ApiResponse<List<FriendResponse>> listUserFriends(@PathVariable("userId") UUID userId);
}
