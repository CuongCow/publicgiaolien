import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { SystemSettingsProvider } from './context/SystemSettingsContext';
import LoginNotification from './components/LoginNotification';
import { LanguageProvider } from './context/LanguageContext';
import { translations } from './translations';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

// Import trang Super Admin
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import AdminManagement from './pages/superadmin/AdminManagement';
import InviteCodeManagement from './pages/superadmin/InviteCodeManagement';
import NotificationManagement from './pages/superadmin/NotificationManagement';
import TeamSummary from './pages/superadmin/TeamSummary';
import SafetySettings from './pages/superadmin/SafetySettings';
import SystemLogs from './pages/superadmin/SystemLogs';
import DatabaseManagement from './pages/superadmin/DatabaseManagement';

// Component con để debug translations
const DebugTranslations = () => {
  const { useLanguage } = require('./context/LanguageContext');
  const { language } = useLanguage();
  const { translations } = require('./translations');
  
  useEffect(() => {
    console.log('Debug component loaded with language:', language);
    console.log('Translations available:', Object.keys(translations).join(', '));
    console.log('Current language keys count:', Object.keys(translations[language] || {}).length);
    
    // Log một số key để debug
    const keysToCheck = ['system_overview', 'total_teams', 'total_stations'];
    keysToCheck.forEach(key => {
      console.log(`Key "${key}" có giá trị:`, translations[language]?.[key] || 'không tìm thấy');
    });
  }, [language]);
  
  return null; // Component này không render gì cả
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra trạng thái xác thực khi component được load
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const adminData = localStorage.getItem('admin');
        
        if (token) {
          try {
            // Luôn xác thực với server để đảm bảo token hợp lệ
            const response = await authApi.getMe();
            
            // Nếu thành công, cập nhật thông tin admin nếu cần
            localStorage.setItem('admin', JSON.stringify(response.data));
            setIsAuthenticated(true);
          } catch (tokenError) {
            // Nếu token không hợp lệ, xóa thông tin đăng nhập và đặt lại trạng thái
            localStorage.removeItem('token');
            localStorage.removeItem('admin');
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
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
  const ProtectedRoute = ({ children, requiredRole }) => {
    // Lấy thông tin vai trò của người dùng từ localStorage
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    const userRole = admin?.role || 'user';
    
    if (loading) {
      return <div className="loading">Đang tải...</div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    // Kiểm tra quyền truy cập nếu có yêu cầu
    if (requiredRole && userRole !== requiredRole) {
      // Chuyển hướng đến trang phù hợp với vai trò
      return <Navigate to={userRole === 'superadmin' ? '/superadmin' : '/admin'} />;
    }
    
    return children;
  };
  
  // Route bảo vệ cho Super Admin
  const SuperAdminRoute = ({ children }) => {
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [loadingSuperAdmin, setLoadingSuperAdmin] = useState(true);
    
    useEffect(() => {
      const checkSuperAdmin = async () => {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const response = await authApi.getMe();
            setIsSuperAdmin(response.data.role === 'superadmin');
          }
        } catch (error) {
          setIsSuperAdmin(false);
        } finally {
          setLoadingSuperAdmin(false);
        }
      };
      
      checkSuperAdmin();
    }, []);
    
    if (loadingSuperAdmin) {
      return <div className="loading">Đang tải...</div>;
    }
    
    return isSuperAdmin ? children : <Navigate to="/admin" />;
  };

  return (
    <LanguageProvider>
      <SystemSettingsProvider>
        <Router>
          <ToastContainer />
          <LoginNotification />
          <DebugTranslations />
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
            
            {/* Super Admin routes */}
            <Route path="/superadmin" element={
              <SuperAdminRoute>
                <SuperAdminDashboard />
              </SuperAdminRoute>
            } />
            <Route path="/superadmin/admins" element={
              <SuperAdminRoute>
                <AdminManagement />
              </SuperAdminRoute>
            } />
            <Route path="/superadmin/invite-codes" element={
              <SuperAdminRoute>
                <InviteCodeManagement />
              </SuperAdminRoute>
            } />
            <Route path="/superadmin/notifications" element={
              <SuperAdminRoute>
                <NotificationManagement />
              </SuperAdminRoute>
            } />
            <Route path="/superadmin/teams" element={
              <SuperAdminRoute>
                <TeamSummary />
              </SuperAdminRoute>
            } />
            <Route path="/superadmin/security" element={
              <SuperAdminRoute>
                <SafetySettings />
              </SuperAdminRoute>
            } />
            <Route path="/superadmin/logs" element={
              <SuperAdminRoute>
                <SystemLogs />
              </SuperAdminRoute>
            } />
            <Route path="/superadmin/database" element={
              <SuperAdminRoute>
                <DatabaseManagement />
              </SuperAdminRoute>
            } />
            
            {/* User routes */}
            <Route path="/station/:stationId" element={<UserStation />} />
            
            {/* Default routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </SystemSettingsProvider>
    </LanguageProvider>
  );
}

export default App;
