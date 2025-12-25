import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../context/SocketContext'; 

const Header = () => {
  const { user, logout } = useAuth();
  // Get notifications and a setter to clear them when viewed (optional, but good practice)
  const { notifications, setNotifications } = useSocket(); 
  const navigate = useNavigate();
  
  // Use a simple count of all notifications for the badge
  const unreadCount = notifications ? notifications.length : 0; 

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Placeholder function for handling notification view
  const handleViewNotifications = () => {
      if (unreadCount > 0) {
        alert(notifications.map(n => n.message).join('\n'));
        setNotifications([]); // Clear notifications after viewing
      } else {
        alert('No new notifications.');
      }
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 transition-colors">
      <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Logo/App Name */}
        <Link to="/" className="text-2xl sm:text-3xl font-extrabold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 transition-colors tracking-tighter">
          ToolSwap
        </Link>
        <div className="flex items-center space-x-4 sm:space-x-6">
          
          {user ? (
            <>
              {/* Notification Bell Icon */}
              <button 
                onClick={handleViewNotifications}
                className="relative text-xl text-gray-700 dark:text-gray-300 hover:text-indigo-500 interactive-button"
                title="Notifications"
              >
                🔔
                {/* Unread count badge */}
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Greeting: Hidden on small screen */}
              <span className="text-gray-700 dark:text-gray-300 text-sm hidden sm:block">
                Welcome, <span className="font-bold">{user.name.split(' ')[0]}</span>!
              </span>

              {/* List a Tool Button */}
              <Link 
                to="/add-tool" 
                className="interactive-button text-white bg-indigo-600 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-indigo-700 shadow-md"
              >
                List a Tool
              </Link>
              
              {/* Logout Button */}
              <button 
                onClick={handleLogout} 
                className="text-gray-600 dark:text-gray-400 text-sm hover:text-red-500 transition-colors hidden sm:block"
              >
                Logout
              </button>
              
              {/* Profile Avatar */}
              <Link to="/profile" title="My Profile" className="interactive-button">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-md sm:text-lg ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-gray-800 hover:ring-indigo-600 transition-all duration-200">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </Link>
            </>
          ) : (
            <>
              {/* Login/Sign Up Links */}
              <Link 
                to="/login" 
                className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="interactive-button text-white bg-indigo-500 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-indigo-600 shadow-md"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;