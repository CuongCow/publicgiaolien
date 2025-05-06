// File kiểm tra kết nối API
const express = require('express');
const router = express.Router();

// Route test cơ bản
router.get('/', (req, res) => {
  console.log('API test endpoint was called');
  res.status(200).json({
    message: 'API Test route is working',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL ? 'true' : 'false'
  });
});

// Route test login
router.post('/login', (req, res) => {
  console.log('API TEST LOGIN - Body:', req.body);
  console.log('API TEST LOGIN - Headers:', req.headers);
  
  res.status(200).json({
    success: true,
    message: 'Login test successful',
    received: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Route test với thông tin thời gian thực
router.get('/time', (req, res) => {
  console.log('API TEST TIME endpoint was called');
  res.status(200).json({
    message: 'API time check',
    currentTime: new Date().toISOString(),
    timestamp: Date.now(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    headers: req.headers,
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL ? 'true' : 'false'
  });
});

// Route test OPTIONS cho login
router.options('/login', (req, res) => {
  console.log('API TEST OPTIONS - Headers:', req.headers);
  res.sendStatus(200);
});

module.exports = router; 