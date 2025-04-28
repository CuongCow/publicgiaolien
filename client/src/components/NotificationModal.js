import React from 'react';
import { Modal, Button, ListGroup, Badge } from 'react-bootstrap';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import './NotificationModal.css';

const NotificationModal = ({ show, onHide, notifications }) => {
  // Format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm - dd/MM/yyyy', { locale: vi });
  };

  // Get appropriate icon for notification type
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

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-bell me-2"></i>
          Tất cả thông báo
          {notifications.length > 0 && (
            <Badge bg="primary" className="ms-2">
              {notifications.length}
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {notifications.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-bell-slash fs-1 text-muted"></i>
            <p className="mt-3 text-muted">Không có thông báo nào</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {notifications.map((notification) => (
              <ListGroup.Item key={notification._id} className="p-3 border-bottom">
                <div className="d-flex">
                  <div className="me-3">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow-1">
                    <h5>{notification.title}</h5>
                    <div className="notification-content mb-2 quill-content">
                      <div dangerouslySetInnerHTML={{ __html: notification.content }} />
                    </div>
                    <div className="text-muted small d-flex justify-content-between align-items-center">
                      <div>
                        <i className="bi bi-clock me-1"></i>
                        {formatDate(notification.createdAt)}
                      </div>
                      {notification.createdBy && (
                        <div>
                          <i className="bi bi-person me-1"></i>
                          {notification.createdBy.name || notification.createdBy.username}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NotificationModal; 