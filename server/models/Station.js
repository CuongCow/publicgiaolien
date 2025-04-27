const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  teams: [{
    type: String,
    trim: true
  }],
  content: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'both'],
    default: 'text'
  },
  // Nội dung dạng OTT (nếu có)
  ottContent: {
    type: String,
    default: ''
  },
  // Nội dung dạng NW (nếu có)
  nwContent: {
    type: String,
    default: ''
  },
  // Cho phép hiển thị loại nội dung nào
  showText: {
    type: Boolean,
    default: true
  },
  showImage: {
    type: Boolean,
    default: false
  },
  // Cho phép hiển thị OTT và NW
  showOTT: {
    type: Boolean,
    default: true
  },
  showNW: {
    type: Boolean,
    default: true
  },
  correctAnswer: {
    type: [String],
    required: true,
    default: []
  },
  maxAttempts: {
    type: Number,
    default: 5
  },
  lockTime: {
    type: Number,
    default: 0, // Thời gian khóa tính bằng phút
  },
  qrCode: {
    type: String
  },
  gameName: {
    type: String,
    trim: true,
    default: ''
  },
  gameNote: {
    type: String,
    default: 'Trung thành với bản mã'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware để tạo mã QR trước khi lưu
StationSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('_id')) {
    try {
      const url = `${process.env.CLIENT_URL || 'http://192.168.1.8:3000'}/station/${this._id}`;
      this.qrCode = await require('qrcode').toDataURL(url);
    } catch (error) {
      console.error('QR Code generation error:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Station', StationSchema); 