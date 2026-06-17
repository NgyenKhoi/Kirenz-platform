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

export interface PostResponse {
  id: string;
  slug: string;
  author: AuthorResponse;
  content: string;
  media: PostMediaResponse[];
  reactionsCount: number;
  commentsCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  createdAt: string;
  updatedAt: string;
}
