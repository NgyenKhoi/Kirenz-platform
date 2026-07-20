import axios from 'axios';
import { API_ENDPOINTS, socialServiceClient } from '../config/api.config';
import { MediaUploadResponse } from '../types/post.types';
import { Conversation, Message, ConversationType } from '../types/chat';

const API_BASE_URL = `${import.meta.env.VITE_CHAT_API_URL || 'http://localhost:8080'}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const chatService = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await axios.get(`${API_BASE_URL}/conversations`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  },

  getConversationById: async (id: string): Promise<Conversation> => {
    const response = await axios.get(`${API_BASE_URL}/conversations/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  },

  getOrCreateDirectConversation: async (otherUserId: string): Promise<Conversation> => {
    const response = await axios.post(`${API_BASE_URL}/conversations/direct/${otherUserId}`, {}, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  },

  createGroupConversation: async (name: string, participantIds: string[]): Promise<Conversation> => {
    const response = await axios.post(`${API_BASE_URL}/conversations`, {
      name,
      type: ConversationType.GROUP,
      participantIds,
    }, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  },

  updateGroupName: async (conversationId: string, name: string): Promise<Conversation> => {
    const response = await axios.patch(`${API_BASE_URL}/conversations/${conversationId}`, { name }, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  },

  deleteGroup: async (conversationId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/conversations/${conversationId}`, {
      headers: getAuthHeaders(),
    });
  },

  getMessageHistory: async (conversationId: string, page = 0, size = 50): Promise<Message[]> => {
    const response = await axios.get(`${API_BASE_URL}/messages/${conversationId}`, {
      params: { page, size },
      headers: getAuthHeaders(),
    });
    return response.data.data;
  },

  addParticipant: async (conversationId: string, userId: string): Promise<Conversation> => {
    const response = await axios.post(`${API_BASE_URL}/conversations/${conversationId}/participants`, null, {
      params: { userId },
      headers: getAuthHeaders(),
    });
    return response.data.data;
  },

  removeParticipant: async (conversationId: string, userId: string): Promise<Conversation> => {
    const response = await axios.delete(`${API_BASE_URL}/conversations/${conversationId}/participants/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  },

  leaveGroup: async (conversationId: string): Promise<void> => {
    await axios.post(`${API_BASE_URL}/conversations/${conversationId}/leave`, {}, {
      headers: getAuthHeaders(),
    });
  },

  makeAdmin: async (conversationId: string, userId: string): Promise<Conversation> => {
    const response = await axios.post(`${API_BASE_URL}/conversations/${conversationId}/admins/${userId}`, {}, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  },

  updateNickname: async (conversationId: string, userId: string, nickname: string): Promise<Conversation> => {
    const response = await axios.patch(`${API_BASE_URL}/conversations/${conversationId}/nicknames/${userId}`, { nickname }, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  },

  getPresence: async (userIds: string[]): Promise<Record<string, { isOnline: boolean, lastSeen?: number }>> => {
    if (userIds.length === 0) return {};
    const response = await axios.get(`${API_BASE_URL}/presence/status`, {
      params: { userIds: userIds.join(',') },
      headers: getAuthHeaders(),
    });
    const raw = response.data.data as Record<string, { isOnline?: boolean; online?: boolean; lastSeen?: number }>;
    return Object.fromEntries(Object.entries(raw).map(([userId, presence]) => [userId, {
      isOnline: presence.isOnline ?? presence.online ?? false,
      lastSeen: presence.lastSeen,
    }]));
  },

  uploadMedia: async (files: File[]): Promise<MediaUploadResponse[]> => {
    return Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await socialServiceClient.post(
          API_ENDPOINTS.MEDIA.CHAT,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data.data;
      })
    );
  },

  markAsRead: async (conversationId: string): Promise<void> => {
    await axios.post(`${API_BASE_URL}/messages/${conversationId}/read`, {}, {
      headers: getAuthHeaders(),
    });
  },
};
