import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : null;
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login'); // Redirect if no token
      return;
    }
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000; // Current time in seconds
    if (decoded.exp < now) {
      toast.error('Session expired. Please log in again.');
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/posts`);
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error.response?.data || error.message);
        toast.error('Failed to load posts');
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please log in to create a post');
      navigate('/login');
      return;
    }
    setLoadingAction(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('description', description);
    if (image) formData.append('image', image);

    try {
      if (editingPostId) {
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/posts/${editingPostId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
        });
        toast.success('Post updated successfully!');
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/posts`, formData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
        });
        toast.success('Post created successfully!');
      }
      const updatedPosts = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/posts`);
      setPosts(updatedPosts.data);
      setEditingPostId(null);
      setTitle('');
      setContent('');
      setDescription('');
      setImage(null);
      setShowCreateForm(false);
    } catch (error) {
      console.error(error.response?.data || error.message);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Action failed');
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setDescription(post.description);
    setImage(null);
    setShowCreateForm(true);
  };

  const handleView = (postId) => {
    navigate(`/blog/${postId}`);
  };

  const handleLike = async (postId) => {
    setLoadingAction(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedPosts = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/posts`);
      setPosts(updatedPosts.data);
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Like failed');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleMyBlogs = () => {
    navigate('/my-blogs');
  };

  return (
    <div>
      <button onClick={handleBack} style={{ marginBottom: '10px', marginRight: '10px' }}>Back</button>
      <button onClick={handleLogout} style={{ marginBottom: '10px', marginRight: '10px' }}>Logout</button>
      <button onClick={handleMyBlogs} style={{ marginBottom: '10px' }}>My Blogs</button>
      <h2>Welcome, {user?.username || 'Guest'}!</h2>

      {!showCreateForm && (
        <button onClick={() => setShowCreateForm(true)} style={{ marginBottom: '20px' }} disabled={loadingAction}>
          Create Post
        </button>
      )}

      {showCreateForm && (
        <div>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={loadingAction} />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loadingAction} />
            <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} disabled={loadingAction} />
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} disabled={loadingAction} />
            <button type="submit" disabled={loadingAction}>
              {loadingAction ? <span className="spinner"></span> : (editingPostId ? 'Update Post' : 'Create Post')}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingPostId(null);
                setTitle('');
                setContent('');
                setDescription('');
                setImage(null);
                setShowCreateForm(false);
              }}
              style={{ marginLeft: '10px' }}
              disabled={loadingAction}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <h3>All Posts</h3>
      {loadingPosts ? (
        <div><span className="spinner"></span> Loading posts...</div>
      ) : (
        posts.map((post) => (
          <div key={post.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', display: 'flex', alignItems: 'center' }}>
            {post.image && <img src={`${process.env.REACT_APP_API_BASE_URL}${post.image}`} alt={post.title} style={{ maxWidth: '100px', marginRight: '10px' }} />}
            <div style={{ flex: 1 }}>
              <h4>{post.title}</h4>
              <p>{post.description}</p>
              <p>By: {post.username} | {new Date(post.created_at).toLocaleString()}</p>
              <p>Likes: {post.like_count || 0}</p>
              <button onClick={() => handleLike(post.id)} disabled={loadingAction}>
                {loadingAction ? <span className="spinner"></span> : 'Like'}
              </button>
              <button onClick={() => handleView(post.id)} style={{ marginLeft: '10px' }} disabled={loadingAction}>View</button>
              {post.user_id === user?.id && (
                <button onClick={() => handleEdit(post)} style={{ marginLeft: '10px' }} disabled={loadingAction}>Edit</button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Blog;