import { API_ENDPOINTS, socialServiceClient } from '../config/api.config';
import { ApiResponse } from '../types/auth.types';
import { ReactionSummaryResponse, ReactionType, ReactionUserResponse } from '../types/reaction.types';

export const reactionService = {

  listPostReactions: async (postId: string): Promise<ReactionUserResponse[]> => {
    const response = await socialServiceClient.get<ApiResponse<ReactionUserResponse[]>>(
      API_ENDPOINTS.POSTS.REACTIONS(postId)
    );
    return response.data.data;
  },

  listCommentReactions: async (commentId: string): Promise<ReactionUserResponse[]> => {
    const response = await socialServiceClient.get<ApiResponse<ReactionUserResponse[]>>(
      API_ENDPOINTS.COMMENTS.REACTIONS(commentId)
    );
    return response.data.data;
  },
  reactToPost: async (postId: string, type: ReactionType): Promise<ReactionSummaryResponse> => {
    const response = await socialServiceClient.post<ApiResponse<ReactionSummaryResponse>>(
      API_ENDPOINTS.POSTS.REACTIONS(postId),
      { type }
    );
    return response.data.data;
  },

  unreactToPost: async (postId: string): Promise<ReactionSummaryResponse> => {
    const response = await socialServiceClient.delete<ApiResponse<ReactionSummaryResponse>>(
      API_ENDPOINTS.POSTS.MY_REACTION(postId)
    );
    return response.data.data;
  },

  reactToComment: async (commentId: string, type: ReactionType): Promise<ReactionSummaryResponse> => {
    const response = await socialServiceClient.post<ApiResponse<ReactionSummaryResponse>>(
      API_ENDPOINTS.COMMENTS.REACTIONS(commentId),
      { type }
    );
    return response.data.data;
  },

  unreactToComment: async (commentId: string): Promise<ReactionSummaryResponse> => {
    const response = await socialServiceClient.delete<ApiResponse<ReactionSummaryResponse>>(
      API_ENDPOINTS.COMMENTS.MY_REACTION(commentId)
    );
    return response.data.data;
  },
};

