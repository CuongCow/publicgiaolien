const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const InviteCode = require('../models/InviteCode');

// Đăng ký admin mới
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

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
router.post('/verify-invite-code', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        isValid: false,
        message: 'Vui lòng cung cấp mã mời' 
      });
    }
    
    const inviteCode = await InviteCode.findOne({ code });
    
    if (!inviteCode) {
      return res.status(400).json({ 
        isValid: false,
        message: 'Mã mời không hợp lệ' 
      });
    }
    
    if (inviteCode.isUsed) {
      return res.status(400).json({ 
        isValid: false,
        message: 'Mã mời đã được sử dụng' 
      });
    }
    
    const now = new Date();
    if (inviteCode.expiresAt && inviteCode.expiresAt < now) {
      return res.status(400).json({ 
        isValid: false,
        message: 'Mã mời đã hết hạn' 
      });
    }
    
    res.json({ 
      isValid: true,
      message: 'Mã mời hợp lệ' 
    });
  } catch (err) {
    console.error('Error verifying invite code:', err);
    res.status(500).json({ 
      isValid: false,
      message: 'Lỗi server' 
    });
  }
});

// Tạo route để lấy thông báo cho user hiện tại
router.get('/notifications', auth, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    
    const userId = req.admin.id;
    const userRole = req.admin.role;
    
    // Tìm các thông báo dựa trên tiêu chí:
    // 1. Thông báo cho 'all'
    // 2. Thông báo cho 'admins' nếu user là admin
    // 3. Thông báo cho 'teams' nếu user là team
    // 4. Thông báo cụ thể cho userId này (specificAdmins hoặc specificTeams)
    let query = {
      isActive: true,
      expiresAt: { $gt: new Date() },
      $or: [
        { targetUsers: 'all' }
      ]
    };
    
    if (userRole === 'superadmin' || userRole === 'admin') {
      query.$or.push({ targetUsers: 'admins' });
      query.$or.push({
        targetUsers: 'specificAdmins',
        targetUsersList: userId
      });
    } else if (userRole === 'team') {
      query.$or.push({ targetUsers: 'teams' });
      query.$or.push({
        targetUsers: 'specificTeams',
        targetUsersList: userId
      });
    }
    
    const notifications = await Notification.find(query)
      .populate('createdBy', 'username name')
      .sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (err) {
    console.error('Error getting notifications for user:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router; 