package com.example.admin_service.monitoring;

import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.monitoring.dto.MonitoringResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/monitoring")
@RequiredArgsConstructor
public class AdminMonitoringController {

    private final MonitoringService monitoringService;

    @GetMapping
    public ApiResponse<MonitoringResponse> getMonitoring() {
        return ApiResponse.success("System monitoring retrieved successfully", monitoringService.getMonitoring());
    }
}
