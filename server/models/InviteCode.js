const mongoose = require('mongoose');

const InviteCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      const now = new Date();
      return new Date(now.setDate(now.getDate() + 7)); // Mã hết hạn sau 7 ngày
    }
  }
});

module.exports = mongoose.model('InviteCode', InviteCodeSchema); 