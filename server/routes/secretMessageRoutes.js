const express = require('express');
const router = express.Router();
const secretMessageController = require('../controllers/secretMessageController');
const secretMessageResponseController = require('../controllers/secretMessageResponseController');
const { auth } = require('../middleware/auth');
const qrcode = require('qrcode');
const SecretMessage = require('../models/SecretMessage');

// Middleware debug để kiểm tra auth
const debugAuth = (req, res, next) => {
  console.log('DEBUG - Request headers:', req.headers);
  console.log('DEBUG - Authorization header:', req.headers.authorization);
  auth(req, res, (err) => {
    if (err) {
      console.log('DEBUG - Auth error:', err);
      return res.status(401).json({ message: 'Unauthorized', error: err.message });
    }
    console.log('DEBUG - Auth success, req.admin:', req.admin);
    next();
  });
};

// Routes cho mật thư
router.post('/create', debugAuth, secretMessageController.create);
router.get('/admin', debugAuth, secretMessageController.getAllByAdmin);
router.get('/:id', secretMessageController.getById);
router.put('/:id', debugAuth, secretMessageController.update);
router.delete('/:id', debugAuth, secretMessageController.delete);

// Routes mới cho phản hồi mật thư
router.post('/response/submit-answer', secretMessageResponseController.submitAnswer);
router.post('/response/submit-user-info', secretMessageResponseController.submitUserInfo);
router.get('/response/admin', debugAuth, secretMessageResponseController.getAllByAdmin);
router.get('/response/remaining-attempts/:secretMessageId', secretMessageResponseController.getRemainingAttempts);
router.delete('/response/:responseId', debugAuth, secretMessageResponseController.deleteResponse);

// Endpoint mới: Tạo QR code cho mật thư
router.get('/:id/qrcode', auth, async (req, res) => {
  try {
    const secretMessage = await SecretMessage.findOne({
      _id: req.params.id,
      adminId: req.admin.id
    });
    
    if (!secretMessage) return res.status(404).json({ message: 'Không tìm thấy mật thư' });

    // Lấy origin URL từ request header hoặc sử dụng CLIENT_URL từ biến môi trường
    const origin = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:3000';
    
    // Tạo URL cho mật thư
    const url = `${origin}/secret-message/${secretMessage._id}`;
    
    // Tạo QR code với mức sửa lỗi cao để hỗ trợ thêm logo sau này
    const qrCodeDataUrl = await qrcode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 4,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    res.json({ qrCode: qrCodeDataUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 