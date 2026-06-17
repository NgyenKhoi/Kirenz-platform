export interface BlockResponse {
  id: string;
  blockedUserId: string;
  createdAt: string;
}

export interface BlockStatusResponse {
  viewerId: string;
  targetUserId: string;
  blockedByViewer: boolean;
  blockedViewer: boolean;
}
