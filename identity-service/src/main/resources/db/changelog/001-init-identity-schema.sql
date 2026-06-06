--liquibase formatted sql

--changeset identity-service:001-init-identity-schema
--comment: Initialize complete Identity Service schema with users, friendships, blocks, privacy_settings, user_sessions, and user_stats tables

-- 1. Unified Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio VARCHAR(255),
    birth_date DATE,
    gender VARCHAR(20),
    location VARCHAR(100),
    website VARCHAR(255),
    role VARCHAR(20) DEFAULT 'USER' NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (role IN ('USER', 'MODERATOR', 'ADMIN')),
    CHECK (status IN ('ACTIVE', 'BANNED', 'DEACTIVATED'))
);

-- 2. Friendships Table
CREATE TABLE friendships (
    id UUID PRIMARY KEY,
    user_id_1 UUID NOT NULL REFERENCES users(id),
    user_id_2 UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL,
    requested_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (user_id_1 < user_id_2),
    CHECK (user_id_1 <> user_id_2),
    UNIQUE (user_id_1, user_id_2)
);

-- 3. Blocks Table
CREATE TABLE blocks (
    id UUID PRIMARY KEY,
    blocker_id UUID NOT NULL REFERENCES users(id),
    blocked_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (blocker_id <> blocked_id),
    UNIQUE (blocker_id, blocked_id)
);

-- 4. Privacy Settings Table
CREATE TABLE privacy_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    profile_visibility VARCHAR(20) DEFAULT 'PUBLIC' NOT NULL,
    post_visibility_default VARCHAR(20) DEFAULT 'PUBLIC' NOT NULL,
    allow_mentions VARCHAR(20) DEFAULT 'EVERYONE' NOT NULL,
    show_last_seen BOOLEAN DEFAULT TRUE NOT NULL
);

-- 5. User Sessions Table (Presence Tracking)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) UNIQUE NOT NULL,
    device_name VARCHAR(255),
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 6. User Stats Table (Cache Counters)
CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    friends_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_friendships_user1 ON friendships(user_id_1);
CREATE INDEX idx_friendships_user2 ON friendships(user_id_2);
CREATE INDEX idx_friendships_status ON friendships(status);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);

--rollback DROP TABLE IF EXISTS user_stats CASCADE;
--rollback DROP TABLE IF EXISTS user_sessions CASCADE;
--rollback DROP TABLE IF EXISTS privacy_settings CASCADE;
--rollback DROP TABLE IF EXISTS blocks CASCADE;
--rollback DROP TABLE IF EXISTS friendships CASCADE;
--rollback DROP TABLE IF EXISTS users CASCADE;
