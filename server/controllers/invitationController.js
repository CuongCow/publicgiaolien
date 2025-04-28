const InvitationCode = require('../models/InvitationCode');
const crypto = require('crypto');

// @route   POST api/invitations
// @desc    Tạo mã mời mới
// @access  Private (SuperAdmin)
exports.createInvitation = async (req, res) => {
  try {
    // Chỉ SuperAdmin mới có quyền tạo mã mời
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    // Tạo mã mời ngẫu nhiên 10 ký tự
    const code = crypto.randomBytes(5).toString('hex').toUpperCase();
    
    // Mã mời có hiệu lực trong 7 ngày
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = new InvitationCode({
      code,
      createdBy: req.admin.id,
      expiresAt
    });

    await invitation.save();

    res.status(201).json(invitation);
  } catch (err) {
    console.error('Create invitation error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   GET api/invitations
// @desc    Lấy danh sách mã mời
// @access  Private (SuperAdmin)
exports.getInvitations = async (req, res) => {
  try {
    // Chỉ SuperAdmin mới có quyền xem danh sách mã mời
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const invitations = await InvitationCode.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username name')
      .populate('usedBy', 'username name');

    res.json(invitations);
  } catch (err) {
    console.error('Get invitations error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   DELETE api/invitations/:id
// @desc    Xóa mã mời
// @access  Private (SuperAdmin)
exports.deleteInvitation = async (req, res) => {
  try {
    // Chỉ SuperAdmin mới có quyền xóa mã mời
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const invitation = await InvitationCode.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: 'Không tìm thấy mã mời' });
    }

    // Không cho phép xóa mã mời đã sử dụng
    if (invitation.isUsed) {
      return res.status(400).json({ message: 'Không thể xóa mã mời đã sử dụng' });
    }

    await InvitationCode.deleteOne({ _id: req.params.id });

    res.json({ message: 'Đã xóa mã mời' });
  } catch (err) {
    console.error('Delete invitation error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   POST api/invitations/verify
// @desc    Kiểm tra mã mời hợp lệ
// @access  Public
exports.verifyInvitation = async (req, res) => {
  const { code } = req.body;

  try {
    if (!code) {
      return res.status(400).json({ message: 'Mã mời là bắt buộc' });
    }

    const invitation = await InvitationCode.findOne({ code, isUsed: false });
    
    if (!invitation || new Date(invitation.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'Mã mời không hợp lệ hoặc đã hết hạn' });
    }

    res.json({ valid: true });
  } catch (err) {
    console.error('Verify invitation error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 