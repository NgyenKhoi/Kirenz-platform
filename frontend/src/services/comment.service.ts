import { API_ENDPOINTS, socialServiceClient } from '../config/api.config';
import { ApiResponse } from '../types/auth.types';
import { CommentResponse, CreateCommentRequest, UpdateCommentRequest } from '../types/comment.types';

export const commentService = {
  create: async (postId: string, data: CreateCommentRequest): Promise<CommentResponse> => {
    const response = await socialServiceClient.post<ApiResponse<CommentResponse>>(
      API_ENDPOINTS.POSTS.COMMENTS(postId),
      data
    );
    return response.data.data;
  },

  listByPost: async (postId: string): Promise<CommentResponse[]> => {
    const response = await socialServiceClient.get<ApiResponse<CommentResponse[]>>(
      API_ENDPOINTS.POSTS.COMMENTS(postId)
    );
    return response.data.data;
  },

  update: async (
    postId: string,
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<CommentResponse> => {
    const response = await socialServiceClient.patch<ApiResponse<CommentResponse>>(
      API_ENDPOINTS.POSTS.COMMENT_DETAIL(postId, commentId),
      data
    );
    return response.data.data;
  },

  remove: async (postId: string, commentId: string): Promise<void> => {
    await socialServiceClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.POSTS.COMMENT_DETAIL(postId, commentId)
    );
  },
};
