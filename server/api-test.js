// File kiểm tra kết nối API
const express = require('express');
const router = express.Router();

// Route kiểm tra API đơn giản
router.get('/test', (req, res) => {
  console.log('API Test endpoint was called');
  res.status(200).json({
    message: 'API test endpoint is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    headers: req.headers,
    vercel: process.env.VERCEL ? 'true' : 'false'
  });
});

// Route POST kiểm tra API
router.post('/post-test', (req, res) => {
  console.log('API POST Test endpoint was called');
  console.log('Request body:', req.body);
  res.status(200).json({
    message: 'API POST test endpoint is working!',
    timestamp: new Date().toISOString(),
    receivedData: req.body,
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL ? 'true' : 'false'
  });
});

module.exports = router; 