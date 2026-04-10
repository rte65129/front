import { io, Socket } from 'socket.io-client';
import { User } from '../types';

interface MessagePayload {
  id: number;
  content: string;
  senderId: number;
  senderUsername: string;
  receiverId?: number;
  roomId?: number;
  createdAt: string;
  readAt?: string;
}

interface TypingData {
  userId: number;
  username: string;
  isTyping: boolean;
}

class SocketService {
  private socket: Socket | null = null;
  private baseUrl = 'http://localhost:3000';

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(this.baseUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Отправка сообщения
  sendMessage(
    content: string,
    receiverId?: number,
    roomId?: number
  ): Promise<{ ok: boolean; messageId?: number; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ ok: false, error: 'Socket not connected' });
        return;
      }

      this.socket.emit('sendMessage', { content, receiverId, roomId }, (response: any) => {
        resolve(response);
      });
    });
  }

  // Подписка на получение сообщений
  onMessageReceived(callback: (message: MessagePayload) => void) {
    if (!this.socket) return;
    this.socket.on('messageReceived', callback);
  }

  // Присоединение к комнате
  joinRoom(roomId: number) {
    if (!this.socket) return;
    this.socket.emit('joinRoom', roomId);
  }

  // Выход из комнаты
  leaveRoom(roomId: number) {
    if (!this.socket) return;
    this.socket.emit('leaveRoom', roomId);
  }

  // Индикатор набора текста
  emitTyping(roomId?: number, receiverId?: number, isTyping: boolean = true) {
    if (!this.socket) return;
    this.socket.emit('typing', { roomId, receiverId, isTyping });
  }

  onTyping(callback: (data: TypingData) => void) {
    if (!this.socket) return;
    this.socket.on('typing', callback);
  }

  // Отметка о прочтении
  markAsRead(messageIds: number[]) {
    if (!this.socket) return;
    this.socket.emit('markAsRead', messageIds);
  }

  onMessagesRead(callback: (messageIds: number[]) => void) {
    if (!this.socket) return;
    this.socket.on('messagesRead', callback);
  }

  onUserJoined(callback: (userId: number) => void) {
    if (!this.socket) return;
    this.socket.on('userJoined', callback);
  }

  onUserLeft(callback: (userId: number) => void) {
    if (!this.socket) return;
    this.socket.on('userLeft', callback);
  }

  // Очистка слушателей
  offMessageReceived(callback?: (message: MessagePayload) => void) {
    if (!this.socket) return;
    this.socket.off('messageReceived', callback);
  }

  offTyping(callback?: (data: TypingData) => void) {
    if (!this.socket) return;
    this.socket.off('typing', callback);
  }
}

export const socketService = new SocketService();
export default socketService;