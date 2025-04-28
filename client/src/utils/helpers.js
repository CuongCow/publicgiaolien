// Định dạng ngày giờ thành chuỗi dễ đọc
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Kiểm tra xem date có hợp lệ không
  if (isNaN(date.getTime())) {
    return 'N/A';
  }
  
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// Kiểm tra xem một giá trị có phải là rỗng không (null, undefined, chuỗi trống)
export const isEmpty = (value) => {
  return (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
};

// Tạo ID ngẫu nhiên
export const generateRandomId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Tạo mật khẩu ngẫu nhiên dễ nhớ
export const generateEasyPassword = (length = 5) => {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
};

// Các cài đặt hệ thống lưu trong bộ nhớ để tránh gọi API liên tục
let systemSettings = {
  termType: 'default',
  customTerm: ''
};

// Hàm cập nhật cài đặt hệ thống
export const updateSystemSettings = (settings) => {
  systemSettings = {
    ...systemSettings,
    ...settings
  };
};

// Hàm lấy thuật ngữ thay thế cho từ "Trạm"
export const getReplacementTerm = () => {
  switch (systemSettings.termType) {
    case 'journey':
      return 'Hành trình';
    case 'custom':
      return systemSettings.customTerm || 'Trạm';
    case 'default':
    default:
      return 'Trạm';
  }
};

// Hàm thay thế từ "Trạm" bằng thuật ngữ thay thế trong chuỗi
export const replaceStationTerm = (text) => {
  if (!text) return '';
  
  const replacementTerm = getReplacementTerm();
  if (replacementTerm === 'Trạm') return text; // Không cần thay thế nếu là mặc định
  
  // Thay thế các trường hợp của từ "Trạm"
  let result = text;
  
  // Xử lý các biến thể khác nhau của từ "Trạm"
  const replacements = [
    // Chữ cái đầu viết hoa
    { pattern: /Trạm/g, replacement: replacementTerm },
    // Viết thường
    { pattern: /trạm/g, replacement: replacementTerm.toLowerCase() },
    // Viết hoa toàn bộ
    { pattern: /TRẠM/g, replacement: replacementTerm.toUpperCase() },
    // Số nhiều với "s" ở cuối (tiếng Anh)
    { pattern: /Trạms/g, replacement: `${replacementTerm}s` },
    { pattern: /trạms/g, replacement: `${replacementTerm.toLowerCase()}s` },
    { pattern: /TRẠMS/g, replacement: `${replacementTerm.toUpperCase()}s` },
    // Các từ ghép phổ biến
    { pattern: /Trạm\s+(\w+)/g, replacement: `${replacementTerm} $1` },
    { pattern: /trạm\s+(\w+)/g, replacement: `${replacementTerm.toLowerCase()} $1` }
  ];
  
  // Áp dụng tất cả các thay thế
  replacements.forEach(({ pattern, replacement }) => {
    result = result.replace(pattern, replacement);
  });
  
  return result;
};

// Hàm định dạng ngày tháng
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Xử lý lỗi từ API và trả về message
 * @param {Error} error - Lỗi từ Axios
 * @param {string} defaultMessage - Thông báo mặc định nếu không lấy được lỗi từ server
 * @returns {string} Thông báo lỗi
 */
export const handleApiError = (error, defaultMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau.') => {
  // Kiểm tra lỗi từ server
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  
  // Kiểm tra lỗi kết nối
  if (error.message === 'Network Error') {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.';
  }

  // Kiểm tra timeout
  if (error.code === 'ECONNABORTED') {
    return 'Kết nối đến máy chủ quá lâu. Vui lòng thử lại sau.';
  }
  
  return defaultMessage;
}; 