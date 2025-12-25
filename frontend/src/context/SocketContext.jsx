import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  // Socket instance state
  const [socket, setSocket] = useState(null);
  // Real-time notification state
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth(); // Access user for authentication

  useEffect(() => {
    // Connect only if a user is logged in
    if (user && user.token) {
      // Assuming Socket.IO server runs on the same base URL as the API (http://localhost:3000)
      const newSocket = io('http://localhost:3000', {
        query: { token: user.token },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      setSocket(newSocket);
      
      // Emit event to add user to the server's activeUsers list
      newSocket.on('connect', () => {
        console.log('Socket Connected. User ID:', user._id);
        newSocket.emit('add_user', user._id); // Essential for real-time features
      });

      // Listener for incoming notifications (e.g., booking approved/declined, new request)
      const handleNotification = (notification) => {
        setNotifications((prevNotifications) => [notification, ...prevNotifications]);
      };
      
      newSocket.on('new_booking_request', handleNotification);
      newSocket.on('booking_status_updated', handleNotification);
      
      // Listener for online/offline status updates (for other users)
      newSocket.on('userStatusUpdate', (data) => {
          console.log(`User ${data.userId} is now ${data.isOnline ? 'online' : 'offline'}`);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket Disconnected');
      });

      // Cleanup on component unmount or user change
      return () => {
        newSocket.off('new_booking_request', handleNotification);
        newSocket.off('booking_status_updated', handleNotification);
        newSocket.close();
        setSocket(null);
      };
    } else if (socket) {
      // If user logs out, disconnect the socket
      socket.close();
      setSocket(null);
      setNotifications([]);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};