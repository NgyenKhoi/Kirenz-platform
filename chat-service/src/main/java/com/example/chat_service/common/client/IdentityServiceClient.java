package com.example.chat_service.common.client;

import com.example.chat_service.common.dto.ApiResponse;
import com.example.chat_service.conversation.dto.ParticipantInfo;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import com.example.chat_service.common.config.FeignAuthForwardingConfig;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "identity-service", configuration = FeignAuthForwardingConfig.class)
public interface IdentityServiceClient {

    @GetMapping("/api/users/internal/profiles")
    ApiResponse<List<ParticipantInfo>> getProfilesByIds(@RequestParam("ids") List<UUID> ids);
}
