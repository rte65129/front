import React, { useEffect, useState } from 'react';
import { getPosts, deletePost } from '../api/posts';
import { Post } from '../types';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const PostsList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getPosts();
      if (data.ok && data.posts) {
        setPosts(data.posts);
      } else {
        setError(data.error || 'Ошибка загрузки постов');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Удалить пост?')) {
      try {
        const data = await deletePost(id);
        if (data.ok) {
          setPosts(posts.filter(p => p.id !== id));
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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <h1>Все посты</h1>
      {posts.length === 0 && <p>Нет постов. Будьте первым!</p>}
      {posts.map(post => (
        <PostCard key={post.id} post={post} onDelete={handleDelete} />
      ))}
    </div>
  );
};

export default PostsList;