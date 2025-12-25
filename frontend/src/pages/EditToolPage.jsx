import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import Loader from '../components/Loader';

const EditToolPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', category: '', description: '', condition: 'Good' });
  const [image, setImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch logic from the updated toolController is required for this to work
  useEffect(() => {
    const fetchTool = async () => {
      try {
        const { data } = await api.get(`/tools/${id}`);
        setFormData({
          name: data.name,
          category: data.category,
          description: data.description,
          condition: data.condition,
        });
        setCurrentImageUrl(data.imageUrl);
      } catch (err) {
        setError('Failed to fetch tool data. Check console for details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTool();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const updatedData = new FormData();
    updatedData.append('name', formData.name);
    updatedData.append('category', formData.category);
    updatedData.append('description', formData.description);
    updatedData.append('condition', formData.condition);
    if (image) {
      updatedData.append('image', image);
    }

    try {
      // Calls the PUT /api/tools/:id endpoint
      await api.put(`/tools/${id}`, updatedData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update tool.');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this tool? This action cannot be undone.')) {
      setLoading(true);
      setError('');
      try {
        // Calls the DELETE /api/tools/:id endpoint
        await api.delete(`/tools/${id}`);
        navigate('/profile');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete tool.');
        setLoading(false);
      }
    }
  };

  if (loading) return <Loader />;
  if (error && !currentImageUrl) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-xl mx-auto mt-12">
      {/* Container with modern glassmorphism effect and shadow */}
      <div className="bg-white/70 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 p-10 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900 dark:text-white">Edit Tool</h2>
        
        {error && <p className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-lg mb-6 border border-red-300 dark:border-red-700">{error}</p>}
        
        <form onSubmit={handleUpdate}>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-4">Current Image</label>
            <img 
              src={currentImageUrl} 
              alt="Current tool" 
              className="w-full h-48 object-cover rounded-xl border border-gray-300 dark:border-gray-600 shadow-md" 
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Tool Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/90 dark:bg-gray-900 dark:text-white" />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Category</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/90 dark:bg-gray-900 dark:text-white" />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/90 dark:bg-gray-900 dark:text-white" />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Condition</label>
            <select name="condition" value={formData.condition} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/90 dark:bg-gray-900 dark:text-white appearance-none">
              <option>New</option>
              <option>Good</option>
              <option>Fair</option>
            </select>
          </div>

          <div className="mb-8">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Upload New Image (Optional)</label>
            <input 
              type="file" 
              onChange={handleImageChange} 
              className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-200 dark:hover:file:bg-indigo-800 cursor-pointer"
            />
          </div>
          
          <div className="flex space-x-4">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold interactive-button hover:bg-indigo-700 shadow-lg disabled:bg-gray-400 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {loading ? 'Updating...' : 'Update Tool'}
            </button>
            <button 
              type="button" 
              onClick={handleDelete} 
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold interactive-button hover:bg-red-700 shadow-lg disabled:bg-gray-400 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {loading ? 'Deleting...' : 'Delete Tool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditToolPage;