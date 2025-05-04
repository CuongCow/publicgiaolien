/**
 * Danh sách từ khóa SEO được phân loại theo trang và chủ đề
 * Sử dụng để tối ưu hóa nội dung theo từ khóa
 */

export const seoKeywords = {
  // Từ khóa trang chủ
  home: {
    primary: [
      'hệ thống giao liên', 
      'giao lien', 
      'giải mật thư', 
      'trò chơi nhóm',
      'giao liên mật thư',
      'phần mềm giao liên',
      'quản lý trạm chơi',
      'quản lý đội mật thư'
    ],
    secondary: [
      'quản lý trò chơi', 
      'mật thư online', 
      'tổ chức hoạt động nhóm', 
      'phần mềm quản lý trò chơi',
      'hệ thống quản lý chơi mật thư',
      'trò chơi team building',
      'phần mềm tổ chức trò chơi',
      'quản lý sự kiện nhóm',
      'trò chơi ngoài trời',
      'tạo trạm mật thư'
    ]
  },
  
  // Từ khóa trang đăng nhập/đăng ký
  auth: {
    primary: [
      'đăng nhập giao liên', 
      'đăng ký giao liên', 
      'tài khoản giao liên',
      'tham gia hệ thống giao liên', 
      'truy cập giao liên',
      'đăng ký tài khoản mật thư'
    ],
    secondary: [
      'truy cập hệ thống giao liên', 
      'quản lý trò chơi mật thư', 
      'tạo tài khoản mới',
      'đăng nhập hệ thống quản lý trò chơi',
      'tạo tài khoản điều hành trò chơi',
      'đăng ký quản lý trạm',
      'tài khoản quản lý sự kiện'
    ]
  },
  
  // Từ khóa trang quản lý trạm
  stations: {
    primary: [
      'quản lý trạm', 
      'tạo trạm mật thư', 
      'trạm điểm', 
      'thiết lập trạm',
      'trạm chơi mật thư',
      'điểm trạm giao liên',
      'quản lý các trạm chơi',
      'thiết kế trạm mật thư'
    ],
    secondary: [
      'cài đặt trạm chơi', 
      'tạo trạm mới', 
      'thiết kế trò chơi trạm', 
      'quy tắc trạm chơi',
      'tạo thử thách trạm',
      'thiết lập nhiệm vụ tại trạm',
      'cấu hình trạm mật thư',
      'thiết kế hoạt động tại trạm',
      'điểm kiểm tra mật thư',
      'hệ thống kiểm soát trạm'
    ]
  },
  
  // Từ khóa trang quản lý đội
  teams: {
    primary: [
      'quản lý đội chơi', 
      'tạo đội', 
      'danh sách đội', 
      'thông tin đội chơi',
      'đội giải mật thư',
      'nhóm chơi trò chơi',
      'quản lý người chơi',
      'điều phối đội'
    ],
    secondary: [
      'cài đặt đội', 
      'quy tắc đội chơi', 
      'phân công đội', 
      'thành viên đội',
      'tổ chức đội chơi mật thư',
      'tạo nhóm giải đố',
      'quản lý nhóm tham gia',
      'phân chia đội chơi',
      'cách thức phân nhóm',
      'thiết lập đội thi đấu'
    ]
  },
  
  // Từ khóa trang bảng xếp hạng
  leaderboard: {
    primary: [
      'bảng xếp hạng', 
      'điểm số đội chơi', 
      'thành tích', 
      'kết quả trò chơi',
      'xếp hạng đội mật thư',
      'điểm số giải đố',
      'thứ hạng đội chơi',
      'bảng thành tích giải mật thư'
    ],
    secondary: [
      'điểm thưởng', 
      'thứ hạng đội', 
      'thống kê điểm', 
      'đội dẫn đầu',
      'kết quả giải mật thư',
      'thành tích giải đố',
      'hệ thống tính điểm',
      'tổng hợp điểm đội chơi',
      'bảng điểm cuối cùng',
      'so sánh thành tích đội'
    ]
  },
  
  // Từ khóa trang admin
  admin: {
    primary: [
      'quản trị viên giao liên', 
      'bảng điều khiển admin', 
      'quản lý hệ thống',
      'điều hành trò chơi mật thư',
      'quản lý hệ thống giao liên',
      'truy cập quản trị viên',
      'trang quản lý admin'
    ],
    secondary: [
      'thiết lập hệ thống', 
      'phân quyền người dùng', 
      'cài đặt trò chơi', 
      'quản lý dữ liệu',
      'điều hành hoạt động giao liên',
      'quản lý người chơi và trạm',
      'thiết lập quy tắc trò chơi',
      'cấu hình hệ thống giao liên',
      'giám sát hoạt động trò chơi',
      'phân tích dữ liệu trò chơi'
    ]
  },
  
  // Từ khóa dành cho người dùng
  user: {
    primary: [
      'tham gia trò chơi', 
      'ghi điểm', 
      'trạm chơi', 
      'hướng dẫn chơi',
      'tham gia giải mật thư',
      'người chơi giao liên',
      'điều hướng trạm',
      'hoàn thành thử thách'
    ],
    secondary: [
      'nộp kết quả', 
      'hoàn thành thử thách', 
      'quy tắc chơi', 
      'nhận thưởng',
      'cách giải mật thư',
      'tìm kiếm trạm',
      'cập nhật điểm số',
      'chiến lược chơi',
      'mẹo giải mật thư',
      'hướng dẫn tìm trạm'
    ]
  },
  
  // Từ khóa chung
  general: {
    primary: [
      'mật thư', 
      'trò chơi nhóm', 
      'hoạt động ngoài trời', 
      'team building',
      'giao liên',
      'giải đố mật thư',
      'hoạt động tập thể',
      'trò chơi giáo dục'
    ],
    secondary: [
      'giải đố', 
      'trò chơi mật mã', 
      'hoạt động đoàn thể', 
      'hoạt động giáo dục',
      'hoạt động nhóm vui nhộn',
      'xây dựng tinh thần đồng đội',
      'trò chơi phát triển kỹ năng',
      'hoạt động thanh niên',
      'trải nghiệm ngoài trời',
      'hoạt động kết nối nhóm'
    ]
  },
  
  // Từ khóa dành cho hướng dẫn
  guide: {
    primary: [
      'hướng dẫn sử dụng giao liên',
      'cách chơi mật thư',
      'hướng dẫn tạo trạm',
      'cách quản lý đội chơi',
      'hướng dẫn thiết lập hệ thống'
    ],
    secondary: [
      'hướng dẫn chi tiết giao liên',
      'cẩm nang quản lý trò chơi',
      'cách tạo trò chơi mật thư',
      'tài liệu hướng dẫn giao liên',
      'video hướng dẫn sử dụng',
      'FAQ giao liên',
      'câu hỏi thường gặp'
    ]
  },
  
  // Từ khóa đuôi dài (long-tail)
  longTail: [
    'phần mềm quản lý trò chơi mật thư trực tuyến',
    'hệ thống quản lý đội chơi và trạm mật thư',
    'công cụ tạo trò chơi mật thư cho hoạt động nhóm',
    'ứng dụng chấm điểm trực tuyến cho trò chơi mật thư',
    'nền tảng tổ chức hoạt động giải mã và mật thư',
    'phần mềm tổ chức hoạt động ngoài trời cho đoàn thể',
    'hệ thống quản lý thành tích và xếp hạng đội chơi',
    'công cụ tạo thử thách và nhiệm vụ cho trò chơi mật thư',
    'phần mềm quản lý tập trung cho hoạt động ngoài trời',
    'nền tảng giải mật thư và trò chơi team building',
    'phần mềm tổ chức hoạt động tập thể cho trường học',
    'ứng dụng tạo và quản lý trò chơi xây dựng đội nhóm',
    'hệ thống quản lý các hoạt động giáo dục ngoài trời',
    'công cụ theo dõi tiến độ và thành tích đội chơi mật thư',
    'phần mềm thiết kế và quản lý trạm hoạt động ngoài trời',
    'nền tảng quản lý sự kiện giải mật thư quy mô lớn',
    'hệ thống trò chơi mật thư với nhiều trạm chơi khác nhau',
    'phần mềm tạo lập và điều hành hoạt động đoàn thể',
    'ứng dụng giải mật thư với nhiều cấp độ khác nhau',
    'công cụ quy hoạch và quản lý hoạt động giáo dục ngoài trời'
  ],
  
  // Từ khóa theo mùa và sự kiện
  seasonal: {
    summer: [
      'hoạt động mật thư mùa hè',
      'trò chơi ngoài trời mùa hè',
      'trò chơi đội nhóm mùa hè',
      'giải mật thư trại hè'
    ],
    schoolYear: [
      'hoạt động ngoại khóa trường học',
      'trò chơi giao liên cho trường học',
      'hoạt động xây dựng tinh thần đồng đội học sinh',
      'giải mật thư các trường học'
    ],
    holiday: [
      'hoạt động nhóm ngày lễ',
      'trò chơi mật thư dịp lễ tết',
      'tổ chức hoạt động đặc biệt ngày lễ',
      'giải mật thư kỷ niệm ngày lễ'
    ]
  },
  
  // Từ khóa theo lĩnh vực
  industry: {
    education: [
      'giải mật thư trong giáo dục',
      'hoạt động ngoài trời cho học sinh',
      'trò chơi phát triển kỹ năng học sinh',
      'hoạt động xây dựng tinh thần đồng đội trong trường học'
    ],
    corporate: [
      'team building doanh nghiệp',
      'hoạt động gắn kết nhân viên',
      'trò chơi mật thư cho công ty',
      'hoạt động phát triển đội nhóm trong doanh nghiệp'
    ],
    community: [
      'hoạt động cộng đồng giải mật thư',
      'trò chơi nhóm cho tổ chức xã hội',
      'hoạt động thanh thiếu niên trong cộng đồng',
      'tổ chức sự kiện cộng đồng'
    ]
  }
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