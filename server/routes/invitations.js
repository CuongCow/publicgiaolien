const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const { auth, checkSuperAdmin } = require('../middleware/auth');

// @route   POST api/invitations
// @desc    Tạo mã mời mới
// @access  Private (SuperAdmin)
router.post('/', auth, checkSuperAdmin, invitationController.createInvitation);

// @route   GET api/invitations
// @desc    Lấy danh sách mã mời
// @access  Private (SuperAdmin)
router.get('/', auth, checkSuperAdmin, invitationController.getInvitations);

// @route   DELETE api/invitations/:id
// @desc    Xóa mã mời
// @access  Private (SuperAdmin)
router.delete('/:id', auth, checkSuperAdmin, invitationController.deleteInvitation);

// @route   POST api/invitations/verify
// @desc    Kiểm tra mã mời hợp lệ
// @access  Public
router.post('/verify', invitationController.verifyInvitation);

module.exports = router; 