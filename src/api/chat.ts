import axiosInstance from './axiosInstance';

export interface Room {
  id: number;
  name: string;
  description?: string;
  isPrivate: boolean;
  inviteCode: string;
  inviteLink?: string;
  createdAt: string;
  members: Array<{
    id: number;
    userId: number;
    joinedAt: string;
    user: {
      id: number;
      username: string;
      email?: string;
    };
  }>;
  messages?: Array<{
    id: number;
    content: string;
    senderId: number;
    sender: {
      id: number;
      username: string;
    };
    createdAt: string;
  }>;
  _count?: {
    members: number;
  };
}

export interface Message {
  id: number;
  content: string;
  senderId: number;
  sender: {
    id: number;
    username: string;
  };
  roomId: number;
  createdAt: string;
  readAt?: string;
}

export const getRooms = async () => {
  const response = await axiosInstance.get('/chat/rooms');
  return response.data;
};

export const createRoom = async (name: string, description?: string, isPrivate: boolean = true) => {
  const response = await axiosInstance.post('/chat/rooms', { name, description, isPrivate });
  return response.data;
};

export const getRoomInfo = async (roomId: number) => {
  const response = await axiosInstance.get(`/chat/rooms/${roomId}/info`);
  return response.data;
};

export const getMessages = async (receiverId?: number, roomId?: number) => {
  if (!receiverId && !roomId) {
    throw new Error('Either receiverId or roomId must be provided');
  }
  
  // Для приватных сообщений
  if (receiverId) {
    const response = await axiosInstance.get('/chat/dm/messages', { 
      params: { receiverId } 
    });
    return response.data;
  } 
  // Для комнат
  else {
    const response = await axiosInstance.get(`/chat/rooms/${roomId}/messages`);
    return response.data;
  }
};

export const joinRoomByInviteCode = async (inviteCode: string) => {
  const response = await axiosInstance.post(`/chat/rooms/join/${inviteCode}`);
  return response.data;
};

export const getRoomByInviteCode = async (inviteCode: string) => {
  const response = await axiosInstance.get(`/chat/rooms/invite/${inviteCode}`);
  return response.data;
};

export const getRoomMessages = async (roomId: number) => {
  const response = await axiosInstance.get(`/chat/rooms/${roomId}/messages`);
  return response.data;
};

export const regenerateInviteCode = async (roomId: number) => {
  const response = await axiosInstance.post(`/chat/rooms/${roomId}/regenerate-invite`);
  return response.data;
};

export const leaveRoom = async (roomId: number) => {
  const response = await axiosInstance.post(`/chat/rooms/${roomId}/leave`);
  return response.data;
};