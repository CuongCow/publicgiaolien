const mongoose = require('mongoose');

// Schema con cho trường thông tin người dùng
const UserInfoFieldSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  required: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const SecretMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    default: ''
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  teamNote: {
    type: String,
    default: ''
  },
  // Các trường để thu thập thông tin người dùng
  userInfoFields: {
    type: [UserInfoFieldSchema],
    default: []
  },
  // Nội dung chính
  content: {
    type: String,
    required: true
  },
  // Nội dung dạng OTT
  ottContent: {
    type: String,
    default: ''
  },
  // Nội dung dạng NW
  nwContent: {
    type: String,
    default: ''
  },
  // Cho phép hiển thị loại nội dung
  showText: {
    type: Boolean,
    default: true
  },
  showImage: {
    type: Boolean,
    default: false
  },
  showOTT: {
    type: Boolean,
    default: true
  },
  showNW: {
    type: Boolean,
    default: true
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'both'],
    default: 'text'
  },
  fontSize: {
    type: String,
    default: '1.05rem'
  },
  fontWeight: {
    type: String,
    default: '500'
  },
  lineHeight: {
    type: String,
    default: '1.5'
  },
  letterSpacing: {
    type: String,
    default: 'normal'
  },
  paragraphSpacing: {
    type: String,
    default: '0.8rem'
  },
  correctAnswer: {
    type: [String],
    default: []
  },
  maxAttempts: {
    type: Number,
    default: 0 // 0 hoặc null có nghĩa là không giới hạn số lần thử
  },
  qrCode: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware để tạo mã QR trước khi lưu
SecretMessageSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('_id')) {
    try {
      const url = `${process.env.CLIENT_URL || 'http://localhost:3000'}/secret-message/${this._id}`;
      this.qrCode = await require('qrcode').toDataURL(url);
    } catch (error) {
      console.error('QR Code generation error:', error);
    }
  }
  next();
});

const SecretMessage = mongoose.model('SecretMessage', SecretMessageSchema);

module.exports = SecretMessage; 