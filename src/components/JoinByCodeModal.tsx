import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinRoomByInviteCode } from '../api/chat';

interface JoinByCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined: () => void;
}

const JoinByCodeModal: React.FC<JoinByCodeModalProps> = ({ isOpen, onClose, onJoined }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedCode = code.trim().toUpperCase();

    try {
      const response = await joinRoomByInviteCode(trimmedCode);
      if (response.ok) {
        onJoined();
        onClose();
        setCode('');
        navigate(`/chat/room/${response.room.id}`);
      } else {
        setError(response.error || 'Не удалось присоединиться');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка подключения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div 
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '400px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>Присоединиться по коду</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Код приглашения
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABCD1234"
              maxLength={8}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '1.25rem',
                textAlign: 'center',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                boxSizing: 'border-box',
              }}
              autoFocus
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee',
              color: '#c00',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || code.trim().length !== 8}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: (loading || code.trim().length !== 8) ? '#ccc' : '#007bff',
                color: 'white',
                cursor: (loading || code.trim().length !== 8) ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
              }}
            >
              {loading ? 'Подключение...' : 'Присоединиться'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinByCodeModal;