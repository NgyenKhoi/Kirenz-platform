import { API_ENDPOINTS, publicSocialServiceClient, socialServiceClient } from '../config/api.config';
import { ApiResponse } from '../types/auth.types';
import { CreatePostRequest, CursorPage, MediaUploadResponse, PostImageResponse, PostResponse, SharePostRequest, TrendingHashtagResponse, UpdatePostRequest } from '../types/post.types';

export const postService = {
  uploadImages: async (files: File[]): Promise<MediaUploadResponse[]> => {
    return Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await socialServiceClient.post<ApiResponse<MediaUploadResponse>>(
          API_ENDPOINTS.MEDIA.POSTS,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data.data;
      })
    );
  },
  create: async (data: CreatePostRequest): Promise<PostResponse> => {
    const response = await socialServiceClient.post<ApiResponse<PostResponse>>(
      API_ENDPOINTS.POSTS.BASE,
      data
    );
    return response.data.data;
  },

  listFeed: async (): Promise<PostResponse[]> => {
    const response = await socialServiceClient.get<ApiResponse<PostResponse[]>>(
      API_ENDPOINTS.POSTS.BASE
    );
    return response.data.data;
  },

  listFeedPage: async (cursor?: string | null, limit = 20): Promise<CursorPage<PostResponse>> => {
    const response = await socialServiceClient.get<ApiResponse<CursorPage<PostResponse>>>(
      API_ENDPOINTS.POSTS.FEED,
      { params: { limit, ...(cursor ? { cursor } : {}) } }
    );
    return response.data.data;
  },

  explore: async (q: string, cursor?: string | null, limit = 20): Promise<CursorPage<PostResponse>> => {
    const response = await socialServiceClient.get<ApiResponse<CursorPage<PostResponse>>>(
      API_ENDPOINTS.POSTS.EXPLORE,
      { params: { q, limit, ...(cursor ? { cursor } : {}) } }
    );
    return response.data.data;
  },

  trending: async (limit = 10): Promise<TrendingHashtagResponse[]> => {
    const response = await socialServiceClient.get<ApiResponse<TrendingHashtagResponse[]>>(
      API_ENDPOINTS.POSTS.TRENDING,
      { params: { limit } }
    );
    return response.data.data;
  },

  listPublic: async (): Promise<PostResponse[]> => {
    const response = await publicSocialServiceClient.get<ApiResponse<PostResponse[]>>(
      API_ENDPOINTS.POSTS.PUBLIC
    );
    return response.data.data;
  },

  getPublicById: async (postId: string): Promise<PostResponse> => {
    const response = await publicSocialServiceClient.get<ApiResponse<PostResponse>>(
      API_ENDPOINTS.POSTS.PUBLIC_DETAIL(postId)
    );
    return response.data.data;
  },

  listMine: async (): Promise<PostResponse[]> => {
    const response = await socialServiceClient.get<ApiResponse<PostResponse[]>>(
      API_ENDPOINTS.POSTS.ME
    );
    return response.data.data;
  },

  listByUser: async (userId: string): Promise<PostResponse[]> => {
    const response = await socialServiceClient.get<ApiResponse<PostResponse[]>>(
      API_ENDPOINTS.POSTS.USER(userId)
    );
    return response.data.data;
  },

  listUserImages: async (userId: string): Promise<PostImageResponse[]> => {
    const response = await socialServiceClient.get<ApiResponse<PostImageResponse[]>>(
      API_ENDPOINTS.POSTS.USER_IMAGES(userId)
    );
    return response.data.data;
  },

  getById: async (postId: string): Promise<PostResponse> => {
    const response = await socialServiceClient.get<ApiResponse<PostResponse>>(
      API_ENDPOINTS.POSTS.DETAIL(postId)
    );
    return response.data.data;
  },

  update: async (postId: string, data: UpdatePostRequest): Promise<PostResponse> => {
    const response = await socialServiceClient.patch<ApiResponse<PostResponse>>(
      API_ENDPOINTS.POSTS.DETAIL(postId),
      data
    );
    return response.data.data;
  },

  share: async (postId: string, data: SharePostRequest): Promise<PostResponse> => {
    const response = await socialServiceClient.post<ApiResponse<PostResponse>>(
      API_ENDPOINTS.POSTS.SHARES(postId),
      data
    );
    return response.data.data;
  },

  remove: async (postId: string): Promise<void> => {
    await socialServiceClient.delete<ApiResponse<void>>(API_ENDPOINTS.POSTS.DETAIL(postId));
  },
};
