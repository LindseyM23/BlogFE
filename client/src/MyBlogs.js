import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const MyBlogs = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : null;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/posts`);
        const userPosts = response.data.filter(post => post.user_id === user.id);
        setPosts(userPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [user?.id]);

  const handleView = (postId) => {
    navigate(`/blog/${postId}`);
  };

  const handleBack = () => {
    navigate('/blog');
  };

  return (
    <div>
      <button onClick={handleBack} style={{ marginBottom: '10px' }}>Back to All Blogs</button>
      <h2>My Blogs</h2>
      {loading ? (
        <div><span className="spinner"></span> Loading posts...</div>
      ) : posts.length === 0 ? (
        <p>You haven't created any posts yet.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', display: 'flex', alignItems: 'center' }}>
            {post.image && <img src={`${process.env.REACT_APP_API_BASE_URL}${post.image}`} alt={post.title} style={{ maxWidth: '100px', marginRight: '10px' }} />}
            <div style={{ flex: 1 }}>
              <h4>{post.title}</h4>
              <p>{post.description}</p>
              <p>By: {post.username} | {new Date(post.created_at).toLocaleString()}</p>
              <p>Likes: {post.like_count || 0}</p>
              <button onClick={() => handleView(post.id)}>View</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyBlogs;