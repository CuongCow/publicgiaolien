import React, { createContext, useState, useContext, useEffect } from 'react';
import { configApi } from '../services/api';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    baseUrl: window.location.origin,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Mặc định sử dụng window.location.origin
        let baseUrl = window.location.origin;
        
        // Lấy cấu hình từ server nếu có thể
        try {
          const response = await configApi.getConfig();
          if (response.data && response.data.success && response.data.data) {
            // Nếu server trả về baseUrl hợp lệ thì sử dụng
            if (response.data.data.baseUrl) {
              baseUrl = response.data.data.baseUrl;
              console.log('Loaded baseUrl from server:', baseUrl);
            }
          }
        } catch (error) {
          console.warn('Không thể lấy cấu hình từ server, sử dụng window.location.origin:', error);
        }
        
        setConfig({
          baseUrl,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching config:', error);
        setConfig(prev => ({
          ...prev,
          isLoading: false,
          error: 'Không thể tải cấu hình từ server'
        }));
      }
    };

    fetchConfig();
  }, []);

  const getUrlWithBase = (path) => {
    const baseUrl = config.baseUrl;
    // Loại bỏ dấu / cuối cùng của baseUrl nếu có
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    // Đảm bảo path bắt đầu bằng /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  };

  return (
    <ConfigContext.Provider value={{ 
      ...config, 
      getUrlWithBase
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigContext; 