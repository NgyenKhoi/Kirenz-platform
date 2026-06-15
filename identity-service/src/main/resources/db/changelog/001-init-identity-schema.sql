--liquibase formatted sql

--changeset identity-service:001-init-identity-schema
--comment: Initialize Identity Service auth schema with users table only

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

--rollback DROP TABLE IF EXISTS users CASCADE;
