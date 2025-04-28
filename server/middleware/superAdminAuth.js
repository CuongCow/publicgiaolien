const Admin = require('../models/Admin');

// Middleware để kiểm tra người dùng có quyền Super Admin không
module.exports = async function(req, res, next) {
  try {
    // Kiểm tra xem người dùng đã đăng nhập chưa (req.admin.id từ middleware auth trước đó)
    if (!req.admin || !req.admin.id) {
      return res.status(401).json({ message: 'Không có quyền truy cập' });
    }
    
    // Lấy thông tin admin từ database
    const admin = await Admin.findById(req.admin.id);
    
    if (!admin) {
      return res.status(401).json({ message: 'Không tìm thấy tài khoản Admin' });
    }
    
    // Kiểm tra xem admin có vai trò superadmin không
    if (admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Không đủ quyền hạn để thực hiện thao tác này' });
    }
    
    // Admin có quyền Super Admin, cho phép tiếp tục
    next();
  } catch (err) {
    console.error('SuperAdmin authorization error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 