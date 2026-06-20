import { API_ENDPOINTS, userServiceClient } from '../config/api.config';
import { ApiResponse } from '../types/auth.types';
import {
  FriendRequestResponse,
  FriendResponse,
  FriendStatusResponse,
  MutualFriendResponse,
  SendFriendRequest,
  UserSearchResponse,
} from '../types/friend.types';

export const friendService = {
  searchUsers: async (query: string, limit = 10): Promise<UserSearchResponse[]> => {
    const response = await userServiceClient.get<ApiResponse<UserSearchResponse[]>>(
      API_ENDPOINTS.FRIENDS.SEARCH,
      { params: { q: query, limit } }
    );
    return response.data.data;
  },
  sendRequest: async (data: SendFriendRequest): Promise<FriendRequestResponse> => {
    const response = await userServiceClient.post<ApiResponse<FriendRequestResponse>>(
      API_ENDPOINTS.FRIENDS.REQUESTS,
      data
    );
    return response.data.data;
  },

  getIncomingRequests: async (): Promise<FriendRequestResponse[]> => {
    const response = await userServiceClient.get<ApiResponse<FriendRequestResponse[]>>(
      API_ENDPOINTS.FRIENDS.INCOMING
    );
    return response.data.data;
  },

  getOutgoingRequests: async (): Promise<FriendRequestResponse[]> => {
    const response = await userServiceClient.get<ApiResponse<FriendRequestResponse[]>>(
      API_ENDPOINTS.FRIENDS.OUTGOING
    );
    return response.data.data;
  },

  acceptRequest: async (requestId: string): Promise<FriendResponse> => {
    const response = await userServiceClient.post<ApiResponse<FriendResponse>>(
      API_ENDPOINTS.FRIENDS.ACCEPT(requestId)
    );
    return response.data.data;
  },

  declineRequest: async (requestId: string): Promise<FriendRequestResponse> => {
    const response = await userServiceClient.post<ApiResponse<FriendRequestResponse>>(
      API_ENDPOINTS.FRIENDS.DECLINE(requestId)
    );
    return response.data.data;
  },

  cancelRequest: async (requestId: string): Promise<FriendRequestResponse> => {
    const response = await userServiceClient.delete<ApiResponse<FriendRequestResponse>>(
      API_ENDPOINTS.FRIENDS.CANCEL(requestId)
    );
    return response.data.data;
  },

  getFriends: async (): Promise<FriendResponse[]> => {
    const response = await userServiceClient.get<ApiResponse<FriendResponse[]>>(
      API_ENDPOINTS.FRIENDS.BASE
    );
    return response.data.data;
  },

  removeFriend: async (friendId: string): Promise<void> => {
    await userServiceClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.FRIENDS.REMOVE(friendId)
    );
  },

  getStatus: async (targetUserId: string): Promise<FriendStatusResponse> => {
    const response = await userServiceClient.get<ApiResponse<FriendStatusResponse>>(
      API_ENDPOINTS.FRIENDS.STATUS(targetUserId)
    );
    return response.data.data;
  },

  getMutualFriends: async (targetUserId: string): Promise<MutualFriendResponse[]> => {
    const response = await userServiceClient.get<ApiResponse<MutualFriendResponse[]>>(
      API_ENDPOINTS.FRIENDS.MUTUAL(targetUserId)
    );
    return response.data.data;
  },
};
