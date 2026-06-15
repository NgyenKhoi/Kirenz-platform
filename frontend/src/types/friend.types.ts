export type FriendRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

export type RelationshipStatus =
  | 'SELF'
  | 'FRIENDS'
  | 'OUTGOING_REQUEST'
  | 'INCOMING_REQUEST'
  | 'NONE';

export interface FriendRequestResponse {
  id: string;
  requesterId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string | null;
}

export interface FriendResponse {
  friendshipId: string;
  friendId: string;
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
