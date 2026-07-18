package com.example.admin_service.audit;

import com.example.admin_service.audit.dto.AdminActionResponse;
import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.user.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/actions")
@RequiredArgsConstructor
public class AdminActionController {

    private final AdminActionService adminActionService;

    @GetMapping
    public ApiResponse<PageResponse<AdminActionResponse>> search(
        @RequestParam(required = false) UUID adminId,
        @RequestParam(required = false) AdminTargetType targetType,
        @RequestParam(required = false) String targetId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(
            "Admin action history retrieved successfully",
            adminActionService.search(adminId, targetType, targetId, page, size)
        );
    }
}
