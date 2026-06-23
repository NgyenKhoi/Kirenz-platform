package com.example.chat_service.common.client;

import com.example.chat_service.common.config.FeignAuthForwardingConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(name = "user-service", url = "${services.user.url}", configuration = FeignAuthForwardingConfig.class)
public interface UserServiceClient {

    @GetMapping("/api/privacy/internal/check-dm")
    boolean checkDirectMessagePermission(
        @RequestParam("senderId") UUID senderId,
        @RequestParam("receiverId") UUID receiverId
    );
}
