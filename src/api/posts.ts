import axiosInstance from './axiosInstance';

export const getPosts = async () => {
  const response = await axiosInstance.get('/posts');
  return response.data;
};

export const getPost = async (id: number) => {
  const response = await axiosInstance.get(`/posts/${id}`);
  return response.data;
};

export const createPost = async (title: string, content?: string) => {
  const response = await axiosInstance.post('/posts', { title, content });
  return response.data;
};

export const updatePost = async (id: number, title: string, content?: string) => {
  const response = await axiosInstance.put(`/posts/${id}`, { title, content });
  return response.data;
};

export const deletePost = async (id: number) => {
  const response = await axiosInstance.delete(`/posts/${id}`);
  return response.data;
};