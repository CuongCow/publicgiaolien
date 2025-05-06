/**
 * Script sinh 1000 câu trả lời tự động từ các template và chủ đề
 * Kết quả sẽ được lưu vào file expandedReplies.js
 */

const fs = require('fs');
const path = require('path');

// Mảng từ khóa theo danh mục
const categories = {
  greeting: [
    "xin chào", "chào", "hello", "hi", "hey", "chào buổi sáng", "chào buổi chiều", 
    "chào buổi tối", "kính chào", "chào admin", "xin chào admin", "chào bạn",
    "rất vui được gặp", "làm quen", "gặp lại", "chào mừng", "quay lại", "trở lại"
  ],
  
  thanks: [
    "cảm ơn", "thank", "cảm ơn bạn", "cảm ơn rất nhiều", "rất cảm ơn", "cảm ơn vì", 
    "xin cảm ơn", "gửi lời cảm ơn", "đa tạ", "cảm kích", "biết ơn", "trân trọng",
    "đánh giá cao", "cảm ơn sự giúp đỡ", "cảm ơn hỗ trợ", "thật tuyệt"
  ],
  
  goodbye: [
    "tạm biệt", "bye", "chào tạm biệt", "hẹn gặp lại", "gặp lại sau", "chúc ngày tốt lành",
    "chúc buổi tối vui vẻ", "tối nay nói chuyện tiếp", "đi đây", "kết thúc", "kết thúc cuộc trò chuyện",
    "mai gặp lại", "hẹn sớm gặp lại", "tạm biệt nhé", "sẽ nói chuyện sau"
  ],
  
  help: [
    "hướng dẫn", "giúp đỡ", "help", "trợ giúp", "cần giúp", "cần hỗ trợ", "làm thế nào",
    "hỗ trợ", "giải thích", "không hiểu", "hướng dẫn sử dụng", "không biết cách", "cách để",
    "cần chỉ dẫn", "cách dùng", "hướng dẫn chi tiết", "manual", "thắc mắc", "câu hỏi"
  ],
  
  error: [
    "lỗi", "error", "bug", "vấn đề", "không hoạt động", "hỏng", "trục trặc", "sự cố",
    "lỗi kết nối", "lỗi đăng nhập", "không vào được", "bị lỗi", "lỗi hệ thống", "gặp khó khăn",
    "không thành công", "thất bại", "phát sinh lỗi", "báo lỗi", "lỗi khi", "không thể", 
    "không đúng", "sai", "hỏng", "lỗi 404", "lỗi 500", "không tìm thấy"
  ],
  
  account: [
    "tài khoản", "account", "đăng nhập", "đăng ký", "tạo tài khoản", "mật khẩu", "quên mật khẩu",
    "đổi mật khẩu", "reset password", "khóa tài khoản", "kích hoạt tài khoản", "xác minh tài khoản",
    "đăng xuất", "thông tin tài khoản", "hồ sơ", "profile", "email", "tên đăng nhập", "username",
    "tên người dùng", "thông tin cá nhân", "cập nhật thông tin", "xóa tài khoản"
  ],
  
  settings: [
    "cài đặt", "settings", "tùy chỉnh", "thiết lập", "thay đổi", "cấu hình", "tùy biến",
    "điều chỉnh", "set up", "config", "preferences", "options", "chọn lựa", "phương thức",
    "thay đổi cài đặt", "thay đổi thiết lập", "thay đổi thông tin"
  ],
  
  features: [
    "tính năng", "chức năng", "features", "function", "khả năng", "công cụ", "tiện ích",
    "module", "phần mềm", "ứng dụng", "extension", "plugin", "add-on", "component", 
    "capability", "service", "operation", "functionality", "khả năng mới"
  ],
  
  notifications: [
    "thông báo", "notification", "alert", "tin nhắn", "message", "nhắc nhở", "reminder",
    "cảnh báo", "tin tức", "update", "cập nhật", "thông tin mới", "tin mới", "news",
    "broadcast", "announcement", "thông tin quan trọng", "nhắc nhở", "mail", "email"
  ],
  
  chat: [
    "chat", "nhắn tin", "trò chuyện", "tán gẫu", "nói chuyện", "giao tiếp", "liên lạc",
    "messenger", "tin nhắn", "message", "SMS", "nhắn gửi", "gửi tin", "inbox", "DM",
    "direct message", "group chat", "team chat", "chat room", "channel"
  ],
  
  reports: [
    "báo cáo", "thống kê", "report", "analytics", "số liệu", "dữ liệu", "data", "metrics",
    "insight", "performance", "hiệu suất", "tổng kết", "summary", "overview", "tổng quan",
    "đánh giá", "phân tích", "tài liệu", "trích xuất", "xuất dữ liệu", "export data"
  ],
  
  users: [
    "người dùng", "user", "thành viên", "member", "nhân viên", "khách hàng", "client", 
    "admin", "administrator", "quản trị viên", "superadmin", "quản lý", "manager", "CEO",
    "director", "leader", "nhóm", "team", "group", "phòng ban", "department", "tổ chức", "organization"
  ],
  
  security: [
    "bảo mật", "security", "an toàn", "bảo vệ", "protection", "firewall", "antivirus", 
    "xác thực", "authentication", "authorization", "permission", "quyền hạn", "quyền truy cập",
    "access", "riêng tư", "privacy", "mã hóa", "encryption", "xác thực hai yếu tố", "2FA",
    "mật khẩu mạnh", "strong password", "bảo mật thông tin"
  ],
  
  system: [
    "hệ thống", "system", "server", "database", "cơ sở dữ liệu", "backend", "frontend", 
    "API", "service", "microservice", "cloud", "đám mây", "lưu trữ", "storage", "hosting",
    "domain", "tên miền", "SSL", "nâng cấp", "update", "phiên bản", "version", "release",
    "deployment", "triển khai", "maintenance", "bảo trì", "hạ tầng", "infrastructure"
  ],
  
  performance: [
    "hiệu suất", "performance", "tốc độ", "speed", "nhanh", "chậm", "lag", "giật", "mượt",
    "smooth", "responsive", "phản hồi", "tải", "load", "tải trang", "page load", "thời gian phản hồi",
    "response time", "tối ưu", "optimization", "cải thiện", "improvement", "nâng cao", "enhance"
  ],
  
  technical: [
    "kỹ thuật", "technical", "công nghệ", "technology", "development", "phát triển", "coding",
    "lập trình", "programming", "software", "phần mềm", "hardware", "phần cứng", "network",
    "mạng", "internet", "web", "mobile", "desktop", "cloud", "đám mây", "AI", "machine learning",
    "trí tuệ nhân tạo", "dữ liệu", "data", "big data", "phân tích", "analytics"
  ],
  
  payment: [
    "thanh toán", "payment", "tiền", "money", "banking", "ngân hàng", "credit card", "thẻ tín dụng",
    "thẻ ghi nợ", "debit card", "e-wallet", "ví điện tử", "chuyển khoản", "transfer", "PayPal",
    "Momo", "ZaloPay", "VNPay", "hóa đơn", "invoice", "biên lai", "receipt", "phí", "fee", "giá", "price"
  ],
  
  support: [
    "hỗ trợ", "support", "trợ giúp", "giúp đỡ", "service", "dịch vụ", "khách hàng", "customer",
    "chăm sóc", "care", "tư vấn", "consultant", "tư vấn viên", "consultant", "hotline", "đường dây nóng",
    "liên hệ", "contact", "phản hồi", "feedback", "góp ý", "suggestion", "khiếu nại", "complaint"
  ],
  
  faq: [
    "câu hỏi thường gặp", "faq", "frequently asked questions", "câu hỏi phổ biến", "common questions",
    "thắc mắc", "query", "vấn đề", "issue", "giải đáp", "answer", "trả lời", "reply", "response",
    "giải thích", "explanation", "hướng dẫn", "guide", "tutorial", "hướng dẫn từng bước", "step-by-step"
  ]
};

// Mảng phản hồi theo danh mục
const responses = {
  greeting: [
    "Xin chào! Tôi là trợ lý ảo của Giao Liên. Tôi có thể giúp gì cho bạn?",
    "Chào bạn! Rất vui được gặp bạn. Tôi có thể hỗ trợ bạn vấn đề gì?",
    "Xin chào! Hôm nay bạn cần hỗ trợ về vấn đề gì?",
    "Chào mừng bạn đến với hệ thống hỗ trợ Giao Liên. Tôi có thể giúp gì cho bạn?",
    "Xin chào! Tôi đang sẵn sàng hỗ trợ bạn với các câu hỏi về Giao Liên.",
    "Chào bạn! Tôi là trợ lý ảo của Giao Liên, rất vui được hỗ trợ bạn.",
    "Xin chào! Cảm ơn bạn đã liên hệ với bộ phận hỗ trợ Giao Liên.",
    "Chào bạn, rất vui được gặp lại! Tôi có thể trợ giúp bạn điều gì?",
    "Xin chào! Bạn đang cần thông tin hoặc hỗ trợ về vấn đề gì?",
    "Chào bạn! Tôi là trợ lý ảo của Giao Liên, hãy cho tôi biết tôi có thể giúp gì cho bạn?"
  ],
  
  thanks: [
    "Không có gì! Rất vui khi được hỗ trợ bạn. Bạn cần giúp đỡ gì thêm không?",
    "Rất vui khi được giúp đỡ bạn! Nếu có thắc mắc gì khác, đừng ngại hỏi nhé.",
    "Không có chi! Đó là nhiệm vụ của tôi. Bạn còn cần hỗ trợ gì nữa không?",
    "Rất vui vì đã giúp được bạn. Nếu có câu hỏi nào khác, hãy liên hệ lại với tôi.",
    "Không cần cảm ơn đâu! Tôi luôn sẵn sàng hỗ trợ bạn khi cần.",
    "Vui vì đã giúp được bạn! Đừng ngại liên hệ nếu bạn cần thêm thông tin.",
    "Đó là nhiệm vụ của tôi! Hy vọng bạn hài lòng với câu trả lời.",
    "Rất vui khi giúp được bạn. Chúc bạn có trải nghiệm tốt với Giao Liên!",
    "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Tôi luôn sẵn sàng hỗ trợ bạn!",
    "Không có gì! Tôi rất vui khi được giúp đỡ bạn. Chúc bạn một ngày tốt lành!"
  ],
  
  goodbye: [
    "Tạm biệt bạn! Chúc bạn một ngày tốt lành.",
    "Chào tạm biệt! Rất vui được trò chuyện với bạn.",
    "Tạm biệt! Hẹn gặp lại bạn sớm.",
    "Chúc bạn một ngày vui vẻ! Hẹn gặp lại.",
    "Tạm biệt và cảm ơn bạn đã liên hệ với chúng tôi!",
    "Chào tạm biệt! Nếu cần hỗ trợ thêm, đừng ngại liên hệ lại nhé.",
    "Tạm biệt! Hy vọng đã giải đáp được thắc mắc của bạn.",
    "Hẹn gặp lại bạn! Đừng quên liên hệ nếu cần thêm hỗ trợ.",
    "Tạm biệt và chúc bạn thành công với dự án của mình!",
    "Chào tạm biệt! Rất vui vì đã hỗ trợ được bạn hôm nay."
  ]
};

// Hàm tạo câu trả lời duy nhất từ template
function generateResponses() {
  const result = [];
  let id = 1;
  
  // Thêm câu trả lời có sẵn từ mẫu
  Object.keys(categories).forEach(category => {
    const keywords = categories[category];
    const categoryResponses = responses[category] || [
      `Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về ${category}.`,
      `Chúng tôi đang phát triển thông tin về ${category}. Bạn cần hỗ trợ cụ thể về vấn đề gì?`,
      `Cảm ơn bạn đã liên hệ về ${category}. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.`,
      `${category} là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?`,
      `Chúng tôi có nhiều tài liệu về ${category}. Bạn muốn biết thêm về khía cạnh nào?`
    ];
    
    // Tạo câu trả lời cho từng từ khóa
    keywords.forEach(keyword => {
      const usedResponses = new Set();
      
      // Mỗi từ khóa tạo 2-3 câu trả lời khác nhau
      const numResponses = Math.min(Math.floor(Math.random() * 2) + 2, categoryResponses.length);
      
      for (let i = 0; i < numResponses; i++) {
        let responseIndex;
        do {
          responseIndex = Math.floor(Math.random() * categoryResponses.length);
        } while (usedResponses.has(responseIndex));
        
        usedResponses.add(responseIndex);
        
        const priority = 
          category === "greeting" ? Math.floor(Math.random() * 20) + 80 :
          category === "error" ? Math.floor(Math.random() * 15) + 75 :
          category === "account" ? Math.floor(Math.random() * 15) + 70 :
          Math.floor(Math.random() * 30) + 50;
        
        result.push({
          keyword,
          response: categoryResponses[responseIndex],
          category,
          priority
        });
        
        // Giới hạn số lượng câu trả lời
        if (result.length >= 1000) {
          return result;
        }
      }
    });
  });
  
  // Tạo thêm câu trả lời tùy chỉnh nếu chưa đủ 1000 câu
  while (result.length < 1000) {
    const categoryKeys = Object.keys(categories);
    const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    const keywords = categories[randomCategory];
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    result.push({
      keyword: randomKeyword,
      response: `Đây là câu trả lời tự động cho từ khóa "${randomKeyword}" trong danh mục ${randomCategory}. Vui lòng cho biết chi tiết hơn để nhận hỗ trợ tốt hơn.`,
      category: randomCategory,
      priority: Math.floor(Math.random() * 30) + 50
    });
  }
  
  return result;
}

// Tạo 1000 câu trả lời
const expandedReplies = generateResponses();

// Tạo nội dung file
let fileContent = `/**
 * Danh sách 1000 câu trả lời tự động mở rộng
 * Sử dụng để nâng cao khả năng tương tác của hệ thống chat tự động
 * Được tạo tự động bởi script generateExpandedReplies.js
 */

const expandedReplies = [
`;

// Thêm từng câu trả lời vào nội dung file
expandedReplies.forEach((reply, index) => {
  fileContent += `  {
    keyword: "${reply.keyword}",
    response: "${reply.response.replace(/"/g, '\\"')}",
    category: "${reply.category}",
    priority: ${reply.priority}
  }`;
  
  if (index < expandedReplies.length - 1) {
    fileContent += ',\n';
  } else {
    fileContent += '\n';
  }
});

fileContent += `];

module.exports = expandedReplies;`;

// Ghi file
fs.writeFileSync(
  path.join(__dirname, '../data/expandedReplies.js'),
  fileContent,
  'utf8'
);

console.log(`Đã tạo thành công ${expandedReplies.length} câu trả lời tự động vào file expandedReplies.js`);
console.log('Thống kê theo danh mục:');

// Thống kê
const stats = {};
expandedReplies.forEach(reply => {
  stats[reply.category] = (stats[reply.category] || 0) + 1;
});

Object.keys(stats).sort((a, b) => stats[b] - stats[a]).forEach(category => {
  console.log(`- ${category}: ${stats[category]} câu trả lời`);
}); 