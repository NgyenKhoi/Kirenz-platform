import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { NotificationResponse } from './notification.service';

class NotificationWebSocketService {
  private client: Client | null = null;
  private notificationSubscription: any = null;
  private unreadCountSubscription: any = null;
  private connectionPromise: Promise<void> | null = null;

  async connect(token: string, userId: string): Promise<void> {
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(import.meta.env.VITE_NOTIFICATION_WS_URL || `${import.meta.env.VITE_NOTIFICATION_API_URL || 'http://localhost:8080'}/ws/notifications`),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          console.log('STOMP NOTIF: ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = (frame) => {
        console.log('Connected to Notification WebSocket');
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error('STOMP Notification error', frame);
        reject(frame);
      };

      this.client.onWebSocketClose = () => {
        console.log('Notification WebSocket connection closed');
        this.connectionPromise = null;
      };

      this.client.activate();
    });

    return this.connectionPromise;
  }

  subscribeToNotifications(
    userId: string,
    onNotification: (notif: NotificationResponse) => void,
    onUnreadCount?: (count: number) => void
  ) {
    if (!this.client?.connected) return;

    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.unreadCountSubscription) {
      this.unreadCountSubscription.unsubscribe();
    }

    this.notificationSubscription = this.client.subscribe(
      `/user/queue/notifications`,
      (message: IMessage) => {
        onNotification(JSON.parse(message.body));
      }
    );

    if (onUnreadCount) {
      this.unreadCountSubscription = this.client.subscribe(
        `/user/queue/notifications/unread-count`,
        (message: IMessage) => {
          const body = JSON.parse(message.body);
          onUnreadCount(body.count);
        }
      );
    }
  }

  disconnect() {
    this.notificationSubscription?.unsubscribe();
    this.unreadCountSubscription?.unsubscribe();
    this.client?.deactivate();
    this.client = null;
    this.connectionPromise = null;
  }
}

export const notificationWebsocketService = new NotificationWebSocketService();
