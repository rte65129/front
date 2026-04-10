import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
      <nav>
        <Link to="/" style={{ marginRight: '1rem' }}>Главная</Link>
        {user && (
          <>
            <Link to="/posts/new" style={{ marginRight: '1rem' }}>Создать пост</Link>
            <Link to="/chat" style={{ marginRight: '1rem' }}>💬 Чат</Link> {/* 👈 Добавь */}
          </>
        )}
      </nav>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: '1rem' }}>Привет, {user.username}</span>
            <button onClick={handleLogout}>Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '1rem' }}>Войти</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;