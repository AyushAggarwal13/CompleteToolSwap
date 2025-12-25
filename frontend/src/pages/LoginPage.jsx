import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      {/* Container with modern glassmorphism effect and shadow */}
      <div className="bg-white/70 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 p-10 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900 dark:text-white">Welcome Back</h2>
        
        {error && <p className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-lg mb-6 border border-red-300 dark:border-red-700">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/90 dark:bg-gray-900 dark:text-white" 
            />
          </div>
          
          <div className="mb-8">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/90 dark:bg-gray-900 dark:text-white" 
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold interactive-button hover:bg-indigo-700 shadow-lg dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Login
          </button>
        </form>
        
        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          Don't have an account? 
          <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-800 dark:hover:text-indigo-300 ml-1 transition-colors">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;