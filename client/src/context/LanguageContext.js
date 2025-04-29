import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { translations } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('vi');

  useEffect(() => {
    // Lấy cài đặt ngôn ngữ từ server khi khởi động
    const fetchLanguageSetting = async () => {
      try {
        // Sử dụng đường dẫn tương đối thay vì URL đầy đủ
        const response = await axios.get('/api/settings/language');
        setLanguage(response.data.language);
      } catch (error) {
        console.error('Lỗi khi lấy cài đặt ngôn ngữ:', error);
        // Sử dụng ngôn ngữ mặc định nếu có lỗi
        setLanguage('vi');
      }
    };
    fetchLanguageSetting();
  }, []);

  const changeLanguage = async (newLanguage) => {
    try {
      await axios.post('/api/settings/language', { language: newLanguage });
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Lỗi khi cập nhật ngôn ngữ:', error);
    }
  };

  // Thêm hàm dịch
  const t = (key) => {
    const langBundle = translations[language] || {};
    return langBundle[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext); 