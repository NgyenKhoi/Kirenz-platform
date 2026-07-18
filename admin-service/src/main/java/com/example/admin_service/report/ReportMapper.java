package com.example.admin_service.report;

import com.example.admin_service.report.dto.AdminReportDetailResponse;
import com.example.admin_service.report.dto.ReportResponse;
import org.springframework.stereotype.Component;

@Component
public class ReportMapper {

    public ReportResponse toResponse(Report report) {
        return new ReportResponse(
            report.getId(), report.getReporterId(), report.getTargetType(), report.getTargetId(),
            report.getReason(), report.getDescription(), report.getStatus(), report.getResolution(),
            report.getCreatedAt(), report.getUpdatedAt()
        );
    }

    public AdminReportDetailResponse toAdminDetail(Report report, long aggregateReportCount) {
        return new AdminReportDetailResponse(
            toResponse(report), aggregateReportCount, report.getModerationReason(), report.getAdminNote()
        );
    }
}
