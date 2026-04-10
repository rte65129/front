import axiosInstance from './axiosInstance';

export const register = async (username: string, email: string, password: string) => {
  const response = await axiosInstance.post('/auth/register', { username, email, password });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};

export const refresh = async () => {
  const response = await axiosInstance.post('/auth/refresh');
  return response.data;
};