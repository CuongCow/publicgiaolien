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

module.exports = router; 