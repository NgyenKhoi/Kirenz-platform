export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM'
}

export interface Attachment {
  type: string;
  url: string;
  cloudinaryPublicId?: string;
  metadata?: Record<string, any>;
}

export interface LastMessage {
  messageId: string;
  content: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  sentAt: string;
}

export interface ParticipantInfo {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  nickname?: string | null;
  admin?: boolean | null;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  participants: ParticipantInfo[];
  adminIds?: string[];
  currentUserAdmin?: boolean;
  lastMessage?: LastMessage;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  type: MessageType;
  attachments?: Attachment[];
  sentAt: string;
  status: string;
}

export interface ConversationUpdateMessage {
  conversationId: string;
  conversationName?: string;
  lastMessage: LastMessage;
  unreadCount: number;
  updatedAt: string;
}

export interface PendingChatMedia {
  id: string;
  file: File;
  type: 'IMAGE' | 'VIDEO' | 'FILE';
  previewUrl: string;
}
