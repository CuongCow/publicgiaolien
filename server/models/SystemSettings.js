const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  termType: {
    type: String,
    enum: ['default', 'custom'],
    default: 'default'
  },
  customTerm: {
    type: String,
    default: ''
  },
  databaseRetentionDays: {
    type: Number,
    default: 30,
    min: 1,
    max: 365
  },
  securitySettings: {
    maxLoginAttempts: {
      type: Number,
      default: 5
    },
    lockoutTimeMinutes: {
      type: Number,
      default: 30
    },
    sessionTimeoutMinutes: {
      type: Number,
      default: 60
    },
    requireStrongPasswords: {
      type: Boolean,
      default: true
    },
    blockedIPs: {
      type: [String],
      default: []
    }
  },
  notificationSettings: {
    enableLoginAlerts: {
      type: Boolean,
      default: true
    },
    enableSystemNotifications: {
      type: Boolean,
      default: true
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema); 