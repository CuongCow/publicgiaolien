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
      // Sử dụng CLIENT_URL từ biến môi trường hoặc window.location.origin nếu có thể, 
      // chỉ fallback sang localhost khi không có lựa chọn nào khác
      const url = `${process.env.CLIENT_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:3000'}/secret-message/${this._id}`;
      
      // Tạo QR code với các tùy chọn nâng cao
      const qrcode = require('qrcode');
      
      // Tạo QR code cơ bản
      this.qrCode = await qrcode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        margin: 4,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      // Lưu ý: Để thêm logo vào QR code ở phía server cần sử dụng canvas
      // và xử lý hình ảnh riêng. Quá trình này phức tạp hơn so với ở client
      // Trong môi trường production, bạn có thể cần thêm thư viện xử lý hình ảnh
      // như sharp hoặc jimp để thực hiện điều này
      
    } catch (error) {
      console.error('QR Code generation error:', error);
    }
  }
  next();
});

const SecretMessage = mongoose.model('SecretMessage', SecretMessageSchema);

module.exports = SecretMessage; 