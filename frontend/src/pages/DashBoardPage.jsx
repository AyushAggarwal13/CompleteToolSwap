import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import Loader from '../components/Loader';

const DashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/bookings/my-bookings');
        setBookings(data);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

// This useEffect listens for ALL real-time updates from the socket
useEffect(() => {
  if (socket) {
    // Listener for when a NEW request comes in for one of your tools
    const handleNewRequest = (newBooking) => {
      // Add the new booking to the top of the list
      setBookings(prevBookings => [newBooking.bookingDetails, ...prevBookings]);
    };

    // Listener for when a request you made gets approved/declined
    const handleStatusUpdate = (updatedBooking) => {
      setBookings(prevBookings => 
        prevBookings.map(b => b._id === updatedBooking.bookingDetails._id ? updatedBooking.bookingDetails : b)
      );
    };

    socket.on('new_booking_request', handleNewRequest);
    socket.on('booking_status_updated', handleStatusUpdate);

    // Clean up the listeners
    return () => {
      socket.off('new_booking_request', handleNewRequest);
      socket.off('booking_status_updated', handleStatusUpdate);
    };
  }
}, [socket]);
  
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const { data: updatedBooking } = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      setBookings(bookings.map(b => b._id === bookingId ? updatedBooking : b));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleReview = async (bookingId, rating, comment) => {
    try {
      await api.post('/users/reviews', { bookingId, rating, comment });
      alert('Review submitted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };


  if (loading || !user) {
    return <Loader />;
  }
  
  const bookingsAsOwner = bookings.filter(b => b.owner._id === user._id);
  const bookingsAsBorrower = bookings.filter(b => b.borrower._id === user._id);

  const formatDateTime = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  const ReviewForm = ({ booking }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    return (
      <div className="mt-2 p-4 border rounded-md">
        <h4 className="font-semibold mb-2">Leave a Review</h4>
        <div className="flex items-center mb-2">
          <label className="mr-2">Rating:</label>
          <select value={rating} onChange={(e) => setRating(e.target.value)} className="p-1 border rounded">
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
        <textarea
          className="w-full p-2 border rounded-md"
          placeholder="Add a comment (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button 
          onClick={() => handleReview(booking._id, rating, comment)}
          className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Submit Review
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>
      
      {/* Requests for Your Tools */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Requests for Your Tools</h2>
        {bookingsAsOwner.length > 0 ? (
          <ul>
            {bookingsAsOwner.map(booking => (
              <li key={booking._id} className="border-b py-3 flex justify-between items-center">
                <div>
                {/*
                  <p><span className="font-semibold">{booking.borrower.name}</span> wants to borrow <span className="font-semibold">{booking.tool.name}</span></p>
                */}
                  <p className="text-sm text-gray-500">Status: {booking.status}</p>
                  <p className="text-xs text-gray-400">
                    From: {formatDateTime(booking.startDate)} to {formatDateTime(booking.endDate)}
                  </p>
                </div>
                {booking.status === 'pending' && (
                  <div>
                    <button onClick={() => handleStatusUpdate(booking._id, 'approved')} className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600">Approve</button>
                    <button onClick={() => handleStatusUpdate(booking._id, 'declined')} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Decline</button>
                  </div>
                )}
                 {booking.status === 'completed' && <ReviewForm booking={booking} />}
              </li>
            ))}
          </ul>
        ) : <p>No one has requested your tools yet.</p>}
      </div>

      {/* Your Borrowing Requests */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Your Borrowing Requests</h2>
        {bookingsAsBorrower.length > 0 ? (
           <ul>
            {bookingsAsBorrower.map(booking => (
              <li key={booking._id} className="border-b py-3">
                <p>You requested to borrow <span className="font-semibold">{booking.tool.name}</span> from <span className="font-semibold">{booking.owner.name}</span></p>
                <p className="text-sm text-gray-500">Status: {booking.status}</p>
                 <p className="text-xs text-gray-400">
                    From: {formatDateTime(booking.startDate)} to {formatDateTime(booking.endDate)}
                  </p>
                  {booking.status === 'completed' && <ReviewForm booking={booking} />}
              </li>
            ))}
          </ul>
        ) : <p>You haven't requested any tools yet.</p>}
      </div>
    </div>
  );
};

export default DashboardPage;