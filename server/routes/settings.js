const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

// @route   GET api/settings
// @desc    Lấy cài đặt hệ thống của admin đang đăng nhập
// @access  Private (Admin only)
router.get('/', auth, settingsController.getSettings);

// @route   GET api/settings/public/:adminId
// @desc    Lấy cài đặt công khai của admin
// @access  Public
router.get('/public/:adminId', settingsController.getPublicSettings);

// @route   PUT api/settings
// @desc    Cập nhật cài đặt hệ thống
// @access  Private (Admin only)
router.put('/', auth, settingsController.updateSettings);

module.exports = router; 