--liquibase formatted sql

--changeset user-service:001-init-user-friends-schema

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

CREATE INDEX idx_friend_requests_receiver_status
ON friend_requests(receiver_id, status);

CREATE INDEX idx_friend_requests_requester_status
ON friend_requests(requester_id, status);

CREATE INDEX idx_friend_requests_pair_status
ON friend_requests(requester_id, receiver_id, status);

CREATE INDEX idx_friendships_user1
ON friendships(user_id_1);

CREATE INDEX idx_friendships_user2
ON friendships(user_id_2);

--rollback DROP TABLE IF EXISTS friendships CASCADE;
--rollback DROP TABLE IF EXISTS friend_requests CASCADE;
