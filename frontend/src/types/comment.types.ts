import { ReactionSummaryResponse } from './reaction.types';

export interface CommentAuthorResponse {
  id: string;
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface CommentResponse {
  id: string;
  postId: string;
  parentCommentId?: string | null;
  author: CommentAuthorResponse;
  content: string;
  taggedUserIds?: string[];
  reactionsCount: number;
  reactionSummary?: ReactionSummaryResponse;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string | null;
  taggedUserIds?: string[];
}

export interface UpdateCommentRequest {
  content: string;
}
