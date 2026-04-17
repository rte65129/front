import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomMessages, getRoomInfo, Room } from '../api/chat';  // ← используем getRoomInfo
import { useChat } from '../contexts/ChatContext';
import socketService from '../services/socket';
import RoomInviteModal from '../components/RoomInviteModal';
import ChatWindow from '../components/ChatWindow';
import axiosInstance from '../api/axiosInstance';  // ← для отладки

const RoomChatPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { setActiveChat, setMessages } = useChat();
  const [room, setRoom] = useState<Room | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Загрузка сообщений
  useEffect(() => {
    const fetchMessages = async () => {
      if (!roomId) return;
      try {
        const response = await getRoomMessages(parseInt(roomId, 10));
        if (response.ok) {
          setMessages(response.messages);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [roomId, setMessages]);

  // 🔥 Загрузка данных комнаты — ИСПРАВЛЕННАЯ ВЕРСИЯ
  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) return;
      
      const numericRoomId = parseInt(roomId, 10);
      if (isNaN(numericRoomId)) {
        console.error('Invalid roomId:', roomId);
        setLoading(false);
        return;
      }

      try {
        // ✅ Используем axiosInstance (не fetch!) + правильный путь
        const response = await axiosInstance.get(`/chat/rooms/${numericRoomId}/info`);
        
        if (response.data.ok) {
          setRoom(response.data.room);
        } else {
          console.warn('Room info not found:', response.data.error);
          // Fallback: попробуем получить из списка комнат
          await tryFallbackRoomLoad(numericRoomId);
        }
      } catch (err: any) {
        console.error('Failed to fetch room:', err);
        // При ошибке тоже пробуем fallback
        await tryFallbackRoomLoad(numericRoomId);
      }
    };

    // Fallback: если эндпоинт /info ещё не работает, берём данные из списка комнат
    const tryFallbackRoomLoad = async (id: number) => {
      try {
        const roomsResp = await axiosInstance.get('/chat/rooms');
        if (roomsResp.data.ok) {
          const found = roomsResp.data.rooms.find((r: Room) => r.id === id);
          if (found) {
            setRoom(found);
            return;
          }
        }
      } catch (e) {
        console.error('Fallback also failed:', e);
      }
      // Если ничего не получилось — хотя бы снимаем loading
      setLoading(false);
    };

    fetchRoom();
  }, [roomId]);

  // Подключение к WebSocket-комнате
  useEffect(() => {
    if (roomId) {
      const numericRoomId = parseInt(roomId, 10);
      if (!isNaN(numericRoomId)) {
        setActiveChat({ roomId: numericRoomId });
        socketService.joinRoom(numericRoomId);
      }
      return () => {
        if (roomId) {
          const id = parseInt(roomId, 10);
          if (!isNaN(id)) {
            socketService.leaveRoom(id);
          }
        }
      };
    }
  }, [roomId, setActiveChat]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>;
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: 'calc(100vh - 100px)',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h2 style={{ margin: 0 }}>{room?.name || 'Комната'}</h2>
          {room?.description && (
            <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.875rem' }}>
              {room.description}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowInviteModal(true)}
            disabled={!room}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: room ? '#28a745' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: room ? 'pointer' : 'not-allowed',
            }}
          >
            Пригласить
          </button>
          <button
            onClick={() => navigate('/chat')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Назад
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '1rem' }}>
        <ChatWindow />
      </div>

      {/* Invite Modal */}
      {room && (
        <RoomInviteModal
          room={room}
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
};

export default RoomChatPage;