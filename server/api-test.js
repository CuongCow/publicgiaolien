// File kiểm tra kết nối API
const express = require('express');
const router = express.Router();

// Route test cơ bản
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'API Test route is working',
    timestamp: new Date().toISOString()
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
    timestamp: new Date().toISOString()
  });
});

// Route test OPTIONS cho login
router.options('/login', (req, res) => {
  console.log('API TEST OPTIONS - Headers:', req.headers);
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-auth-token, Authorization');
  res.sendStatus(200);
});

module.exports = router; 