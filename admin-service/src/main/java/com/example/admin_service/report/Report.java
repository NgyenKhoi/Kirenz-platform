package com.example.admin_service.report;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reports")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "reporter_id", nullable = false)
    private UUID reporterId;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private ReportTargetType targetType;

    @Column(name = "target_id", nullable = false, length = 255)
    private String targetId;

    @Column(name = "target_owner_id")
    private UUID targetOwnerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ReportReason reason;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;

    @Column(name = "moderation_reason", length = 50)
    private String moderationReason;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ReportResolution resolution;

    @Column(name = "admin_note", length = 2000)
    private String adminNote;

    @Column(name = "assigned_admin_id")
    private UUID assignedAdminId;

    @Column(name = "resolved_by")
    private UUID resolvedBy;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(nullable = false)
    private long version;

    public void startReview(UUID adminId, String note) {
        if (status != ReportStatus.PENDING) {
            throw new IllegalStateException("Only pending reports can start review");
        }
        status = ReportStatus.REVIEWING;
        assignedAdminId = adminId;
        adminNote = note;
    }

    public void dismiss(UUID adminId, ModerationReason reason, String note, Instant now) {
        requireOpen();
        status = ReportStatus.DISMISSED;
        resolution = ReportResolution.NO_VIOLATION;
        moderationReason = reason.name();
        adminNote = note;
        assignedAdminId = assignedAdminId == null ? adminId : assignedAdminId;
        resolvedBy = adminId;
        resolvedAt = now;
    }

    public void resolve(
        UUID adminId,
        ReportResolution outcome,
        ModerationReason reason,
        String note,
        Instant now
    ) {
        requireOpen();
        if (outcome == null || outcome == ReportResolution.NO_VIOLATION) {
            throw new IllegalArgumentException("A violation resolution is required");
        }
        status = ReportStatus.RESOLVED;
        resolution = outcome;
        moderationReason = reason.name();
        adminNote = note;
        assignedAdminId = assignedAdminId == null ? adminId : assignedAdminId;
        resolvedBy = adminId;
        resolvedAt = now;
    }

    private void requireOpen() {
        if (status == ReportStatus.RESOLVED || status == ReportStatus.DISMISSED) {
            throw new IllegalStateException("Report is already closed");
        }
    }
}
