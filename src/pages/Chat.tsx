import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { User } from '../types';
import axiosInstance from '../api/axiosInstance';
import ErrorMessage from '../components/ErrorMessage';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { setActiveChat, activeChat } = useChat();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/users');
        if (response.data.ok) {
          const filteredUsers = response.data.users.filter(
            (u: User) => u.id !== user?.id
          );
          setUsers(filteredUsers);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  const handleSelectUser = (userId: number) => {
    setActiveChat({ userId });
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>;
  }

  return (
    <div style={{ 
      display: 'flex', 
      maxWidth: '1200px', 
      margin: '2rem auto', 
      height: '600px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <ChatList users={users} onSelectUser={handleSelectUser} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeChat ? (
          <>
            <div style={{ 
              padding: '1rem', 
              borderBottom: '1px solid #ddd',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ margin: 0 }}>
                {activeChat.userId 
                  ? users.find(u => u.id === activeChat.userId)?.username 
                  : 'Чат'}
              </h3>
            </div>
            <div style={{ flex: 1, padding: '1rem' }}>
              <ChatWindow />
            </div>
          </>
        ) : (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#999'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                Выберите чат для начала общения
              </p>
              <p>Выберите пользователя из списка слева</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;