import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { SystemSettingsProvider } from './context/SystemSettingsContext';

// Import các component
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StationForm from './pages/admin/StationForm';
import StationList from './pages/admin/StationList';
import TeamRanking from './pages/admin/TeamRanking';
import AdminProfile from './pages/admin/AdminProfile';
import AdminSettings from './pages/admin/AdminSettings';
import UserStation from './pages/user/UserStation';
import NotFound from './pages/NotFound';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import TeamList from './pages/admin/TeamList';
import SubmissionsHistory from './pages/admin/SubmissionsHistory';
import { authApi } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra trạng thái xác thực khi component được load
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await authApi.getMe();
          setIsAuthenticated(true);
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Kiểm tra và áp dụng chế độ tối từ localStorage
  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  // Route bảo vệ cho admin
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div className="loading">Đang tải...</div>;
    }
    
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <SystemSettingsProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/stations" element={
              <ProtectedRoute>
                <StationList />
              </ProtectedRoute>
            } />
            <Route path="/admin/stations/new" element={
              <ProtectedRoute>
                <StationForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/stations/edit/:id" element={
              <ProtectedRoute>
                <StationForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/teams" element={
              <ProtectedRoute>
                <TeamList />
              </ProtectedRoute>
            } />
            <Route path="/admin/ranking" element={
              <ProtectedRoute>
                <TeamRanking />
              </ProtectedRoute>
            } />
            <Route path="/admin/submissions" element={
              <ProtectedRoute>
                <SubmissionsHistory />
              </ProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <ProtectedRoute>
                <AdminProfile />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <AdminSettings />
              </ProtectedRoute>
            } />
            
            {/* User routes */}
            <Route path="/station/:stationId" element={<UserStation />} />
            
            {/* Default routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </SystemSettingsProvider>
  );
}

export default App;
