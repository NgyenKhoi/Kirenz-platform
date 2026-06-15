# User Service API

Base path:

```text
/api/friends
```

Authentication:

* All endpoints require `Authorization: Bearer <access-token>`.
* `user-service` validates the JWT using the same `JWT_SECRET` as Identity Service.
* User identity is taken from the JWT subject.

## Friends Requirements

User Service owns friendship state. It stores user IDs as UUID values from Identity Service and does not use foreign keys to Identity Service tables.

Supported flows:

* Send friend request
* View incoming friend requests
* View outgoing friend requests
* Accept friend request
* Decline friend request
* Cancel outgoing friend request
* List friends
* Remove friend
* Check relationship status

Rules:

* A user cannot send a friend request to themselves.
* A user cannot send a duplicate pending request.
* A user cannot send a request when both users are already friends.
* If the target user already sent a pending request, the API returns conflict instead of creating a second inverse request.
* Friendships are stored as normalized user pairs so each friendship has only one row.

## Endpoints

### Send Friend Request

```http
POST /api/friends/requests
```

Request:

```json
{
  "receiverId": "00000000-0000-0000-0000-000000000000"
}
```

### Incoming Requests

```http
GET /api/friends/requests/incoming
```

### Outgoing Requests

```http
GET /api/friends/requests/outgoing
```

### Accept Request

```http
POST /api/friends/requests/{requestId}/accept
```

### Decline Request

```http
POST /api/friends/requests/{requestId}/decline
```

### Cancel Outgoing Request

```http
DELETE /api/friends/requests/{requestId}
```

### List Friends

```http
GET /api/friends
```

### Remove Friend

```http
DELETE /api/friends/{friendId}
```

### Relationship Status

```http
GET /api/friends/status/{targetUserId}
```

Possible status values:

* `SELF`
* `FRIENDS`
* `OUTGOING_REQUEST`
* `INCOMING_REQUEST`
* `NONE`

## Tables

User Service currently owns:

* `friend_requests`
* `friendships`
