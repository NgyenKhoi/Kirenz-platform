import { ReactionSummaryResponse } from './reaction.types';

export type MediaType = 'IMAGE' | 'VIDEO';

export interface PostMediaRequest {
  type: MediaType;
  url: string;
}

export interface CreatePostRequest {
  content: string;
  media?: PostMediaRequest[];
}

export interface UpdatePostRequest {
  content: string;
  media?: PostMediaRequest[];
}

export interface SharePostRequest {
  caption?: string;
}

export interface AuthorResponse {
  id: string;
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface PostMediaResponse {
  type: MediaType;
  url: string;
}

export interface SharedPostResponse {
  id: string;
  author?: AuthorResponse | null;
  content?: string | null;
  media: PostMediaResponse[];
  available: boolean;
  createdAt?: string | null;
}

export interface PostResponse {
  id: string;
  slug: string;
  author: AuthorResponse;
  content: string;
  originalPostId?: string | null;
  sharedPost?: SharedPostResponse | null;
  media: PostMediaResponse[];
  reactionsCount: number;
  reactionSummary?: ReactionSummaryResponse;
  commentsCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  createdAt: string;
  updatedAt: string;
}
