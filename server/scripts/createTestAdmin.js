/**
 * Script để tạo admin test
 * Sử dụng: node createTestAdmin.js
 */

const mongoose = require('mongoose');
const config = require('../config');
const bcrypt = require('bcryptjs');

// Kết nối MongoDB
mongoose.connect(config.MONGODB_URI)
  .then(async () => {
    try {
      console.log('Đã kết nối MongoDB');
      
      // Tạo model Admin tạm thời
      const AdminSchema = new mongoose.Schema({
        username: String,
        password: String,
        name: String,
        email: String,
        role: String,
        createdAt: { type: Date, default: Date.now }
      });
      
      // Thêm middleware pre-save để hash mật khẩu
      AdminSchema.pre('save', async function(next) {
        if (this.isModified('password')) {
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
        }
        next();
      });
      
      // Xác định model Admin
      const Admin = mongoose.model('Admin', AdminSchema);
      
      // Kiểm tra xem admin test đã tồn tại chưa
      const existingAdmin = await Admin.findOne({ username: 'testadmin' });
      
      if (existingAdmin) {
        console.log('Admin test đã tồn tại:');
        console.log(`ID: ${existingAdmin._id}`);
        console.log(`Username: ${existingAdmin.username}`);
        console.log(`Email: ${existingAdmin.email}`);
        console.log(`Role: ${existingAdmin.role}`);
      } else {
        // Tạo admin mới
        const newAdmin = new Admin({
          username: 'testadmin',
          password: 'Test@123',
          name: 'Admin Test',
          email: 'testadmin@example.com',
          role: 'admin'
        });
        
        await newAdmin.save();
        
        console.log('Đã tạo admin test:');
        console.log(`ID: ${newAdmin._id}`);
        console.log(`Username: ${newAdmin.username}`);
        console.log(`Email: ${newAdmin.email}`);
        console.log(`Role: ${newAdmin.role}`);
      }
      
      console.log('\nĐăng nhập với:');
      console.log('Username: testadmin');
      console.log('Password: Test@123');
      
    } catch (error) {
      console.error('Lỗi khi tạo admin test:', error);
    } finally {
      mongoose.disconnect();
      console.log('Đã ngắt kết nối MongoDB');
    }
  })
  .catch(err => {
    console.error('Lỗi kết nối MongoDB:', err);
  }); 