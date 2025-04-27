import React, { createContext, useState, useContext, useEffect } from 'react';
import { settingsApi } from '../services/api';
import { updateSystemSettings } from '../utils/helpers';

// Tạo context
const SystemSettingsContext = createContext();

// Custom hook để sử dụng context
export const useSystemSettings = () => useContext(SystemSettingsContext);

// Provider component
export const SystemSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    termType: 'default',
    customTerm: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch settings từ server khi component được mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // Nếu có token (admin đăng nhập), lấy cài đặt của admin
        const token = localStorage.getItem('token');
        if (token) {
          const response = await settingsApi.getSettings();
          setSettings(response.data);
          updateSystemSettings(response.data);
        } else {
          // Nếu không có token (người dùng thông thường), sử dụng cài đặt mặc định
          setSettings({
            termType: 'default',
            customTerm: ''
          });
          updateSystemSettings({
            termType: 'default',
            customTerm: ''
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Lỗi khi tải cài đặt hệ thống:', err);
        setError('Không thể tải cài đặt hệ thống');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
    
    // Cài đặt interval để làm mới cài đặt mỗi 5 phút
    const refreshInterval = setInterval(fetchSettings, 5 * 60 * 1000);
    
    // Dọn dẹp interval khi component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Hàm cập nhật cài đặt
  const updateSettings = async (newSettings) => {
    try {
      setLoading(true);
      const response = await settingsApi.updateSettings(newSettings);
      setSettings(response.data);
      
      // Cập nhật cài đặt trong utils/helpers.js
      updateSystemSettings(response.data);
      
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Lỗi khi cập nhật cài đặt hệ thống:', err);
      setError('Không thể cập nhật cài đặt hệ thống');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy cài đặt của admin cụ thể (cho trang đội chơi)
  const getAdminSettings = async (adminId) => {
    if (!adminId) return;
    
    try {
      setLoading(true);
      const response = await settingsApi.getPublicSettings(adminId);
      
      // Cập nhật cài đặt trong utils/helpers.js
      updateSystemSettings(response.data);
      
      return response.data;
    } catch (err) {
      console.error('Lỗi khi tải cài đặt của admin:', err);
      // Không cập nhật state error vì đây là chức năng không quan trọng
    } finally {
      setLoading(false);
    }
  };

  return (
    <SystemSettingsContext.Provider value={{ 
      settings, 
      loading, 
      error, 
      updateSettings,
      getAdminSettings
    }}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

export default SystemSettingsContext; 