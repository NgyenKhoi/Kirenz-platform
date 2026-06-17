export interface CommentAuthorResponse {
  id: string;
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface CommentResponse {
  id: string;
  postId: string;
  author: CommentAuthorResponse;
  content: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}
