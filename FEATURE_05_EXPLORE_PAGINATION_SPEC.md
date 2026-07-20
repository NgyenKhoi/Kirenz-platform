# Feature 05 Explore Pagination And Infinite Scroll Specification

## Purpose

The mobile UI uses infinite scroll, but infinite scroll must be backed by a paginated API. The client initially requests a small page, renders it, and requests the next page only when the user approaches the bottom. The server must not load and serialize the entire post collection for every feed or Explore request.

This specification adds stable cursor pagination without changing the existing Feature 05 friendship, privacy, or block contracts.

## Current Limitation

`GET /api/posts` currently returns `ApiResponse<List<PostResponse>>` from all active posts before applying viewer visibility rules. This has four problems:

- response time and memory usage grow with the entire post collection;
- the mobile client waits for all posts before showing the first screen;
- client-side Explore search only sees an unbounded snapshot;
- offset pagination would duplicate or skip posts when new posts are inserted during scrolling.

The existing endpoint may remain temporarily for compatibility, but new mobile infinite scroll must use the cursor endpoints below.

## API Contracts

### Feed page

```http
GET /api/posts/feed?limit=20&cursor={opaqueCursor}
Authorization: Bearer {accessToken}
```

`cursor` is omitted for the first page. `limit` defaults to `20`, has a minimum of `1`, and a maximum of `50`.

### Explore post page

```http
GET /api/posts/explore?q={query}&limit=20&cursor={opaqueCursor}
Authorization: Bearer {accessToken}
```

Rules:

- trim `q`;
- require at least two characters after removing one optional leading `#`;
- match post content and hashtags case-insensitively;
- apply block, post privacy, and profile-access rules before returning rows;
- sort by `createdAt DESC, id DESC`;
- do not expose posts the viewer could not retrieve through post detail.

### Trending hashtags

```http
GET /api/posts/explore/trending?limit=10
Authorization: Bearer {accessToken}
```

Return hashtag counts computed from viewer-visible active posts in a bounded recent window. The initial implementation may use the latest 500 visible posts or the latest 30 days. The chosen window must be documented in the response or service configuration.

### Response envelope

```json
{
  "success": true,
  "message": "Posts retrieved successfully",
  "data": {
    "items": [],
    "nextCursor": "opaque-base64url-value",
    "hasMore": true
  }
}
```

`nextCursor` is `null` when `hasMore` is `false`.

```text
CursorPage<T> {
  items: List<T>
  nextCursor: String?
  hasMore: boolean
}
```

## Cursor Rules

The cursor is an opaque Base64 URL-safe value containing the last returned row's:

```text
createdAt
postId
```

The server owns cursor encoding and decoding. Clients must only store and return it.

The next-page predicate is logically:

```text
status = ACTIVE
AND (
  createdAt < cursor.createdAt
  OR (createdAt = cursor.createdAt AND id < cursor.postId)
)
```

Fetch `limit + 1` viewer-visible rows. Return at most `limit`; the extra row determines `hasMore`. Visibility filtering must occur before the final `hasMore` decision. A page containing many private or blocked posts must continue scanning until it fills the requested visible page or exhausts the source.

Invalid, malformed, expired, or unsupported cursors return HTTP `400` with a safe message. They must not fall back silently to the first page.

## Database Indexes

Add or verify MongoDB compound indexes aligned with the cursor queries:

```javascript
{ status: 1, createdAt: -1, _id: -1 }
{ userId: 1, status: 1, createdAt: -1, _id: -1 }
```

If normalized hashtags are persisted for server-side Explore search, also add an index appropriate to the selected query strategy. Do not introduce an unbounded regular-expression scan as the final production search design.

## Privacy And Block Requirements

- Blocked users must be excluded in both directions.
- `PUBLIC` posts are visible unless another access rule denies them.
- `FRIENDS_ONLY` posts require canonical friendship state.
- `PRIVATE` posts are visible only to their owner.
- Shared posts must retain the existing unavailable-original behavior.
- Deleted or newly private posts encountered between page requests are omitted without resetting the cursor.
- Counts and `hasMore` must describe viewer-visible results, not raw database rows.

## Mobile Infinite Scroll Behavior

1. Load the first page when the screen opens or performs a hard refresh.
2. Render the first page immediately.
3. Request `nextCursor` when the user scrolls near the end.
4. Permit only one load-more request at a time.
5. Deduplicate merged posts by canonical post id.
6. Keep existing content visible when load-more fails and show an inline Retry action.
7. A pull-to-refresh replaces the list from the first page and clears the previous cursor.
8. Stop requesting when `hasMore=false`.
9. Cache the merged list and cursor per authenticated account.
10. Feed, Explore, Profile, and Post Detail mutations continue reconciling shared post entities by id.

Infinite scroll is therefore the presentation behavior; cursor pagination is the backend data-loading mechanism that makes it efficient and stable.

## Compatibility And Migration

1. Add the new endpoints without changing the response shape of existing `GET /api/posts`.
2. Add repository/service/controller coverage for cursor validation, ordering, privacy, blocks, and end-of-list behavior.
3. Migrate Flutter Feed to `/api/posts/feed`.
4. Migrate Flutter Explore related posts to `/api/posts/explore` and trending to `/api/posts/explore/trending`.
5. Validate cached/offline reconciliation and cross-screen post mutations.
6. Deprecate the unpaginated endpoint only after web and mobile no longer depend on it.

## Acceptance Checklist

- [ ] First page never reads or serializes the full active-post collection.
- [ ] Repeated timestamps remain stable through the post-id tie breaker.
- [ ] Inserting a new post during scrolling does not duplicate or skip existing page items.
- [ ] Private and blocked rows never leak and do not produce an incorrect early end.
- [ ] Invalid cursors return a typed `400` response.
- [ ] Load-more failure preserves already-rendered posts and supports Retry.
- [ ] Pull-to-refresh resets pagination and returns the newest visible posts.
- [ ] Feed and Explore stop requesting after `hasMore=false`.
- [ ] Existing unpaginated consumers continue working during migration.
