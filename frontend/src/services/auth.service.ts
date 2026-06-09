import apiClient, { API_ENDPOINTS, STORAGE_KEYS } from '../config/api.config';
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  UserProfile,
  ApiResponse,
  RefreshTokenRequest,
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  UpdateProfileRequest,
} from '../types/auth.types';


export const authService = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    const loginData = response.data.data;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, loginData.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, loginData.refreshToken);

    return loginData;
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken } as RefreshTokenRequest
    );
    const loginData = response.data.data;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, loginData.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, loginData.refreshToken);

    return loginData;
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.ME
    );
    const userData = response.data.data;

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

    return userData;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.patch<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.ME,
      data
    );
    const userData = response.data.data;

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

    return userData;
  },


  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getCachedUser: (): UserProfile | null => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  // OTP Verification
  sendOTP: async (data: SendOTPRequest): Promise<SendOTPResponse> => {
    const response = await apiClient.post<ApiResponse<SendOTPResponse>>(
      API_ENDPOINTS.VERIFICATION.SEND_OTP,
      data
    );
    return response.data.data;
  },

  verifyOTP: async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
    const response = await apiClient.post<ApiResponse<VerifyOTPResponse>>(
      API_ENDPOINTS.VERIFICATION.VERIFY_OTP,
      data
    );
    return response.data.data;
  },
};
