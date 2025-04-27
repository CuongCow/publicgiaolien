import React from 'react';
import { Alert } from 'react-bootstrap';

/**
 * Component hiển thị lỗi chuẩn hóa
 */
const ErrorHandler = ({ error, onClose = null, className = '' }) => {
  if (!error) return null;
  
  // Tùy chọn đóng Alert nếu có callback onClose
  const dismissible = onClose !== null;
  
  return (
    <Alert 
      variant="danger" 
      className={`d-flex align-items-center ${className}`} 
      onClose={onClose} 
      dismissible={dismissible}
    >
      <i className="bi bi-exclamation-triangle-fill me-2" style={{ fontSize: '1.1rem' }}></i>
      <div>{error}</div>
    </Alert>
  );
};

export default ErrorHandler; 