# Admin Features Task Tracker

Last updated: 2026-07-19

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
- [x] Implement reviewing, dismiss, note, moderation reason, and resolution workflow for content reports.
- [x] Persist every privileged action in `admin_actions`.
- [x] Add report workflow and authorization tests.

## Phase 3 - Social and notification moderation contracts

- [x] Add Social Service internal content-detail contract for posts/comments and attached media.
- [x] Add Social Service internal moderation commands: temporary hide and remove content.
- [x] Add Identity Service suspend/ban support and expose user-scoped violation history from Admin Service-owned audit records.
- [x] Define warning notification Kafka event keyed by admin action ID with idempotent consumer behavior.
- [x] Add Feign fallbacks/circuit breakers and partial-result semantics.

## Phase 4 - Dashboard aggregation

- [x] Add Identity Service user-growth time-series endpoint.
- [x] Add Social Service post/comment/reaction time-series endpoint.
- [x] Aggregate dashboard overview in Admin Service through Feign only.
- [x] Return partial-data metadata when a downstream service is unavailable.
- [x] Add short TTL caching for expensive dashboard queries.
- [x] Add the role-aware `/admin` frontend route and an admin-only route guard.
- [x] Integrate the supplied Dashboard UI/UX with Admin Service summary and growth APIs.
- [x] Add TanStack Query dashboard hooks with loading, empty, error, partial-data, and refresh states.
- [x] Add dashboard aggregation and partial-result contract tests.
- [ ] Run the live-stack dashboard E2E smoke path for admin authorization and rendered metrics.

## Phase 5 - System monitoring

- [x] Aggregate Identity, User, Social, Chat, and Notification health.
- [x] Show Kafka, Redis, PostgreSQL, and MongoDB component states without exposing credentials.
- [x] Query Eureka for registered service-instance counts.
- [x] Add timeouts, circuit breakers, and explicit `UNKNOWN` state handling.

## Phase 6 - Admin web application

- [ ] Complete shared admin shell navigation for Users, Reports, Monitoring, and Audit.
- [ ] Build user list, search, filters, detail, ban/unban, and warning UI.
- [ ] Build report queue, report detail, and moderation action UI.
- [ ] Build system-monitoring UI.
- [ ] Add TanStack Query hooks, loading/error states, and frontend tests.

## End-to-end integration track

- [ ] Dashboard: ADMIN loads aggregated metrics; USER receives 403/redirect; one unavailable downstream renders partial data.
- [ ] Users: ADMIN searches and filters users, performs warn/suspend/ban/unban, and sees the audit entry.
- [ ] Reports: USER submits a report; ADMIN reviews and resolves it; owning service state, audit, and notification are verified.
- [ ] Monitoring: stopping one dependency changes only its component state and the page remains usable.
- [x] Run frontend production build plus API contract smoke tests before each admin phase is marked complete.

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
| 2026-07-18 | `mvn test` in `admin-service/` after report workflow and audit implementation | Passed: 22 tests |
| 2026-07-18 | `mvn test` in `social-service/` after internal moderation contracts | Passed: 34 tests |
| 2026-07-18 | `mvn test` in `admin-service/` after Social moderation orchestration | Passed: 26 tests |
| 2026-07-18 | targeted suspension, summary, and login tests in `identity-service/` | Passed: 24 tests |
| 2026-07-18 | targeted user/report moderation tests in `admin-service/` | Passed: 15 tests |
| 2026-07-18 | `mvn test` in `admin-service/` after Phase 3 fallbacks and partial detail | Passed: 31 tests |
| 2026-07-18 | `mvn -Dtest=AdminUserQueryServiceTest test` in `identity-service/` after growth analytics | Passed: 3 tests |
| 2026-07-18 | `mvn test` in `social-service/` after activity analytics | Passed: 35 tests |
| 2026-07-18 | `mvn test` in `admin-service/` after dashboard aggregation | Passed: 33 tests |
| 2026-07-18 | `npm run lint` in `frontend/` after dashboard integration | Passed |
| 2026-07-18 | `npm run build` in `frontend/` after dashboard integration | Passed with existing bundle-size warnings |
| 2026-07-19 | `mvn -Dtest=MonitoringServiceTest test` in `admin-service/` | Passed: 3 tests covering UP, DOWN, and UNKNOWN |
| 2026-07-19 | `mvn test` in `admin-service/` after system monitoring | Passed: 36 tests |
| 2026-07-19 | module compile after adding Actuator | Identity, Social, Chat, and Notification passed; User Service remains blocked by pre-existing Lombok annotation-processing failures |

## Current implementation boundary

Admin user queries, bans, and temporary suspensions use protected Identity Service Feign contracts. Warning delivery uses Kafka, while user-scoped violation history reads Admin Service-owned `admin_actions`. Authenticated users can submit and query reports; admins can review, dismiss, hide/remove content, warn, suspend, or ban reported users with audited optimistic state transitions. Identity and Social expose bounded dashboard time series, while Admin Service aggregates summary and growth data through Feign with a short TTL cache and explicit partial-data metadata. Admin Service now also discovers Identity, User, Social, Chat, and Notification instances through Eureka, probes bounded Actuator health through circuit breakers, and reports sanitized Kafka, Redis, PostgreSQL, and MongoDB rollups with explicit UP, DOWN, and UNKNOWN states. No service reads another service's database directly. Phase 5 backend implementation is complete; live-stack E2E remains pending environment startup, and the Admin web application is next.
