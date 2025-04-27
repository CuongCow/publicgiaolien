const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = function(req, res, next) {
  // Lấy token từ header
  const token = req.header('x-auth-token');

  // Kiểm tra xem có token không
  if (!token) {
    return res.status(401).json({ message: 'Không có token, không thể truy cập' });
  }

  try {
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Thêm admin vào request
    req.admin = decoded.admin;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Middleware kiểm tra SuperAdmin
exports.checkSuperAdmin = function(req, res, next) {
  if (req.admin && req.admin.role === 'superadmin') {
    next();
  } else {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
}; 