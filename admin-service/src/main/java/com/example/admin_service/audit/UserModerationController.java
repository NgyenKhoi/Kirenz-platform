package com.example.admin_service.audit;

import com.example.admin_service.audit.dto.UserModerationDetailResponse;
import com.example.admin_service.auth.CurrentUser;
import com.example.admin_service.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/moderation/actions")
@RequiredArgsConstructor
public class UserModerationController {
    private final AdminActionService adminActionService;
    private final CurrentUser currentUser;

    @GetMapping("/{actionId}")
    public ApiResponse<UserModerationDetailResponse> detail(@PathVariable UUID actionId) {
        return ApiResponse.success("Moderation detail retrieved successfully",
            adminActionService.getForTargetUser(actionId, currentUser.id()));
    }
}
