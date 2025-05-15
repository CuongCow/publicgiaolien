import axios from 'axios';

// Sử dụng Google Translate API miễn phí (không cần API key)
const translateText = async (text, targetLanguage = 'en') => {
  try {
    if (!text || text.trim() === '') return '';
    
    // Phát hiện ngôn ngữ của văn bản gốc
    const sourceLanguage = localStorage.getItem('source_language') || 'vi';
    
    // Sử dụng Google Translate API 
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await axios.get(url);
    if (!response.data || !response.data[0]) {
      throw new Error('Invalid translation response');
    }
    
    // Kết hợp các đoạn dịch thành văn bản hoàn chỉnh
    let translatedText = '';
    response.data[0].forEach(item => {
      if (item[0]) {
        translatedText += item[0];
      }
    });
    
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Trả về văn bản gốc nếu có lỗi
  }
};

// Dịch nội dung HTML
const translateHtml = async (html, targetLanguage = 'en') => {
  try {
    if (!html || html.trim() === '') return '';
    
    // Tạo một DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Lấy tất cả các node văn bản
    const textNodes = [];
    const walk = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walk.nextNode()) {
      if (node.nodeValue.trim()) {
        textNodes.push(node);
      }
    }
    
    // Dịch từng node văn bản
    for (const node of textNodes) {
      const translatedText = await translateText(node.nodeValue, targetLanguage);
      node.nodeValue = translatedText;
    }
    
    return doc.body.innerHTML;
  } catch (error) {
    console.error('HTML translation error:', error);
    return html; // Trả về HTML gốc nếu có lỗi
  }
};

// Chức năng dịch toàn bộ trang web
const translatePage = async (targetLanguage = 'en') => {
  try {
    // Lưu ngôn ngữ đích
    localStorage.setItem('target_language', targetLanguage);
    
    // Tìm tất cả các phần tử chứa văn bản
    const elements = document.querySelectorAll('[data-translatable]');
    
    // Kiểm tra nếu không có phần tử nào - có thể DOM chưa load xong
    if (elements.length === 0) {
      console.debug('Không tìm thấy phần tử nào có thuộc tính data-translatable, đợi DOM load xong');
      
      // Đợi một lúc và thử lại nếu đang trong quá trình tải trang
      if (document.readyState !== 'complete') {
        await new Promise(resolve => setTimeout(resolve, 500));
        return translatePage(targetLanguage);
      }
    }
    
    console.debug(`Đang dịch ${elements.length} phần tử sang ngôn ngữ: ${targetLanguage}`);
    
    for (const element of elements) {
      // Lưu nội dung gốc nếu chưa lưu
      if (!element.dataset.originalText) {
        element.dataset.originalText = element.innerHTML;
      }
      
      // Dịch nội dung
      const translatedContent = await translateHtml(element.dataset.originalText, targetLanguage);
      element.innerHTML = translatedContent;
    }
    
    // Lưu trạng thái đã dịch
    document.documentElement.setAttribute('data-translated', 'true');
    document.documentElement.setAttribute('data-lang', targetLanguage);
    
    return true;
  } catch (error) {
    console.error('Page translation error:', error);
    return false;
  }
};

// Khôi phục nội dung gốc
const restoreOriginalContent = () => {
  try {
    // Tìm tất cả các phần tử đã dịch
    const elements = document.querySelectorAll('[data-translatable]');
    
    for (const element of elements) {
      if (element.dataset.originalText) {
        element.innerHTML = element.dataset.originalText;
      }
    }
    
    // Xóa trạng thái đã dịch
    document.documentElement.removeAttribute('data-translated');
    document.documentElement.removeAttribute('data-lang');
    
    // Xóa ngôn ngữ đích
    localStorage.removeItem('target_language');
    
    return true;
  } catch (error) {
    console.error('Restore original content error:', error);
    return false;
  }
};

// Tạo một MutationObserver để theo dõi các phần tử mới được thêm vào DOM
const setupMutationObserver = () => {
  // Kiểm tra nếu đã có observer
  if (window._translationObserver) {
    return;
  }
  
  // Lấy ngôn ngữ hiện tại
  const currentLanguage = localStorage.getItem('target_language');
  if (!currentLanguage || currentLanguage === 'vi') {
    return; // Không cần observer nếu đang sử dụng tiếng Việt
  }
  
  // Tạo một observer để tự động dịch các phần tử mới khi chúng được thêm vào DOM
  const observer = new MutationObserver((mutations) => {
    // Kiểm tra những phần tử mới được thêm vào
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          // Kiểm tra xem node có phải là phần tử HTML không
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Tìm các phần tử có thuộc tính data-translatable trong node mới
            const translatableElements = node.querySelectorAll('[data-translatable]');
            if (translatableElements.length > 0 || node.hasAttribute('data-translatable')) {
              // Dịch các phần tử mới
              const currentLang = document.documentElement.getAttribute('data-lang');
              if (currentLang && currentLang !== 'vi') {
                setTimeout(() => {
                  if (node.hasAttribute('data-translatable') && !node.dataset.originalText) {
                    node.dataset.originalText = node.innerHTML;
                    translateHtml(node.innerHTML, currentLang).then(translated => {
                      node.innerHTML = translated;
                    });
                  }
                  
                  translatableElements.forEach(element => {
                    if (!element.dataset.originalText) {
                      element.dataset.originalText = element.innerHTML;
                      translateHtml(element.innerHTML, currentLang).then(translated => {
                        element.innerHTML = translated;
                      });
                    }
                  });
                }, 100);
              }
            }
          }
        });
      }
    });
  });
  
  // Bắt đầu quan sát toàn bộ DOM
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  // Lưu observer để tránh tạo nhiều lần
  window._translationObserver = observer;
};

// Gọi setupMutationObserver khi DOM được tải
if (document.readyState === 'complete') {
  setupMutationObserver();
} else {
  window.addEventListener('load', setupMutationObserver);
}

export default {
  translateText,
  translateHtml,
  translatePage,
  restoreOriginalContent,
  setupMutationObserver
}; 