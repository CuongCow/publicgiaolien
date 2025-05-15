import React, { createContext, useState, useContext, useEffect } from 'react';
import translationService from '../services/translationService';

// Tạo context
const TranslationContext = createContext();

// Provider component
export const TranslationProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Khôi phục ngôn ngữ đã chọn từ localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selected_language');
    if (savedLanguage) {
      try {
        const languageData = JSON.parse(savedLanguage);
        setSelectedLanguage(languageData);
        
        // Áp dụng bản dịch khi tải trang
        const applyTranslation = async () => {
          setIsTranslating(true);
          
          // Nếu chọn tiếng Việt, khôi phục nội dung gốc
          if (languageData.languageCode === 'vi') {
            await translationService.restoreOriginalContent();
          } else {
            // Dịch trang sang ngôn ngữ đã lưu
            await translationService.translatePage(languageData.languageCode);
          }
          
          setIsTranslating(false);
        };
        
        // Đợi DOM load hoàn thành trước khi áp dụng bản dịch
        if (document.readyState === 'complete') {
          applyTranslation();
        } else {
          window.addEventListener('load', applyTranslation);
          return () => window.removeEventListener('load', applyTranslation);
        }
      } catch (e) {
        console.error('Lỗi khi phân tích dữ liệu ngôn ngữ đã lưu:', e);
      }
    }
  }, []);

  // Thay đổi ngôn ngữ
  const changeLanguage = async (languageData) => {
    try {
      if (!languageData || !languageData.languageCode) {
        return false;
      }

      setIsTranslating(true);
      setSelectedLanguage(languageData);
      
      // Lưu thông tin ngôn ngữ đã chọn
      localStorage.setItem('selected_language', JSON.stringify(languageData));
      
      // Nếu chọn tiếng Việt, khôi phục nội dung gốc
      if (languageData.languageCode === 'vi') {
        await translationService.restoreOriginalContent();
      } else {
        // Dịch trang sang ngôn ngữ mới
        await translationService.translatePage(languageData.languageCode);
      }
      
      setIsTranslating(false);
      return true;
    } catch (error) {
      console.error('Lỗi khi thay đổi ngôn ngữ:', error);
      setIsTranslating(false);
      return false;
    }
  };

  // Khôi phục nội dung gốc
  const resetToOriginal = async () => {
    try {
      setIsTranslating(true);
      await translationService.restoreOriginalContent();
      setSelectedLanguage(null);
      localStorage.removeItem('selected_language');
      setIsTranslating(false);
      return true;
    } catch (error) {
      console.error('Lỗi khi khôi phục nội dung gốc:', error);
      setIsTranslating(false);
      return false;
    }
  };

  // Cung cấp các giá trị và hàm cho context
  const value = {
    selectedLanguage,
    isTranslating,
    changeLanguage,
    resetToOriginal
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

// Hook để sử dụng context
export const useTranslation = () => {
  return useContext(TranslationContext);
};

export default TranslationContext; 