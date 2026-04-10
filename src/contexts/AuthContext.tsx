import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth';
import axiosInstance from '../api/axiosInstance';
import socketService from '../services/socket';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        // Проверяем валидность токена через refresh
        await axiosInstance.post('/auth/refresh');
      } catch (error) {
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

const login = async (email: string, password: string) => {
  const data = await apiLogin(email, password);
  if (data.ok && data.user) {
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // 👇 Получаем токен для вебсокета и подключаемся
    try {
      const wsTokenResponse = await axiosInstance.get('/auth/ws-token');
      if (wsTokenResponse.data.ok) {
        socketService.connect(wsTokenResponse.data.token);
      }
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  } else {
    throw new Error(data.error || 'Login failed');
  }
};

  const register = async (username: string, email: string, password: string) => {
    const data = await apiRegister(username, email, password);
    if (data.ok && data.user_id) {
      await login(email, password);
    } else {
      throw new Error(data.error || 'Registration failed');
    }
  };

const logout = async () => {
  await apiLogout();
  setUser(null);
  localStorage.removeItem('user');
  socketService.disconnect(); 
};
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};