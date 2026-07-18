--liquibase formatted sql

--changeset admin-service:001-init-admin-schema
CREATE TABLE reports (
    id UUID PRIMARY KEY,
    reporter_id UUID NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    target_owner_id UUID,
    reason VARCHAR(50) NOT NULL,
    description VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    moderation_reason VARCHAR(50),
    resolution VARCHAR(30),
    admin_note VARCHAR(2000),
    assigned_admin_id UUID,
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_reports_target_type CHECK (target_type IN ('POST', 'COMMENT', 'USER', 'STORY')),
    CONSTRAINT chk_reports_status CHECK (status IN ('PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED')),
    CONSTRAINT chk_reports_resolution CHECK (resolution IS NULL OR resolution IN (
        'NO_VIOLATION', 'CONTENT_REMOVED', 'CONTENT_HIDDEN', 'USER_WARNED', 'USER_SUSPENDED', 'USER_BANNED'
    ))
);

CREATE INDEX idx_reports_status_created_at ON reports(status, created_at DESC);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);
CREATE INDEX idx_reports_reporter ON reports(reporter_id, created_at DESC);
CREATE INDEX idx_reports_target_owner ON reports(target_owner_id, created_at DESC);

CREATE TABLE admin_actions (
    id UUID PRIMARY KEY,
    admin_id UUID NOT NULL,
    action_type VARCHAR(40) NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    reason VARCHAR(50),
    note VARCHAR(2000),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id, created_at DESC);
CREATE INDEX idx_admin_actions_target ON admin_actions(target_type, target_id, created_at DESC);

--rollback DROP TABLE IF EXISTS admin_actions; DROP TABLE IF EXISTS reports;
