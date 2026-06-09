--liquibase formatted sql

--changeset identity-service:002-refactor-identity-schema

DROP TABLE IF EXISTS user_stats CASCADE;

DROP TABLE IF EXISTS user_sessions CASCADE;

ALTER TABLE friendships
ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE friendships
ADD CONSTRAINT chk_friendships_status
CHECK (
    status IN (
        'PENDING',
        'ACCEPTED',
        'REJECTED'
    )
);

ALTER TABLE privacy_settings
ADD CONSTRAINT chk_profile_visibility
CHECK (
    profile_visibility IN (
        'PUBLIC',
        'FRIENDS',
        'PRIVATE'
    )
);

ALTER TABLE privacy_settings
ADD CONSTRAINT chk_post_visibility
CHECK (
    post_visibility_default IN (
        'PUBLIC',
        'FRIENDS',
        'PRIVATE'
    )
);

ALTER TABLE privacy_settings
ADD CONSTRAINT chk_allow_mentions
CHECK (
    allow_mentions IN (
        'EVERYONE',
        'FRIENDS',
        'NOBODY'
    )
);

CREATE TABLE notification_settings (
    user_id UUID PRIMARY KEY
        REFERENCES users(id)
        ON DELETE CASCADE,

    friend_requests BOOLEAN DEFAULT TRUE NOT NULL,
    messages BOOLEAN DEFAULT TRUE NOT NULL,
    comments BOOLEAN DEFAULT TRUE NOT NULL,
    mentions BOOLEAN DEFAULT TRUE NOT NULL,
    reactions BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker
ON blocks(blocker_id);

CREATE INDEX IF NOT EXISTS idx_blocks_blocked
ON blocks(blocked_id);

--rollback DROP INDEX IF EXISTS idx_blocks_blocked;
--rollback DROP INDEX IF EXISTS idx_blocks_blocker;
--rollback DROP TABLE IF EXISTS notification_settings;
--rollback ALTER TABLE privacy_settings DROP CONSTRAINT IF EXISTS chk_allow_mentions;
--rollback ALTER TABLE privacy_settings DROP CONSTRAINT IF EXISTS chk_post_visibility;
--rollback ALTER TABLE privacy_settings DROP CONSTRAINT IF EXISTS chk_profile_visibility;
--rollback ALTER TABLE friendships DROP CONSTRAINT IF EXISTS chk_friendships_status;
--rollback ALTER TABLE friendships DROP COLUMN IF EXISTS accepted_at;