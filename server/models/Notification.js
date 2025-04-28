const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    default: 'info'
  },
  targetUsers: {
    type: String,
    enum: ['all', 'admins', 'teams', 'specificAdmins', 'specificTeams'],
    default: 'all'
  },
  targetUsersList: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  sendEmail: {
    type: Boolean,
    default: false
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: function() {
      const now = new Date();
      return new Date(now.setDate(now.getDate() + 7)); // Mặc định hết hạn sau 7 ngày
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema); 