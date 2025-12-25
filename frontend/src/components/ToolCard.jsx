
import React from 'react';
import { Link } from 'react-router-dom';

const ToolCard = ({ tool, onlineUsers = [] }) => {
    const isOwnerOnline = onlineUsers.includes(tool.owner._id);

    const solidCardClass = "bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300";

    return (
        <div className={`rounded-xl overflow-hidden interactive-button ${solidCardClass} hover:shadow-xl`}> 
            <Link to={`/tool/${tool._id}`}>
                <img 
                    src={tool.imageUrl} 
                    alt={tool.name} 
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-[1.05]" 
                />
                <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 truncate">{tool.name}</h3> 
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-3">{tool.category}</p>
                    
                    <div className="flex justify-between items-center text-xs">
                        
                        <p className="text-gray-600 dark:text-gray-300 flex items-center">
                            Owner: <span className="font-semibold ml-1 text-indigo-700 dark:text-indigo-400">{tool.owner.name}</span>
                        </p> 
                        
                        {isOwnerOnline ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-600 text-white dark:bg-green-700">
                                Online
                            </span>
                        ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                                Offline
                            </span>
                        )}

                    </div>
                    
                    <div className="mt-2 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            tool.condition === 'New' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-white' :
                            tool.condition === 'Good' ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-white'
                        }`}>
                            {tool.condition}
                        </span>
                    </div>

                </div>
            </Link>
        </div>
    );
};

export default ToolCard;