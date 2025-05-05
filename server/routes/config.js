const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/config
 * @desc    Get server configuration including base URL
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    // Ưu tiên sử dụng CLIENT_URL từ biến môi trường
    const baseUrl = process.env.CLIENT_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:3000';
    
    // Trả về cấu hình 
    res.json({
      success: true,
      data: {
        baseUrl: baseUrl,
        env: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin cấu hình',
      error: error.message
    });
  }
});

module.exports = router; 