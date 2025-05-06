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

// API thống kê - đặt trước các route có tham số
router.get('/statistics', debugAuth, secretMessageResponseController.getStatistics);

// Route test không cần xác thực (chỉ dùng cho môi trường phát triển)
router.get('/statistics/test', (req, res) => {
  // Tạo dữ liệu mẫu để test frontend
  const sampleData = {
    totalResponses: 25,
    correctResponses: 15,
    incorrectResponses: 10,
    accuracyRate: "60.00",
    dailyStats: [
      { date: '2025-04-30', total: 2, correct: 1, incorrect: 1 },
      { date: '2025-05-01', total: 5, correct: 3, incorrect: 2 },
      { date: '2025-05-02', total: 4, correct: 2, incorrect: 2 },
      { date: '2025-05-03', total: 3, correct: 2, incorrect: 1 },
      { date: '2025-05-04', total: 6, correct: 4, incorrect: 2 },
      { date: '2025-05-05', total: 3, correct: 2, incorrect: 1 },
      { date: '2025-05-06', total: 2, correct: 1, incorrect: 1 },
    ],
    messageStats: [
      { id: '1', name: 'Mật thư 1', total: 10, correct: 6, incorrect: 4 },
      { id: '2', name: 'Mật thư 2', total: 8, correct: 5, incorrect: 3 },
      { id: '3', name: 'Mật thư 3', total: 7, correct: 4, incorrect: 3 }
    ],
    userRankings: [
      { rank: 1, userName: 'User 1', totalAttempts: 8, correctAttempts: 7, accuracy: "87.50" },
      { rank: 2, userName: 'User 2', totalAttempts: 7, correctAttempts: 5, accuracy: "71.43" },
      { rank: 3, userName: 'User 3', totalAttempts: 6, correctAttempts: 3, accuracy: "50.00" },
      { rank: 4, userName: 'User 4', totalAttempts: 4, correctAttempts: 2, accuracy: "50.00" }
    ]
  };

  // Trả về dữ liệu mẫu
  return res.status(200).json({
    success: true,
    statistics: sampleData
  });
});

// Routes cho phản hồi mật thư
router.post('/response/submit-answer', secretMessageResponseController.submitAnswer);
router.post('/response/submit-user-info', secretMessageResponseController.submitUserInfo);
router.get('/response/admin', debugAuth, secretMessageResponseController.getAllByAdmin);
router.get('/response/remaining-attempts/:secretMessageId', secretMessageResponseController.getRemainingAttempts);
router.get('/response/check-correct/:secretMessageId', secretMessageResponseController.checkCorrectAnswer);
router.delete('/response/all', debugAuth, secretMessageResponseController.deleteAllResponses);
router.delete('/response/:responseId', debugAuth, secretMessageResponseController.deleteResponse);

// Endpoint mới: Tạo QR code cho mật thư (đặt trước /:id)
router.get('/:id/qrcode', debugAuth, async (req, res) => {
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
    console.error('QR Code generation error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', secretMessageController.getById);
router.put('/:id', debugAuth, secretMessageController.update);
router.delete('/:id', debugAuth, secretMessageController.delete);

module.exports = router; 