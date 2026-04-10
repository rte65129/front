import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface PostCardProps {
  post: Post;
  onDelete?: (id: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  const { user } = useAuth();
  const isAuthor = user?.id === post.authorId;

  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
      <h3>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h3>
      <p>Автор: {post.author.username}</p>
      <p>{post.content?.slice(0, 100)}...</p>
      {isAuthor && (
        <div>
          <Link to={`/posts/${post.id}/edit`} style={{ marginRight: '1rem' }}>Редактировать</Link>
          <button onClick={() => onDelete && onDelete(post.id)}>Удалить</button>
        </div>
      )}
    </div>
  );
};

export default PostCard;