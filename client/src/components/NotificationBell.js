import React, { useState, useEffect, useRef } from 'react';
import { Dropdown, Badge, ListGroup } from 'react-bootstrap';
import { authApi } from '../services/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import NotificationModal from './NotificationModal';
import './NotificationBell.css';
import { useLanguage } from '../context/LanguageContext';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const { t } = useLanguage();
  
  // Sử dụng localStorage để lưu trữ ID của các thông báo đã đọc
  const readNotificationsRef = useRef(
    JSON.parse(localStorage.getItem('readNotifications') || '[]')
  );
  
  // Fetch thông báo khi component mount
  useEffect(() => {
    fetchNotifications();
    
    // Thiết lập interval để tự động cập nhật thông báo mỗi 5 phút
    const intervalId = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Tính toán số lượng thông báo chưa đọc khi danh sách thông báo thay đổi
  useEffect(() => {
    const readIds = readNotificationsRef.current;
    const count = notifications.filter(
      notification => !readIds.includes(notification._id)
    ).length;
    
    setUnreadCount(count);
  }, [notifications]);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.getNotifications();
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(t('error_loading_notifications'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggle = (isOpen) => {
    setShow(isOpen);
    
    // Khi mở dropdown, đánh dấu tất cả thông báo là đã đọc
    if (isOpen && unreadCount > 0) {
      const readIds = readNotificationsRef.current;
      
      // Thêm ID của các thông báo chưa đọc vào danh sách đã đọc
      const newReadIds = [...readIds];
      
      notifications.forEach(notification => {
        if (!readIds.includes(notification._id)) {
          newReadIds.push(notification._id);
        }
      });
      
      // Cập nhật ref và localStorage
      readNotificationsRef.current = newReadIds;
      localStorage.setItem('readNotifications', JSON.stringify(newReadIds));
      
      // Cập nhật số lượng thông báo chưa đọc
      setUnreadCount(0);
    }
  };

  // Mở modal xem tất cả thông báo
  const handleViewAllClick = (e) => {
    e.preventDefault();
    setShow(false); // Đóng dropdown
    setShowAllModal(true); // Mở modal
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm - dd/MM/yyyy', { locale: vi });
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <i className="bi bi-info-circle-fill text-primary me-2"></i>;
      case 'warning':
        return <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>;
      case 'error':
        return <i className="bi bi-x-circle-fill text-danger me-2"></i>;
      case 'success':
        return <i className="bi bi-check-circle-fill text-success me-2"></i>;
      default:
        return <i className="bi bi-bell-fill text-primary me-2"></i>;
    }
  };
  
  const getDropdownItems = () => {
    if (loading) {
      return (
        <ListGroup.Item className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
            <span className="visually-hidden">{t('loading_status')}</span>
          </div>
          {t('loading_notifications')}
        </ListGroup.Item>
      );
    }
    
    if (error) {
      return (
        <ListGroup.Item className="text-danger py-3">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </ListGroup.Item>
      );
    }
    
    if (notifications.length === 0) {
      return (
        <ListGroup.Item className="text-center py-3">
          <i className="bi bi-bell-slash me-2"></i>
          {t('no_notifications')}
        </ListGroup.Item>
      );
    }
    
    // Chỉ hiển thị 5 thông báo mới nhất trong dropdown
    return notifications.slice(0, 5).map(notification => {
      const readIds = readNotificationsRef.current;
      const isRead = readIds.includes(notification._id);
      
      // Loại bỏ các tag HTML từ nội dung thông báo cho phiên bản ngắn
      const stripHtml = (html) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      };
      
      const contentPreview = stripHtml(notification.content);
      const shortContent = contentPreview.substring(0, 150) + 
                          (contentPreview.length > 150 ? '...' : '');
      
      return (
        <ListGroup.Item 
          key={notification._id} 
          className={`notification-item py-3 ${isRead ? '' : 'unread'}`}
        >
          <div className="d-flex align-items-start">
            <div className="me-2">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-grow-1">
              <div className="fw-bold">{notification.title}</div>
              <div className="text-muted small mt-1">
                {shortContent}
              </div>
              <div className="text-muted small mt-1">
                <i className="bi bi-clock me-1"></i>
                {formatDate(notification.createdAt)}
              </div>
            </div>
          </div>
        </ListGroup.Item>
      );
    });
  };
  
  return (
    <>
      <Dropdown show={show} onToggle={handleToggle} align="end">
        <Dropdown.Toggle 
          variant="link" 
          id="notification-dropdown" 
          className="p-0 border-0 text-dark position-relative"
          style={{ boxShadow: 'none', background: 'transparent' }}
        >
          <i className="bi bi-bell-fill fs-5"></i>
          {unreadCount > 0 && (
            <Badge 
              bg="danger" 
              pill 
              className="notification-badge"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu style={{ width: '350px', maxHeight: '500px', overflowY: 'auto' }}>
          <div className="p-2 border-bottom d-flex justify-content-between align-items-center">
            <h6 className="mb-0">{t('notifications_title')}</h6>
            <Badge bg="primary" pill>
              {notifications.length}
            </Badge>
          </div>
          <ListGroup variant="flush">
            {getDropdownItems()}
          </ListGroup>
          {notifications.length > 0 && (
            <div className="p-2 border-top text-center">
              <a 
                href="#" 
                onClick={handleViewAllClick} 
                className="text-decoration-none"
              >
                {t('view_all_notifications')}
              </a>
            </div>
          )}
        </Dropdown.Menu>
      </Dropdown>

      {/* Modal xem tất cả thông báo */}
      <NotificationModal 
        show={showAllModal} 
        onHide={() => setShowAllModal(false)} 
        notifications={notifications} 
      />
    </>
  );
};

export default NotificationBell; 