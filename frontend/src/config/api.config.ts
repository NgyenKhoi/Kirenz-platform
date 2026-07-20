import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ErrorResponse, LoginResponse } from '../types/auth.types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const USER_SERVICE_BASE_URL = import.meta.env.VITE_USER_SERVICE_BASE_URL || API_BASE_URL;
export const SOCIAL_SERVICE_BASE_URL = import.meta.env.VITE_SOCIAL_SERVICE_BASE_URL || API_BASE_URL;
export const NOTIFICATION_SERVICE_BASE_URL = import.meta.env.VITE_NOTIFICATION_SERVICE_BASE_URL || API_BASE_URL;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    GOOGLE: '/auth/google',
    REFRESH: '/auth/refresh',
  },
  USER: {
    ME: '/users/me',
    AVATAR: '/users/me/avatar',
    COVER: '/users/me/cover',
    DETAIL: (userId: string) => `/users/${userId}`,
  },
  PRIVACY: {
    BASE: '/privacy',
    ME: '/privacy/me',
    CAN_MESSAGE: (receiverId: string) => `/privacy/can-message/${receiverId}`,
  },
  VERIFICATION: {
    SEND_OTP: '/verification/send-otp',
    VERIFY_OTP: '/verification/verify-otp',
  },
  FRIENDS: {
    BASE: '/friends',
    SEARCH: '/users/search',
    REQUESTS: '/friends/requests',
    INCOMING: '/friends/requests/incoming',
    OUTGOING: '/friends/requests/outgoing',
    ACCEPT: (requestId: string) => `/friends/requests/${requestId}/accept`,
    DECLINE: (requestId: string) => `/friends/requests/${requestId}/decline`,
    CANCEL: (requestId: string) => `/friends/requests/${requestId}`,
    REMOVE: (friendId: string) => `/friends/${friendId}`,
    STATUS: (targetUserId: string) => `/friends/status/${targetUserId}`,
    MUTUAL: (targetUserId: string) => `/users/${targetUserId}/mutual-friends`,
    USER: (userId: string) => `/friends/user/${userId}`,
    SUGGESTIONS: '/friends/suggestions',
  },
  BLOCKS: {
    BASE: '/blocks',
    USER: (blockedUserId: string) => `/blocks/${blockedUserId}`,
    STATUS: (targetUserId: string) => `/blocks/status/${targetUserId}`,
  },
  POSTS: {
    BASE: '/posts',
    FEED: '/posts/feed',
    EXPLORE: '/posts/explore',
    TRENDING: '/posts/explore/trending',
    PUBLIC: '/posts/public',
    PUBLIC_DETAIL: (postId: string) => `/posts/public/${postId}`,
    ME: '/posts/me',
    DETAIL: (postId: string) => `/posts/${postId}`,
    USER: (userId: string) => `/posts/user/${userId}`,
    USER_IMAGES: (userId: string) => `/posts/user/${userId}/images`,
    SHARES: (postId: string) => `/posts/${postId}/shares`,
    REACTIONS: (postId: string) => `/posts/${postId}/reactions`,
    MY_REACTION: (postId: string) => `/posts/${postId}/reactions/me`,
    COMMENTS: (postId: string) => `/posts/${postId}/comments`,
    COMMENT_DETAIL: (postId: string, commentId: string) => `/posts/${postId}/comments/${commentId}`,
  },
  MEDIA: {
    POSTS: '/media/posts',
    CHAT: '/media/chat',
  },
  COMMENTS: {
    REACTIONS: (commentId: string) => `/comments/${commentId}/reactions`,
    MY_REACTION: (commentId: string) => `/comments/${commentId}/reactions/me`,
  },
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};

export const apiClient = axios.create({
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

// Anonymous reads intentionally use a client without auth/refresh interceptors.
// This prevents a stale local token from blocking an otherwise public post.
export const publicSocialServiceClient = axios.create({
  baseURL: SOCIAL_SERVICE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const notificationServiceClient = axios.create({
  baseURL: NOTIFICATION_SERVICE_BASE_URL,
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

const redirectToLogin = () => {
  const returnTo = `${window.location.pathname}${window.location.search}`;
  window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`;
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

notificationServiceClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const addRefreshInterceptor = (client: AxiosInstance) => {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ErrorResponse>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      const isAuthRequest = originalRequest.url?.startsWith('/auth/');

      if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => client(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          redirectToLogin();
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
          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError as Error);
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          redirectToLogin();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

addRefreshInterceptor(apiClient);
addRefreshInterceptor(userServiceClient);
addRefreshInterceptor(socialServiceClient);
addRefreshInterceptor(notificationServiceClient);

export default apiClient;

