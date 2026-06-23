-- liquibase formatted sql

-- changeset hoahtm:3
CREATE TABLE privacy_settings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    profile_visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    post_visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    allow_direct_messages BOOLEAN NOT NULL DEFAULT TRUE,
    show_online_status BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_privacy_user_id ON privacy_settings(user_id);
