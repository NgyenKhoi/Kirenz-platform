# Web-to-Mobile Contract Remediation Plan

## 1. Objective

Make the current web/backend behavior the validated source for mobile implementation, remove known cross-client contradictions, and raise the mobile contract-readiness audit above 95% before Flutter feature work starts.

This plan does not invent mobile-only success states. A capability is `Ready for mobile` only when its request, response, error, state-reconciliation, and backend-gap behavior are explicit and match the repository.

## 2. Decisions

| Area | Contract decision |
| --- | --- |
| Chat versus social notifications | Chat messages use Chat Service conversation/user-queue state only. Notification Service must neither create nor expose `MESSAGE` social rows, and legacy `MESSAGE` rows must not affect list or unread count. |
| Explore | Until a dedicated discovery endpoint exists, Explore is a composed client contract: `GET /api/posts` supplies privacy-filtered posts, `GET /api/users/search?q=...` supplies people, and hashtag/content filtering plus trending ranking are client-side behavior matching the web implementation. |
| Relationship status | The exact values are `SELF`, `FRIENDS`, `OUTGOING_REQUEST`, `INCOMING_REQUEST`, `BLOCKED`, `BLOCKED_BY_TARGET`, and `NONE`. |
| Share post | Current request is `{ caption }` only. Shared posts are created as `PUBLIC` by the backend. No share privacy selector may be promised until the request contract changes. |
| Edit post tags | Current edit UI does not edit tags. `PATCH /api/posts/{id}` changes content, media, and privacy; existing tags remain unchanged. |
| Chat upload mapping | `/api/media/chat` returns flat upload metadata. The client maps `publicId` to `cloudinaryPublicId`, nests width/height/format/bytes under attachment metadata, and adds the original local filename and MIME type. |
| Local notifications | In-app banners and social list/realtime are MVP-capable. OS local-notification permission and display behavior require their own explicit mobile section; FCM/APNs remains post-MVP. |
| Chat feature order | Complete the transport spike and account-scoped connection manager before message publishing. Message UI may be built against an interface, but transport validation is an exit gate. |

## 3. Implementation Work

### 3.1 Backend and web blockers

- Stop consuming `message-sent` as a Notification Service social notification.
- Exclude any legacy `MESSAGE` rows from notification REST lists, unread counts, and mark-all operations.
- Keep the enum value only for database/backward compatibility until legacy data is retired.
- Merge realtime notification rows by notification id in the web shell instead of blindly prepending duplicates.
- Keep unread count queue payload authoritative.
- Enforce at least three unique participants including the creator for group creation.
- Preserve direct-message privacy denial as HTTP 403 instead of converting it to a generic 400.
- Stop logging raw chat message content; retain only conversation id, content length, attachment count, and actor id.

### 3.2 Contract documentation

- Add exact request/response mappings and enum values to affected feature documents.
- Specify Explore as a composed contract and document its current scalability gap.
- Correct share/edit-tag capability boundaries.
- Define chat upload-to-attachment transformation.
- Remove the Feature 07/08 dependency cycle.
- Add local-notification permission, display, dedupe, and routing behavior.
- Add per-feature readiness, accessibility, logging, and manual-acceptance metadata.

## 4. Verification Gates

| Gate | Required evidence |
| --- | --- |
| Notification separation | Notification Service tests prove `MESSAGE` is excluded from list/count/mark-all, and no `message-sent` listener creates rows. |
| Web realtime dedupe | Frontend lint/build passes and notification merge is id-based. |
| Backend compile | Affected Maven modules compile/test successfully. |
| Contract traceability | Every documented endpoint/enum/DTO maps to a source declaration or is labeled `Backend gap`. |
| Feature completeness | Each numbered spec contains status, exact contracts, UI/state/error/cache/realtime rules, accessibility/logging requirements, and an acceptance checklist. |
| Final audit | No known P0/P1 contradiction remains; contract-readiness score is at least 95%. |

## 5. Implemented And Verified Baseline

Implemented source changes:

- Notification Service no longer consumes `message-sent`.
- Social notification list/count/mark-all repository queries exclude legacy `MESSAGE` rows.
- Web notification REST loads list/count independently, merges socket rows by id, preserves canonical count, exposes actionable errors, and disables duplicate mark-all submission.
- Web `FRIEND_ACCEPT` routing uses `actorId`; its `targetId` is a friendship id, not a user id.
- Chat WebSocket logging no longer records raw message content.
- Group creation deduplicates participant ids and rejects fewer than three unique participants including the creator.
- Direct-message privacy denial remains `AccessDeniedException`/HTTP 403; dependency-check failure remains a distinct backend error.
- All nine feature specs now name the source-validated request/response DTOs and enums needed by Flutter repositories.

Verification completed on 2026-07-13:

- `notification-service`: `mvn test` passed, 4 tests, 0 failures/errors.
- `frontend`: `npm run lint` passed.
- `frontend`: `npm run build` passed; only existing chunk-size/dynamic-import warnings remain.
- `chat-service`: `mvn test` passed, 4 tests, 0 failures/errors, including group cardinality/deduplication and direct-message permission regression tests.
- Repository: `git diff --check` passed.

Validated source anchors:

| Contract | Source |
| --- | --- |
| Relationship enum values | `user-service/.../FriendService.java` and `frontend/src/types/friend.types.ts`. |
| Explore composition | `frontend/src/Explore.tsx`, PostController feed, and UserRelationshipController search. |
| Post create/edit/share bodies | Social Service post request DTOs and `PostService`. |
| Chat upload transformation | `MediaUploadResponse`, chat `Attachment`, and `frontend/src/Chat.tsx`. |
| Notification separation/routing | Notification listener/repository/service and event producers in User/Social services. |

## 6. Final Contract-Readiness Audit

Documentation readiness is **97% (44/45 checks)** on 2026-07-13. Nine feature specs were checked across endpoint/action mapping, exact DTO/enums, error/gap classification, cache/realtime reconciliation, and manual handoff behavior. No known P0/P1 contract contradiction remains.

The one open integration check is Feature 08 physical-device transport validation for SockJS/native STOMP, CONNECT authorization, heartbeat, reconnect, and token replacement through Gateway on Android/iOS. It remains a named `Transport gate`; the Flutter client must not claim realtime completion before this spike passes.

## 7. Deferred Backend Gaps

These remain explicit gaps and do not block documenting current behavior accurately:

- Dedicated paginated Explore/search API.
- Avatar and cover delete endpoints.
- Post/feed/comment/notification pagination.
- Orphan upload cleanup.
- Reliable chat publish acknowledgement/idempotency.
- Native mobile STOMP endpoint if the chosen Dart client cannot use SockJS.
- Push device-token/preferences endpoints.

