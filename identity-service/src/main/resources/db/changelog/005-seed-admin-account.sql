--liquibase formatted sql

--changeset identity-service:005-seed-admin-account
--comment: Seed the default administrator account for admin feature testing
INSERT INTO users (
    id,
    email,
    username,
    password,
    display_name,
    role,
    status,
    email_verified,
    email_verified_at,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@gmail.com',
    'admin',
    '$2a$12$9Pbyy7O9QAZMirj1psmQb.9HhtHJpXDNYiSzUUJgbHJVTH5hlqPMO',
    'Administrator',
    'ADMIN',
    'ACTIVE',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO UPDATE SET
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    email_verified = EXCLUDED.email_verified,
    email_verified_at = COALESCE(users.email_verified_at, CURRENT_TIMESTAMP),
    updated_at = CURRENT_TIMESTAMP;

--rollback DELETE FROM users WHERE id = '00000000-0000-0000-0000-000000000001' AND username = 'admin';
