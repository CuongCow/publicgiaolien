const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = function(req, res, next) {
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
}; 