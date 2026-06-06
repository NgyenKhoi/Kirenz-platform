# 🗄️ Identity Service - Database Schema Design (Deeply Refined)

This document defines the PostgreSQL schema for the **Identity Service**, responsible for user authentication, unified profile management, social connections, and session security.

---

## 🏗️ 1. Unified User Identity
Consolidates authentication and profile data into a single table for performance and simplicity. Use cases: **UC-ID-01** (Onboarding), **UC-ID-02** (Access), **UC-ID-03** (Profile).

### `users` Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier (System-wide) |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Primary login identifier |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | User's handle |
| `password` | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| `display_name` | VARCHAR(100) | NULL | User's display name |
| `avatar_url` | TEXT | NULL | Cloudinary asset URL |
| `bio` | VARCHAR(255) | NULL | Personal introduction |
| `birth_date` | DATE | NULL | Date of birth |
| `gender` | VARCHAR(20) | NULL | MALE, FEMALE, OTHER |
| `location` | VARCHAR(100) | NULL | City/Country |
| `website` | VARCHAR(255) | NULL | Personal link |
| `role` | VARCHAR(20) | DEFAULT 'USER' | USER, MODERATOR, ADMIN |
| `status` | VARCHAR(20) | DEFAULT 'ACTIVE' | ACTIVE, BANNED, DEACTIVATED |
| `email_verified` | BOOLEAN | DEFAULT FALSE | Whether email is verified |
| `email_verified_at`| TIMESTAMP | NULL | Time of verification |
| `last_login_at` | TIMESTAMP | NULL | Last successful authentication |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

---

## 🤝 2. Bi-directional Social Graph
Manages friendship states. User relationships are unique pairs. Use cases: **UC-ID-05** (Friendship Lifecycle).

### `friendships` Table
*Constraint: `user_id_1 < user_id_2` alphabetically to ensure a single row per pair. Also `user_id_1 <> user_id_2` to prevent self-friendship.*

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Relationship record ID |
| `user_id_1` | UUID | FK -> users(id) | The first user in the pair |
| `user_id_2` | UUID | FK -> users(id) | The second user in the pair |
| `status` | VARCHAR(20) | NOT NULL | PENDING, ACCEPTED, DECLINED, CANCELLED |
| `requested_by` | UUID | FK -> users(id) | User who initiated the request |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Relationship started |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Status last updated |

---

## 🚫 3. Defensive & Privacy Controls
Handles blocking and visibility. Use cases: **UC-ID-08** (Privacy), **UC-ID-09** (Blocking).

### `blocks` Table
*Constraint: `blocker_id <> blocked_id` to prevent self-blocking.*

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Block record ID |
| `blocker_id` | UUID | FK -> users(id) | User initiating the block |
| `blocked_id` | UUID | FK -> users(id) | User being blocked |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Time of action |

### `privacy_settings` Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | UUID | PRIMARY KEY, FK -> users(id) | Reference to User |
| `profile_visibility`| VARCHAR(20) | DEFAULT 'PUBLIC' | PUBLIC, FRIENDS_ONLY, PRIVATE |
| `post_visibility_default` | VARCHAR(20) | DEFAULT 'PUBLIC' | Default for Social Service |
| `allow_mentions` | VARCHAR(20) | DEFAULT 'EVERYONE'| EVERYONE, FRIENDS, NO_ONE |
| `show_last_seen` | BOOLEAN | DEFAULT true | Online status toggle |

---

## 🔑 4. Session Management (Presence Tracking)
Enables tracking of active users and their last known metadata. Use case: **UC-ID-04** (Presence).

### `user_sessions` Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Session unique identifier |
| `user_id` | UUID | FK -> users(id) | Reference to owner |
| `refresh_token` | VARCHAR(500) | UNIQUE, NOT NULL | Active refresh token |
| `device_name` | VARCHAR(255) | NULL | e.g., "Chrome on MacOS" |
| `ip_address` | VARCHAR(100) | NULL | Last known IP |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Session start |
| `expires_at` | TIMESTAMP | NOT NULL | Token expiration time |

---

## 📈 5. User Stats (Counter Caching)
Optimized counters for friendship metrics to avoid expensive `COUNT` queries on the profile page.

### `user_stats` Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | UUID | PRIMARY KEY, FK -> users(id) | Reference to User |
| `friends_count` | INTEGER | DEFAULT 0 | Cached count of `ACCEPTED` friends |

---

## 📜 SQL Implementation Script (PostgreSQL)

```sql
-- Identity Service Schema Initial Script (UUID-based with Constraints)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Unified Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- BCrypt hashed
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Friendships Table
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id_1 UUID NOT NULL REFERENCES users(id),
    user_id_2 UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL, -- PENDING, ACCEPTED, DECLINED, CANCELLED
    requested_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (user_id_1 < user_id_2),
    CHECK (user_id_1 <> user_id_2),
    UNIQUE (user_id_1, user_id_2)
);

-- 3. Blocks Table
CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
```
