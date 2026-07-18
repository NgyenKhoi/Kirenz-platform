import { API_ENDPOINTS, userServiceClient } from '../config/api.config';
import { ApiResponse } from '../types/auth.types';
import { PrivacySettingResponse, UpdatePrivacySettingRequest } from '../types/privacy.types';

export const privacyService = {
  getPrivacySettings: async (): Promise<PrivacySettingResponse> => {
    const response = await userServiceClient.get<ApiResponse<PrivacySettingResponse>>(
      API_ENDPOINTS.PRIVACY.ME
    );
    return response.data.data;
  },

  getUserPrivacySettings: async (userId: string): Promise<PrivacySettingResponse> => {
    const response = await userServiceClient.get<ApiResponse<PrivacySettingResponse>>(
      `/privacy/user/${userId}`
    );
    return response.data.data;
  },

  updatePrivacySettings: async (data: UpdatePrivacySettingRequest): Promise<PrivacySettingResponse> => {
    const response = await userServiceClient.put<ApiResponse<PrivacySettingResponse>>(
      API_ENDPOINTS.PRIVACY.ME,
      data
    );
    return response.data.data;
  },

  canSendDirectMessage: async (receiverId: string): Promise<boolean> => {
    const response = await userServiceClient.get<ApiResponse<boolean>>(
      API_ENDPOINTS.PRIVACY.CAN_MESSAGE(receiverId)
    );
    return response.data.data;
  },
};
