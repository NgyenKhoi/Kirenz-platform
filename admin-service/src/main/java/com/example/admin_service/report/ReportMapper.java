package com.example.admin_service.report;

import com.example.admin_service.report.dto.AdminReportDetailResponse;
import com.example.admin_service.report.dto.ReportResponse;
import com.example.admin_service.social.dto.SocialModerationContentResponse;
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

    public AdminReportDetailResponse toAdminDetail(
        Report report,
        long aggregateReportCount,
        SocialModerationContentResponse targetContent,
        boolean partialData,
        java.util.List<String> unavailableComponents
    ) {
        return new AdminReportDetailResponse(
            toResponse(report), aggregateReportCount, report.getModerationReason(), report.getAdminNote(),
            targetContent, partialData, unavailableComponents
        );
    }
}
