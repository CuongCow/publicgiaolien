const jwt = require('jsonwebtoken');
const config = require('../config');
const SystemSettings = require('../models/SystemSettings');

const auth = async function(req, res, next) {
  // Lấy địa chỉ IP của request
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Xóa tiền tố IPv6 nếu có
  const cleanIP = clientIP.replace(/^::ffff:/, '');
  
  try {
    // Kiểm tra xem IP có trong danh sách chặn không
    const settings = await SystemSettings.findOne();
    
    if (settings && 
        settings.securitySettings && 
        settings.securitySettings.blockedIPs && 
        settings.securitySettings.blockedIPs.length > 0) {
      
      // Kiểm tra IP có trong danh sách chặn không
      if (settings.securitySettings.blockedIPs.includes(cleanIP)) {
        return res.status(403).json({ 
          message: 'Địa chỉ IP của bạn đã bị chặn truy cập, vui lòng liên hệ quản trị viên' 
        });
      }
    }
    
    // Lấy token từ header
    const token = req.header('x-auth-token');

    // Kiểm tra xem có token không
    if (!token) {
      return res.status(401).json({ message: 'Không có token, xác thực bị từ chối' });
    }

    // Xác thực token
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      req.admin = decoded.admin;
      next();
    } catch (err) {
      res.status(401).json({ message: 'Token không hợp lệ' });
    }
  } catch (err) {
    console.error('Error checking blocked IP:', err);
    next(); // Vẫn cho phép request tiếp tục trong trường hợp lỗi
  }
};

module.exports = { auth }; 