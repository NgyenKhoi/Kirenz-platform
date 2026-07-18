package com.example.admin_service.report.dto;

import jakarta.validation.constraints.Size;

public record ReviewReportRequest(
    @Size(max = 2000) String adminNote
) {
}
