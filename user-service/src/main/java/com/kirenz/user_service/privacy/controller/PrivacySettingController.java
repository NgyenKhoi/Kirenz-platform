package com.kirenz.user_service.privacy.controller;

import com.kirenz.user_service.common.dto.ApiResponse;
import com.kirenz.user_service.privacy.dto.PrivacySettingResponse;
import com.kirenz.user_service.privacy.dto.UpdatePrivacySettingRequest;
import com.kirenz.user_service.privacy.service.PrivacySettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/privacy")
@RequiredArgsConstructor
public class PrivacySettingController {

    private final PrivacySettingService privacySettingService;

    @GetMapping("/me")
    public ApiResponse<PrivacySettingResponse> getMyPrivacySettings() {
        return ApiResponse.success(
            "Privacy settings retrieved successfully",
            privacySettingService.getPrivacySettings()
        );
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<PrivacySettingResponse> getUserPrivacySettings(@PathVariable UUID userId) {
        return ApiResponse.success(
            "User privacy settings retrieved successfully",
            privacySettingService.getPrivacySettingsByUserId(userId)
        );
    }

    @PutMapping("/me")
    public ApiResponse<PrivacySettingResponse> updatePrivacySettings(@RequestBody UpdatePrivacySettingRequest request) {
        return ApiResponse.success(
            "Privacy settings updated successfully",
            privacySettingService.updatePrivacySettings(request)
        );
    }

    @GetMapping("/can-message/{receiverId}")
    public ApiResponse<Boolean> canSendDirectMessage(@PathVariable UUID receiverId) {
        return ApiResponse.success(
            "Direct message permission retrieved successfully",
            privacySettingService.canCurrentUserSendDirectMessage(receiverId)
        );
    }

    @GetMapping("/internal/check-dm")
    public boolean checkDirectMessagePermission(
        @RequestParam UUID senderId,
        @RequestParam UUID receiverId
    ) {
        return privacySettingService.canSendDirectMessage(senderId, receiverId);
    }
}
