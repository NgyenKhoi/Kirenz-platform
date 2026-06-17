import { API_ENDPOINTS, userServiceClient } from '../config/api.config';
import { ApiResponse } from '../types/auth.types';
import { BlockResponse, BlockStatusResponse } from '../types/block.types';

export const blockService = {
  blockUser: async (blockedUserId: string): Promise<BlockResponse> => {
    const response = await userServiceClient.post<ApiResponse<BlockResponse>>(
      API_ENDPOINTS.BLOCKS.USER(blockedUserId)
    );
    return response.data.data;
  },

  unblockUser: async (blockedUserId: string): Promise<void> => {
    await userServiceClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.BLOCKS.USER(blockedUserId)
    );
  },

  getBlockedUsers: async (): Promise<BlockResponse[]> => {
    const response = await userServiceClient.get<ApiResponse<BlockResponse[]>>(
      API_ENDPOINTS.BLOCKS.BASE
    );
    return response.data.data;
  },

  getBlockStatus: async (targetUserId: string): Promise<BlockStatusResponse> => {
    const response = await userServiceClient.get<ApiResponse<BlockStatusResponse>>(
      API_ENDPOINTS.BLOCKS.STATUS(targetUserId)
    );
    return response.data.data;
  },
};
