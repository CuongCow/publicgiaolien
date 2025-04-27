const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

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

module.exports = router; 