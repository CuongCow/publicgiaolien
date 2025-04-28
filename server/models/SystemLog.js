const mongoose = require('mongoose');

const SystemLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'login', 'logout', 'reset_password', 'other']
  },
  target: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: 'unknown'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Tạo chỉ mục cho trường createdAt để tự động xóa
SystemLogSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 30 * 24 * 60 * 60 // Mặc định xóa sau 30 ngày
});

module.exports = mongoose.model('SystemLog', SystemLogSchema); 