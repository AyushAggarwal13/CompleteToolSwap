import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/Loader';

const ToolDetailPage = () => {
  // State variables (Logic remains unchanged)
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [requestCount, setRequestCount] = useState(0); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch tool data (Logic remains unchanged)
  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No tool ID provided.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: toolData } = await api.get(`/tools/${id}`);
        setTool(toolData);
        
        // Check user booking history
        if (user) {
          const { data: bookingsData } = await api.get('/bookings/my-bookings');
          
          const userRequestsForThisTool = bookingsData.filter(
            // Filter user requests
            b => b.tool?._id === id && b.borrower?._id === user._id
          );
          
          const activeRequest = userRequestsForThisTool.find(
            // Find active request
            b => b.status === 'pending' || b.status === 'approved'
          );

          if (activeRequest) {
            // Block new requests
            setRequestCount(3);
            setBookingMessage(`You have an active request for this tool. Status: ${activeRequest.status}`);
          } else {
            setRequestCount(userRequestsForThisTool.length);
            if (userRequestsForThisTool.length >= 3) {
              setBookingMessage('You have reached the maximum number of requests for this tool.');
            }
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not fetch tool details. The tool may have been deleted.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  // Handle booking request (Logic remains unchanged)
  const handleBookingRequest = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Client-side validation
    if (!startDate || !endDate) {
      setError('Please select both a start and end date.');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError('End date must be after start date.');
      return;
    }

    setError('');
    setBookingMessage('');

    try {
      await api.post('/bookings', {
        toolId: tool._id,
        startDate: startDate,
        endDate: endDate,
      });
      // Update state on success
      setBookingMessage('Booking request sent successfully!');
      setRequestCount(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send booking request.');
    }
  };

  // Loading and error handling
  if (loading) return <Loader />;
  if (error && !tool) return <p className="text-red-500 text-center mt-10">{error}</p>;
  if (!tool) return <p className="text-center mt-10">Tool not found.</p>;

  // Conditional logic
  const isOwner = user && user._id === tool.owner?._id;
  const canRequest = !isOwner && requestCount < 3;
  const isButtonDisabled = !startDate || !endDate || !canRequest;

  return (
    <div className="max-w-6xl mx-auto mt-12 p-4"> {/* Layout container */}
      {/* Updated container with solid, high-contrast, modern style */}
      <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"> 
        <div className="grid md:grid-cols-2 gap-12"> {/* Two-column layout */}
          
          {/* Image Column */}
          <div className="shadow-xl rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
            <img 
              src={tool.imageUrl} 
              alt={tool.name} 
              className="w-full h-96 object-cover" 
            />
          </div>

          {/* Details & Booking Column */}
          <div className="space-y-6">
            {/* Title & Category */}
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">{tool.name}</h1>
            <p className="text-xl text-indigo-600 dark:text-indigo-400 font-medium">{tool.category}</p>
            
            {/* Owner and Condition Info */}
            <div className="flex items-center space-x-8 text-sm">
                <p className="text-gray-700 dark:text-gray-400">
                    Owner: <span className="font-semibold">{tool.owner?.name || 'Unknown'}</span>
                </p>
                <p className="font-bold text-blue-600 dark:text-blue-400">
                    Condition: {tool.condition}
                </p>
                <p className="text-gray-700 dark:text-gray-400">
                    Trust Score: <span className="font-bold text-green-600 dark:text-green-400">{tool.owner?.trustScore || 'N/A'}/5</span>
                </p>
            </div>
            
            {/* Tool Description */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
            </div>
            
            {/* Status Messages */}
            {error && <p className="text-red-500 font-medium">{error}</p>}
            {bookingMessage && <p className="text-green-600 font-medium">{bookingMessage}</p>}
            
            {/* Booking/Action Section */}
            {user && !isOwner ? (
                <>
                    {canRequest && (
                      <div className="pt-4 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">Request Dates</h3>
                        <div className="flex gap-4">
                            <input 
                              type="datetime-local"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              required
                              // Updated input styles
                              className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <input 
                              type="datetime-local"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              required
                              // Updated input styles
                              className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button
                          onClick={handleBookingRequest}
                          disabled={isButtonDisabled}
                          // Updated button styles with interactive class
                          className={`w-full text-white py-3 rounded-xl font-bold interactive-button transition-colors ${isButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'}`}
                        >
                          Request to Borrow
                        </button>
                      </div>
                    )}
                    
                </>
            ) : isOwner ? (
                // Owner action link
                <Link 
                    to={`/tool/${tool._id}/edit`} 
                    className="w-full inline-block text-center text-white py-3 rounded-xl font-bold interactive-button transition-colors bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                    Manage Tool
                </Link>
            ) : (
                // Login prompt
                <button
                    onClick={() => navigate('/login')}
                    className="w-full text-white py-3 rounded-xl font-bold interactive-button transition-colors bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                    Login to Request
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolDetailPage;