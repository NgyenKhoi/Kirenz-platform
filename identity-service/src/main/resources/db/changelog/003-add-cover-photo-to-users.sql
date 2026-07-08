--liquibase formatted sql

--changeset identity-service:003-add-cover-photo-to-users
--comment: Add optional user cover photo URL

ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

--rollback ALTER TABLE users DROP COLUMN IF EXISTS cover_photo_url;
