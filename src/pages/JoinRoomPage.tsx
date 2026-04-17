import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomByInviteCode, joinRoomByInviteCode, Room } from '../api/chat';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

const JoinRoomPage: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoom = async () => {
      if (!inviteCode) {
        setError('Invalid invite code');
        setLoading(false);
        return;
      }

      try {
        const response = await getRoomByInviteCode(inviteCode);
        if (response.ok) {
          setRoom(response.room);
        } else {
          setError(response.error || 'Room not found');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load room');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [inviteCode]);

  const handleJoin = async () => {
    if (!inviteCode) return;

    setJoining(true);
    setError('');

    try {
      const response = await joinRoomByInviteCode(inviteCode);
      if (response.ok) {
        navigate(`/chat/room/${response.room.id}`);
      } else {
        setError(response.error || 'Failed to join room');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Загрузка...
      </div>
    );
  }

  if (!room) {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '4rem auto', 
        padding: '2rem',
        textAlign: 'center',
      }}>
        <ErrorMessage message={error || 'Room not found'} />
        <button
          onClick={() => navigate('/chat')}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Вернуться к чатам
        </button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '4rem auto',
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    }}>
      <h1 style={{ marginTop: 0 }}>{room.name}</h1>
      
      {room.description && (
        <p style={{ color: '#666', marginBottom: '2rem' }}>{room.description}</p>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c00',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h3>Участники ({room._count?.members || room.members.length})</h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginTop: '1rem',
        }}>
          {room.members.map((member) => (
            <div
              key={member.id}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#e3f2fd',
                borderRadius: '20px',
                fontSize: '0.875rem',
              }}
            >
              {member.user.username}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleJoin}
          disabled={joining}
          style={{
            flex: 1,
            padding: '1rem',
            backgroundColor: joining ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: joining ? 'not-allowed' : 'pointer',
          }}
        >
          {joining ? 'Присоединение...' : 'Присоединиться к комнате'}
        </button>
        
        <button
          onClick={() => navigate('/chat')}
          style={{
            padding: '1rem 2rem',
            backgroundColor: 'white',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  );
};

export default JoinRoomPage;