import React from 'react';

const Loader = () => (
  <div className="flex justify-center items-center h-40">
    {/* Loader animation with better colors and shadow for visual appeal */}
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 border-solid opacity-75 shadow-lg"></div>
  </div>
);

export default Loader;