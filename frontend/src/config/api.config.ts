import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ErrorResponse, LoginResponse } from '../types/auth.types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
export const USER_SERVICE_BASE_URL = import.meta.env.VITE_USER_SERVICE_BASE_URL || 'http://localhost:8082/api';
export const SOCIAL_SERVICE_BASE_URL = import.meta.env.VITE_SOCIAL_SERVICE_BASE_URL || 'http://localhost:8083/api';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
  },
  USER: {
    ME: '/users/me',
  },
  VERIFICATION: {
    SEND_OTP: '/verification/send-otp',
    VERIFY_OTP: '/verification/verify-otp',
  },
  FRIENDS: {
    BASE: '/friends',
    REQUESTS: '/friends/requests',
    INCOMING: '/friends/requests/incoming',
    OUTGOING: '/friends/requests/outgoing',
    ACCEPT: (requestId: string) => `/friends/requests/${requestId}/accept`,
    DECLINE: (requestId: string) => `/friends/requests/${requestId}/decline`,
    CANCEL: (requestId: string) => `/friends/requests/${requestId}`,
    REMOVE: (friendId: string) => `/friends/${friendId}`,
    STATUS: (targetUserId: string) => `/friends/status/${targetUserId}`,
    MUTUAL: (targetUserId: string) => `/users/${targetUserId}/mutual-friends`,
  },
  BLOCKS: {
    BASE: '/blocks',
    USER: (blockedUserId: string) => `/blocks/${blockedUserId}`,
    STATUS: (targetUserId: string) => `/blocks/status/${targetUserId}`,
  },
  POSTS: {
    BASE: '/posts',
    DETAIL: (postId: string) => `/posts/${postId}`,
    COMMENTS: (postId: string) => `/posts/${postId}/comments`,
    COMMENT_DETAIL: (postId: string, commentId: string) => `/posts/${postId}/comments/${commentId}`,
  },
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userServiceClient = axios.create({
  baseURL: USER_SERVICE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const socialServiceClient = axios.create({
  baseURL: SOCIAL_SERVICE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

userServiceClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

socialServiceClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<ApiResponse<LoginResponse>>(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
