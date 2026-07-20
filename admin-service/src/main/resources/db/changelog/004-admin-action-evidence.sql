--liquibase formatted sql

--changeset admin-service:004-admin-action-evidence
ALTER TABLE admin_actions ADD COLUMN evidence_url VARCHAR(1000);

--rollback ALTER TABLE admin_actions DROP COLUMN IF EXISTS evidence_url;
