package com.example.admin_service.report;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public interface ReportRepository extends JpaRepository<Report, UUID>, JpaSpecificationExecutor<Report> {

    boolean existsByReporterIdAndTargetTypeAndTargetIdAndStatusIn(
        UUID reporterId,
        ReportTargetType targetType,
        String targetId,
        Collection<ReportStatus> statuses
    );

    Page<Report> findByReporterId(UUID reporterId, Pageable pageable);

    Optional<Report> findByIdAndReporterId(UUID id, UUID reporterId);

    long countByTargetTypeAndTargetId(ReportTargetType targetType, String targetId);
}
