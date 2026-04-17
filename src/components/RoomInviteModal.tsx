import React, { useState } from 'react';
import { Room } from '../api/chat';

interface RoomInviteModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
}

const RoomInviteModal: React.FC<RoomInviteModalProps> = ({ room, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(room.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
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
        <h3 style={{ marginTop: 0 }}>Код приглашения</h3>
        
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Комната: <strong>{room.name}</strong>
        </p>

        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            flex: 1,
            padding: '1rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '1.5rem',
            textAlign: 'center',
            border: '2px dashed #007bff',
            letterSpacing: '4px',
            userSelect: 'all',
          }}>
            {room.inviteCode}
          </div>
          <button
            onClick={handleCopy}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: copied ? '#28a745' : '#007bff',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {copied ? '✓' : 'Копировать'}
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#999', marginBottom: '1.5rem' }}>
          Скопируйте код и отправьте другу. Он сможет ввести его в поле «Присоединиться по коду».
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomInviteModal;