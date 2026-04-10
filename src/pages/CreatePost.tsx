import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../api/posts';
import ErrorMessage from '../components/ErrorMessage';

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Заголовок обязателен');
      return;
    }
    setSubmitting(true);
    try {
      const data = await createPost(title, content);
      if (data.ok && data.post) {
        navigate(`/posts/${data.post.id}`);
      } else {
        setError(data.error || 'Ошибка создания поста');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка сети');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <h1>Создать пост</h1>
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
          {submitting ? 'Публикация...' : 'Опубликовать'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;