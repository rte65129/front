import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';

const ChatWindow: React.FC = () => {
  const { user } = useAuth();
  const { messages, activeChat, typingUsers, sendMessage, emitTyping } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      emitTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitTyping(false);
    }, 1000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      await sendMessage(inputMessage.trim());
      setInputMessage('');
      setIsTyping(false);
      emitTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getOtherUserId = () => {
    if (!activeChat?.userId || !user) return null;
    return activeChat.userId === user.id ? null : activeChat.userId;
  };

  const typingUsersList = Array.from(typingUsers.values());

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '500px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#fff'
    }}>
      {/* Messages area */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '1rem',
        borderBottom: '1px solid #ddd'
      }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>Нет сообщений</p>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === user?.id;
            return (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                  marginBottom: '0.5rem',
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '0.5rem 1rem',
                    borderRadius: '18px',
                    backgroundColor: isOwnMessage ? '#007bff' : '#e9ecef',
                    color: isOwnMessage ? '#fff' : '#000',
                    wordBreak: 'break-word',
                  }}
                >
                  {!isOwnMessage && (
                    <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                      {message.senderUsername}
                    </div>
                  )}
                  <div>{message.content}</div>
                  <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.7 }}>
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsersList.length > 0 && (
        <div style={{ 
          padding: '0.5rem 1rem', 
          fontSize: '0.875rem', 
          color: '#666',
          fontStyle: 'italic',
          borderBottom: '1px solid #ddd'
        }}>
         {typingUsersList.join(', ')} печатает{typingUsersList.length > 1 ? 'ют' : ''}...
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSendMessage} style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          placeholder="Введите сообщение..."
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '20px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: inputMessage.trim() ? '#007bff' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
          }}
        >
          Отправить
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;