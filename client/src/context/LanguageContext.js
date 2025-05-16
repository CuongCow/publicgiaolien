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
        } else {
          // Server trả về ngôn ngữ không hợp lệ, sử dụng mặc định
          setLanguage('vi'); // Giá trị mặc định
        }
        setTranslationsLoaded(true);
      } catch (error) {
        // Sử dụng ngôn ngữ mặc định nếu có lỗi
        setLanguage('vi');
        setTranslationsLoaded(true);
      }
    };
    fetchLanguageSetting();
  }, []);

  const changeLanguage = async (newLanguage) => {
    try {
      await axios.post('/api/settings/language', { language: newLanguage });
      setLanguage(newLanguage);
    } catch (error) {
      // Lỗi khi cập nhật ngôn ngữ
    }
  };

  // Thêm hàm dịch
  const t = (key) => {
    const langBundle = translations[language] || {};
    const translation = langBundle[key] || key;
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext); 