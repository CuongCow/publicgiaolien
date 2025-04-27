/**
 * Script tạo tài khoản Super Admin đầu tiên
 * 
 * Cách chạy: node scripts/createSuperAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://cuongdn:v446gy9nDmuyKsqg@cluster0.frhl2tm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function createSuperAdmin() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    // Tạo mật khẩu mã hóa
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('admin123', salt);

    // Xóa tài khoản Super Admin cũ nếu có
    await Admin.deleteOne({ username: 'superadmin' });
    console.log('Đã xóa tài khoản Super Admin cũ nếu có');

    // Tạo Super Admin mới
    const admin = new Admin({
      username: 'superadmin',
      password,
      name: 'Super Admin',
      email: 'c.dao1255@gmail.com',
      role: 'superadmin'
    });

    // Lưu vào cơ sở dữ liệu
    await admin.save();
    console.log('Super Admin đã được tạo thành công!');
    console.log('- Username: superadmin');
    console.log('- Password: admin123');
    console.log('Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu tiên.');

  } catch (error) {
    console.error('Lỗi tạo Super Admin:', error.message);
  } finally {
    // Ngắt kết nối MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Chạy hàm tạo Super Admin
createSuperAdmin(); 