const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin',
    required: true,
    index: true
  },
  termType: {
    type: String,
    enum: ['default', 'journey', 'custom'],
    default: 'default'
  },
  customTerm: {
    type: String,
    default: ''
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema); 