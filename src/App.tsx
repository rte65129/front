import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import PostsList from './pages/PostsList';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import Chat from './pages/Chat';
import RoomChatPage from './pages/RoomChatPage';
import JoinRoomPage from './pages/JoinRoomPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <Header />
          <main>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<PostsList />} />
              <Route path="/posts/:id" element={<PostDetail />} />
              
              {/* 👇 ЧАТЫ — добавленные роуты */}
              <Route path="/chat" element={
                <PrivateRoute>
                  <Chat />
                </PrivateRoute>
              } />
              <Route path="/chat/room/:roomId" element={
                <PrivateRoute>
                  <RoomChatPage />
                </PrivateRoute>
              } />
              <Route path="/chat/join/:inviteCode" element={
                <PrivateRoute>
                  <JoinRoomPage />
                </PrivateRoute>
              } />
              {/* 👆 конец чатов */}
              
              <Route path="/posts/new" element={
                <PrivateRoute>
                  <CreatePost />
                </PrivateRoute>
              } />
              <Route path="/posts/:id/edit" element={
                <PrivateRoute>
                  <EditPost />
                </PrivateRoute>
              } />
            </Routes>
          </main>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;