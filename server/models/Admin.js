const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Mã hóa mật khẩu trước khi lưu
AdminSchema.pre('save', async function(next) {
  const admin = this;
  
  // Bỏ qua hash mật khẩu nếu đã được đánh dấu
  if (admin.$locals.skipPasswordHash) {
    return next();
  }
  
  // Chỉ hash mật khẩu nếu nó bị sửa đổi hoặc mới
  if (!admin.isModified('password')) {
    return next();
  }
  
  // Kiểm tra xem mật khẩu đã hash chưa
  // Mật khẩu đã hash sẽ bắt đầu bằng "$2a$" hoặc "$2b$" (bcrypt signature)
  if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
    return next(); // Đã hash rồi, bỏ qua
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Phương thức kiểm tra mật khẩu
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', AdminSchema); 