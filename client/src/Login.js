import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { validatePassword } from './utils';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/users/login`, { username, password });
      console.log('Login response token:', response.data.token);
      localStorage.setItem('token', response.data.token);
      toast.success('Login successful!');
      navigate('/blog');
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/reset/request`, { username: resetUsername });
      console.log(`Reset code: ${response.data.code}`);
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Reset request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetVerify = async (e) => {
    e.preventDefault();
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/reset/verify`, { username: resetUsername, code: resetCode, newPassword });
      console.log('Password reset successfully');
      setShowReset(false);
      setResetUsername('');
      setResetCode('');
      setNewPassword('');
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {!showReset ? (
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
          <button type="submit" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Login'}
          </button>
          <p>
            <button type="button" onClick={() => setShowReset(true)} disabled={loading}>Forgot Password?</button>
          </p>
        </form>
      ) : (
        <div>
          <h3>Reset Password</h3>
          <form onSubmit={handleResetRequest}>
            <input type="text" placeholder="Username" value={resetUsername} onChange={(e) => setResetUsername(e.target.value)} disabled={loading} />
            <button type="submit" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Request Reset Code'}
            </button>
          </form>
          <form onSubmit={handleResetVerify}>
            <input type="text" placeholder="Reset Code" value={resetCode} onChange={(e) => setResetCode(e.target.value)} disabled={loading} />
            <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} />
            <button type="submit" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Reset Password'}
            </button>
          </form>
          <button type="button" onClick={() => setShowReset(false)} disabled={loading}>Back to Login</button>
        </div>
      )}
    </div>
  );
};

export default Login;