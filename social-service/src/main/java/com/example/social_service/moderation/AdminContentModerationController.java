package com.example.social_service.moderation;

import com.example.social_service.common.dto.ApiResponse;
import com.example.social_service.moderation.dto.ModerationCommandRequest;
import com.example.social_service.moderation.dto.ModerationCommandResponse;
import com.example.social_service.moderation.dto.ModerationContentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/internal/content")
@RequiredArgsConstructor
public class AdminContentModerationController {

    private final ContentModerationService contentModerationService;

    @GetMapping("/{targetType}/{targetId}")
    public ApiResponse<ModerationContentResponse> getDetail(
        @PathVariable ModerationTargetType targetType,
        @PathVariable String targetId
    ) {
        return ApiResponse.success("Moderation content retrieved successfully",
            contentModerationService.getDetail(targetType, targetId));
    }

    @PostMapping("/{targetType}/{targetId}/hide")
    public ApiResponse<ModerationCommandResponse> hide(
        @PathVariable ModerationTargetType targetType,
        @PathVariable String targetId,
        @Valid @RequestBody ModerationCommandRequest request
    ) {
        return ApiResponse.success("Content hidden successfully", contentModerationService.hide(targetType, targetId));
    }

    @PostMapping("/{targetType}/{targetId}/remove")
    public ApiResponse<ModerationCommandResponse> remove(
        @PathVariable ModerationTargetType targetType,
        @PathVariable String targetId,
        @Valid @RequestBody ModerationCommandRequest request
    ) {
        return ApiResponse.success("Content removed successfully",
            contentModerationService.remove(targetType, targetId));
    }
}
