const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');
const Settings = require('../models/Settings');

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

// Lấy cài đặt ngôn ngữ
router.get('/language', async (req, res) => {
  try {
    console.log('Đang lấy cài đặt ngôn ngữ...');
    let settings = await Settings.findOne();
    
    // Nếu không có settings, tạo mới với giá trị mặc định
    if (!settings) {
      settings = await Settings.create({ language: 'vi' });
      console.log('Đã tạo cài đặt mặc định');
    }
    
    console.log('Cài đặt ngôn ngữ:', settings);
    res.json({ language: settings.language });
  } catch (error) {
    console.error('Lỗi khi lấy cài đặt ngôn ngữ:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Cập nhật cài đặt ngôn ngữ
router.post('/language', async (req, res) => {
  try {
    console.log('Đang cập nhật ngôn ngữ:', req.body);
    const { language } = req.body;
    
    if (!language || !['vi', 'en'].includes(language)) {
      return res.status(400).json({ message: 'Ngôn ngữ không hợp lệ' });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ language });
    } else {
      settings.language = language;
      await settings.save();
    }
    
    console.log('Đã cập nhật ngôn ngữ:', settings);
    res.json({ success: true, language: settings.language });
  } catch (error) {
    console.error('Lỗi khi cập nhật ngôn ngữ:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router; 