import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPost, deletePost } from '../api/posts';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getPost(parseInt(id));
        if (data.ok && data.post) {
          setPost(data.post);
        } else {
          setError(data.error || 'Пост не найден');
        }
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!post) return;
    if (window.confirm('Удалить пост?')) {
      try {
        const data = await deletePost(post.id);
        if (data.ok) {
          navigate('/');
        } else {
          alert(data.error || 'Не удалось удалить');
        }
      } catch (err) {
        alert('Ошибка при удалении');
      }
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (!post) return <ErrorMessage message="Пост не найден" />;

  const isAuthor = user?.id === post.authorId;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <h1>{post.title}</h1>
      <p>Автор: {post.author.username}</p>
      <p>Дата: {new Date(post.createdAt).toLocaleString()}</p>
      <div style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{post.content}</div>
      {isAuthor && (
        <div style={{ marginTop: '2rem' }}>
          <Link to={`/posts/${post.id}/edit`} style={{ marginRight: '1rem' }}>Редактировать</Link>
          <button onClick={handleDelete}>Удалить</button>
        </div>
      )}
      <div style={{ marginTop: '2rem' }}>
        <Link to="/">← Назад к списку</Link>
      </div>
    </div>
  );
};

export default PostDetail;