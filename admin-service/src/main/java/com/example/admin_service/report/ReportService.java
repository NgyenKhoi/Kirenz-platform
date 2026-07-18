package com.example.admin_service.report;

import com.example.admin_service.common.exception.BadRequestException;
import com.example.admin_service.common.exception.NotFoundException;
import com.example.admin_service.report.dto.AdminReportDetailResponse;
import com.example.admin_service.report.dto.CreateReportRequest;
import com.example.admin_service.report.dto.ReportResponse;
import com.example.admin_service.user.dto.PageResponse;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    private static final List<ReportStatus> OPEN_STATUSES = List.of(ReportStatus.PENDING, ReportStatus.REVIEWING);

    private final ReportRepository reportRepository;
    private final ReportMapper reportMapper;

    @Transactional
    public ReportResponse create(UUID reporterId, CreateReportRequest request) {
        String targetId = request.targetId().trim();
        if (reportRepository.existsByReporterIdAndTargetTypeAndTargetIdAndStatusIn(
            reporterId, request.targetType(), targetId, OPEN_STATUSES
        )) {
            throw duplicateReport();
        }
        Report report = Report.builder()
            .reporterId(reporterId)
            .targetType(request.targetType())
            .targetId(targetId)
            .reason(request.reason())
            .description(normalize(request.description()))
            .build();
        try {
            return reportMapper.toResponse(reportRepository.saveAndFlush(report));
        } catch (DataIntegrityViolationException ex) {
            throw duplicateReport();
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<ReportResponse> findMine(UUID reporterId, int page, int size) {
        var result = reportRepository.findByReporterId(reporterId, pageRequest(page, size)).map(reportMapper::toResponse);
        return toPageResponse(result);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReportResponse> search(
        ReportStatus status, ReportTargetType targetType, ReportReason reason, int page, int size
    ) {
        Specification<Report> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) predicates.add(builder.equal(root.get("status"), status));
            if (targetType != null) predicates.add(builder.equal(root.get("targetType"), targetType));
            if (reason != null) predicates.add(builder.equal(root.get("reason"), reason));
            return builder.and(predicates.toArray(Predicate[]::new));
        };
        var result = reportRepository.findAll(specification, pageRequest(page, size)).map(reportMapper::toResponse);
        return toPageResponse(result);
    }

    @Transactional(readOnly = true)
    public AdminReportDetailResponse getAdminDetail(UUID reportId) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new NotFoundException("Report not found"));
        long count = reportRepository.countByTargetTypeAndTargetId(report.getTargetType(), report.getTargetId());
        return reportMapper.toAdminDetail(report, count);
    }

    private PageRequest pageRequest(int page, int size) {
        return PageRequest.of(Math.max(0, page), Math.max(1, Math.min(size, 100)),
            Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    private PageResponse<ReportResponse> toPageResponse(org.springframework.data.domain.Page<ReportResponse> page) {
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
            page.getTotalElements(), page.getTotalPages());
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private BadRequestException duplicateReport() {
        return new BadRequestException("You already have an open report for this target");
    }
}
