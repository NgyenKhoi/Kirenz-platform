# Kirenz Platform - System Architecture

## 1. Project Overview

Kirenz là một nền tảng mạng xã hội được xây dựng theo kiến trúc Microservices, hỗ trợ:

* User Authentication & Authorization
* User Profile Management
* Friend System
* Social Posts
* Comments
* Likes
* Notifications
* Real-time Messaging
* Group Conversations
* Media Uploads
* Content Discovery

Hệ thống sử dụng Hybrid Database Architecture:

* PostgreSQL cho dữ liệu quan hệ và định danh người dùng
* MongoDB cho dữ liệu mạng xã hội và dữ liệu có tần suất ghi cao

---

# 2. System Architecture

```text
Client (ReactJS)
        |
        |
        v
+-------------------+
|    API Gateway    |
|      :8080        |
+-------------------+
        |
        |
  +-----+-----+
  |           |
  v           v

+-------------------+        +-------------------+
| Identity Service  |        |  Social Service   |
|      :8081        |        |      :8082        |
+-------------------+        +-------------------+
| PostgreSQL        |        | MongoDB           |
+-------------------+        +-------------------+

        |
        |
        v

+-------------------+
|    RabbitMQ       |
+-------------------+

```

---

# 3. Microservices

## 3.1 Identity Service

Port:

```text
8081
```

Database:

```text
PostgreSQL
```

Responsibilities:

* User Registration
* Login
* JWT Generation
* User Profile Management
* Friend Requests
* Friend Management
* User Settings
* User Statistics
* Authorization

Owned Database:

```text
PostgreSQL
```

No MongoDB access allowed.

---

## 3.2 Social Service

Port:

```text
8082
```

Database:

```text
MongoDB
```

Responsibilities:

* Posts
* Comments
* Likes
* Notifications
* Conversations
* Messages
* Bookmarks
* Hashtags
* WebSocket Messaging

Owned Database:

```text
MongoDB
```

No PostgreSQL access allowed.

---

## 3.3 API Gateway

Port:

```text
8080
```

Responsibilities:

* Single Entry Point
* JWT Validation
* Routing
* Request Filtering
* Rate Limiting (future)
* Security Headers

Database:

```text
None
```

---

# 4. Inter-Service Communication

## OpenFeign

Service-to-Service communication is performed using OpenFeign.

Example:

```text
Social Service
      |
      |
      v
Identity Service
```

Use cases:

* Get user information
* Validate user existence
* Retrieve friend information
* Retrieve user privacy settings

---

## Feign Client Naming

```java
@FeignClient(
    name = "identity-service",
    url = "${services.identity.url}"
)
```

Example:

```text
Social Service
  -> Identity Service

GET /internal/users/{id}
```

---

# 5. Fault Tolerance

## Circuit Breaker

Technology:

```text
Resilience4j
```

Purpose:

* Prevent cascading failures
* Improve service availability
* Fallback support

Example:

```text
Social Service
      |
      X
Identity Service Down
      |
Fallback Response
```

Example Usage:

```java
@CircuitBreaker(
    name = "identityService",
    fallbackMethod = "fallbackGetUser"
)
```

---

# 6. Event Driven Communication

Technology:

```text
RabbitMQ
```

Purpose:

* Async communication
* Decouple services
* Event propagation

---

## Planned Events

### UserCreatedEvent

Publisher:

```text
Identity Service
```

Consumers:

```text
Social Service
```

---

### FriendAcceptedEvent

Publisher:

```text
Identity Service
```

Consumers:

```text
Social Service
```

---

### PostCreatedEvent

Publisher:

```text
Social Service
```

Consumers:

```text
Notification Module
```

---

### MessageSentEvent

Publisher:

```text
Social Service
```

Consumers:

```text
Notification Module
```

---

# 7. Database Architecture

## PostgreSQL

Managed by:

```text
Identity Service
```

Tables:

* users
* friends
* user_stats
* user_settings

---

## MongoDB

Managed by:

```text
Social Service
```

Collections:

* posts
* comments
* likes
* notifications
* conversations
* messages
* bookmarks
* hashtags

---

# 8. Security

Authentication:

```text
JWT Access Token
```

Authorization:

```text
Spring Security
```

Gateway validates JWT before forwarding requests.

Service-to-Service communication uses:

```text
Internal API
```

Future:

```text
mTLS
```

---

# 9. Technology Stack

Backend:

```text
Java 21
Spring Boot 3
```

Database:

```text
PostgreSQL
MongoDB
```

Messaging:

```text
RabbitMQ
```

Real-Time:

```text
WebSocket
STOMP
```

Security:

```text
Spring Security
JWT
```

Communication:

```text
OpenFeign
```

Fault Tolerance:

```text
Resilience4j
```

Migration:

```text
Liquibase
```

Containerization:

```text
Docker
Docker Compose
```

CI/CD:

```text
GitHub Actions
Docker Hub
```

---

# 10. Development Roadmap

Phase 1

* Identity Service
* Authentication
* Users
* Friends
* PostgreSQL
* Liquibase

Phase 2

* Social Service
* Posts
* Comments
* MongoDB

Phase 3

* OpenFeign
* API Gateway
* JWT Propagation

Phase 4

* RabbitMQ
* Notifications

Phase 5

* WebSocket
* Conversations
* Messages

Phase 6

* Circuit Breaker
* Monitoring
* Production Deployment

````

---

# 11. Repository Structure

```text
kirenz-platform/

├── api-gateway
├── identity-service
├── social-service
├── shared-lib

├── docs
│   ├── architecture
│   ├── database
│   ├── api
│   └── diagrams

├── docker-compose.yml
├── pom.xml
└── README.md
````

---

# 12. Service Design Rules

Every service must follow:

### Domain-Based Package Structure

```text
user/
friend/
auth/
```

instead of:

```text
controller/
service/
repository/
entity/
```

---

### Layering

```text
Controller
    ↓
Service
    ↓
Repository
```

Controller must never access Repository directly.

---

### DTO Separation

```text
Request DTO
Response DTO
```

Never expose Entity/Document directly.

---

### Mapping

Technology:

```text
MapStruct
```

Entity ↔ DTO conversion must use Mapper classes.

---

### Exception Handling

Every service must implement:

```text
GlobalExceptionHandler
```

using:

```java
@RestControllerAdvice
```

---

### API Response Standard

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

All services must follow the same response format.
