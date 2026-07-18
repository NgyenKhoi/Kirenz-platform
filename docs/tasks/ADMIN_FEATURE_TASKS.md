# Admin Features Task Tracker

Last updated: 2026-07-18

Legend: `[x]` completed, `[~]` in progress, `[ ]` pending, `[!]` blocked.

## Phase 0 - Admin Service foundation

- [x] Audit the generated Admin Service against `rule.md` and current service patterns.
- [x] Normalize the generated nested project into the top-level `admin-service` module.
- [x] Align Java, Spring Boot, Spring Cloud, JWT, Feign, Eureka, Kafka, JPA, Redis, and Liquibase dependencies.
- [x] Configure port `8086`, `admin_db`, Eureka registration, Actuator health, Redis, and Kafka.
- [x] Add Admin Service-owned Liquibase baseline for `reports` and `admin_actions`.
- [x] Add stateless JWT authentication using the Identity Service token contract.
- [x] Require `ROLE_ADMIN` for `/api/admin/**`; keep `/api/reports/**` authenticated for future user report submission.
- [x] Add `GET /api/admin/ping` smoke endpoint with the standard API response envelope.
- [x] Add API Gateway routes for `/api/admin/**` and `/api/reports/**`.
- [x] Register Admin Service in Docker Compose and expose port `8086`.
- [x] Run Admin Service tests, Gateway tests, and Docker Compose config validation.

## Phase 1 - Identity Service admin contracts

- [x] Add internal admin summary endpoint: totals, new accounts, locked/deactivated accounts.
- [x] Add paginated registered-user search by name, username, or email.
- [x] Add account status and email-verification filters.
- [x] Add admin-only ban and unban commands with transition validation.
- [x] Publish or expose admin-action inputs without sharing the Identity database.
- [x] Add authorization, validation, repository, and controller tests.
- [x] Send warning notifications through Kafka and expose paginated admin-action history.

## Phase 2 - Reports and moderation audit

- [x] Implement report entities, enums, repositories, DTOs, mappers, and validation.
- [x] Submit reports for posts, comments, and users; retain story as an extensible target type.
- [x] Deduplicate repeated reports from the same reporter and target.
- [x] List/filter reports and load report detail with aggregate report count.
- [ ] Implement reviewing, dismiss, note, moderation reason, and resolution workflow.
- [ ] Persist every privileged action in `admin_actions`.
- [ ] Add report workflow and authorization tests.

## Phase 3 - Social and notification moderation contracts

- [ ] Add Social Service internal content-detail contract for posts/comments and attached media.
- [ ] Add Social Service internal moderation commands: temporary hide and remove content.
- [ ] Add Identity Service violation-history and suspend/ban support.
- [x] Define warning notification Kafka event keyed by admin action ID with idempotent consumer behavior.
- [ ] Add Feign fallbacks/circuit breakers and partial-result semantics.

## Phase 4 - Dashboard aggregation

- [ ] Add Identity Service user-growth time-series endpoint.
- [ ] Add Social Service post/comment/reaction time-series endpoint.
- [ ] Aggregate dashboard overview in Admin Service through Feign only.
- [ ] Return partial-data metadata when a downstream service is unavailable.
- [ ] Add short TTL caching for expensive dashboard queries.

## Phase 5 - System monitoring

- [ ] Aggregate Identity, User, Social, Chat, and Notification health.
- [ ] Show Kafka, Redis, PostgreSQL, and MongoDB component states without exposing credentials.
- [ ] Query Eureka for registered service-instance counts.
- [ ] Add timeouts, circuit breakers, and explicit `UNKNOWN` state handling.

## Phase 6 - Admin web application

- [ ] Add role-aware admin route guard and navigation.
- [ ] Build dashboard cards and growth/activity charts.
- [ ] Build user list, search, filters, detail, ban/unban, and warning UI.
- [ ] Build report queue, report detail, and moderation action UI.
- [ ] Build system-monitoring UI.
- [ ] Add TanStack Query hooks, loading/error states, and frontend tests.

## Verification log

Run from repository root unless a working directory is stated.

| Date | Command | Result |
|---|---|---|
| 2026-07-18 | `mvn test` in `admin-service/` | Passed: 4 tests |
| 2026-07-18 | `mvn test` in `api-gateway/` | Passed: 1 test |
| 2026-07-18 | `docker compose config --quiet` | Passed |
| 2026-07-18 | `mvn -Dtest=AdminUserQueryServiceTest test` in `identity-service/` | Passed: 2 tests |
| 2026-07-18 | `mvn test` in `identity-service/` | Existing failure: 81/83 passed; 2 `UserRepositoryTest` assertions expect domain username from `User#getUsername()`, which currently returns email for Spring Security |
| 2026-07-18 | `mvn test` in `admin-service/` after user actions | Passed: 11 tests |
| 2026-07-18 | targeted admin tests in `identity-service/` | Passed: 7 tests |
| 2026-07-18 | targeted listener/service tests in `notification-service/` | Passed: 5 tests |
| 2026-07-18 | `mvn test` in `admin-service/` after report query/submission implementation | Passed: 14 tests |

## Current implementation boundary

Admin user queries and account status changes now use Identity Service Feign contracts. Warning delivery uses Kafka, while `admin_actions` remains owned by Admin Service. Authenticated users can submit and query their reports; admins can filter reports and load aggregate detail. No service reads another service's database directly. Report state transitions, moderation orchestration, and dashboard aggregation remain pending.
