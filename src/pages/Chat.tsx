import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRooms, Room } from '../api/chat';
import CreateRoomModal from '../components/CreateRoomModal';
import JoinByCodeModal from '../components/JoinByCodeModal';  // ← новый импорт
import ErrorMessage from '../components/ErrorMessage';

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);  // ← новое состояние
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await getRooms();
      if (response.ok) {
        setRooms(response.rooms);
      } else {
        setError(response.error || 'Failed to load rooms');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>;
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '2rem auto',
      padding: '0 1rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <h1 style={{ margin: 0 }}>Мои комнаты</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowJoinModal(true)}  // ← кнопка входа по коду
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            🔗 Присоединиться по коду
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            + Создать комнату
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {rooms.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '1rem' }}>
            У вас пока нет комнат
          </p>
          <p style={{ color: '#999' }}>
            Создайте новую комнату или присоединитесь по коду приглашения
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => navigate(`/chat/room/${room.id}`)}
              style={{
                padding: '1.5rem',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem' }}>{room.name}</h3>
              {room.description && (
                <p style={{ 
                  color: '#666', 
                  margin: '0 0 1rem',
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {room.description}
                </p>
              )}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.875rem',
                color: '#999',
              }}>
                <span>{room.members.length} участников</span>
                <span>{new Date(room.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchRooms}
      />
      
      <JoinByCodeModal  // ← новый модал
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoined={fetchRooms}
      />
    </div>
  );
};

export default Chat;