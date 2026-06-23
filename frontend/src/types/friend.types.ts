export type FriendRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

export type RelationshipStatus =
  | 'SELF'
  | 'FRIENDS'
  | 'OUTGOING_REQUEST'
  | 'INCOMING_REQUEST'
  | 'BLOCKED'
  | 'BLOCKED_BY_TARGET'
  | 'NONE';

export interface FriendRequestResponse {
  id: string;
  requesterId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string | null;
  // Enriched profile fields for the "other" user
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface FriendResponse {
  friendshipId: string;
  friendId: string;
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
}

export interface FriendStatusResponse {
  userId: string;
  targetUserId: string;
  status: RelationshipStatus;
}

export interface MutualFriendResponse {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface SendFriendRequest {
  receiverId: string;
}

export interface UserSearchResponse {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  relationshipStatus: RelationshipStatus;
}

export interface FriendSuggestionResponse {
  id: string;
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  mutualFriendCount: number;
}