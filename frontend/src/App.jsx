import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddToolPage from './pages/AddToolPage';
import ToolDetailPage from './pages/ToolDetailPage';
import ProfilePage from './pages/ProfilePage';
import EditToolPage from './pages/EditToolPage';


function App() {
  return (
    // Updated container with custom background and dark mode
    <div className="modern-background min-h-screen dark:bg-gray-900 dark:text-gray-200 text-gray-900 transition-colors duration-500"> 
      <Header />
      <main className="container mx-auto p-4">

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* New route for editing a tool */}
          <Route path="/tool/:id/edit" element={<EditToolPage />} />
          <Route path="/add-tool" element={<AddToolPage />} />
          <Route path="/tool/:id" element={<ToolDetailPage />} />

        </Routes>
      </main>
    </div>
  );
}

export default App;