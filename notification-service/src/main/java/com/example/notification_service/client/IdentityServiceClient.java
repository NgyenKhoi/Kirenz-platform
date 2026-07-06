package com.example.notification_service.client;

import com.example.notification_service.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "identity-service", configuration = FeignAuthForwardingConfig.class)
public interface IdentityServiceClient {

    @GetMapping("/api/users/internal/profiles")
    ApiResponse<List<IdentityUserProfileResponse>> getProfilesByIds(@RequestParam("ids") List<UUID> ids);

    @GetMapping("/api/users/internal/birthdays")
    ApiResponse<List<IdentityUserProfileResponse>> getBirthdaysToday();
}
