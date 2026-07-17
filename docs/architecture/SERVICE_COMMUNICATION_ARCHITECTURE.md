# Service Communication Architecture

## Purpose

This document describes how Kirenz services communicate after the API Gateway, Eureka, OpenFeign, Resilience4j, and Kafka integration work.

The platform uses two communication styles:

- Synchronous calls for data that is required to complete the current request.
- Asynchronous Kafka events for side effects that should not block the user request.

## API Gateway

The API Gateway is the single HTTP entry point for the frontend.

Port: `8080`

Responsibilities:

- Validate JWT access tokens for protected HTTP APIs.
- Permit public authentication and verification endpoints.
- Route requests to services by Eureka service name using `lb://...`.
- Proxy WebSocket handshakes for Chat and Notification services.
- Apply shared CORS and security behavior at the edge.

Gateway route ownership:

| Gateway path | Target service | Transport |
| --- | --- | --- |
| `/api/auth/**` | `identity-service` | HTTP |
| `/api/verification/**` | `identity-service` | HTTP |
| `/api/users/me/**` | `identity-service` | HTTP |
| `/api/users/internal/**` | `identity-service` | HTTP |
| `/api/users/*` | `identity-service` | HTTP |
| `/api/users/search` | `user-service` | HTTP |
| `/api/users/*/mutual-friends` | `user-service` | HTTP |
| `/api/friends/**` | `user-service` | HTTP |
| `/api/blocks/**` | `user-service` | HTTP |
| `/api/privacy/**` | `user-service` | HTTP |
| `/api/posts/**` | `social-service` | HTTP |
| `/api/comments/**` | `social-service` | HTTP |
| `/api/media/**` | `social-service` | HTTP |
| `/api/conversations/**` | `chat-service` | HTTP |
| `/api/messages/**` | `chat-service` | HTTP |
| `/api/presence/**` | `chat-service` | HTTP |
| `/api/notifications/**` | `notification-service` | HTTP |
| `/ws/chat/**` | `chat-service` `/ws` | WebSocket/SockJS |
| `/ws/notifications/**` | `notification-service` `/ws` | WebSocket/SockJS |

## Eureka Service Discovery

Discovery Service is the Eureka Server.

Port: `8761`

Registered Eureka clients:

- `api-gateway`
- `identity-service`
- `user-service`
- `social-service`
- `chat-service`
- `notification-service`

Services register with Eureka using `EUREKA_DEFAULT_ZONE`, which points to `http://discovery-service:8761/eureka/` in Docker Compose.

## OpenFeign Synchronous Calls

OpenFeign is used when a service needs remote data immediately. Feign clients now use Eureka service names only. They do not use hardcoded service URLs in the `@FeignClient` annotation.

Correct pattern:

```java
@FeignClient(name = "identity-service")
```

Pattern to avoid:

```java
@FeignClient(name = "identity-service", url = "http://localhost:8081")
```

Current synchronous service-to-service calls:

| Caller | Target | Purpose |
| --- | --- | --- |
| `user-service` | `identity-service` | Search users and fetch profile summaries for friends, mutual friends, and suggestions. |
| `social-service` | `identity-service` | Fetch author/commenter display profile data. |
| `social-service` | `user-service` | Check friendship/visibility before showing or interacting with posts. |
| `chat-service` | `identity-service` | Fetch conversation participant profile data. |
| `chat-service` | `user-service` | Check direct-message permission using privacy and relationship rules. |
| `notification-service` | `identity-service` | Fetch actor profile data and birthday users. |
| `notification-service` | `user-service` | Fetch user friends for birthday notifications. |

## Resilience4j Fault Tolerance

Services that call other services through OpenFeign include the Spring Cloud CircuitBreaker Resilience4j starter:

- `user-service`
- `social-service`
- `chat-service`
- `notification-service`

OpenFeign circuit breaker support is enabled with:

```yaml
spring:
  cloud:
    openfeign:
      circuitbreaker:
        enabled: true
```

Default Resilience4j behavior:

- Circuit breaker sliding window: `20` calls
- Minimum calls before calculating failure rate: `5`
- Failure threshold: `50%`
- Open-state wait duration: `10s`
- Half-open permitted calls: `3`
- Retry attempts: `3`
- Retry wait duration: `300ms`

Configured circuit breaker/retry instances:

- `identity-service`
- `user-service`

This keeps synchronous dependencies from cascading failures indefinitely. If a dependency is down or unstable, calls fail fast once the circuit opens.

## Kafka Asynchronous Events

Kafka is used for side effects that do not need to block the request that triggered them.

Current topics:

| Topic | Producer | Consumer | Purpose |
| --- | --- | --- | --- |
| `user-created` | `identity-service` | `user-service`, `notification-service` | Initialize user-domain state and create welcome notifications. |
| `notification-events` | `user-service`, `social-service` | `notification-service` | Create notifications for friend, post, comment, reaction, mention, and similar social events. |
| `message-sent` | `chat-service` | `notification-service` | Create message notifications for conversation recipients. |

## Request Flow Examples

### Login

1. Frontend sends `POST /api/auth/login` to API Gateway.
2. Gateway permits the public auth route.
3. Gateway routes to `identity-service` through Eureka.
4. Identity Service validates credentials and returns JWT tokens.

### View Feed

1. Frontend sends `GET /api/posts` to API Gateway with JWT.
2. Gateway validates JWT.
3. Gateway routes to `social-service` through Eureka.
4. Social Service may synchronously call:
   - `identity-service` for author profile data.
   - `user-service` for relationship/privacy checks.
5. Feign calls are protected by Resilience4j circuit breakers.

### Send Chat Message

1. Frontend connects to `ws://gateway/ws/chat` using SockJS/STOMP.
2. Gateway proxies `/ws/chat/**` to `chat-service` `/ws` through Eureka.
3. Chat Service validates the WebSocket token and saves the message.
4. Chat Service broadcasts the message to active conversation subscribers.
5. Chat Service publishes a `message-sent` Kafka event for each recipient.
6. Notification Service consumes `message-sent`, stores notifications, and pushes them to connected users.

## Runtime Rules

- Gateway routing must use Eureka service names.
- Feign clients must use service names and must not hardcode URLs.
- Synchronous calls should be used only when the caller needs data immediately.
- Kafka should be used for notifications, lifecycle events, and non-blocking side effects.
- Services still enforce their own business authorization; gateway authentication does not replace domain checks.
