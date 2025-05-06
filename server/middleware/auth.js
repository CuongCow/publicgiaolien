const jwt = require('jsonwebtoken');
const config = require('../config');
const SystemSettings = require('../models/SystemSettings');

const auth = async function(req, res, next) {
  // Lấy địa chỉ IP của request
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Xóa tiền tố IPv6 nếu có
  const cleanIP = clientIP.replace(/^::ffff:/, '');
  
  console.log(`[AUTH] Xác thực request từ IP: ${cleanIP}`);
  console.log(`[AUTH] Token từ header:`, req.header('x-auth-token') ? 'Có token' : 'Không có token');
  
  try {
    // Kiểm tra xem IP có trong danh sách chặn không
    const settings = await SystemSettings.findOne();
    
    if (settings && 
        settings.securitySettings && 
        settings.securitySettings.blockedIPs && 
        settings.securitySettings.blockedIPs.length > 0) {
      
      // Kiểm tra IP có trong danh sách chặn không
      if (settings.securitySettings.blockedIPs.includes(cleanIP)) {
        console.log(`[AUTH] IP ${cleanIP} bị chặn`);
        return res.status(403).json({ 
          message: 'Địa chỉ IP của bạn đã bị chặn truy cập, vui lòng liên hệ quản trị viên' 
        });
      }
    }
    
    // Lấy token từ header
    const token = req.header('x-auth-token');

    // Kiểm tra xem có token không
    if (!token) {
      console.log(`[AUTH] Không có token trong header`);
      return res.status(401).json({ message: 'Không có token, xác thực bị từ chối' });
    }

    // Xác thực token
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      req.admin = decoded.admin;
      console.log(`[AUTH] Xác thực thành công cho admin:`, req.admin);
      next();
    } catch (err) {
      console.log(`[AUTH] Token không hợp lệ:`, err.message);
      res.status(401).json({ message: 'Token không hợp lệ', error: err.message });
    }
  } catch (err) {
    console.error('[AUTH] Lỗi kiểm tra IP bị chặn:', err);
    next(); // Vẫn cho phép request tiếp tục trong trường hợp lỗi
  }
};

// Middleware xác thực tùy chỉnh cho secret-messages
const authenticate = async function(req, res, next) {
  // Bỏ qua việc xác thực token cho test API
  console.log("Xác thực đường dẫn:", req.originalUrl);
  next();
};

module.exports = { auth, authenticate }; 