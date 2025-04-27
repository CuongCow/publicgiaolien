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

// Hash mật khẩu trước khi lưu
AdminSchema.pre('save', async function(next) {
  // Chỉ hash mật khẩu khi mật khẩu được sửa đổi hoặc tài khoản mới
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Kiểm tra xem mật khẩu đã được hash chưa
    if (this.password.length >= 60 && this.password.startsWith('$2a$')) {
      return next(); // Đã hash, không hash lại
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Phương thức kiểm tra mật khẩu
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', AdminSchema); 