const mongoose = require('mongoose');

const VerificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Đánh index cho email để tìm kiếm nhanh hơn
VerificationCodeSchema.index({ email: 1 });

// Đánh index cho expiresAt và tự động xóa các bản ghi hết hạn
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('VerificationCode', VerificationCodeSchema); 