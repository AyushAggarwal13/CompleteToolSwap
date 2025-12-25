import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';

const AddToolPage = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('Good');
  const [image, setImage] = useState(null);
  // Using hardcoded location for simplicity.
  const [location] = useState({ longitude: 77.216721, latitude: 28.644800 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please upload an image.');
      return;
    }

    setLoading(true);
    setError('');

    // Prepare FormData object
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('condition', condition);
    formData.append('longitude', location.longitude);
    formData.append('latitude', location.latitude);
    // The key 'image' must match the backend upload.single('image') middleware
    formData.append('image', image);

    try {
      // FIX: Rely on axios to set the correct 'Content-Type': 'multipart/form-data' header automatically.
      await api.post('/tools', formData);
      
      // Navigate to the homepage on success
      navigate('/');
    } catch (err) {
      // Log the full error response for debugging the backend crash
      console.error("Tool listing failed:", err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to list tool. Check your Cloudinary setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12">
      {/* Container with modern glassmorphism effect and shadow */}
      <div className="bg-white/70 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 p-10 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900 dark:text-white">List a New Tool</h2>
        
        {error && <p className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-lg mb-6 border border-red-300 dark:border-red-700">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Tool Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/90 dark:bg-gray-900 dark:text-white" />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Category</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/90 dark:bg-gray-900 dark:text-white" />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/90 dark:bg-gray-900 dark:text-white" />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Condition</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/90 dark:bg-gray-900 dark:text-white appearance-none">
              <option>New</option>
              <option>Good</option>
              <option>Fair</option>
            </select>
          </div>
          <div className="mb-8">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Tool Image</label>
            <input 
              type="file" 
              onChange={(e) => setImage(e.target.files[0])} 
              required 
              className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-200 dark:hover:file:bg-indigo-800 cursor-pointer"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold interactive-button hover:bg-indigo-700 shadow-lg disabled:bg-gray-400 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {loading ? 'Listing...' : 'List Tool'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddToolPage;