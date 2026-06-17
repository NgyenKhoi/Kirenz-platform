--liquibase formatted sql

--changeset user-service:002-add-blocks-schema

CREATE TABLE blocks (
    id UUID PRIMARY KEY,
    blocker_id UUID NOT NULL,
    blocked_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CHECK (blocker_id <> blocked_id),
    UNIQUE (blocker_id, blocked_id)
);

CREATE INDEX idx_blocks_blocker
ON blocks(blocker_id);

CREATE INDEX idx_blocks_blocked
ON blocks(blocked_id);

--rollback DROP TABLE IF EXISTS blocks CASCADE;
