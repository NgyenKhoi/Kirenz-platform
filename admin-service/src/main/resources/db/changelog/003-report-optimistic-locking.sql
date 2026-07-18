--liquibase formatted sql

--changeset admin-service:003-report-optimistic-locking
ALTER TABLE reports ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

--rollback ALTER TABLE reports DROP COLUMN IF EXISTS version;
