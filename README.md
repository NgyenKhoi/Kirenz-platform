# Kirenz Platform

Kirenz Platform is a social networking web application built to demonstrate a modern Microservices architecture. The system uses Java 21, Spring Boot 3, Spring Cloud, PostgreSQL, MongoDB, Redis, Apache Kafka, JWT security, WebSocket, Docker, and a ReactJS frontend.

The current repository already contains the React frontend and Identity Service implementation. The target architecture separates the platform into dedicated services for identity, users, social content, chat, and notifications.

## Current Repository Status

Implemented or present:

* `frontend/` - ReactJS client built with Vite
* `identity-service/` - Spring Boot service for registration, login, JWT, refresh token flow, OTP verification, and user profile endpoints
* `docs/` - architecture, API, database, and use-case documentation
* root `pom.xml` - Maven parent project

Target services in the architecture:

* `api-gateway/`
* `discovery-service/`
* `identity-service/`
* `user-service/`
* `social-service/`
* `chat-service/`
* `notification-service/`
* `shared-lib/`

## Architecture Summary

```text
ReactJS Client
      |
      v
API Gateway :8080
      |
      | routes by Eureka service discovery
      v
Discovery Service :8761
      |
      +--> Identity Service :8081       PostgreSQL
      +--> User Service :8082           PostgreSQL
      +--> Social Service :8083         MongoDB
      +--> Chat Service :8084           MongoDB + Redis
      `--> Notification Service :8085   PostgreSQL

Apache Kafka is used for event-driven communication between services.
```

Important architecture rules:

* RabbitMQ is not used.
* Apache Kafka is the only event-driven messaging technology.
* Eureka Service Discovery is used instead of hardcoded service URLs.
* API Gateway routes through service discovery.
* OpenFeign clients use service names such as `@FeignClient(name = "user-service")`.
* Each service owns its own database tables or collections.
* Identity Service keeps lightweight profile fields in `users`.
* User Service owns friendship, blocking, and privacy policy data.

Full architecture documentation: [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)

Use case catalog: [docs/uc/USE_CASE.md](docs/uc/USE_CASE.md)

## Prerequisites

Install:

* Java 21
* Maven
* Docker
* Docker Compose
* Node.js 20 or newer
* npm

## Infrastructure Startup

The target local environment needs:

* PostgreSQL
* MongoDB
* Redis
* Kafka
* Zookeeper, if the selected Kafka image requires it
* Eureka Discovery Service
* API Gateway

When `docker-compose.yml` is available, start infrastructure from the repository root:

```bash
docker compose up -d
```

The current repository does not yet include the final Docker Compose file, so services can also be started manually while the platform is being implemented.

## Backend Startup Order

Start services in this order:

1. Discovery Service
2. API Gateway
3. Identity Service
4. User Service
5. Social Service
6. Chat Service
7. Notification Service

Current implemented backend service:

```bash
cd identity-service
mvn spring-boot:run
```

Identity Service runs on:

```text
http://localhost:8081
```

Required Identity Service environment variables:

```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
JWT_SECRET
REDIS_HOST
REDIS_PORT
REDIS_PASSWORD
BREVO_API_KEY
BREVO_SENDER_EMAIL
BREVO_SENDER_NAME
```

## Frontend Startup

Start the ReactJS client:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

The frontend API base URL can be configured with:

```text
VITE_API_BASE_URL=http://localhost:8081/api
```

After API Gateway is implemented, the frontend should point to the gateway:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

## Existing Web Use Cases

The current React client contains screens and flows for:

* Register
* Login
* OTP verification
* Protected layout
* Home feed screen
* User profile screen
* Profile settings
* Privacy settings
* Friends screen
* Chat screen
* Stories and story viewer screens

The current Identity Service supports:

* Register
* Login
* Refresh token
* Current user profile
* Update user profile
* Send OTP
* Verify OTP
* JWT-based request authentication

The current Identity Service database dependency is intentionally small:

* `users`

Refresh tokens are stateless JWTs, and OTP values are stored in Redis.

Planned target use cases:

* Google login
* Send friend request
* Accept friend request
* Create post
* Comment post
* React to post
* Create conversation
* Send message
* Receive notification

## UI Black Box Test Scenarios

The platform is intended to be evaluated through the web UI. A user should be able to verify the complete system without manually calling APIs.

Recommended UI scenarios:

1. Register a new account.
2. Verify the account with OTP.
3. Login with email and password.
4. Login with Google after OAuth2 is implemented.
5. Open the profile page and update profile information.
6. Change privacy settings.
7. Send a friend request.
8. Accept a friend request from another account.
9. Create a post.
10. Comment on a post.
11. React to a post with an emoji.
12. Create a conversation.
13. Send a real-time chat message.
14. Receive an in-app notification.

## Service Ports

| Service | Port | Database |
| --- | ---: | --- |
| API Gateway | 8080 | None |
| Discovery Service | 8761 | None |
| Identity Service | 8081 | PostgreSQL |
| User Service | 8082 | PostgreSQL |
| Social Service | 8083 | MongoDB |
| Chat Service | 8084 | MongoDB, Redis |
| Notification Service | 8085 | PostgreSQL |
| Frontend | 3000 | None |

## Kafka Topics

| Topic | Producer | Consumers |
| --- | --- | --- |
| `user-created` | Identity Service | User Service, Social Service |
| `friend-accepted` | User Service | Notification Service, Social Service |
| `post-created` | Social Service | Notification Service |
| `comment-created` | Social Service | Notification Service |
| `reaction-created` | Social Service | Notification Service |
| `message-sent` | Chat Service | Notification Service |

## Development Roadmap

1. Discovery Service, API Gateway, and Identity Service
2. User Service with friends, blocking, and privacy
3. Social Service with posts, comments, reactions, bookmarks, and hashtags
4. Chat Service with WebSocket, conversations, messages, and Redis presence
5. Kafka event publishing and consumers
6. Notification Service
7. Resilience4j, Docker Compose, GitHub Actions, and deployment preparation
