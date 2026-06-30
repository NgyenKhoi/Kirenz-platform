--liquibase formatted sql

--changeset notification-service:001-init-notifications-schema

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

--rollback DROP TABLE IF EXISTS notifications CASCADE;
