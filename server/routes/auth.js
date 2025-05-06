const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config');
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');
const InvitationCode = require('../models/InvitationCode');
const LoginHistory = require('../models/LoginHistory');
const superAdminAuth = require('../middleware/superAdminAuth');
const SystemLog = require('../models/SystemLog');
const SystemSettings = require('../models/SystemSettings');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Đăng ký admin mới
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Thêm OPTIONS handler riêng cho route login
router.options('/login', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-auth-token, Authorization');
  res.status(200).send();
});

// Lấy thông tin admin
router.get('/me', auth, authController.getMe);

// Lấy lịch sử đăng nhập
router.get('/login-history', auth, authController.getLoginHistory);

// Lấy chi tiết lịch sử đăng nhập
router.get('/login-history/:id', auth, authController.getLoginHistoryDetail);

// Cập nhật thông tin admin
router.patch('/profile', auth, authController.updateProfile);

// @route   POST api/auth/check-email
// @desc    Kiểm tra xem email đã tồn tại chưa
// @access  Public
router.post('/check-email', authController.checkEmail);

// @route   POST api/auth/send-verification
// @desc    Gửi mã xác thực đến email khi đăng ký
// @access  Public
router.post('/send-verification', authController.sendVerification);

// @route   POST api/auth/verify-code
// @desc    Xác thực mã
// @access  Public
router.post('/verify-code', authController.verifyCode);

// @route   POST api/auth/request-reset
// @desc    Yêu cầu đặt lại mật khẩu
// @access  Public
router.post('/request-reset', authController.requestPasswordReset);

// @route   POST api/auth/reset-password
// @desc    Đặt lại mật khẩu
// @access  Public
router.post('/reset-password', authController.resetPassword);

// @route   POST api/auth/verify-invite-code
// @desc    Xác minh mã mời
// @access  Public
router.post('/verify-invite-code', authController.verifyInviteCode);

// Tạo route để lấy thông báo cho user hiện tại
router.get('/notifications', auth, authController.getNotifications);

// Lấy danh sách admin dựa trên vai trò (role) người dùng hiện tại
// @route   GET api/auth/admins
// @desc    Lấy danh sách admin - superadmin thấy tất cả admin, admin thường chỉ thấy superadmin
// @access  Private
router.get('/admins', auth, async (req, res) => {
  try {
    // Lấy thông tin người dùng hiện tại
    const currentUser = await Admin.findById(req.admin.id);
    
    if (!currentUser) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
    }
    
    let query = {};
    
    // Nếu là superadmin, trả về tất cả admin (trừ chính họ)
    if (currentUser.role === 'superadmin') {
      query = { _id: { $ne: currentUser._id } };
    } 
    // Nếu là admin thường, chỉ trả về superadmin
    else {
      query = { role: 'superadmin' };
    }
    
    // Lấy danh sách admin theo query
    const admins = await Admin.find(query)
      .select('-password -loginHistory -verificationCode -resetPasswordCode')
      .sort({ username: 1 });
    
    res.json(admins);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách admin:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router; 