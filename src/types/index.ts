export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Post {
  id: number;
  title: string;
  content: string | null;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
  };
}

export interface ApiResponse<T = any> {
  ok: boolean;
  error?: string;
  details?: any;
  user?: User;
  post?: Post;
  posts?: Post[];
  user_id?: number;
}