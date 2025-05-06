// API Check - Kiểm tra API trạng thái
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'API Check OK',
    timestamp: new Date().toISOString(),
    vercel: process.env.VERCEL ? 'true' : 'false',
    node_env: process.env.NODE_ENV
  });
});

router.post('/', (req, res) => {
  res.status(200).json({
    message: 'API Check POST OK',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Tạo một route login-test riêng để kiểm tra POST login
router.post('/login-test', (req, res) => {
  console.log('API Check login-test POST called with data:', req.body);
  res.status(200).json({
    message: 'Login test OK',
    body: req.body,
    headers: {
      contentType: req.headers['content-type'],
      origin: req.headers['origin'],
      host: req.headers['host']
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 
router.post('/login-test', (req, res) => {
  console.log('API Check login-test POST called with data:', req.body);
  res.status(200).json({
    message: 'Login test OK',
    body: req.body,
    headers: {
      contentType: req.headers['content-type'],
      origin: req.headers['origin'],
      host: req.headers['host']
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 