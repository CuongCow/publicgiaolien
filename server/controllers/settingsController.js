const SystemSettings = require('../models/SystemSettings');

// @route   GET api/settings
// @desc    Lấy cài đặt hệ thống của admin cụ thể
// @access  Private (Admin only)
exports.getSettings = async (req, res) => {
  try {
    const adminId = req.admin ? req.admin.id : null;
    
    // Nếu không có adminId, trả về cài đặt mặc định
    if (!adminId) {
      return res.json({
        termType: 'default',
        customTerm: ''
      });
    }
    
    // Tìm cài đặt theo adminId
    let settings = await SystemSettings.findOne({ adminId });
    
    // Nếu không tìm thấy, tạo cài đặt mặc định cho admin
    if (!settings) {
      settings = new SystemSettings({
        adminId,
        termType: 'default',
        customTerm: ''
      });
      await settings.save();
    }
    
    res.json(settings);
  } catch (err) {
    console.error('Get settings error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   GET api/settings/public/:adminId
// @desc    Lấy cài đặt của admin cho public (đội chơi)
// @access  Public
exports.getPublicSettings = async (req, res) => {
  try {
    const { adminId } = req.params;
    
    // Tìm cài đặt theo adminId
    const settings = await SystemSettings.findOne({ adminId });
    
    // Nếu không tìm thấy, trả về cài đặt mặc định
    if (!settings) {
      return res.json({
        termType: 'default',
        customTerm: ''
      });
    }
    
    res.json(settings);
  } catch (err) {
    console.error('Get public settings error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   PUT api/settings
// @desc    Cập nhật cài đặt hệ thống cho admin
// @access  Private (Admin only)
exports.updateSettings = async (req, res) => {
  try {
    const { termType, customTerm, customCopyTemplates } = req.body;
    const adminId = req.admin.id;
    
    // Kiểm tra các giá trị hợp lệ
    if (termType && !['default', 'journey', 'custom'].includes(termType)) {
      return res.status(400).json({ message: 'Loại thuật ngữ không hợp lệ' });
    }
    
    // Tìm cài đặt hiện có hoặc tạo mới nếu chưa có
    let settings = await SystemSettings.findOne({ adminId });
    
    if (!settings) {
      settings = new SystemSettings({ adminId });
    }
    
    // Cập nhật các trường
    if (termType !== undefined) settings.termType = termType;
    if (customTerm !== undefined) settings.customTerm = customTerm;
    
    // Cập nhật mẫu sao chép tùy chỉnh nếu có
    if (customCopyTemplates) {
      if (customCopyTemplates.stationCentered) {
        settings.customCopyTemplates.stationCentered = customCopyTemplates.stationCentered;
      }
      if (customCopyTemplates.stationRace) {
        settings.customCopyTemplates.stationRace = customCopyTemplates.stationRace;
      }
    }
    
    // Cập nhật thời gian cập nhật
    settings.lastUpdated = Date.now();
    
    await settings.save();
    
    res.json(settings);
  } catch (err) {
    console.error('Update settings error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 