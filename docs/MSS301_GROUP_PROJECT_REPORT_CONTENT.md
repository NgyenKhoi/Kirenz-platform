# GROUP PROJECT DOCUMENTATION

# MICROSERVICES WITH SPRING BOOT

# KIRENZ PLATFORM – MOMENTS SOCIAL NETWORK

Prepared by **[GROUP NAME]**

- **[MEMBER 1 NAME – STUDENT ID]**
- **[MEMBER 2 NAME – STUDENT ID]**
- **[MEMBER 3 NAME – STUDENT ID]**

FPT University, Da Nang Campus, 2026

> Copying note: Replace only the information inside square brackets, insert the suggested figures, and use Microsoft Word's automatic Table of Contents feature after applying Heading 1 and Heading 2 styles. “Kirenz Platform” is the repository/system name; “Moments” is the product name displayed in the web user interface.

---

# Table of Contents

1. Revision History  
2. Project Introduction  
   2.1. Product Perspective  
   2.2. Project Objectives and Scope  
   2.3. User Classes and Characteristics  
   2.4. Business Rules  
3. Database Design  
   3.1. Database Strategy  
   3.2. Logical Data Model  
   3.3. PostgreSQL Data Dictionary  
   3.4. MongoDB Data Dictionary  
   3.5. Redis Data  
   3.6. Data Ownership and Consistency  
4. System Architecture (Microservices Architecture)  
   4.1. Operating Environment  
   4.2. High-Level Architecture  
   4.3. Service Responsibilities  
   4.4. Communication Design  
   4.5. Security Architecture  
   4.6. Reliability and Scalability  
   4.7. Technologies Learned and Applied  
5. Implementation  
   5.1. Implementation Approach  
   5.2. Deployment Considerations  
   5.3. Installation and Start-up Procedure  
   5.4. Testing and Quality Assurance  
   5.5. Screenshots and Explanations  
6. Conclusion  
7. References  
Appendix A. Ten-Week Project Timeline  
Appendix B. Requirement-to-Service Traceability

---

# Revision History

| Name | Date | Reason for Changes | Version |
|---|---|---|---|
| [MEMBER NAME] | [DD Month 2026] | Created the initial project proposal, scope, and microservice boundaries | 0.1 Draft |
| [MEMBER NAME] | [DD Month 2026] | Added database design and system architecture | 0.2 Draft |
| [MEMBER NAME] | [DD Month 2026] | Added implementation, deployment, and test information | 0.9 Review |
| [GROUP LEADER NAME] | 18 July 2026 | Reviewed and prepared the final submission | 1.0 Final |

---

# Project Introduction

## Product Perspective

Kirenz Platform – Moments Social Network is a full-stack social networking system that enables people to create an account, build a personal profile, connect with friends, publish and discover multimedia content, communicate in real time, and receive notifications about relevant activities. The project corresponds to the “Social Media Blog Platform” topic in the MSS301 group-project list, but extends the original blog idea with a friend graph, privacy controls, blocking, real-time direct and group messaging, and event-driven notifications.

The system is implemented as a single-page web application backed by independently deployable Spring Boot microservices. Instead of placing all business functions and data in one application, Kirenz separates authentication, user relationships, social content, chat, and notifications into bounded services. An API Gateway provides one public entry point, Eureka supplies service discovery, OpenFeign supports synchronous service-to-service queries, and Apache Kafka distributes asynchronous domain events. PostgreSQL stores relational and transactional data, MongoDB stores high-volume social and chat documents, and Redis stores short-lived authentication and presence information. This architecture demonstrates the principal learning outcomes of the Microservices with Spring Boot course.

## Project Objectives and Scope

The objectives of Kirenz are to:

1. Provide secure account registration, email verification, password login, Google login, access-token renewal, and protected API access.
2. Allow users to maintain a recognizable profile containing a display name, avatar, cover photo, biography, birth date, gender, location, and website.
3. Support a social graph through friend requests, friend lists, mutual friends, suggestions, unfriending, user blocking, and privacy preferences.
4. Support multimedia posts with configurable visibility, user tagging, sharing, comments, replies, and emoji reactions.
5. Help users discover people, post text, and hashtags through the Explore interface.
6. Provide direct and group chat with WebSocket delivery, attachments, typing indicators, online presence, nicknames, group administration, and read status.
7. Deliver in-app notifications for friend and social events while maintaining read/unread state.
8. Demonstrate service isolation, database-per-service ownership, event-driven integration, fault tolerance, containerization, and a responsive React interface.

The current submission focuses on the responsive web application and its supporting backend. Native mobile clients, public cloud production deployment, advanced content moderation, recommendation algorithms, persisted notification-channel preferences, and a complete administrator dashboard are outside the current user-facing scope. The data model contains roles and extension points that allow these capabilities to be added later.

## User Classes and Characteristics

### Visitor (Unauthenticated User)

A visitor is a person who has not signed in. The visitor may browse the public feed, open a public post permalink shared by another person, create an account, verify an email address, sign in with an email/password pair, or use Google authentication. Only posts whose visibility is `PUBLIC` are returned by the anonymous API. Reactions, comments, discussion dialogs, profile access, reposting, and all private account functions require a valid JWT access token.

| No. | Function Name | Function Description |
|---:|---|---|
| 1 | Register an account | Create an account using display name, username, email, and password. The server validates uniqueness and request data. |
| 2 | Verify email by OTP | Request and submit a one-time password delivered through email to prove ownership of the registered address. |
| 3 | Login with email and password | Authenticate with credentials and receive access and refresh tokens. |
| 4 | Login with Google | Submit a Google identity token; the Identity Service verifies it and signs in or provisions the corresponding account. |
| 5 | Browse public posts | Open the public feed at `/` or a shared permalink at `/posts/{postId}`. The server returns only active `PUBLIC` posts. Restricted posts appear unavailable. |
| 6 | Continue to an authenticated action | Clicking Like, Comment, Repost, View discussion, or an author profile redirects the visitor to `/login` with a safe `returnTo` value so the original page can be restored after login. |

### Registered User

A registered user is the primary actor. The user is expected to access the platform from a modern desktop or mobile browser, may connect from any location or time zone, and may produce both private profile data and public or restricted social content.

| No. | Function Name | Function Description |
|---:|---|---|
| 1 | Manage profile | View and update display name, avatar, cover photo, biography, birth date, gender, location, and website. |
| 2 | Manage session | Use a JWT-protected session, automatically renew an expired access token with a refresh token, and sign out from the web client. |
| 3 | Search and explore | Search users by identity fields, search visible post content/hashtags, view trending hashtags computed from the loaded feed, and open another user's profile. |
| 4 | Manage friend requests | Send, receive, accept, decline, or cancel requests; view incoming/outgoing requests and the friend list. |
| 5 | View mutual friends and suggestions | Inspect mutual connections and receive “People You May Know” suggestions. |
| 6 | Unfriend or block a user | Remove a friendship, block an account, view the blocked-user list, or unblock an account. Blocking prevents inappropriate visibility and interaction. |
| 7 | Configure privacy | Select profile and post visibility and control whether direct messages and online status are permitted. |
| 8 | Create a post | Publish text with uploaded image/video media, tagged users, and a visibility value. |
| 9 | Manage own posts | View, edit, soft-delete, and share posts while ownership checks protect another user's content. |
| 10 | Interact with posts | View the feed, open post details, add/edit/delete comments, reply in a thread, tag users, and add/change/remove emoji reactions. |
| 11 | Use direct chat | Start or reopen a one-to-one conversation with an allowed user and exchange real-time text or media messages. |
| 12 | Use group chat | Create a group, add/remove participants, promote an administrator, assign nicknames, rename the group, leave it, or delete it when authorized. |
| 13 | View real-time state | See new messages, typing activity, online/offline presence, and delivery/read information without refreshing the page. |
| 14 | Manage notifications | Receive real-time activity notifications, view history and unread count, mark one notification as read, or mark all as read. |
| 15 | Use responsive interface | Access the main features from desktop or mobile layouts, with protected routing and consistent navigation. |

### System Administrator / Operator

The system now includes an Admin Service to support moderation, governance, and operational monitoring. Administrators are authorized users who can review analytics, manage user accounts, process reports of inappropriate content or behavior, moderate posts and comments, and monitor the health of the microservices and infrastructure. The administration functions are protected by the `ADMIN` role and are routed through the Admin Service as the single entry point for administrative operations.

| No. | Function Name | Function Description |
|---:|---|---|
| 1 | View admin dashboard | Review summary metrics for total registered users, user growth trends, pending reports, and current activity counts for posts, comments, and reactions. |
| 2 | Search and filter users | Search for users by keyword and filter by role, account status, email verification status, and account activity. |
| 3 | Manage account status | Ban, unban, suspend, or warn users and attach a structured moderation reason and optional note. |
| 4 | Review admin action history | Inspect immutable audit records of moderation actions to verify who performed each operation and why. |
| 5 | Manage reports | Review user-submitted reports for posts, comments, or accounts, update the report status, and resolve them with an approved moderation decision. |
| 6 | Moderate content | Hide or remove inappropriate posts or comments, maintain a moderation trail, and preserve the integrity of the social platform. |
| 7 | Monitor service registration | Use Eureka and service health endpoints to confirm that the Gateway and business services are running correctly. |
| 8 | Inspect logs and infrastructure health | Review service logs, Spring Actuator health information, and overall Kafka, Redis, PostgreSQL, and MongoDB status. |
| 9 | Manage deployment configuration | Supply environment variables for databases, JWT, Redis, Kafka, email, Google, and Cloudinary without exposing secrets. |
| 10 | Back up and maintain service data | Coordinate backup and recovery procedures for service-owned databases according to the microservice boundary. |

## Business Rules

1. An email address and username must be unique. A Google identity may be linked to at most one user.
2. A protected request must contain a valid JWT. The access token is short-lived; the refresh token is used only to request a new authenticated token pair.
3. A user cannot send a friend request to himself or herself. A request follows the states `PENDING`, `ACCEPTED`, `DECLINED`, or `CANCELLED`.
4. A friendship is stored once as a canonical pair and may not contain the same user on both sides.
5. A user cannot block himself or herself. The pair `(blocker_id, blocked_id)` is unique.
6. Blocking and privacy rules take precedence over ordinary friend or chat operations.
7. Profile/post visibility values are `PUBLIC`, `FRIENDS`, or `PRIVATE`. Direct messaging and online-status display can be independently enabled or disabled.
8. Anonymous endpoints may return only active posts with `PUBLIC` visibility. They do not return comments, reaction-user lists, friend-only posts, or private posts. Public links are stable at `/posts/{postId}`.
9. Only the content owner may update or delete his or her post/comment. Deleted social content is marked with status/timestamps so it can be excluded from normal queries.
10. A user can have at most one reaction for a particular target; the reaction type may be changed or removed.
11. A direct conversation contains the intended participants and is reused instead of creating unnecessary duplicates. Group-management operations require membership or administrator permission as appropriate.
12. Every service owns its data. A service must never directly read or modify another service's database; it must use an API or a Kafka event.
13. Notification read state belongs only to the notification receiver.

---

# Database Design

## Database Strategy

Kirenz uses polyglot persistence and the database-per-service pattern. PostgreSQL is selected for identity, relationship, privacy, and notification records because these domains require constraints, unique keys, and transactional updates. MongoDB is selected for posts, comments, reactions, conversations, and messages because these are document-oriented, frequently read/written, and may evolve to include flexible media metadata. Redis is used for temporary OTP/authentication data and real-time presence state; it is not the permanent source of business truth.

The logical user identifier is a UUID created by the Identity Service. Other services store this UUID as a cross-service reference, but no physical foreign key crosses a service database boundary. Referential correctness is maintained through authenticated APIs, service-level validation, and domain events.

## Logical Data Model

**Figure 1 – Logical entity relationship diagram (convert the following model to a Draw.io ERD or paste it as a monospaced figure in Word):**

```text
IDENTITY DATABASE (PostgreSQL)
USERS (1)
  | logical UUID reference
  +----------------------+----------------------+----------------------+
                         |                      |                      |
USER DATABASE            | SOCIAL DATABASE      | CHAT DATABASE        | NOTIFICATION DATABASE
(PostgreSQL)             | (MongoDB)            | (MongoDB)            | (PostgreSQL)
                         |                      |                      |
USERS 1--* FRIEND_REQUESTS  USERS 1--* POSTS      USERS *--* CONVERSATIONS  USERS 1--* NOTIFICATIONS
USERS *--* FRIENDSHIPS      POSTS 1--* COMMENTS   CONVERSATIONS 1--* MESSAGES
USERS 1--* BLOCKS            POSTS/COMMENTS 1--* REACTIONS
USERS 1--1 PRIVACY_SETTINGS  USERS *--* POSTS (BOOKMARKS, extension model)
                            HASHTAGS summarize tags extracted from POSTS
```

### Relationship Explanation

- `users.id` is the global identity reference used as `userId`, `requesterId`, `receiverId`, `senderId`, `actorId`, or `receiverId` in other services.
- A friend request connects one requester to one receiver. When accepted, the application creates one friendship record.
- A block connects a blocker to a blocked user. Each user has at most one privacy-setting record.
- A post belongs to one user and may contain many media objects and tagged-user UUIDs. A shared post points to `originalPostId`.
- A comment belongs to one post and one user. `parentCommentId` supports replies.
- A reaction belongs to one user and one target, where the target is either a post or comment.
- A conversation contains a list of participants and may contain many messages. Each message belongs to one conversation and sender.
- A notification belongs to one receiver and optionally refers to an actor and a target object.

## PostgreSQL Data Dictionary

### Identity Service – `users`

| Field | Type | Key/Constraint | Purpose |
|---|---|---|---|
| id | UUID | Primary key | Global user identity |
| email | VARCHAR(255) | Unique, not null | Login and verification address |
| google_id | VARCHAR(255) | Unique, nullable | Linked Google identity |
| username | VARCHAR(50) | Unique, not null | Public account handle |
| password | VARCHAR(255) | Not null | Securely encoded password |
| display_name | VARCHAR(100) | Nullable | Name displayed in the UI |
| avatar_url, cover_photo_url | TEXT | Nullable | Cloudinary-hosted profile media |
| bio | VARCHAR(255) | Nullable | Short profile introduction |
| birth_date, gender | DATE, VARCHAR(20) | Nullable | Personal profile information |
| location, website | VARCHAR | Nullable | Optional profile information |
| role | VARCHAR(20) | USER/MODERATOR/ADMIN | Authorization role |
| status | VARCHAR(20) | ACTIVE/BANNED/DEACTIVATED | Account lifecycle status |
| email_verified, email_verified_at | BOOLEAN, TIMESTAMP | Verification state | Email ownership state |
| last_login_at | TIMESTAMP | Nullable | Most recent successful login |
| created_at, updated_at | TIMESTAMP | Audit fields | Record creation/update time |

### User Service – relationship and privacy tables

| Table | Important Fields | Constraints and Purpose |
|---|---|---|
| friend_requests | id, requester_id, receiver_id, status, created_at, updated_at, responded_at | Prevents self-request; tracks the complete request lifecycle and supports indexed incoming/outgoing queries. |
| friendships | id, user_id_1, user_id_2, created_at | Unique user pair; stores the accepted undirected relationship. |
| blocks | id, blocker_id, blocked_id, created_at | Unique directed pair; prevents self-blocking. |
| privacy_settings | id, user_id, profile_visibility, post_visibility, allow_direct_messages, show_online_status, updated_at | One record per user; central policy source for profile, post, direct-message, and presence visibility. |

### Notification Service – `notifications`

| Field | Type | Purpose |
|---|---|---|
| id | UUID | Notification primary key |
| receiver_id | UUID | User who owns and receives the notification |
| actor_id | UUID, nullable | User who caused the event |
| actor_name, actor_avatar | VARCHAR | Snapshot used for efficient display |
| type | VARCHAR(50) | FRIEND_REQUEST, FRIEND_ACCEPT, POST_COMMENT, POST_LIKE, COMMENT_REPLY, POST_MENTION, COMMENT_MENTION, BIRTHDAY, WELCOME, or MESSAGE |
| target_id | VARCHAR(255) | Optional post, comment, request, profile, or message reference |
| message | VARCHAR(1000) | Human-readable notification text |
| is_read | BOOLEAN | Read/unread state |
| created_at | TIMESTAMP | Notification creation time |

## MongoDB Data Dictionary

### Social Service collections

| Collection | Main Fields | Design Notes |
|---|---|---|
| posts | id, slug, userId, content, privacy, originalPostId, media[], taggedUserIds[], reactionsCount, commentsCount, status, createdAt, updatedAt, deletedAt | Unique slug; indexed author; supports media, tagging, sharing, counters, privacy, and soft deletion. |
| comments | id, postId, userId, parentCommentId, content, taggedUserIds[], reactionsCount, status, createdAt, updatedAt, deletedAt | Compound index on post and creation time; `parentCommentId` provides threaded replies. |
| reactions | id, userId, targetType, targetId, type, createdAt, updatedAt | Unique compound index on user/target prevents duplicate reactions. |
| hashtags | id, tag, postCount, trendingScore, lastUsedAt, createdAt, updatedAt | Unique normalized tag and aggregate fields for future server-side trending queries. |
| bookmarks | id, userId, postId, createdAt | Unique user/post pair. The model is present as an extension point; the current web flow does not expose a complete bookmark feature. |

The embedded post-media object stores media URLs and relevant metadata. Keeping media metadata inside a post avoids a separate database join, while the binary image/video itself is stored and delivered by Cloudinary.

### Chat Service collections

| Collection | Main Fields | Design Notes |
|---|---|---|
| conversations | id, type, name, participantIds[], adminIds[], participantNicknames{}, createdBy, createdAt, updatedAt, lastMessage, status | Supports direct/group conversations, authorization, participant-specific nicknames, and a denormalized last-message preview. |
| messages | id, conversationId, senderId, content, type, sentAt, attachments[], statusList[], status | Indexed by conversation, sender, and send time; embedded attachments and per-recipient delivery/read state support the real-time UI. |

## Redis Data

Redis holds short-lived values that require very fast access:

- OTP codes and expiry metadata used during email verification.
- Online/offline presence for Chat Service WebSocket sessions.
- Typing indicators and other transient chat state.
- Short-lived authentication/session control data where configured.

All Redis records are disposable or reproducible; permanent profiles, relationships, posts, messages, and notifications remain in PostgreSQL or MongoDB.

## Data Ownership and Consistency

Each business service has exclusive write ownership of its database. Synchronous validation uses OpenFeign when a response cannot be completed without current information; for example, Chat Service asks User Service whether direct messaging is allowed, and Social Service asks for relationship information needed by a visibility rule. Kafka events are used for side effects that should not delay the originating request, such as producing a notification after a friend or social action. Denormalized actor names, avatars, counters, and last-message previews improve read performance. Their eventual consistency is an intentional microservice trade-off, while unique constraints and service-level transactions protect critical invariants inside one service boundary.

---

# System Architecture (Microservices Architecture)

## Operating Environment

Kirenz is designed for users distributed across different geographical locations and time zones. A user needs only an internet connection and a current browser; all public HTTP and WebSocket traffic enters through the API Gateway. In development, the complete system can run on one workstation. In production, the frontend, Gateway, services, and data infrastructure should run on controlled container hosts in the same cloud region, while Cloudinary and the transactional email provider are accessed as managed external services.

### Recommended Development Environment

| Component | Minimum/Recommended Requirement |
|---|---|
| Developer workstation | 64-bit Windows, Linux, or macOS; 4 CPU cores; 8 GB RAM minimum, 16 GB recommended; at least 10 GB free storage |
| Backend runtime | Java Development Kit 21 and Maven Wrapper |
| Frontend runtime | Node.js 18 or later and npm |
| Containers | Docker Engine/Docker Desktop with Docker Compose |
| Databases | PostgreSQL for Identity, User, and Notification services; MongoDB for Social and Chat services |
| Messaging/cache | Apache Kafka and Redis |
| Browser | Current Chrome, Edge, Firefox, or Safari with JavaScript and WebSocket enabled |
| Network | Ports 3000, 8080–8085, 8761, 5432, 27017, 6379, and 9092 as required by the selected local topology |

In production, Linux-based container hosts, TLS termination, managed secrets, database backups, centralized logs, and restricted network access are recommended. Only the frontend and API Gateway should be public. Databases, Kafka, Redis, Eureka, and direct service ports should remain private. Services should be deployed near their databases to reduce latency. Time values are stored as instants and converted by the client for different user time zones.

## High-Level Architecture

**Figure 2 – Kirenz microservices deployment diagram:**

```text
                         HTTPS / WebSocket
+-------------------+            |
| React 19 + Vite   |            v
| Web SPA :3000     |-----> API Gateway :8080
+-------------------+       JWT validation and routing
                                  |
                 +----------------+----------------+
                 |                                 |
                 v                                 v
        Discovery Service :8761          Business services registered in Eureka
        (Eureka registry)                 |
                 +------------------------+-------------------------------+
                 |              |             |             |            |
                 v              v             v             v            v
          Identity :8081   User :8082    Social :8083   Chat :8084   Notification :8085
          PostgreSQL       PostgreSQL    MongoDB        MongoDB       PostgreSQL
          Redis/Email      Kafka/Feign   Cloudinary     Redis/WS      Kafka/WebSocket
                 |              |             |             |            |
                 +--------------+-------------+-------------+------------+
                                       Apache Kafka
```

The React single-page application calls one base URL at the API Gateway. The Gateway routes authentication, verification, and profile paths to Identity Service; friend, block, privacy, and user-search paths to User Service; post, comment, reaction, and media paths to Social Service; conversation, message, presence, and chat WebSocket paths to Chat Service; and notification HTTP/WebSocket paths to Notification Service. Eureka removes the need for clients to know a changing service instance address.

## Service Responsibilities

| Component | Port | Data Store | Main Responsibility |
|---|---:|---|---|
| Frontend | 3000 | Browser state | Responsive React/TypeScript interface, routing, forms, API integration, and WebSocket subscriptions |
| API Gateway | 8080 | None | Single entry point, route matching, JWT validation, CORS/header handling, and load-balanced forwarding |
| Discovery Service | 8761 | In-memory registry | Eureka service registration, discovery, and health visibility |
| Identity Service | 8081 | PostgreSQL, Redis | Registration, password/Google login, OTP verification, JWT issuing/refresh, account status, and profile data |
| User Service | 8082 | PostgreSQL | Friend requests, friendships, mutual friends, suggestions, blocks, and privacy settings |
| Social Service | 8083 | MongoDB | Feed, posts, sharing, comments, replies, reactions, hashtags/model, and Cloudinary media upload |
| Chat Service | 8084 | MongoDB, Redis | Direct/group conversations, messages, attachments, typing, presence, delivery/read status, and WebSocket messaging |
| Notification Service | 8085 | PostgreSQL | Kafka event consumption, notifications, unread count, read state, birthdays, and real-time delivery |
| Apache Kafka | 9092 | Kafka log | Asynchronous event distribution and loose coupling |
| Redis | 6379 | In-memory key/value | OTP and short-lived real-time/presence state |
| Cloudinary | Managed service | Object/CDN storage | Avatar, cover, post, and chat media storage/delivery |
| Email provider (Brevo) | Managed service | External | Transactional OTP email delivery |

No business service may bypass another service and access its database. This boundary prevents a schema change in one domain from silently breaking another domain.

## Communication Design

Normal operations use JSON over HTTP/REST. Media upload uses `multipart/form-data`. Chat and notifications use STOMP over WebSocket/SockJS so the server can push updates without polling. The client includes the access token with protected requests and WebSocket connection metadata.

OpenFeign is used when the caller requires an immediate answer. For example, User Service retrieves identity profiles for search results, Social Service resolves author and friendship data, Chat Service checks direct-message privacy and participant profiles, and Notification Service resolves actor information. Eureka-based service names provide runtime location. Resilience4j circuit-breaker and retry configuration limits cascading failure.

Apache Kafka handles cross-service side effects. Important flows include user-created events from Identity Service, friend/social notification events from User and Social services, and chat message events from Chat Service. Notification Service consumes relevant events, persists a notification, and pushes it to an active recipient. The originating command does not wait for every downstream action.

**Figure 3 – Example event-driven notification sequence:**

```text
User A -> Social Service: react to User B's post
Social Service -> MongoDB: upsert unique reaction and update counter
Social Service -> Kafka: publish notification event
Kafka -> Notification Service: deliver event asynchronously
Notification Service -> PostgreSQL: save unread notification for User B
Notification Service -> WebSocket: push notification if User B is online
User B -> Notification API: mark notification as read
```

**Figure 4 – Send-message sequence:**

```text
Browser -> API Gateway -> Chat WebSocket endpoint: CONNECT with JWT
Browser -> /app/chat.send: message command
Chat Service: validate sender membership, block/privacy rules, and payload
Chat Service -> MongoDB: persist message and update conversation preview
Chat Service -> subscribed users: full message and conversation summary
Recipient -> REST/WebSocket action: mark delivered/read
Chat Service -> Redis: update temporary presence/typing information
```

## Security Architecture

- Passwords are handled by Spring Security and stored only as encoded values.
- Email ownership is verified with an expiring OTP sent through a transactional email provider.
- Google login verifies a Google-issued identity token before accepting its claims.
- Identity Service issues a short-lived access JWT and longer-lived refresh JWT. API Gateway validates protected requests before routing them.
- Downstream services enforce ownership, membership, friendship, block, and privacy authorization.
- Roles and account states allow locked, banned, or deactivated accounts to be rejected.
- Request DTO validation and global exception handling produce controlled error responses.
- Database, JWT, Cloudinary, and email secrets must be injected through environment variables or a secret manager.
- Production traffic must use HTTPS/WSS, restrictive CORS, private service networks, least-privilege database accounts, and rotated credentials.

## Reliability and Scalability

Eureka supports dynamic registration and multiple instances behind the Gateway. Stateless REST services can scale horizontally while persistent state remains in owned databases. Kafka buffers asynchronous workloads and decouples producers from consumers. Redis provides low-latency ephemeral state. MongoDB suits append-heavy posts/messages, and PostgreSQL constraints protect identity and relationship integrity.

Resilience4j circuit breakers use bounded windows, failure thresholds, an open-state wait, and half-open trial calls; retry is limited to avoid endless blocking. Health endpoints expose basic status. Production should additionally implement centralized logs/metrics/tracing, idempotent Kafka consumers and dead-letter handling, database replication/backups, readiness/liveness probes, resource limits, and autoscaling.

## Technologies Learned and Applied

1. **Spring Cloud Gateway:** centralizes routes and token validation.
2. **Netflix Eureka:** dynamically resolves service instances.
3. **Apache Kafka:** implements event-driven workflows and loose coupling.
4. **WebSocket, STOMP, and SockJS:** provide real-time chat, notifications, typing, and presence.
5. **OpenFeign and Resilience4j:** combine declarative HTTP clients with circuit breaking and retry.
6. **Polyglot persistence:** applies PostgreSQL, MongoDB, and Redis to different access patterns.
7. **Liquibase:** versions relational schema changes.
8. **Cloudinary:** separates media storage/delivery from application containers.
9. **React, TypeScript, Zustand, TanStack Query, and Axios:** provide a typed, responsive SPA.
10. **Docker Compose:** describes a repeatable multi-container environment.

---

# Implementation

## Implementation Approach

The backend follows a layered structure within each bounded context: controllers expose REST/WebSocket endpoints, services implement business rules, repositories encapsulate persistence, DTOs define external contracts, and centralized exception handlers return consistent API errors. Security and current-user helpers are present in independently deployable services so authorization does not depend only on the Gateway.

The frontend is organized into page components, reusable post/common components, typed service modules, hooks, utility functions, and a Zustand authentication store. React Router protects authenticated pages. Axios modules call the API Gateway, while STOMP clients subscribe to chat and notification destinations. This separation keeps UI rendering independent from transport details.

Relational schemas are expressed as Liquibase change sets. MongoDB documents use Spring Data annotations and compound/unique indexes. Cloudinary returns hosted media URLs, which are stored in profiles, posts, or message attachments instead of storing large binary files in application databases.

## Deployment Considerations

### Required Configuration

The operator must provide:

- `JWT_SECRET` shared by token-issuing and token-validating components.
- Separate PostgreSQL URLs/credentials for Identity, User, and Notification services.
- Separate MongoDB URIs/databases for Social and Chat services.
- Kafka bootstrap servers and Redis host, port, and password.
- Eureka default-zone URL when discovery is enabled.
- Google OAuth client ID.
- Brevo API key and sender identity for OTP mail.
- Cloudinary cloud name, API key, API secret, folders, and upload-size limits.
- Frontend API and WebSocket base URLs.

Secrets must not appear in screenshots, committed `.env` files, source code, or this report. Local defaults are for development only and must be replaced before public deployment.

### Infrastructure and Capacity

The repository's Docker Compose file builds the frontend and all seven Spring components and starts Kafka and Redis. Its default service URLs refer to hosts named `postgres` and `mongo`, but the current Compose file does not define PostgreSQL or MongoDB containers. Before running the full stack, the team must either (a) provision reachable PostgreSQL/MongoDB instances and override the environment variables, or (b) add database services, volumes, users, databases, and health checks to Compose.

PostgreSQL requires three logical databases: `identity_db`, `user_db`, and `notification_db`. MongoDB should use isolated databases such as `kirenz_social` and `kirenz_chat`. Persistent volumes and scheduled backups are required in production. Kafka and Redis need production-appropriate persistence/authentication and must not be exposed to the internet.

### Database Migration

Liquibase change logs exist for all PostgreSQL-owned schemas. The checked-in application configuration currently disables Liquibase at runtime. Therefore, deployment must explicitly apply the migrations before starting services with Hibernate validation, or deliberately enable Liquibase after validating permissions and ordering. Schema backup and rollback procedures must be tested before a production upgrade.

### User Access and Training

Users may access Kirenz at any time from different locations and time zones. They require a supported browser, JavaScript, client storage used by the session, and WebSocket access through the network proxy. Onboarding should explain registration and OTP, profile/post visibility, blocking, group-administrator responsibilities, and read/online indicators. Operators need a runbook covering start order, variables, migrations, health checks, logs, backup/restore, secret rotation, and incidents.

### Deployment Risks and Controls

| Risk | Control |
|---|---|
| Weak/default secrets | Inject strong secrets from a secret manager and rotate them. |
| Database unavailable at startup | Add health/readiness checks and start services after databases are reachable and migrated. |
| Cascading service failure | Use bounded retries, circuit breakers, timeouts, and controlled fallbacks. |
| Duplicate Kafka delivery | Make consumers idempotent and define retry/dead-letter policies. |
| Lost user media | Use Cloudinary and maintain appropriate retention/backup policies. |
| WebSocket blocked by proxy | Configure upgrade headers and retain SockJS fallback. |
| Excessive or unsafe uploads | Enforce server-side type/size validation and production content controls. |
| Personal-data leakage | Apply privacy/block rules, authorization, TLS, least privilege, and log redaction. |

## Installation and Start-up Procedure

1. Install JDK 21, Node.js 18+, npm, Docker, PostgreSQL, and MongoDB or obtain managed database endpoints.
2. Create the Identity, User, and Notification PostgreSQL databases and the Social and Chat MongoDB databases.
3. Supply all required database, JWT, Redis, Kafka, Google, Brevo, and Cloudinary environment values.
4. Apply the Liquibase change logs for Identity, User, and Notification databases.
5. Start Redis and Kafka with Docker Compose or equivalent managed infrastructure.
6. Start Discovery Service on port 8761.
7. Start Identity, User, Social, Chat, and Notification services on ports 8081–8085 and verify Eureka registration.
8. Start API Gateway on port 8080 and verify `/actuator/health`.
9. In `frontend`, run `npm install` and `npm run dev`, or build the Docker image. Open `http://localhost:3000`.
10. Smoke-test registration, OTP, login, profile update, post creation, friendship, chat, and notification.

For a containerized demonstration, provide environment values in a private `.env` file and run `docker compose up --build`. Resolve the database-host limitation above first.

## Testing and Quality Assurance

The repository contains 24 Java test classes across the services. They include context tests and focused tests for authentication/login/refresh/Google flows, user repositories and errors, posts, comments, reactions, notification behavior, direct-conversation permissions, conversations, and security/current-user behavior. Request validation, unique database constraints, ownership checks, and centralized exception handlers provide additional runtime safeguards.

At the time this report content was prepared (18 July 2026), the frontend passed TypeScript checking with `npm run lint` and completed a production Vite build with `npm run build`. The build reported optimization warnings for a large JavaScript chunk and mixed static/dynamic imports, but no compilation error.

The recommended final verification pipeline is:

1. Run all backend unit/integration tests with Maven.
2. Run TypeScript checking using `npm run lint`.
3. Produce the frontend bundle using `npm run build`.
4. Start the stack and verify Eureka registration and Actuator health.
5. Test Gateway routes with valid, missing, expired, and malformed JWTs.
6. Use two browsers/accounts to test friend requests, notifications, direct/group chat, typing, presence, and read status.
7. Verify ownership, privacy, and block rules with different accounts.
8. Test invalid input, duplicate actions, dependency failure, reconnection, upload limits, and responsive layouts.

## Screenshots and Explanations

> Replace each `[INSERT SCREENSHOT ...]` line with an actual screenshot. Crop secrets, tokens, email addresses, credentials, and private chat content. Keep the figure number and caption.

### Screen Flow / Dialog Map

**Figure 5 – Main screen flow:**

```text
Login <-> Register -> OTP Verification -> Home Feed
                                      |-> Explore/Search -> User Profile -> Friend/Block/Message
                                      |-> Own Profile -> Edit Profile/Cover -> Friends/Photos
                                      |-> Post -> Comments/Reactions/Share/Media Viewer
                                      |-> Chat -> Direct Conversation / Group Conversation / Group Details
                                      |-> Notifications -> Related Post/Profile/Friend Request
                                      |-> Settings & Privacy -> Blocked Users
                                      |-> Logout -> Login
```

### Figure 5A – Visitor Public Feed and Permalink

`[INSERT SCREENSHOT: Public feed opened in a signed-out/incognito browser, plus a public post permalink]`

The root route allows an unauthenticated visitor to read active public posts. A stable `/posts/{postId}` permalink can be copied from a public post and opened without a session. Like, Comment, Repost, View discussion, and profile actions redirect to login while preserving the original URL. The public backend endpoints reject friend-only and private content as not found.

### Figure 6 – Login Screen

`[INSERT SCREENSHOT: Login page showing email/password fields and Google login button]`

The login page at `/login` accepts email/password and offers Google authentication. On success, the client receives authenticated state and token data, then opens the protected Home Feed or returns to the safe internal URL supplied by the visitor flow. Validation and server errors are displayed without exposing sensitive internals.

### Figure 7 – Registration and OTP Verification

`[INSERT SCREENSHOT: Registration form and a second cropped image of the OTP dialog]`

Registration collects display name, username, email, and password. The user then verifies the email with an expiring OTP. This demonstrates validation, unique identity constraints, Redis-backed temporary data, and transactional email integration.

### Figure 8 – Home Feed and Create Post

`[INSERT SCREENSHOT: Home Feed with Create Post composer and one multimedia post]`

Home Feed is the primary social workspace. The composer supports text, media, tagged users, and visibility. A post card shows author, time, media, counts, and actions. Social Service returns feed data and uses identity/relationship information where required.

### Figure 9 – Post Reactions and Comments

`[INSERT SCREENSHOT: Expanded reactions and a comment thread/reply interface]`

Users can select, change, or remove an emoji reaction, inspect summaries, and create threaded comments. A unique reaction constraint prevents duplicate reactions for one user/target. Comment and reaction events can create an asynchronous notification.

### Figure 10 – Explore and Search

`[INSERT SCREENSHOT: Explore page with Trending, People, and Related Posts]`

Explore searches people through User/Identity services and filters visible loaded posts by content or hashtag. Trending hashtags are currently calculated by the frontend from visible feed content. A result can open a profile or send a friend request.

### Figure 11 – User Profile and Friend Management

`[INSERT SCREENSHOT: Another user's profile with friend-status and mutual/friend information]`

The profile combines identity fields, social posts/images, and relationship context from independent services. Depending on status, the viewer may send/cancel/accept a request, unfriend, block, or start a conversation. A hidden profile returns a controlled privacy view.

### Figure 12 – Profile Editing and Privacy Settings

`[INSERT SCREENSHOT: Settings & Privacy page and profile edit dialog]`

The user can edit profile fields, avatar, and cover. Privacy controls determine profile/post visibility, direct-message permission, and online-status visibility. Cloudinary hosts uploaded media; Identity Service stores its URL.

### Figure 13 – Direct Chat

`[INSERT SCREENSHOT: Two-account direct chat showing message, attachment, typing, or online status]`

Chat shows a conversation list and active thread. WebSocket delivers messages without refresh, MongoDB persists history, and Redis holds presence/typing state. Attachments include images, videos, PDF, and DOCX files subject to controls.

### Figure 14 – Group Chat Management

`[INSERT SCREENSHOT: Group details with participants, admin action, nickname, and leave/delete controls]`

Authorized users can create a group, add/remove participants, promote administrators, rename the group, and assign nicknames. Permission checks prevent ordinary members from restricted operations.

### Figure 15 – Notifications

`[INSERT SCREENSHOT: Notification list with unread count and several event types]`

Notification Service consumes events, persists recipient history, and pushes connected clients. The UI displays unread count, supports individual/read-all actions, and navigates to a related profile or post.

### Figure 16 – Eureka Service Registry

`[INSERT SCREENSHOT: Eureka dashboard with Gateway and five business services registered]`

The dashboard provides operational evidence of service discovery. It should show API Gateway, Identity, User, Social, Chat, and Notification services as registered instances.

### Figure 17 – Responsive Mobile Layout

`[INSERT SCREENSHOT: Responsive browser view of Home, Profile, or Chat at mobile width]`

Responsive navigation and content widths preserve the same protected routes and API contracts on small screens. This demonstrates browser-based mobile usability; a native app remains outside the current submission.

---

# Conclusion

Kirenz Platform – Moments Social Network satisfies the MSS301 objective of building a meaningful Spring Boot microservices application. The project separates seven deployable backend/infrastructure components around clear responsibilities, gives each business service ownership of its data, secures traffic with JWT and Spring Security, combines REST with real-time WebSocket communication, and uses Kafka for asynchronous event-driven integration. The React/TypeScript frontend demonstrates complete user journeys for identity, profile, social graph, content, chat, privacy, blocking, and notifications.

Its main strength is the match between domain and technology: PostgreSQL protects relational invariants, MongoDB handles flexible social/chat documents, Redis supports ephemeral state, and Cloudinary handles media. Future work includes automated CI/CD, full database container provisioning, centralized observability, idempotent event/dead-letter handling, a complete administration/moderation interface, and broader end-to-end/performance tests. These additions can preserve the established service boundaries.

---

# References

1. Kirenz project team. *Kirenz Platform README*. Local project file: `README.md`, 2026.
2. Kirenz project team. *Kirenz Platform – Microservices Architecture*. Local project file: `docs/architecture/ARCHITECTURE.md`, 2026.
3. Kirenz project team. *Service Communication Architecture*. Local project file: `docs/architecture/SERVICE_COMMUNICATION_ARCHITECTURE.md`, 2026.
4. Kirenz project team. *Kirenz Platform – Full Use Case Catalog*. Local project file: `docs/uc/USE_CASE.md`, 2026.
5. VMware/Broadcom. *Spring Boot Reference Documentation*. https://docs.spring.io/spring-boot/index.html
6. VMware/Broadcom. *Spring Cloud Gateway Reference Documentation*. https://docs.spring.io/spring-cloud-gateway/reference/
7. VMware/Broadcom. *Spring Cloud Netflix Reference Documentation*. https://docs.spring.io/spring-cloud-netflix/reference/
8. VMware/Broadcom. *Spring Security Reference*. https://docs.spring.io/spring-security/reference/
9. VMware/Broadcom. *Spring for Apache Kafka Reference*. https://docs.spring.io/spring-kafka/reference/
10. Apache Software Foundation. *Apache Kafka Documentation*. https://kafka.apache.org/documentation/
11. MongoDB, Inc. *MongoDB Manual*. https://www.mongodb.com/docs/manual/
12. PostgreSQL Global Development Group. *PostgreSQL Documentation*. https://www.postgresql.org/docs/
13. Redis Ltd. *Redis Documentation*. https://redis.io/docs/latest/
14. Docker, Inc. *Docker Compose Documentation*. https://docs.docker.com/compose/
15. Meta Platforms, Inc. *React Documentation*. https://react.dev/
16. Liquibase Inc. *Liquibase Documentation*. https://docs.liquibase.com/

---

# Appendix A. Ten-Week Project Timeline

| Week | Main Tasks | Detailed Tasks | Technologies / Techniques | Key Deliverables |
|---:|---|---|---|---|
| 1 | Kick-off and analysis | Select Social Media Blog; identify actors, use cases, business rules, non-functional requirements, service boundaries, and assignments. | Use cases, UML, Git | Scope, backlog, use-case catalog, assignments |
| 2 | Architecture foundation | Create the multi-module repository; configure Eureka/Gateway; agree on ports, response format, JWT contract, and data ownership. | Java 21, Spring Boot, Gateway, Eureka, Maven | Skeleton services, architecture diagram, routes |
| 3 | Identity and security | Implement registration, login, Google login, OTP, JWT access/refresh, account status, and profile APIs. | Spring Security, JJWT, Redis, Brevo, PostgreSQL, Liquibase | Secured Identity Service and tested auth APIs |
| 4 | User relationships | Implement requests, friendships, mutual friends, suggestions, blocks, privacy, and identity lookup. | JPA, PostgreSQL, OpenFeign, Resilience4j | Functional User Service |
| 5 | Social content | Implement posts, media, privacy, feed, profile posts/images, sharing, comments/replies, tagging, and reactions. | MongoDB, Cloudinary, validation | Functional Social Service and interaction UI |
| 6 | Real-time chat | Implement direct/group conversations, participant/admin operations, nicknames, messages, media, and WebSocket delivery. | WebSocket, STOMP, SockJS, MongoDB | Direct and group messaging |
| 7 | Presence and notifications | Add Redis presence/typing, delivery/read state, Kafka events, notification persistence, unread counts, and push. | Redis, Kafka, WebSocket, PostgreSQL | Real-time state and Notification Service |
| 8 | Frontend integration | Build login/register/OTP, feed, Explore, profile, friends, settings, blocked users, chat, and notifications. | React, TypeScript, Vite, Zustand, Axios, Tailwind | Responsive end-to-end SPA |
| 9 | Integration and hardening | Add validation, exceptions, circuit breaking, tests, Docker/Compose, documentation, and contract fixes. | JUnit, Mockito, Resilience4j, Docker | Stable integrated build and setup guide |
| 10 | Final verification and presentation | Execute smoke/E2E cases, capture screenshots, finalize report/slides, and rehearse live demo. | Browser tools, Postman, presentation tools | Final report, presentation, live demo |

---

# Appendix B. Requirement-to-Service Traceability

| Requirement / User Journey | Primary Owner | Supporting Components |
|---|---|---|
| Register, OTP, password/Google login, refresh token | Identity Service | Redis, Brevo, Google identity, Gateway, Frontend |
| View/update profile, avatar, cover | Identity Service | Cloudinary, Gateway, Frontend |
| Search people, requests, mutual friends, suggestions | User Service | Identity Service via Feign, Frontend |
| Block and privacy rules | User Service | Social/Chat services as policy consumers |
| Create/view/edit/delete/share posts and media | Social Service | Cloudinary, Identity/User clients, Frontend |
| Comments, replies, tags, reactions | Social Service | Kafka, Notification Service, Frontend |
| Direct/group conversations and messages | Chat Service | User/Identity clients, MongoDB, Frontend |
| Typing, presence, delivery/read state | Chat Service | Redis, WebSocket, Gateway, Frontend |
| Notification history, unread count, real-time push | Notification Service | Kafka, PostgreSQL, WebSocket, Frontend |
| Routing and token validation | API Gateway | Eureka, all business services |
| Dynamic instance lookup | Discovery Service | Gateway and service clients |
