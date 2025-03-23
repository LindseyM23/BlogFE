import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const BlogPost = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : null;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      setLoadingPost(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/posts`);
        const foundPost = response.data.find(p => p.id === parseInt(postId));
        console.log('Fetched posts:', response.data);
        console.log('Found post:', foundPost);
        if (!foundPost) {
          toast.error('Post not found');
          setPost(null);
        } else {
          setPost(foundPost);
          await fetchComments(postId);
        }
      } catch (error) {
        console.error('Error fetching post:', error.response?.data || error.message);
        toast.error('Failed to load post');
        setPost(null);
      } finally {
        setLoadingPost(false);
      }
    };
    fetchPost();
  }, [postId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log('Post state updated:', post);
  }, [post]);

  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/comments/post/${postId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error.response?.data || error.message);
      toast.error('Failed to load comments');
    }
  };

  const handleCommentSubmit = async (parentCommentId = null) => {
    setLoadingAction(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/comments`, {
        postId: post.id,
        parentCommentId,
        content: newComment,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newCommentData = { id: response.data.commentId, user_id: post.user_id, post_id: post.id, parent_comment_id: parentCommentId, content: newComment, created_at: new Date(), username: post.username };
      setComments([...comments, newCommentData]);
      setNewComment('');
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Comment failed');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCommentDelete = async () => {
    setLoadingAction(true);
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/comments/${commentToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(comments.filter(comment => comment.id !== commentToDelete));
      toast.success('Comment deleted!');
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Delete failed');
    } finally {
      setLoadingAction(false);
      setShowDeleteModal(false);
      setCommentToDelete(null);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setLoadingAction(true);
      try {
        await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Post deleted!');
        navigate('/blog');
      } catch (error) {
        console.error(error.response?.data || error.message);
        toast.error(error.response?.data?.message || 'Delete failed');
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleLike = async () => {
    setLoadingAction(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/posts`);
      const updatedPost = response.data.find(p => p.id === parseInt(postId));
      setPost(updatedPost);
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Like failed');
    } finally {
      setLoadingAction(false);
    }
  };

  const renderComments = (parentId = null, level = 0) => {
    return comments
      .filter(comment => comment.parent_comment_id === parentId)
      .map(comment => (
        <div key={comment.id} style={{ marginLeft: `${level * 20}px`, borderLeft: level > 0 ? '2px solid #ccc' : 'none', paddingLeft: '10px' }}>
          <p>{comment.content}</p>
          <p>By: {comment.username} | {new Date(comment.created_at).toLocaleString()}</p>
          {comment.user_id === user?.id && (
            <button
              onClick={() => {
                setCommentToDelete(comment.id);
                setShowDeleteModal(true);
              }}
              disabled={loadingAction}
            >
              {loadingAction ? <span className="spinner"></span> : 'Delete'}
            </button>
          )}
          <form onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(comment.id); }}>
            <input
              type="text"
              placeholder="Reply..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={loadingAction}
            />
            <button type="submit" disabled={loadingAction}>
              {loadingAction ? <span className="spinner"></span> : 'Reply'}
            </button>
          </form>
          {renderComments(comment.id, level + 1)}
        </div>
      ));
  };

  if (loadingPost) {
    return <div><span className="spinner"></span> Loading post...</div>;
  }

  if (!post) {
    return (
      <div>
        Post not found. <button onClick={() => navigate('/blog')}>Back to Blog</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate('/blog')} style={{ marginBottom: '10px' }} disabled={loadingAction}>Back to Blog</button>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      {post.image && <img src={`${process.env.REACT_APP_API_BASE_URL}${post.image}`} alt={post.title} style={{ maxWidth: '300px' }} />}
      <p>By: {post.username} | {new Date(post.created_at).toLocaleString()}</p>
      <p>Likes: {post.like_count || 0}</p>
      <button onClick={handleLike} disabled={loadingAction}>
        {loadingAction ? <span className="spinner"></span> : 'Like'}
      </button>
      {post.user_id === user?.id && (
        <button onClick={handleDeletePost} style={{ marginLeft: '10px' }} disabled={loadingAction}>
          {loadingAction ? <span className="spinner"></span> : 'Delete Post'}
        </button>
      )}
      <h3>Comments</h3>
      <form onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(); }}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={loadingAction}
        />
        <button type="submit" disabled={loadingAction}>
          {loadingAction ? <span className="spinner"></span> : 'Comment'}
        </button>
      </form>
      {renderComments()}

      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '20px', borderRadius: '5px', textAlign: 'center'
          }}>
            <h3>Are you sure you want to delete this comment?</h3>
            <button
              onClick={handleCommentDelete}
              style={{ marginRight: '10px', padding: '5px 10px' }}
              disabled={loadingAction}
            >
              {loadingAction ? <span className="spinner"></span> : 'Yes'}
            </button>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setCommentToDelete(null);
              }}
              style={{ padding: '5px 10px' }}
              disabled={loadingAction}
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPost;