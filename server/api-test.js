// File kiểm tra kết nối API
const express = require('express');
const router = express.Router();

// Route kiểm tra API đơn giản
router.get('/test', (req, res) => {
  console.log('API Test endpoint called');
  res.status(200).json({
    message: 'API test endpoint is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    headers: req.headers,
    vercel: process.env.VERCEL ? 'true' : 'false'
  });
});

module.exports = router; 