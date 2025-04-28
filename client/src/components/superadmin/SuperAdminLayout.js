import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SuperAdminSidebar from './SuperAdminSidebar';
import { superAdminApi } from '../../api/superAdminApi';
import './SuperAdminLayout.css';

const SuperAdminLayout = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    
    // Kiểm tra kích thước màn hình và cập nhật trạng thái sidebar
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    };
    
    // Chạy lần đầu
    handleResize();
    
    // Thêm event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await superAdminApi.checkAuth();
      if (!response.success) {
        navigate('/login');
      }
      setLoading(false);
    } catch (err) {
      setError('Không thể xác thực. Vui lòng đăng nhập lại.');
      navigate('/login');
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = async () => {
    try {
      await superAdminApi.logout();
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      console.error('Lỗi đăng xuất:', err);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="super-admin-layout">
      <SuperAdminSidebar 
        isExpanded={isExpanded} 
        toggleSidebar={toggleSidebar} 
        handleLogout={handleLogout}
      />
      <div className={`content-area ${isExpanded ? 'content-expanded' : 'content-collapsed'}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default SuperAdminLayout; 