package com.kirenz.user_service.identity;

import com.kirenz.user_service.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "identity-service", url = "${services.identity.url}")
public interface IdentityServiceClient {

    @GetMapping("/api/users/internal/profiles")
    ApiResponse<List<IdentityUserProfileResponse>> getProfilesByIds(@RequestParam("ids") List<UUID> ids);
}
