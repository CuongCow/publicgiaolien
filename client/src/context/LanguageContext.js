import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { translations } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('vi');
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  useEffect(() => {
    // Lấy cài đặt ngôn ngữ từ server khi khởi động
    const fetchLanguageSetting = async () => {
      try {
        const response = await axios.get('/api/settings/language');
        // Kiểm tra response.data.language có giá trị hợp lệ
        if (response.data && response.data.language) {
          setLanguage(response.data.language);
          console.log('Đã tải ngôn ngữ từ server:', response.data.language);
        } else {
          console.warn('Server trả về ngôn ngữ không hợp lệ, sử dụng mặc định');
          setLanguage('vi'); // Giá trị mặc định
        }
        setTranslationsLoaded(true);
      } catch (error) {
        console.error('Lỗi khi lấy cài đặt ngôn ngữ:', error);
        // Sử dụng ngôn ngữ mặc định nếu có lỗi
        setLanguage('vi');
        setTranslationsLoaded(true);
      }
    };
    fetchLanguageSetting();
  }, []);

  // Kiểm tra translations đã tải xong chưa
  useEffect(() => {
    if (translationsLoaded) {
      console.log('Translations loaded:', language);
      console.log('Available keys:', Object.keys(translations[language] || {}).length);
    }
  }, [translationsLoaded, language]);

  const changeLanguage = async (newLanguage) => {
    try {
      await axios.post('/api/settings/language', { language: newLanguage });
      setLanguage(newLanguage);
      console.log('Đã đổi ngôn ngữ thành:', newLanguage);
    } catch (error) {
      console.error('Lỗi khi cập nhật ngôn ngữ:', error);
    }
  };

  // Thêm hàm dịch
  const t = (key) => {
    const langBundle = translations[language] || {};
    const translation = langBundle[key] || key;
    
    // Debug nếu key không được tìm thấy
    if (translation === key && process.env.NODE_ENV !== 'production') {
      console.warn(`Khóa dịch không tìm thấy: "${key}" cho ngôn ngữ "${language}"`);
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext); 