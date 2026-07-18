# Kirenz Admin and Moderation Implementation Plan

## 1. Objective

Implement a production-oriented administration module for Kirenz with four capabilities:

1. Dashboard analytics aggregated from Identity, Social, and Admin domains.
2. User search, filtering, ban/unban/suspend, warning, and admin action history.
3. User-submitted reports and an end-to-end moderation workflow for posts, comments, and accounts.
4. Microservice and infrastructure monitoring through service discovery and health indicators.

The frontend must call one administration API. It must not query multiple service databases or combine raw service data in the browser.

## 2. Current Project Status

### 2.1 Existing capabilities that can be reused

- JWT access tokens already contain `userId`, `email`, `username`, and `role` claims.
- Backend JWT filters already create `ROLE_USER`, `ROLE_MODERATOR`, or `ROLE_ADMIN` authorities.
- Identity PostgreSQL already stores `role`, `status`, `email_verified`, `created_at`, and `updated_at`.
- Existing roles are `USER`, `MODERATOR`, and `ADMIN`.
- Existing account statuses are `ACTIVE`, `BANNED`, and `DEACTIVATED`.
- Login already refuses a `BANNED` account.
- Posts and comments already have `ACTIVE`, `INACTIVE`, and `DELETED` statuses. `INACTIVE` can represent temporarily hidden content and `DELETED` can represent removed content.
- Social Service owns post, comment, and reaction timestamps in MongoDB, so it can produce activity time series.
- Notification Service already consumes `notification-events` from Kafka and supports real-time in-app delivery.
- Eureka and API Gateway already exist.
- API Gateway and Discovery Service already include Spring Boot Actuator.
- Frontend `UserProfile` already has `role` and `status` fields, although the Identity response DTO must be checked/fixed because its current DTO does not expose `status`.

### 2.2 Missing capabilities

- No Admin Service or admin aggregation endpoint.
- No admin dashboard route or role-based frontend guard.
- No user administration endpoint in Identity Service.
- No user registration analytics endpoint.
- No `SUSPENDED` status or `suspendedUntil` field.
- No report entity, report repository, report API, report status, or moderation outcome.
- No moderation action/audit table.
- No internal Social Service analytics or moderation endpoint.
- No notification type for an admin warning.
- Identity, User, Social, Chat, and Notification services do not currently include Actuator dependencies, despite some security configurations allowing `/actuator/**`.
- No custom Kafka health indicator is present.
- The root Maven POM references a missing `shared-lib` and omits several runtime modules. Module-level Maven commands must be used until the parent POM is repaired.
- Docker Compose currently references PostgreSQL and MongoDB hosts but does not define those database containers. Admin Service deployment must not assume they are created automatically.

## 3. Architecture Decision

Add a new `admin-service` on port `8086`.

### Admin Service responsibilities

- Own the moderation report lifecycle.
- Own the immutable admin action/audit history.
- Aggregate dashboard data from Identity Service, Social Service, and its own report database.
- Orchestrate user moderation by calling Identity Service.
- Orchestrate content moderation by calling Social Service.
- Publish warning notifications through Kafka.
- Aggregate service discovery and health information.
- Expose the only `/api/admin/**` API consumed by the admin web UI.

### Admin Service must not

- Read Identity, User, Social, Chat, or Notification databases directly.
- Update user or content data locally.
- duplicate complete user, post, or comment documents.
- trust a frontend role check as authorization.

### Service interaction

```text
Admin Web UI
    |
    v
API Gateway /api/admin/**
    |
    v
Admin Service :8086 ----Feign----> Identity Service :8081
    |              |              user list/metrics/status change
    |              |
    |              +----Feign----> Social Service :8083
    |                             content detail/metrics/moderation
    |
    +----Kafka notification-events----> Notification Service :8085
    |
    +----DiscoveryClient/health----> Eureka and service Actuator endpoints
    |
    +----PostgreSQL admin_db
         reports, admin_actions
```

## 4. Security Design

### 4.1 Route authorization

- `POST /api/reports`: any authenticated user.
- `GET /api/reports/me`: any authenticated user, limited to the caller's reports.
- `/api/admin/**`: `ROLE_ADMIN` only for the first delivery.
- `ROLE_MODERATOR` can be enabled later with a restricted permission matrix.
- Internal Identity and Social admin endpoints must require `ROLE_ADMIN`; they must never be added to an existing `permitAll` internal matcher.

### 4.2 Defense rules

- Backend authority is authoritative; hiding the menu in React is only UX.
- Admin cannot ban, suspend, or demote their own account.
- Admin cannot ban another `ADMIN` until a `SUPER_ADMIN` policy exists.
- Every state-changing admin command must write an audit entry, including failed/rejected attempts where useful.
- Every moderation command requires a structured reason. Free-form notes are supplemental.
- Reporters must not receive private admin notes.
- Restricted/deleted content is accessible only through an admin-authorized moderation endpoint.
- Pagination limits must be capped server-side.
- Search values must be normalized and safely bound as repository parameters.

### 4.3 Token limitation to address

The access token lifetime is currently 15 minutes. Banning a user blocks the next login, but an already-issued stateless token may remain usable until expiry. MVP acceptance should document this maximum delay. A follow-up hardening task should add a token version or distributed banned-user check at the Gateway/services for immediate revocation.

## 5. Persistence Design

Admin Service owns PostgreSQL database `admin_db` managed by Liquibase.

### 5.1 `reports`

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| reporter_id | UUID | Authenticated reporter |
| target_type | VARCHAR(20) | POST, COMMENT, USER; STORY reserved |
| target_id | VARCHAR(255) | Mongo ID or UUID string |
| reason | VARCHAR(50) | Structured report reason |
| description | VARCHAR(1000) | Optional reporter explanation |
| status | VARCHAR(20) | PENDING, REVIEWING, RESOLVED, DISMISSED |
| resolution | VARCHAR(30) | NO_VIOLATION, CONTENT_REMOVED, CONTENT_HIDDEN, USER_WARNED, USER_SUSPENDED, USER_BANNED |
| assigned_admin_id | UUID | Nullable |
| admin_note | VARCHAR(2000) | Private moderation note |
| moderation_reason | VARCHAR(50) | Structured decision reason |
| created_at | TIMESTAMPTZ | Indexed |
| updated_at | TIMESTAMPTZ | Audit timestamp |
| resolved_at | TIMESTAMPTZ | Nullable |

Recommended partial unique index: one non-dismissed/non-resolved report per reporter and target. Multiple different reporters can report the same target.

### 5.2 `admin_actions`

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| admin_id | UUID | Acting administrator |
| action_type | VARCHAR(50) | REPORT_REVIEW_STARTED, REPORT_DISMISSED, CONTENT_HIDDEN, CONTENT_REMOVED, WARNING_SENT, USER_SUSPENDED, USER_BANNED, USER_UNBANNED |
| target_type | VARCHAR(20) | REPORT, POST, COMMENT, USER |
| target_id | VARCHAR(255) | Target identifier |
| report_id | UUID | Nullable report reference |
| moderation_reason | VARCHAR(50) | Structured reason |
| note | VARCHAR(2000) | Optional private note |
| metadata | JSONB | Before/after state and safe diagnostic context |
| created_at | TIMESTAMPTZ | Immutable and indexed |

Audit records must be append-only through the application API.

### 5.3 Identity migration

Add:

- `SUSPENDED` to the account status constraint.
- `suspended_until TIMESTAMPTZ NULL`.
- `moderation_reason VARCHAR(255) NULL`.

Login behavior:

- `BANNED`: reject until explicitly unbanned.
- `SUSPENDED` and `suspended_until > now`: reject with a controlled 403.
- expired suspension: reactivate transactionally during authentication or through a scheduled cleanup.
- `DEACTIVATED`: remain user-driven/system deactivation, not a moderation suspension.

## 6. API Contracts

All responses use the existing `ApiResponse<T>` envelope.

### 6.1 Admin dashboard

`GET /api/admin/dashboard/summary`

Returns:

- total registered users.
- registrations today, current week, and current month.
- banned, suspended, and deactivated account counts.
- pending/reviewing report counts.
- total active posts/comments/reactions.

`GET /api/admin/dashboard/user-growth?granularity=DAY&from=&to=`

`GET /api/admin/dashboard/content-growth?granularity=DAY&from=&to=`

Series rows use `{ period, count }` or `{ period, posts, comments, reactions }`. The API caps the requested range and fills missing periods with zero in Admin Service.

### 6.2 User management

`GET /api/admin/users?q=&status=&emailVerified=&page=0&size=20&sort=createdAt,desc`

Response rows:

- id, displayName, username, email, avatarUrl.
- role, status, emailVerified.
- createdAt, lastLoginAt, suspendedUntil.

Commands:

- `POST /api/admin/users/{id}/ban`
- `POST /api/admin/users/{id}/unban`
- `POST /api/admin/users/{id}/suspend`
- `POST /api/admin/users/{id}/warning`
- `GET /api/admin/users/{id}/actions`

Command body:

```json
{
  "moderationReason": "HARASSMENT",
  "note": "Repeated targeted abuse",
  "suspendedUntil": "2026-07-25T00:00:00Z"
}
```

### 6.3 User report submission

- `POST /api/reports`
- `GET /api/reports/me?page=0&size=20`

Create body:

```json
{
  "targetType": "POST",
  "targetId": "mongo-object-id",
  "reason": "HARASSMENT",
  "description": "Optional explanation"
}
```

Admin report API:

- `GET /api/admin/reports?status=&targetType=&reason=&page=&size=`
- `GET /api/admin/reports/{id}`
- `POST /api/admin/reports/{id}/review`
- `POST /api/admin/reports/{id}/dismiss`
- `POST /api/admin/reports/{id}/resolve`

Report detail aggregates:

- report and reporter-safe information.
- live/snapshot target content and media.
- target author.
- total reports for the same target.
- previous upheld violations for the author.
- admin action timeline.

Resolve body:

```json
{
  "action": "REMOVE_CONTENT",
  "moderationReason": "HATE_SPEECH",
  "adminNote": "Confirmed after review",
  "suspendedUntil": null
}
```

Supported actions:

- `NO_VIOLATION`
- `HIDE_CONTENT`
- `REMOVE_CONTENT`
- `SEND_WARNING`
- `SUSPEND_USER`
- `BAN_USER`

The server maps actions to final outcomes and does not trust an arbitrary client-supplied outcome.

### 6.4 Internal Identity API

- `GET /api/admin/internal/users/metrics`
- `GET /api/admin/internal/users/growth`
- `GET /api/admin/internal/users`
- `GET /api/admin/internal/users/{id}`
- `POST /api/admin/internal/users/{id}/ban`
- `POST /api/admin/internal/users/{id}/unban`
- `POST /api/admin/internal/users/{id}/suspend`

These endpoints remain owned and authorized by Identity Service.

### 6.5 Internal Social API

- `GET /api/admin/internal/social/metrics`
- `GET /api/admin/internal/social/growth`
- `GET /api/admin/internal/content/{targetType}/{targetId}`
- `POST /api/admin/internal/content/{targetType}/{targetId}/hide`
- `POST /api/admin/internal/content/{targetType}/{targetId}/remove`

Social Service validates supported target types and returns a normalized moderation content DTO.

### 6.6 Monitoring

`GET /api/admin/monitoring`

Returns one record per component:

- service name.
- UP, DOWN, or UNKNOWN.
- registered Eureka instance count.
- per-instance host/port/status where available.
- response latency and last checked time.
- relevant health components without secrets.

Components:

- Identity, User, Social, Chat, Notification, Admin, API Gateway, Discovery.
- Kafka.
- Redis.
- PostgreSQL aggregate status from relational service health.
- MongoDB aggregate status from document service health.

## 7. Metrics Implementation

### 7.1 Identity metrics

Use repository aggregate queries in Identity Service:

- `count()` for total users.
- `countByCreatedAtGreaterThanEqual` for today/week/month.
- `countByStatus` for BANNED, SUSPENDED, DEACTIVATED.
- native PostgreSQL `date_trunc` query or a projection for daily/monthly growth.

Define week boundaries consistently using application timezone configuration; store/query timestamps in UTC.

### 7.2 Social metrics

Use `MongoTemplate` aggregation inside Social Service, not Admin Service:

- match relevant active/non-deleted status.
- group `createdAt` by day or month.
- return counts for posts, comments, and reactions.
- expose only aggregate DTOs to Admin Service.

### 7.3 Report metrics

Admin Service counts PENDING and REVIEWING reports from its own PostgreSQL database.

## 8. Moderation Workflow

```text
PENDING
  |-- mark reviewing --> REVIEWING
  |-- dismiss ---------> DISMISSED / NO_VIOLATION
  |-- resolve action --> RESOLVED / selected server outcome

REVIEWING
  |-- dismiss ---------> DISMISSED / NO_VIOLATION
  |-- resolve action --> RESOLVED / selected server outcome

RESOLVED or DISMISSED
  |-- terminal for MVP; reopening requires a future explicit audited command
```

Every transition uses optimistic/transactional validation so two admins cannot silently overwrite each other. An action that calls another service is recorded only after the remote command succeeds. If audit persistence fails after a successful remote command, log a high-severity reconciliation event; a later enhancement can use an outbox/saga.

## 9. Warning Notification

Add `ADMIN_WARNING` to Notification Service.

Admin Service publishes to `notification-events`:

```json
{
  "type": "ADMIN_WARNING",
  "actorId": "admin-uuid",
  "receiverId": "target-user-uuid",
  "targetId": "report-or-content-id",
  "message": "Your account received a moderation warning.",
  "createdAt": "..."
}
```

Do not put private admin notes or sensitive report descriptions in the notification message.

## 10. System Monitoring Design

### Phase-one monitoring

1. Add Actuator dependency to all business services.
2. Expose only `health` and `info` on internal service ports.
3. Admin Service uses Eureka `DiscoveryClient` to count registered instances.
4. Admin Service calls each discovered instance's `/actuator/health` with strict timeout and isolated failure handling.
5. Database health is derived from each owning service's health components.
6. Admin Service uses Kafka AdminClient for a bounded broker check.
7. Admin Service uses a Redis connection factory `PING` for cache health.

One unavailable service must not fail the entire monitoring response. It returns DOWN/UNKNOWN for that component.

### Security note

Actuator health details must not be publicly routed by API Gateway. Detailed health is for the internal network and admin aggregation only. Public health probes should return minimal status.

## 11. Frontend Plan

Add:

- `/admin` route with `AdminRoute` checking authentication and `user.role === 'ADMIN'`.
- A backend 403 remains authoritative if role data is stale.
- `admin.service.ts` for transport.
- TanStack Query hooks for dashboard, users, reports, audit, and monitoring.
- An Admin shell with Overview, Users, Reports, Monitoring, and Audit tabs.

### Overview

- Summary cards.
- User growth SVG chart.
- Post/comment/reaction SVG chart.
- Time range and daily/monthly granularity controls.
- Loading, empty, partial-data, and error states.

### Users

- Debounced search.
- Status and email-verification filters.
- Server pagination.
- Ban/unban/suspend/warn confirmation dialogs.
- Required moderation reason and optional note.
- User action-history drawer.

### Reports

- Status/type/reason filters.
- Detail drawer with content, media, author, reporter description, same-target count, and prior violations.
- Review, dismiss, and resolve actions.
- Required reason/note validation and disabled pending controls.

### Monitoring

- Service cards with status, instances, latency, and last check.
- Infrastructure cards for Kafka, Redis, PostgreSQL, and MongoDB.
- Manual refresh plus a conservative polling interval only while the tab is visible.

## 12. Implementation Phases

### Phase 0 — Foundation and security

- Create `admin-service` skeleton, port 8086, Eureka, JWT, Feign, Kafka, PostgreSQL, Liquibase.
- Add Gateway route.
- Add Docker Compose service/environment.
- Implement `ROLE_ADMIN` backend guard and current-admin helper.
- Repair/add module-level verification commands; do not block on the broken root POM.

Acceptance: non-admin receives 403 for `/api/admin/**`; admin reaches a health/identity endpoint.

### Phase 1 — User management and identity metrics

- Identity migrations for suspension.
- Admin user list/search/filter/pagination.
- Ban, unban, suspend.
- Summary and user-growth metrics.
- Admin Service orchestration and audit writes.
- Frontend Users and Overview user cards/chart.

Acceptance: admin actions change login behavior, are audited, and self/admin protection works.

### Phase 2 — Reports and content moderation

- Admin report schema and public authenticated report submission.
- Social content detail, hide, remove, and aggregate metrics.
- Report list/detail/review/dismiss/resolve.
- Prior violation and same-target aggregation.
- Warning notification via Kafka.
- Frontend Reports workflow and content chart.

Acceptance: a user reports a post/comment/account; admin resolves it; content/account state changes in the owning service; audit and notification are visible.

### Phase 3 — Monitoring

- Add Actuator to services.
- Eureka instance aggregation.
- Service health calls with timeout.
- Kafka/Redis checks and database health rollups.
- Frontend Monitoring tab.

Acceptance: stopping one service changes only that service to DOWN and does not break the admin page.

### Phase 4 — Hardening and documentation

- Add integration/authorization tests.
- Add concurrency/idempotency tests for report resolution.
- Validate pagination/range limits.
- Redact secrets and private notes.
- Update architecture, use cases, database documentation, and MSS301 report.
- Capture admin screenshots.

## 13. Verification Matrix

| Area | Required verification |
|---|---|
| Identity | Repository/service/controller tests for metrics, filtering, ban/unban/suspend, self/admin protection, login status |
| Social | Mongo aggregation tests and moderation authorization/state tests |
| Admin | Report transitions, duplicate report policy, audit writes, orchestration failures, role authorization |
| Notification | `ADMIN_WARNING` Kafka mapping and persistence test |
| Gateway | Admin route requires JWT and public report route routing is correct |
| Frontend | `npm run lint`, production build, role route guard, mutation error UX |
| End-to-end | USER submits report; ADMIN reviews/resolves; target state, audit, and notification verified |
| Monitoring | UP, DOWN, timeout, missing Eureka instance, Kafka failure, Redis failure, partial response |

## 14. Time-Priority Recommendation

Because delivery time is limited, the minimum credible course-demo scope is:

1. Admin Service with real role protection.
2. User summary metrics and user list/search/filter.
3. Ban/unban and immutable admin action history.
4. Post/comment/account reports.
5. Review, dismiss, remove/hide content, warn, suspend, and ban workflows.
6. Social activity chart.
7. Eureka instance count and per-service UP/DOWN.
8. Kafka/Redis/PostgreSQL/MongoDB summarized health.

Story reports, advanced moderator permission matrices, immediate token revocation, report reopening, automatic moderation, and long-term metrics warehousing are explicitly phase-two enhancements after the demo-critical workflow is stable.
