import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ConversationUpdateMessage, Message } from '../types/chat';

class WebSocketService {
  private client: Client | null = null;
  private userQueueSubscription: any = null;
  private conversationSubscriptions: Map<string, any> = new Map();
  private connectionPromise: Promise<void> | null = null;

  async connect(token: string, userId: string): Promise<void> {
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(`${import.meta.env.VITE_CHAT_API_URL || 'http://localhost:8084'}/ws`),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          console.log('STOMP: ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = (frame) => {
        console.log('Connected to WebSocket');
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error('STOMP error', frame);
        reject(frame);
      };

      this.client.onWebSocketClose = () => {
        console.log('WebSocket connection closed');
        this.connectionPromise = null;
      };

      this.client.activate();
    });

    return this.connectionPromise;
  }

  subscribeToUserQueue(userId: string, callback: (update: ConversationUpdateMessage) => void) {
    if (!this.client?.connected) return;

    if (this.userQueueSubscription) {
      this.userQueueSubscription.unsubscribe();
    }

    this.userQueueSubscription = this.client.subscribe(
      `/user/${userId}/queue/messages`,
      (message: IMessage) => {
        callback(JSON.parse(message.body));
      }
    );
  }

  subscribeToConversation(conversationId: string, callback: (message: Message) => void) {
    if (!this.client?.connected) return;

    // Unsubscribe if already subscribed to this conversation
    this.conversationSubscriptions.get(conversationId)?.unsubscribe();

    const subscription = this.client.subscribe(
      `/topic/conversation.${conversationId}`,
      (message: IMessage) => {
        callback(JSON.parse(message.body));
      }
    );

    this.conversationSubscriptions.set(conversationId, subscription);
    return subscription;
  }

  subscribeToTyping(conversationId: string, callback: (data: { userId: string, isTyping: boolean }) => void) {
    if (!this.client?.connected) return;

    return this.client.subscribe(
      `/topic/conversation.${conversationId}.typing`,
      (message: IMessage) => {
        callback(JSON.parse(message.body));
      }
    );
  }

  subscribeToPresence(callback: (data: { userId: string, status: 'ONLINE' | 'OFFLINE' }) => void) {
    if (!this.client?.connected) return;

    return this.client.subscribe(
      '/topic/presence',
      (message: IMessage) => {
        callback(JSON.parse(message.body));
      }
    );
  }

  unsubscribeFromConversation(conversationId: string) {
    this.conversationSubscriptions.get(conversationId)?.unsubscribe();
    this.conversationSubscriptions.delete(conversationId);
  }

  sendMessage(conversationId: string, content: string, attachments: any[] = []) {
    if (!this.client?.connected) return;

    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({
        conversationId,
        content,
        attachments,
      }),
    });
  }

  sendTyping(conversationId: string, isTyping: boolean) {
    if (!this.client?.connected) return;

    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({
        conversationId,
        isTyping,
      }),
    });
  }

  disconnect() {
    this.userQueueSubscription?.unsubscribe();
    this.conversationSubscriptions.forEach((sub) => sub.unsubscribe());
    this.conversationSubscriptions.clear();
    this.client?.deactivate();
    this.client = null;
    this.connectionPromise = null;
  }
}

export const websocketService = new WebSocketService();
