import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, updatePost } from '../api/posts';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getPost(parseInt(id));
        if (data.ok && data.post) {
          if (user?.id !== data.post.authorId) {
            setError('У вас нет прав на редактирование этого поста');
          } else {
            setTitle(data.post.title);
            setContent(data.post.content || '');
          }
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
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Заголовок обязателен');
      return;
    }
    setSubmitting(true);
    try {
      const data = await updatePost(parseInt(id!), title, content);
      if (data.ok && data.post) {
        navigate(`/posts/${data.post.id}`);
      } else {
        setError(data.error || 'Ошибка обновления');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка сети');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <h1>Редактировать пост</h1>
      <form onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}
        <div style={{ marginBottom: '1rem' }}>
          <label>Заголовок</label><br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Содержание</label><br />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button type="submit" disabled={submitting} style={{ padding: '0.5rem 1rem' }}>
          {submitting ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
};

export default EditPost;