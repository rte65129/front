import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import socketService from '../services/socket';
import { getMessages } from '../api/chat';

interface Message {
  id: number;
  content: string;
  senderId: number;
  senderUsername: string;
  receiverId?: number;
  roomId?: number;
  createdAt: string;
  readAt?: string;
}

interface ChatContextType {
  messages: Message[];
  activeChat: { userId?: number; roomId?: number } | null;
  typingUsers: Map<number, string>;
  setActiveChat: (chat: { userId?: number; roomId?: number } | null) => void;
  sendMessage: (content: string) => Promise<void>;
  loadMessages: () => Promise<void>;
  markMessagesAsRead: (messageIds: number[]) => void;
  emitTyping: (isTyping: boolean) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<{ userId?: number; roomId?: number } | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());

  // Подписка на сообщения
  useEffect(() => {
    if (!user) return;

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => {
        // Проверяем, относится ли сообщение к активному чату
        const belongsToActiveChat = activeChat?.userId
          ? message.senderId === activeChat.userId || message.receiverId === activeChat.userId
          : activeChat?.roomId
          ? message.roomId === activeChat.roomId
          : false;

        if (belongsToActiveChat || message.senderId === user.id) {
          return [...prev, message];
        }
        return prev;
      });
    };

    const handleTyping = (data: { userId: number; username: string; isTyping: boolean }) => {
      if (data.userId === user.id) return; // Игнорируем свои события

      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        if (data.isTyping) {
          newMap.set(data.userId, data.username);
        } else {
          newMap.delete(data.userId);
        }
        return newMap;
      });
    };

    socketService.onMessageReceived(handleNewMessage);
    socketService.onTyping(handleTyping);

    return () => {
      socketService.offMessageReceived(handleNewMessage);
      socketService.offTyping(handleTyping);
    };
  }, [user, activeChat]);

  const loadMessages = useCallback(async () => {
    if (!activeChat || !user) return;

    try {
      const data = await getMessages(activeChat.userId, activeChat.roomId);
      if (data.ok && data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [activeChat, user]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const sendMessage = async (content: string) => {
    if (!user || !activeChat) return;

    const result = await socketService.sendMessage(
      content,
      activeChat.userId,
      activeChat.roomId
    );

    if (!result.ok) {
      throw new Error(result.error || 'Failed to send message');
    }
  };

  const markMessagesAsRead = (messageIds: number[]) => {
    socketService.markAsRead(messageIds);
  };

  const emitTyping = (isTyping: boolean) => {
    if (!activeChat) return;
    socketService.emitTyping(activeChat.roomId, activeChat.userId, isTyping);
  };

  const clearMessages = () => {
    setMessages([]);
    setActiveChat(null);
    setTypingUsers(new Map());
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        activeChat,
        typingUsers,
        setActiveChat,
        sendMessage,
        loadMessages,
        markMessagesAsRead,
        emitTyping,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};