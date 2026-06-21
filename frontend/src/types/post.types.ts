import { ReactionSummaryResponse } from './reaction.types';

export type MediaType = 'IMAGE' | 'VIDEO';
export type PostPrivacy = 'PUBLIC' | 'FRIENDS' | 'ONLY_ME';

export interface PostMediaRequest {
  type: MediaType;
  url: string;
  publicId?: string | null;
}

export interface CreatePostRequest {
  content: string;
  media?: PostMediaRequest[];
  privacy?: PostPrivacy;
}

export interface UpdatePostRequest {
  content: string;
  media?: PostMediaRequest[];
  privacy?: PostPrivacy;
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
  publicId?: string | null;
}

export interface SharedPostResponse {
  id: string;
  author?: AuthorResponse | null;
  content?: string | null;
  privacy?: PostPrivacy | null;
  media: PostMediaResponse[];
  available: boolean;
  createdAt?: string | null;
}

export interface PostResponse {
  id: string;
  slug: string;
  author: AuthorResponse;
  content: string;
  privacy: PostPrivacy;
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

export interface MediaUploadResponse {
  type: MediaType;
  url: string;
  publicId?: string | null;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  bytes?: number | null;
}

export interface PostImageResponse {
  postId: string;
  url: string;
  publicId?: string | null;
  createdAt: string;
}
