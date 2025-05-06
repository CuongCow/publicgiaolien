const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  language: {
    type: String,
    enum: ['vi', 'en'],
    default: 'vi',
    required: true
  }
}, { 
  timestamps: true,
  // Thêm cài đặt để luôn tạo document mới nếu không tìm thấy
  collection: 'settings'
});

// Middleware để đảm bảo luôn có ít nhất một document
settingsSchema.pre('save', async function(next) {
  const count = await this.constructor.countDocuments();
  if (count === 0) {
    // Tự động tạo document đầu tiên với giá trị mặc định
    await this.constructor.create({ language: 'vi' });
  }
  next();
});

module.exports = mongoose.model('Settings', settingsSchema); 