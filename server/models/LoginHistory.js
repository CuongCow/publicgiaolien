const mongoose = require('mongoose');

const LoginHistorySchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin',
    required: false
  },
  username: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  deviceInfo: {
    type: String
  },
  location: {
    type: String
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  }
});

// Tự động xóa lịch sử cũ sau 90 ngày
LoginHistorySchema.index({ loginTime: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('LoginHistory', LoginHistorySchema); 