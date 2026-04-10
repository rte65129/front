import axiosInstance from './axiosInstance';

export const getConversations = async () => {
  const response = await axiosInstance.get('/chat/conversations');
  return response.data;
};

export const getMessages = async (receiverId?: number, roomId?: number) => {
  const params = receiverId ? { receiverId } : { roomId };
  const response = await axiosInstance.get('/chat/messages', { params });
  return response.data;
};

export const createRoom = async (name: string, description?: string, isPrivate: boolean = false) => {
  const response = await axiosInstance.post('/chat/rooms', { name, description, isPrivate });
  return response.data;
};

export const joinRoom = async (roomId: number) => {
  const response = await axiosInstance.post(`/chat/rooms/${roomId}/join`);
  return response.data;
};

export const getRooms = async () => {
  const response = await axiosInstance.get('/chat/rooms');
  return response.data;
};