import { notificationServiceClient } from '../config/api.config';
import { ApiResponse } from '../types/auth.types';

export interface NotificationResponse {
  id: string;
  receiverId: string;
  actorId?: string | null;
  actorName?: string | null;
  actorAvatar?: string | null;
  type: 'FRIEND_REQUEST' | 'FRIEND_ACCEPT' | 'POST_COMMENT' | 'POST_LIKE' | 'COMMENT_REPLY' | 'POST_MENTION' | 'COMMENT_MENTION' | 'BIRTHDAY' | 'WELCOME';
  targetId?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async (): Promise<NotificationResponse[]> => {
    const response = await notificationServiceClient.get<ApiResponse<NotificationResponse[]>>('/notifications');
    return response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await notificationServiceClient.get<ApiResponse<number>>('/notifications/unread-count');
    return response.data.data;
  },

  markAsRead: async (id: string): Promise<NotificationResponse> => {
    const response = await notificationServiceClient.patch<ApiResponse<NotificationResponse>>(`/notifications/${id}/read`);
    return response.data.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await notificationServiceClient.patch<ApiResponse<void>>('/notifications/read-all');
  },
};
