import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext'; // Import useSocket

const DashboardPage = () => {
  // State for bookings
  const [bookings, setBookings] = useState([]);
  // Loading state
  const [loading, setLoading] = useState(true);
  // Access user info
  const { user } = useAuth();
  const { socket } = useSocket(); // Get socket instance

  // Fetch user's bookings
  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/bookings/my-bookings');
        // Filter out expired bookings on the client-side for cleaner display
        const now = new Date().toISOString(); 
        const filteredData = data.map(booking => {
            if (booking.status === 'approved' && new Date(booking.endDate).toISOString() < now) {
                // Client-side mock of expired state for immediate UI feedback. 
                // The cron job will officially mark it as 'completed' on the server side.
                return { ...booking, status: 'expired' }; 
            }
            return booking;
        });
        setBookings(filteredData);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  // Socket Listener: Update bookings list in real-time
  useEffect(() => {
    if (socket) {
      const handleUpdate = (updateData) => {
        setBookings(prevBookings => {
          const updatedBooking = updateData.bookingDetails;
          const exists = prevBookings.some(b => b._id === updatedBooking._id);

          if (exists) {
            // Update existing booking status
            return prevBookings.map(b => b._id === updatedBooking._id ? updatedBooking : b);
          } else {
            // Add new booking (for incoming requests)
            return [updatedBooking, ...prevBookings];
          }
        });
        alert(updateData.message); // Show real-time alert
      };

      socket.on('new_booking_request', handleUpdate);
      socket.on('booking_status_updated', handleUpdate);

      return () => {
        socket.off('new_booking_request', handleUpdate);
        socket.off('booking_status_updated', handleUpdate);
      };
    }
  }, [socket]);
  
  // Handle booking status update (Logic remains unchanged)
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      // API call triggers backend logic and socket notification
      const { data: updatedBooking } = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      setBookings(bookings.map(b => b._id === bookingId ? updatedBooking : b));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  // Handle Review submission (Logic remains unchanged)
  const handleReview = async (bookingId, rating, comment) => {
    try {
      await api.post('/users/reviews', { bookingId, rating, comment });
      alert('Review submitted successfully!');
      // Update local state to hide review form (e.g. change status to 'reviewed')
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: 'reviewed' } : b));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };
  
  // Helper function for status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-white';
      case 'declined':
        return 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-white';
      case 'completed':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-white';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-white';
      case 'expired':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-white';
      case 'reviewed':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-700 dark:text-white';
      case 'pending':
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white';
    }
  };

  if (loading || !user) {
    return <Loader />;
  }
  
  // Filter bookings
  const bookingsAsOwner = bookings.filter(b => b.owner?._id === user._id);
  const bookingsAsBorrower = bookings.filter(b => b.borrower?._id === user._id);

  // Review form component moved inline for simplicity
  const ReviewForm = ({ booking, isBorrower }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        handleReview(booking._id, rating, comment);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Rate the {isBorrower ? 'Owner' : 'Borrower'} - {isBorrower ? booking.owner.name : booking.borrower.name}
            </h4>
            
            <div className="mb-3 flex items-center">
                <label className="mr-3 text-sm text-gray-600 dark:text-gray-400">Rating:</label>
                <select 
                    value={rating} 
                    onChange={(e) => setRating(parseInt(e.target.value))} 
                    className="p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:text-white text-sm"
                >
                    {[5, 4, 3, 2, 1].map(num => (
                        <option key={num} value={num}>{num} Stars</option>
                    ))}
                </select>
            </div>
            
            <textarea
                className="w-full p-3 border border-gray-300 rounded-md bg-white dark:bg-gray-900 dark:text-white text-sm"
                placeholder="Add a comment (optional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="2"
            />
            
            <button 
                type="submit"
                className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-full font-semibold text-sm interactive-button hover:bg-indigo-700"
            >
                Submit Review
            </button>
        </form>
    );
  };


  const renderBookingItem = (booking, isOwnerView) => {
    // Determine if the user should be able to leave a review
    const isReadyForReview = booking.status === 'completed';

    return (
        <div 
            key={booking._id} 
            className="p-4 bg-white dark:bg-gray-700 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-600"
        >
            <Link to={`/tool/${booking.tool?._id}`} className="flex-1 min-w-0 mb-3 md:mb-0">
                <p className="text-gray-800 dark:text-white truncate font-medium">
                    {isOwnerView 
                        ? `Request from ` 
                        : `You requested `}
                    <span className="font-bold text-indigo-700 dark:text-indigo-400">
                        {isOwnerView ? (booking.borrower?.name || 'Deleted User') : (booking.tool?.name || 'Deleted Tool')}
                    </span>
                    {isOwnerView ? ` for ${booking.tool?.name || 'Deleted Tool'}` : ''}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Tool: {booking.tool?.name || 'N/A'} |
                    Dates: {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                </p>
            </Link>
            
            <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:space-x-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(booking.status)} interactive-button`}>
                    {booking.status} {/* Status badge */}
                </span>
                
                {/* Action buttons (Owner view only) */}
                {isOwnerView && booking.status === 'pending' && (
                    <div className='flex space-x-2'>
                        <button
                            onClick={() => handleStatusUpdate(booking._id, 'approved')}
                            className="interactive-button bg-green-600 text-white text-xs px-3 py-1 rounded-full hover:bg-green-700"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => handleStatusUpdate(booking._id, 'declined')}
                            className="interactive-button bg-red-600 text-white text-xs px-3 py-1 rounded-full hover:bg-red-700"
                        >
                            Decline
                        </button>
                    </div>
                )}
            </div>
            
            {(isReadyForReview && booking.status !== 'reviewed') && (
                <div className="w-full">
                    <ReviewForm booking={booking} isBorrower={!isOwnerView} />
                </div>
            )}
            
        </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto mt-12 space-y-8"> {/* Main container */}
      <h1 className="text-3xl font-extrabold mb-8 text-gray-800 dark:text-white">Your Dashboard</h1> {/* Page title */}

      {/* Requests to Borrow (Borrower View) */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"> 
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b border-gray-300 dark:border-gray-600 pb-2">Your Borrowing Requests</h2> {/* Section title */}
        <div className="space-y-4">
          {bookingsAsBorrower.length > 0 ? (
            bookingsAsBorrower.map(booking => renderBookingItem(booking, false))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">You haven't requested any tools yet.</p>
          )}
        </div>
      </div>

      {/* Requests for Your Tools (Owner View) */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"> 
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b border-gray-300 dark:border-gray-600 pb-2">Requests for Your Tools</h2> {/* Section title */}
        <div className="space-y-4">
          {bookingsAsOwner.length > 0 ? (
            bookingsAsOwner.map(booking => renderBookingItem(booking, true))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No requests for your listed tools yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;