import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { authApi } from '../services/api';

const LoginNotification = () => {
  const [notification, setNotification] = useState(null);
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    // Kiểm tra xem người dùng vừa đăng nhập hay không
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    
    if (justLoggedIn) {
      // Xóa flag justLoggedIn khỏi sessionStorage
      sessionStorage.removeItem('justLoggedIn');
      
      // Tạo thông báo chào mừng từ localStorage thay vì gọi API
      const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
      const welcomeNotification = {
        title: 'Đăng nhập thành công',
        content: adminData.name 
          ? `Chào mừng ${adminData.name} đã quay trở lại!` 
          : 'Chào mừng bạn đã quay trở lại!',
        type: 'success'
      };
      
      setNotification(welcomeNotification);
      setShow(true);
    }
  }, []);
  
  // Nếu không có thông báo, không render gì cả
  if (!notification) {
    return null;
  }
  
  // Loại bỏ các tag HTML từ nội dung thông báo
  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };
  
  const contentPreview = stripHtml(notification.content);
  const shortContent = contentPreview.substring(0, 200) + 
                       (contentPreview.length > 200 ? '...' : '');
  
  // Lấy màu nền dựa trên loại thông báo
  const getBackgroundClass = () => {
    switch (notification.type) {
      case 'info':
        return 'bg-info text-white';
      case 'warning':
        return 'bg-warning';
      case 'error':
        return 'bg-danger text-white';
      case 'success':
        return 'bg-success text-white';
      default:
        return 'bg-light';
    }
  };
  
  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1100 }}>
      <Toast 
        show={show} 
        onClose={() => setShow(false)} 
        delay={8000} 
        autohide
        className={getBackgroundClass()}
      >
        <Toast.Header closeButton>
          <i className="bi bi-bell-fill me-2"></i>
          <strong className="me-auto">{notification.title}</strong>
        </Toast.Header>
        <Toast.Body>
          {shortContent}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default LoginNotification; 