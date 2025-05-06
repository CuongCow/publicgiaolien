import React from 'react';
import { Spinner } from 'react-bootstrap';

/**
 * Component hiển thị trạng thái đang tải
 */
const LoadingSpinner = ({ text = 'Đang tải dữ liệu...', size = 'md' }) => {
  const spinnerSize = size === 'sm' ? '1rem' : (size === 'lg' ? '2rem' : '1.5rem');
  
  return (
    <div className="text-center py-4">
      <Spinner 
        animation="border" 
        variant="primary" 
        style={{ width: spinnerSize, height: spinnerSize }}
      />
      <p className="mt-2 text-muted">{text}</p>
    </div>
  );
};

export default LoadingSpinner; 