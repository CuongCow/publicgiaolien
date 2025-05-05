const mongoose = require('mongoose');

const SecretMessageResponseSchema = new mongoose.Schema({
  secretMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SecretMessage',
    required: true
  },
  messageName: {
    type: String,
    required: true
  },
  userIdentifier: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    default: 'Định danh'
  },
  userInfo: {
    type: Object,
    default: {}
  },
  answer: {
    type: String,
    default: ''
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  isUserInfoSubmission: {
    type: Boolean,
    default: false
  },
  attemptCount: {
    type: Number,
    default: 1
  },
  ipAddress: {
    type: String,
    default: 'unknown'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index để tìm kiếm nhanh theo secretMessageId và userIdentifier
SecretMessageResponseSchema.index({ secretMessageId: 1, userIdentifier: 1 });
// Thêm index cho ipAddress để hỗ trợ tìm kiếm nhanh theo địa chỉ IP
SecretMessageResponseSchema.index({ secretMessageId: 1, ipAddress: 1 });

const SecretMessageResponse = mongoose.model('SecretMessageResponse', SecretMessageResponseSchema);

module.exports = SecretMessageResponse; 