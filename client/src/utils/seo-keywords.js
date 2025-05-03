/**
 * Danh sách từ khóa SEO được phân loại theo trang và chủ đề
 * Sử dụng để tối ưu hóa nội dung theo từ khóa
 */

export const seoKeywords = {
  // Từ khóa trang chủ
  home: {
    primary: ['hệ thống giao liên', 'giao lien', 'giải mật thư', 'trò chơi nhóm'],
    secondary: ['quản lý trò chơi', 'mật thư online', 'tổ chức hoạt động nhóm', 'phần mềm quản lý trò chơi']
  },
  
  // Từ khóa trang đăng nhập/đăng ký
  auth: {
    primary: ['đăng nhập giao liên', 'đăng ký giao liên', 'tài khoản giao liên'],
    secondary: ['truy cập hệ thống giao liên', 'quản lý trò chơi mật thư', 'tạo tài khoản mới']
  },
  
  // Từ khóa trang quản lý trạm
  stations: {
    primary: ['quản lý trạm', 'tạo trạm mật thư', 'trạm điểm', 'thiết lập trạm'],
    secondary: ['cài đặt trạm chơi', 'tạo trạm mới', 'thiết kế trò chơi trạm', 'quy tắc trạm chơi']
  },
  
  // Từ khóa trang quản lý đội
  teams: {
    primary: ['quản lý đội chơi', 'tạo đội', 'danh sách đội', 'thông tin đội chơi'],
    secondary: ['cài đặt đội', 'quy tắc đội chơi', 'phân công đội', 'thành viên đội']
  },
  
  // Từ khóa trang bảng xếp hạng
  leaderboard: {
    primary: ['bảng xếp hạng', 'điểm số đội chơi', 'thành tích', 'kết quả trò chơi'],
    secondary: ['điểm thưởng', 'thứ hạng đội', 'thống kê điểm', 'đội dẫn đầu']
  },
  
  // Từ khóa trang admin
  admin: {
    primary: ['quản trị viên giao liên', 'bảng điều khiển admin', 'quản lý hệ thống'],
    secondary: ['thiết lập hệ thống', 'phân quyền người dùng', 'cài đặt trò chơi', 'quản lý dữ liệu']
  },
  
  // Từ khóa dành cho người dùng
  user: {
    primary: ['tham gia trò chơi', 'ghi điểm', 'trạm chơi', 'hướng dẫn chơi'],
    secondary: ['nộp kết quả', 'hoàn thành thử thách', 'quy tắc chơi', 'nhận thưởng']
  },
  
  // Từ khóa chung
  general: {
    primary: ['mật thư', 'trò chơi nhóm', 'hoạt động ngoài trời', 'team building'],
    secondary: ['giải đố', 'trò chơi mật mã', 'hoạt động đoàn thể', 'hoạt động giáo dục']
  },
  
  // Từ khóa long-tail (đuôi dài)
  longTail: [
    'phần mềm quản lý trò chơi mật thư trực tuyến',
    'hệ thống quản lý đội chơi và trạm mật thư',
    'công cụ tạo trò chơi mật thư cho hoạt động nhóm',
    'ứng dụng chấm điểm trực tuyến cho trò chơi mật thư',
    'nền tảng tổ chức hoạt động giải mã và mật thư',
    'phần mềm tổ chức hoạt động ngoài trời cho đoàn thể',
    'hệ thống quản lý thành tích và xếp hạng đội chơi'
  ]
};

/**
 * Hàm lấy từ khóa theo trang và loại
 * @param {string} page - Tên trang cần lấy từ khóa
 * @param {string} type - Loại từ khóa (primary/secondary)
 * @returns {string} Chuỗi từ khóa được nối bằng dấu phẩy
 */
export const getKeywordsForPage = (page, type = 'primary') => {
  if (!seoKeywords[page]) return '';
  
  const keywords = [
    ...seoKeywords[page][type],
    ...seoKeywords.general[type]
  ];
  
  return keywords.join(', ');
};

/**
 * Tạo thẻ meta keywords dựa trên trang hiện tại
 * @param {string} page - Tên trang cần tạo meta
 * @returns {string} Chuỗi từ khóa đầy đủ
 */
export const generateMetaKeywords = (page) => {
  if (!seoKeywords[page]) return '';
  
  const primary = seoKeywords[page].primary || [];
  const secondary = seoKeywords[page].secondary || [];
  const generalPrimary = seoKeywords.general.primary || [];
  
  const allKeywords = [...primary, ...secondary, ...generalPrimary];
  
  // Thêm 2 từ khóa đuôi dài ngẫu nhiên
  const randomLongTail = seoKeywords.longTail
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);
  
  return [...allKeywords, ...randomLongTail].join(', ');
}; 