--liquibase formatted sql

--changeset admin-service:002-report-deduplication
CREATE UNIQUE INDEX uq_reports_open_reporter_target
    ON reports(reporter_id, target_type, target_id)
    WHERE status IN ('PENDING', 'REVIEWING');

--rollback DROP INDEX IF EXISTS uq_reports_open_reporter_target;
