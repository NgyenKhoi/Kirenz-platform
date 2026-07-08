--liquibase formatted sql

--changeset identity-service:002-add-google-id-to-users
--comment: Add nullable Google account link field to users

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

--rollback DROP INDEX IF EXISTS idx_users_google_id;
--rollback ALTER TABLE users DROP COLUMN IF EXISTS google_id;