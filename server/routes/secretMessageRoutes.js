const express = require('express');
const router = express.Router();
const secretMessageController = require('../controllers/secretMessageController');
const secretMessageResponseController = require('../controllers/secretMessageResponseController');
const { auth } = require('../middleware/auth');

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

module.exports = router; 