CREATE DATABASE identity_db;
CREATE DATABASE user_db;
CREATE DATABASE notification_db;

\connect identity_db;

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

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

\connect user_db;

CREATE TABLE friend_requests (
    id UUID PRIMARY KEY,
    requester_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE,
    CHECK (requester_id <> receiver_id),
    CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED'))
);

CREATE TABLE friendships (
    id UUID PRIMARY KEY,
    user_id_1 UUID NOT NULL,
    user_id_2 UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CHECK (user_id_1 <> user_id_2),
    UNIQUE (user_id_1, user_id_2)
);

CREATE TABLE blocks (
    id UUID PRIMARY KEY,
    blocker_id UUID NOT NULL,
    blocked_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CHECK (blocker_id <> blocked_id),
    UNIQUE (blocker_id, blocked_id)
);

CREATE TABLE privacy_settings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    profile_visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    post_visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    allow_direct_messages BOOLEAN NOT NULL DEFAULT TRUE,
    show_online_status BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_friend_requests_receiver_status ON friend_requests(receiver_id, status);
CREATE INDEX idx_friend_requests_requester_status ON friend_requests(requester_id, status);
CREATE INDEX idx_friend_requests_pair_status ON friend_requests(requester_id, receiver_id, status);
CREATE INDEX idx_friendships_user1 ON friendships(user_id_1);
CREATE INDEX idx_friendships_user2 ON friendships(user_id_2);
CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);
CREATE INDEX idx_privacy_user_id ON privacy_settings(user_id);

\connect notification_db;

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    receiver_id UUID NOT NULL,
    actor_id UUID,
    actor_name VARCHAR(255),
    actor_avatar VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    target_id VARCHAR(255),
    message VARCHAR(1000) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_notifications_receiver ON notifications(receiver_id);
CREATE INDEX idx_notifications_receiver_unread ON notifications(receiver_id, is_read);
