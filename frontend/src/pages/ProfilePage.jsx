import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axiosConfig";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  // Access user info
  const { user } = useAuth();
  // State for user's tools
  const [myTools, setMyTools] = useState([]);
  // Loading state
  const [loading, setLoading] = useState(true);

  // Fetch user's tools (Logic remains unchanged)
  useEffect(() => {
    const fetchMyTools = async () => {
      try {
        // Fetches tools using the new backend route
        const { data } = await api.get(`/tools/user/${user._id}`);
        setMyTools(data);
      } catch (error) {
        console.error("Failed to fetch user's tools", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchMyTools();
    }
  }, [user]);

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto mt-12 space-y-8"> {/* Main container */}
      
      {/* Profile Info Card: Solid high-contrast style */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"> 
        <div className="flex items-center space-x-6">
          {/* Avatar with background color based on theme */}
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white font-extrabold text-3xl ring-4 ring-indigo-300 dark:bg-indigo-500 dark:ring-indigo-700">
            {user?.name.charAt(0).toUpperCase()} {/* Avatar */}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{user?.name}</h1> {/* User name */}
            <p className="text-indigo-500 font-medium">{user?.email}</p> {/* User email */}
            <div className="mt-2 flex items-center text-sm font-semibold text-green-600 dark:text-green-400">
                <span className="mr-1">⭐</span>
                Trust Score: {user?.trustScore || 'N/A'}/5 {/* Trust score */}
            </div>
          </div>
        </div>
      </div>

      {/* My Listed Tools Card */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"> 
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-2">My Listed Tools</h2> {/* Section title */}
        {myTools.length > 0 ? (
          <div className="space-y-4">
            {myTools.map((tool) => (
              <div
                key={tool._id}
                // Updated list item style with hover effect
                className="p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl flex justify-between items-center transition duration-200 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30 shadow-sm"
              >
                <Link to={`/tool/${tool._id}`} className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white hover:text-indigo-600 truncate">
                    {tool.name} {/* Tool name */}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{tool.category}</p> {/* Tool category */}
                </Link>
                <div>
                  {/* Edit Button: Interactive and colorful */}
                  <Link
                    to={`/tool/${tool._id}/edit`}
                    className="interactive-button text-sm bg-indigo-600 text-white px-4 py-2 rounded-full font-medium hover:bg-indigo-700 shadow-md"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">You have not listed any tools yet. <Link to="/add-tool" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">List your first tool here.</Link></p> 
        )}
      </div>
    </div>
  );
};

export default ProfilePage;