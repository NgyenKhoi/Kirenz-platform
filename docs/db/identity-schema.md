# Identity Service - Database Schema

This document describes the current database ownership of Identity Service.

Identity Service owns authentication, authorization state, account status, email verification state, JWT issuing, and lightweight profile fields used by the web UI.

Friendship, blocking, privacy settings, and notification preferences are not Identity Service ownership. Those tables belong to User Service or Notification Service.

## Current Implementation

The current Identity Service implementation requires one PostgreSQL table:

* `users`

Refresh tokens are stateless JWTs. OTP values and OTP rate-limit keys are stored in Redis.

## `users`

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary key | System-wide user identifier |
| `email` | VARCHAR(255) | Unique, not null | Login email |
| `username` | VARCHAR(50) | Unique, not null | Public account handle |
| `password` | VARCHAR(255) | Not null | BCrypt password hash |
| `display_name` | VARCHAR(100) | Nullable | Lightweight display profile |
| `avatar_url` | TEXT | Nullable | Avatar URL |
| `bio` | VARCHAR(255) | Nullable | Short profile bio |
| `birth_date` | DATE | Nullable | Date of birth |
| `gender` | VARCHAR(20) | Nullable | Gender enum value |
| `location` | VARCHAR(100) | Nullable | User location |
| `website` | VARCHAR(255) | Nullable | User website |
| `role` | VARCHAR(20) | Not null, default `USER` | `USER`, `MODERATOR`, `ADMIN` |
| `status` | VARCHAR(20) | Not null, default `ACTIVE` | `ACTIVE`, `BANNED`, `DEACTIVATED` |
| `email_verified` | BOOLEAN | Not null, default `FALSE` | Email verification flag |
| `email_verified_at` | TIMESTAMP WITH TIME ZONE | Nullable | Email verification timestamp |
| `last_login_at` | TIMESTAMP WITH TIME ZONE | Nullable | Last successful login timestamp |
| `created_at` | TIMESTAMP WITH TIME ZONE | Default current timestamp | Account creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | Default current timestamp | Last update timestamp |

## SQL

```sql
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
```

## Migration To Dedicated Database

Use [identity-service/MIGRATION_IDENTITY_DB.md](../../identity-service/MIGRATION_IDENTITY_DB.md) to create `identity_db`, dump the current `users` table, restore it into the new database, and point Identity Service to the new connection string.
