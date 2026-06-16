# Kirenz Platform - Microservices Architecture

## 1. Overview

Kirenz is a social networking platform designed as a Microservices system. The architecture separates identity, user relationships, social content, real-time chat, and notifications into independently deployable services.

The platform demonstrates:

* Microservices architecture with Spring Boot 3 and Java 21
* Service discovery with Eureka
* Gateway-based request routing and JWT validation
* Polyglot persistence with PostgreSQL, MongoDB, and Redis
* Event-driven communication with Apache Kafka
* Real-time communication with WebSocket
* Synchronous service calls with OpenFeign
* Fault tolerance with Resilience4j
* Containerized local development with Docker Compose

RabbitMQ is not used. All asynchronous event-driven communication must use Apache Kafka.

---

## 2. High-Level Architecture

```text
ReactJS Client
      |
      | HTTP / WebSocket
      v
+-----------------------------+
| API Gateway                 |
| Port: 8080                  |
| JWT validation, routing     |
+-------------+---------------+
              |
              | routes via Eureka service discovery
              v
+-----------------------------+
| Discovery Service           |
| Port: 8761                  |
| Eureka Server               |
+-----------------------------+
              |
              v
+----------------+  +--------------+  +----------------+  +--------------+  +----------------------+
| Identity       |  | User         |  | Social         |  | Chat         |  | Notification         |
| Service        |  | Service      |  | Service        |  | Service      |  | Service              |
| Port: 8081     |  | Port: 8082   |  | Port: 8083     |  | Port: 8084   |  | Port: 8085           |
| PostgreSQL     |  | PostgreSQL   |  | MongoDB        |  | MongoDB      |  | PostgreSQL           |
+----------------+  +--------------+  +----------------+  +--------------+  +----------------------+
        |                  |                 |                   |                    |
        +------------------+-----------------+-------------------+--------------------+
                           |
                           v
                    +-------------+
                    | Apache      |
                    | Kafka       |
                    +-------------+

Redis is used by Chat Service for online users, presence tracking, and typing indicators.
```

---

## 3. Infrastructure Services

## 3.1 API Gateway

Port: `8080`

Technology:

* Spring Cloud Gateway
* Spring Security
* JWT
* Eureka Client

Responsibilities:

* Single entry point for the web client
* Validate JWT access tokens before forwarding protected requests
* Route requests through Eureka service discovery
* Apply request filtering and security headers
* Provide a future extension point for rate limiting

Database ownership: none.

Routing rule:

```text
The gateway must route by service name discovered from Eureka.
Hardcoded service URLs must not be used for service routing.
```

---

## 3.2 Discovery Service

Port: `8761`

Technology:

* Spring Cloud Netflix Eureka Server

Responsibilities:

* Service registration
* Service discovery
* Runtime service location for Gateway and Feign clients

Database ownership: none.

---

## 4. Business Services

## 4.1 Identity Service

Port: `8081`

Database: PostgreSQL

Responsibilities:

* User registration
* Login
* Google OAuth2 login
* OTP verification
* JWT access token issuing
* Refresh token issuing and rotation
* Role management
* Authorization data ownership
* Lightweight account profile fields used by the web UI

Owned tables:

* `users`

Current implementation note:

* Refresh tokens are stateless JWTs.
* OTP values are stored in Redis.
* Role is currently stored on `users.role`.
* Dedicated `roles`, `user_roles`, `refresh_tokens`, and `otp_verifications` tables can be added later if the implementation moves to persisted roles, persisted refresh tokens, or persisted OTP audit records.

Integration:

* Publishes `user-created` events to Kafka
* Exposes internal identity and authorization endpoints for trusted services

Data boundary:

* Must not access MongoDB
* Must not own friendship, privacy policy, blocking, post, chat, or notification data

---

## 4.2 User Service

Port: `8082`

Database: PostgreSQL

Responsibilities:

* Friend request lifecycle
* Friendship management
* User blocking
* Privacy settings
* User relationship queries used by other services

Owned tables:

* `friendships`
* `friend_requests`
* `blocks`
* `privacy_settings`

Integration:

* Consumes `user-created` events from Kafka to initialize relationship and privacy defaults when needed
* Publishes `friend-accepted` events to Kafka
* Calls Identity Service by OpenFeign when identity or role information is required

Data boundary:

* Must not access MongoDB
* Must not own authentication tokens, lightweight account profile fields, posts, comments, messages, or notifications

---

## 4.3 Social Service

Port: `8083`

Database: MongoDB

Responsibilities:

* Posts
* Comments
* Emoji reactions
* Saved posts
* Hashtags
* Social feed data

Owned collections:

* `posts`
* `comments`
* `reactions`
* `bookmarks` - saved posts mapping users to posts they saved from other users for later viewing
* `hashtags`

Integration:

* Consumes `user-created` events from Kafka if social read models are needed
* Consumes `friend-accepted` events from Kafka for feed and graph read models
* Publishes `post-created`, `comment-created`, and `reaction-created` events to Kafka
* Calls Identity Service by OpenFeign for lightweight account display data when needed
* Calls User Service by OpenFeign for friendship, privacy, and block checks

Data boundary:

* Must not access PostgreSQL directly
* Must not own chat messages or notification delivery state

---

## 4.4 Chat Service

Port: `8084`

Database: MongoDB

Additional infrastructure: Redis

Responsibilities:

* Conversations
* Messages
* Group chat
* Typing status
* Presence tracking
* WebSocket communication

Owned collections:

* `conversations`
* `messages`

Redis usage:

* Online users
* Presence tracking
* Typing indicators
* Short-lived real-time state

Integration:

* Publishes `message-sent` events to Kafka
* Calls User Service by OpenFeign for participant, block, and privacy checks

Data boundary:

* Must not access PostgreSQL directly
* Must not own profile, friendship, post, comment, or notification preference data

---

## 4.5 Notification Service

Port: `8085`

Database: PostgreSQL

Responsibilities:

* In-app notifications
* Email notifications
* Push notifications as a future capability
* Notification preferences
* Notification read/unread state

Owned tables:

* `notifications`
* `notification_preferences`

Integration:

* Consumes Kafka events from User, Social, and Chat services
* Uses notification preferences to decide delivery channels

Data boundary:

* Must not own user identity, profile, friendship, post, comment, or message data

---

## 5. Inter-Service Communication

## 5.1 Synchronous Communication

Technology: OpenFeign

Synchronous communication is used when a service needs data immediately to complete the current request.

Examples:

```text
Social Service -> User Service
Chat Service   -> User Service
User Service   -> Identity Service
```

Feign clients must use Eureka discovery:

```java
@FeignClient(name = "user-service")
```

Hardcoded service URLs must not be used:

```java
@FeignClient(name = "user-service", url = "http://localhost:8082")
```

---

## 5.2 Asynchronous Communication

Technology: Apache Kafka

Kafka is used for:

* Event propagation
* Loose coupling between services
* Asynchronous notification workflows
* Social graph and feed read model updates
* Cross-service side effects that do not need to block the user request

---

## 6. Kafka Event Catalog

## 6.1 `user-created`

Producer:

* Identity Service

Consumers:

* User Service
* Social Service

Purpose:

* Initialize relationship and privacy defaults when needed
* Initialize social read models when required

---

## 6.2 `friend-accepted`

Producer:

* User Service

Consumers:

* Notification Service
* Social Service

Purpose:

* Notify users about accepted friendships
* Update social graph and feed read models

---

## 6.3 `post-created`

Producer:

* Social Service

Consumers:

* Notification Service

Purpose:

* Notify eligible followers or friends about new posts

---

## 6.4 `comment-created`

Producer:

* Social Service

Consumers:

* Notification Service

Purpose:

* Notify post owners or participants about new comments

---

## 6.5 `reaction-created`

Producer:

* Social Service

Consumers:

* Notification Service

Purpose:

* Notify content owners about reactions

---

## 6.6 `message-sent`

Producer:

* Chat Service

Consumers:

* Notification Service

Purpose:

* Notify offline users about new messages

---

## 7. Database Architecture

## 7.1 PostgreSQL

PostgreSQL stores relational, transactional, and authorization-oriented data.

Owned by:

* Identity Service
* User Service
* Notification Service

Ownership rules:

* Each service owns its own schema or database.
* Services must not read or write another service's tables directly.
* Cross-service data access must happen through APIs or Kafka events.

---

## 7.2 MongoDB

MongoDB stores document-oriented and high-write social data.

Owned by:

* Social Service
* Chat Service

Ownership rules:

* Social Service owns social content collections.
* Chat Service owns conversation and message collections.
* PostgreSQL-based services must not access MongoDB directly.

---

## 7.3 Redis

Redis stores short-lived real-time state.

Used by:

* Chat Service

Responsibilities:

* Online user state
* Presence tracking
* Typing indicators
* Short-lived cache entries

Redis is not the source of truth for permanent business data.

---

## 8. Security Architecture

Authentication:

* JWT access token
* Refresh token
* Google OAuth2 login
* OTP verification

Authorization:

* Spring Security
* Role-based access control

Gateway responsibility:

* Validate JWT before forwarding protected requests
* Forward authenticated user context to downstream services

Service responsibility:

* Enforce business-level authorization
* Reject requests that violate ownership, privacy, friendship, or blocking rules

Future security improvement:

* mTLS between services

---

## 9. Fault Tolerance

Technology: Resilience4j

Applied to:

* OpenFeign calls
* Remote service dependencies

Patterns:

* Circuit breaker
* Retry
* Rate limiter
* Fallback methods

Purpose:

* Prevent cascading failures
* Keep service boundaries resilient
* Return controlled fallback responses when dependencies are unavailable

---

## 10. Repository Structure

Target repository structure:

```text
kirenz-platform/
|-- api-gateway/
|-- discovery-service/
|-- identity-service/
|-- user-service/
|-- social-service/
|-- chat-service/
|-- notification-service/
|-- shared-lib/
|-- frontend/
|-- docs/
|   |-- architecture/
|   |-- database/
|   |-- api/
|   |-- diagrams/
|   `-- uc/
|-- docker-compose.yml
|-- pom.xml
`-- README.md
```

Current repository status:

```text
Implemented or present:
|-- frontend/
|-- identity-service/
|-- docs/
|-- pom.xml
`-- README.md

Planned by target architecture:
|-- api-gateway/
|-- discovery-service/
|-- user-service/
|-- social-service/
|-- chat-service/
|-- notification-service/
|-- shared-lib/
`-- docker-compose.yml
```

---

## 11. Development Roadmap

## Phase 1 - Foundation

* Discovery Service
* API Gateway
* Identity Service
* JWT authentication
* OTP verification
* PostgreSQL identity schema

## Phase 2 - User Domain

* User Service
* Friend requests
* Friendship management
* Blocking
* Privacy settings

## Phase 3 - Social Domain

* Social Service
* Posts
* Comments
* Emoji reactions
* Saved posts
* Hashtags
* MongoDB social collections

## Phase 4 - Real-Time Chat

* Chat Service
* WebSocket communication
* Conversations
* Messages
* Group chat
* Redis presence and typing indicators

## Phase 5 - Kafka Integration

* Kafka topics
* Event publishing
* Event consumers
* Cross-service notification triggers
* Event-driven read model updates

## Phase 6 - Notification Domain

* Notification Service
* In-app notifications
* Email notifications
* Notification preferences
* Read/unread notification state

## Phase 7 - Resilience and Deployment

* Resilience4j circuit breakers
* Retry and fallback policies
* Docker Compose environment
* GitHub Actions pipeline
* Production deployment preparation

---

## 12. Design Rules

Service boundaries:

* A service owns its database and business model.
* A service must not directly access another service's database.
* Cross-service communication must use OpenFeign or Kafka.
* Kafka is the only event-driven messaging technology.
* Eureka is required for service discovery.
* Gateway routes through service discovery.

Code organization:

* Use domain-based package structure.
* Use clear naming and meaningful method names.
* Keep API DTOs separate from persistence models.
* Use mapper classes for DTO conversion when needed.
* Use centralized exception handling for API errors.

API response standard:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```
