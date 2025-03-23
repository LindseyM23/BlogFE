import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Welcome to the Blog</h1>
      <p>Please choose an option:</p>
      <button onClick={handleLogin} style={{ margin: '10px', padding: '10px 20px' }}>Log In</button>
      <button onClick={handleSignup} style={{ margin: '10px', padding: '10px 20px' }}>Sign Up</button>
    </div>
  );
};

export default Home;