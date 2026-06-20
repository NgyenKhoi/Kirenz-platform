import { API_ENDPOINTS, socialServiceClient } from '../config/api.config';
import { ApiResponse } from '../types/auth.types';
import { CreatePostRequest, PostResponse, SharePostRequest, UpdatePostRequest } from '../types/post.types';

export const postService = {
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

  listMine: async (): Promise<PostResponse[]> => {
    const response = await socialServiceClient.get<ApiResponse<PostResponse[]>>(
      API_ENDPOINTS.POSTS.ME
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
