package com.example.admin_service.health;

import com.example.admin_service.auth.CurrentAdmin;
import com.example.admin_service.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminPingController {

    private final CurrentAdmin currentAdmin;

    @GetMapping("/ping")
    public ApiResponse<AdminPingResponse> ping() {
        AdminPingResponse data = new AdminPingResponse("admin-service", "UP", currentAdmin.id());
        return ApiResponse.success("Admin service is available", data);
    }
}
