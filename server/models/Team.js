const mongoose = require('mongoose');
const crypto = require('crypto');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    default: function() {
      // Tạo mật khẩu ngẫu nhiên 5 ký tự
      return Math.random().toString(36).substring(2, 7).toUpperCase();
    }
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  totalScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['inactive', 'active', 'hidden', 'copied', 'exited'],
    default: 'inactive'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  copiedContent: {
    type: [String],
    default: []
  },
  sessionId: {
    type: String,
    default: null
  },
  deviceInfo: {
    type: String,
    default: null
  },
  completedStations: [{
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station'
    },
    score: Number,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Team', TeamSchema); 