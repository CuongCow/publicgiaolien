const mongoose = require('mongoose');

// Schema con cho nội dung riêng của từng đội
const TeamSpecificContentSchema = new mongoose.Schema({
  team: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'both'],
    default: 'text'
  },
  correctAnswer: {
    type: [String],
    default: []
  },
  // Thêm trường cho kích thước chữ
  fontSize: {
    type: String,
    default: '1.05rem'
  },
  // Thêm trường cho độ đậm chữ
  fontWeight: {
    type: String,
    default: '500'
  },
  // Thêm trường cho khoảng cách dòng
  lineHeight: {
    type: String,
    default: '1.5'
  },
  // Thêm trường cho khoảng cách đoạn văn
  paragraphSpacing: {
    type: String,
    default: '0.8rem'
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
  }
}, { _id: false });

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
  // Thêm trường cho kích thước chữ
  fontSize: {
    type: String,
    default: '1.05rem'
  },
  // Thêm trường cho độ đậm chữ
  fontWeight: {
    type: String,
    default: '500'
  },
  // Thêm trường cho khoảng cách dòng
  lineHeight: {
    type: String,
    default: '1.5'
  },
  // Thêm trường cho khoảng cách đoạn văn
  paragraphSpacing: {
    type: String,
    default: '0.8rem'
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
  // Trường để xác định trạm đang hoạt động
  isActive: {
    type: Boolean,
    default: false
  },
  // Trường mới để xác định loại mật thư
  messageType: {
    type: String,
    enum: ['common', 'individual'],
    default: 'common'
  },
  // Mảng chứa nội dung riêng cho từng đội
  teamSpecificContents: {
    type: [TeamSpecificContentSchema],
    default: []
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
      const url = `${process.env.CLIENT_URL || 'http://localhost:3000'}/station/${this._id}`;
      this.qrCode = await require('qrcode').toDataURL(url);
    } catch (error) {
      console.error('QR Code generation error:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Station', StationSchema); 