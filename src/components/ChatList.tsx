import React from 'react';
import { useChat } from '../contexts/ChatContext';
import { User } from '../types';

interface ChatListProps {
  users: User[];
  onSelectUser: (userId: number) => void;
}

const ChatList: React.FC<ChatListProps> = ({ users, onSelectUser }) => {
  const { activeChat } = useChat();

  return (
    <div style={{ 
      width: '250px', 
      borderRight: '1px solid #ddd', 
      overflowY: 'auto',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
        <h3 style={{ margin: 0 }}>Чаты</h3>
      </div>
      <div>
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user.id)}
            style={{
              padding: '1rem',
              cursor: 'pointer',
              backgroundColor: 
                activeChat?.userId === user.id ? '#e3f2fd' : 'transparent',
              borderBottom: '1px solid #eee',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (activeChat?.userId !== user.id) {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }
            }}
            onMouseLeave={(e) => {
              if (activeChat?.userId !== user.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{user.username}</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>{user.email}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;