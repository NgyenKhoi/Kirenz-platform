import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chat.service';
import { websocketService } from '../services/websocket.service';
import { Conversation, Message, ConversationUpdateMessage } from '../types/chat';

export const useChat = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('access_token'); // Changed from 'token' to 'access_token'
  const [onlineUsers, setOnlineUsers] = useState<Record<string, { isOnline: boolean, lastSeen?: number }>>({});

  // 1. Fetch Conversations
  const { data: conversations, isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatService.getConversations(),
    enabled: !!userId && !!token,
  });

  // 2. Initial Presence Fetch
  useEffect(() => {
    if (conversations && conversations.length > 0) {
      const allParticipants = new Set<string>();
      conversations.forEach(c => c.participants.forEach(p => allParticipants.add(p.userId)));
      
      chatService.getPresence(Array.from(allParticipants)).then(setOnlineUsers);
    }
  }, [conversations]);

  // 3. WebSocket Connection and User Queue + Presence Subscription
  useEffect(() => {
    if (!userId || !token) return;

    let presenceSub: { unsubscribe: () => void } | undefined;
    let userQueueSub: { unsubscribe: () => void } | undefined;

    const connect = async () => {
      try {
        await websocketService.connect(token, userId);
        
        // Subscribe to presence updates
        presenceSub = websocketService.subscribeToPresence((data) => {
          setOnlineUsers(prev => ({ 
            ...prev, 
            [data.userId]: { 
              isOnline: data.status === 'ONLINE', 
              lastSeen: data.lastSeen 
            } 
          }));
        });

        userQueueSub = websocketService.subscribeToUserQueue(userId, (update: ConversationUpdateMessage) => {
          queryClient.setQueryData(['conversations'], (old: Conversation[] | undefined) => {
            if (!old) return old;
            
            const index = old.findIndex(c => c.id === update.conversationId);
            if (index !== -1) {
              const updated = [...old];
              updated[index] = { 
                ...updated[index], 
                lastMessage: update.lastMessage, 
                updatedAt: update.updatedAt,
                unreadCount: update.unreadCount 
              };
              return updated.sort((a, b) => 
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
              );
            } else {
              queryClient.invalidateQueries({ queryKey: ['conversations'] });
              return old;
            }
          });
        });
      } catch (err) {
        console.error('WS connection error', err);
      }
    };

    connect();

    return () => {
      presenceSub?.unsubscribe();
      userQueueSub?.unsubscribe();
    };
  }, [userId, token, queryClient]);

  return {
    conversations,
    loadingConversations,
    onlineUsers,
  };
};

export const useConversationMessages = (conversationId: string | null, userId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  // Fetch History
  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => conversationId ? chatService.getMessageHistory(conversationId) : Promise.resolve([]),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (history) {
      setMessages(history.slice().reverse()); // Show in chronological order for UI
    }
  }, [history]);

  // Subscribe to live messages
  useEffect(() => {
    if (!conversationId || !userId) return;

    const sub = websocketService.subscribeToConversation(conversationId, (newMessage: Message) => {
      setMessages(prev => [...prev, newMessage]);
    });

    const typingSub = websocketService.subscribeToTyping(conversationId, (data) => {
      if (data.userId !== userId) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: data.isTyping }));
      }
    });

    return () => {
      sub.unsubscribe();
      typingSub?.unsubscribe();
    };
  }, [conversationId, userId]);

  const sendMessage = useCallback((content: string) => {
    if (conversationId && content.trim()) {
      websocketService.sendMessage(conversationId, content);
    }
  }, [conversationId]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (conversationId) {
      websocketService.sendTyping(conversationId, isTyping);
    }
  }, [conversationId]);

  return {
    messages,
    loadingHistory,
    sendMessage,
    sendTyping,
    typingUsers,
  };
};
