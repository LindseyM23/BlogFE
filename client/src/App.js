import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import Signup from './Signup';
import Login from './Login';
import Blog from './Blog';
import Home from './Home';
import BlogPost from './BlogPost';
import MyBlogs from './MyBlogs';

function App() {
  return (
    <Router>
        <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        closeOnClick 
        pauseOnHover 
        draggable 
      />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:postId" element={<BlogPost />} />
        <Route path="/" element={<Home />} />
        <Route path="/my-blogs" element={<MyBlogs />} />
      </Routes>
    </Router>
  );
}

export default App;