# Database Schema - Kirenz Social Media Platform

## Overview
Project sử dụng **Hybrid Database Architecture**:
- **PostgreSQL**: User authentication, profiles (relational data)
- **MongoDB**: Posts, comments, messages, conversations (document-based, high-volume data)

---

## 📊 PostgreSQL Tables (Relational Data)

### 1. **users** (Authentication & Core User Data)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | User ID |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email đăng nhập |
| `password_hash` | VARCHAR(255) | NOT NULL | Mật khẩu đã hash |
| `is_premium` | BOOLEAN | DEFAULT false | Trạng thái premium |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Ngày tạo tài khoản |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Ngày cập nhật |
| `status` | VARCHAR(20) | DEFAULT 'ACTIVE' | ACTIVE/INACTIVE/DELETED |
| `deleted_at` | TIMESTAMP | NULL | Soft delete timestamp |
| `last_seen` | TIMESTAMP | NULL | Lần cuối online |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE on `email`

---

### 2. **profiles** (User Profile Information)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Profile ID |
| `user_id` | BIGINT | FOREIGN KEY → users(id), UNIQUE | Reference to user |
| `full_name` | VARCHAR(255) | NULL | Tên đầy đủ |
| `avatar_url` | TEXT | NULL | URL avatar (Cloudinary) |
| `bio` | TEXT | NULL | Tiểu sử |
| `location` | VARCHAR(255) | NULL | Địa điểm |
| `website` | VARCHAR(255) | NULL | Website cá nhân |
| `date_of_birth` | DATE | NULL | Ngày sinh |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Ngày tạo profile |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Ngày cập nhật |
| `status` | VARCHAR(20) | DEFAULT 'ACTIVE' | ACTIVE/INACTIVE/DELETED |
| `deleted_at` | TIMESTAMP | NULL | Soft delete timestamp |

**Relationships:**
- ONE-TO-ONE with `users` table

---

## 🍃 MongoDB Collections (Document Data)

### 3. **posts** (User Posts/Content)
```javascript
{
  _id: ObjectId,
  slug: String,                    // URL-friendly identifier
  userId: Integer,                 // Reference to PostgreSQL users.id
  content: String,                 // Post text content
  media: [                         // Media attachments
    {
      type: String,                // "IMAGE" | "VIDEO"
      url: String                  // Cloudinary URL
    }
  ],
  createdAt: ISODate,
  updatedAt: ISODate,
  likes: Integer,                  // Like count
  commentsCount: Integer,          // Comment count
  status: String,                  // "ACTIVE" | "INACTIVE" | "DELETED"
  deletedAt: ISODate               // Soft delete
}
```

**Indexes:**
- `userId` (for user's posts)
- `slug` (unique, for URL routing)
- `status` + `createdAt` (for feed queries)

---

### 4. **comments** (Post Comments)
```javascript
{
  _id: ObjectId,
  postId: String,                  // Reference to posts._id
  userId: Integer,                 // Reference to PostgreSQL users.id
  content: String,                 // Comment text
  createdAt: ISODate,
  status: String,                  // "ACTIVE" | "INACTIVE" | "DELETED"
  deletedAt: ISODate               // Soft delete
}
```

**Indexes:**
- `postId` + `createdAt` (for post comments)
- `userId` (for user's comments)

---

### 5. **conversations** (Chat Conversations)
```javascript
{
  _id: ObjectId,
  type: String,                    // "DIRECT" | "GROUP"
  name: String,                    // Conversation name (for groups)
  participantIds: [Integer],       // Array of user IDs (PostgreSQL users.id)
  createdBy: Integer,              // Creator user ID
  createdAt: ISODate,
  updatedAt: ISODate,
  lastMessage: {                   // Denormalized last message
    messageId: String,
    content: String,
    senderId: Integer,
    sentAt: ISODate
  },
  status: String,                  // "ACTIVE" | "INACTIVE" | "DELETED"
  deletedAt: ISODate
}
```

**Indexes:**
- Compound: `status` + `updatedAt` (for conversation list)
- Compound: `type` + `participantIds` (for finding conversations)
- `participantIds` (for user's conversations)

---

### 6. **messages** (Chat Messages)
```javascript
{
  _id: ObjectId,
  conversationId: String,          // Reference to conversations._id
  senderId: Integer,               // Reference to PostgreSQL users.id
  content: String,                 // Message text
  attachments: [                   // Media attachments
    {
      type: String,                // "IMAGE" | "VIDEO"
      cloudinaryPublicId: String,  // Cloudinary ID for management
      url: String,                 // Cloudinary URL
      metadata: {                  // Additional metadata
        width: Integer,
        height: Integer,
        duration: Integer,         // For videos
        size: Integer
      }
    }
  ],
  type: String,                    // "TEXT" | "IMAGE" | "VIDEO"
  sentAt: ISODate,
  statusList: [                    // Delivery status per recipient
    {
      userId: Integer,
      status: String,              // "SENT" | "DELIVERED" | "READ"
      timestamp: ISODate
    }
  ],
  status: String,                  // "ACTIVE" | "DELETED"
  deletedAt: ISODate
}
```

**Indexes:**
- Compound: `conversationId` + `sentAt` (for message history)
- Compound: `senderId` + `sentAt` (for user's messages)
- `status` (for active messages)

---

## 🔗 Relationships & Data Flow

### Cross-Database References
```
PostgreSQL (users.id) ←→ MongoDB (userId field)
```

**Example:**
- User creates post: `users.id` → `posts.userId`
- User sends message: `users.id` → `messages.senderId`
- User joins conversation: `users.id` → `conversations.participantIds[]`

---

## 📈 Current Features Implemented

### ✅ Authentication & User Management
- User registration/login (JWT-based)
- Profile management (CRUD)
- Premium user status
- User presence tracking (last_seen)

### ✅ Social Media Features
- Create/read/update/delete posts
- Post media attachments (images/videos via Cloudinary)
- Comments on posts
- Like system (counter only, no like details yet)

### ✅ Real-time Chat
- Direct messaging (1-on-1)
- Group conversations
- Message delivery status tracking
- Media attachments in messages
- WebSocket (STOMP) for real-time updates
- User presence (online/offline)

---

## 🚀 Suggested Features to Build Next

### 1. **Social Interactions** (High Priority)
**Missing Tables/Collections:**

#### `likes` (MongoDB)
```javascript
{
  _id: ObjectId,
  userId: Integer,           // Who liked
  targetType: String,        // "POST" | "COMMENT"
  targetId: String,          // Post/Comment ID
  createdAt: ISODate
}
```
**Why:** Currently only tracking like count, not who liked what

#### `follows` (PostgreSQL)
```sql
CREATE TABLE follows (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  follower_id BIGINT NOT NULL,      -- Who follows
  following_id BIGINT NOT NULL,     -- Who is followed
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (follower_id) REFERENCES users(id),
  FOREIGN KEY (following_id) REFERENCES users(id),
  UNIQUE(follower_id, following_id)
);
```
**Why:** Essential for social network (follow/unfollow users)

---

### 2. **Notifications System** (High Priority)
#### `notifications` (MongoDB)
```javascript
{
  _id: ObjectId,
  userId: Integer,           // Recipient
  type: String,              // "LIKE" | "COMMENT" | "FOLLOW" | "MESSAGE"
  actorId: Integer,          // Who triggered notification
  targetType: String,        // "POST" | "COMMENT" | "USER"
  targetId: String,          // Reference to target
  content: String,           // Notification text
  isRead: Boolean,
  createdAt: ISODate
}
```
**Why:** Users need to know about interactions

---

### 3. **Content Discovery** (Medium Priority)
#### `hashtags` (MongoDB)
```javascript
{
  _id: ObjectId,
  tag: String,               // Hashtag text (without #)
  postCount: Integer,        // Number of posts using this tag
  trendingScore: Float,      // For trending calculation
  lastUsed: ISODate
}
```

#### `post_hashtags` (MongoDB)
```javascript
{
  _id: ObjectId,
  postId: String,
  hashtagId: String,
  createdAt: ISODate
}
```
**Why:** Content discovery, trending topics

---

### 4. **User Activity & Analytics** (Medium Priority)
#### `user_stats` (PostgreSQL)
```sql
CREATE TABLE user_stats (
  user_id BIGINT PRIMARY KEY,
  posts_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```
**Why:** Performance optimization for profile pages

---
### 5. **Content Moderation** (Low Priority)
#### `reports` (MongoDB)
```javascript
{
  _id: ObjectId,
  reporterId: Integer,       // Who reported
  targetType: String,        // "POST" | "COMMENT" | "USER"
  targetId: String,
  reason: String,
  description: String,
  status: String,            // "PENDING" | "REVIEWED" | "RESOLVED"
  createdAt: ISODate,
  reviewedAt: ISODate,
  reviewedBy: Integer
}
```
**Why:** Community safety

---

### 6. **Stories/Temporary Content** (Low Priority)
#### `stories` (MongoDB)
```javascript
{
  _id: ObjectId,
  userId: Integer,
  mediaUrl: String,
  mediaType: String,         // "IMAGE" | "VIDEO"
  expiresAt: ISODate,        // Auto-delete after 24h
  viewCount: Integer,
  viewers: [Integer],        // Who viewed
  createdAt: ISODate
}
```
**Why:** Popular social media feature

---

### 7. **Bookmarks/Saved Posts** (Low Priority)
#### `bookmarks` (MongoDB)
```javascript
{
  _id: ObjectId,
  userId: Integer,
  postId: String,
  createdAt: ISODate
}
```
**Why:** User convenience

---

## 🎯 Recommended Development Roadmap

### Phase 1: Core Social Features (2-3 weeks)
1. ✅ **Follows System** - Enable user connections
2. ✅ **Likes Detail** - Track who liked what
3. ✅ **Notifications** - Real-time user engagement alerts

### Phase 2: Content Discovery (2 weeks)
4. ✅ **Hashtags** - Content categorization
5. ✅ **Search** - Find users, posts, hashtags
6. ✅ **Feed Algorithm** - Personalized content feed

### Phase 3: Engagement Features (1-2 weeks)
7. ✅ **Bookmarks** - Save posts for later
8. ✅ **User Stats** - Profile analytics
9. ✅ **Mentions** - Tag users in posts

### Phase 4: Advanced Features (2-3 weeks)
10. ✅ **Stories** - Temporary content
11. ✅ **Content Moderation** - Reports system
12. ✅ **Media Processing** - Image filters, video thumbnails

---

## 📝 Notes

### Current Architecture Strengths:
- ✅ Hybrid database approach (PostgreSQL + MongoDB)
- ✅ Soft delete pattern implemented
- ✅ Real-time chat with WebSocket
- ✅ Media handling with Cloudinary
- ✅ JWT authentication
- ✅ Status tracking (ACTIVE/INACTIVE/DELETED)

### Areas for Improvement:
- ⚠️ No like details (only counter)
- ⚠️ No follow/follower system
- ⚠️ No notification system
- ⚠️ No content discovery (hashtags, search)
- ⚠️ No user activity analytics
- ⚠️ No content moderation tools

---

**Generated:** 2025-12-26  
**Project:** Kirenz Social Media Platform  
**Tech Stack:** Spring Boot + React + PostgreSQL + MongoDB + RabbitMQ
