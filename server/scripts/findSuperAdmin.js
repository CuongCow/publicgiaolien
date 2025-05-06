/**
 * Script để tìm ID của superadmin
 * Sử dụng: node findSuperAdmin.js
 */

const mongoose = require('mongoose');
const config = require('../config');

// Kết nối MongoDB
mongoose.connect(config.MONGODB_URI)
  .then(async () => {
    try {
      console.log('Đã kết nối MongoDB');
      
      // Tạo model Admin tạm thời
      const AdminSchema = new mongoose.Schema({
        username: String,
        email: String,
        role: String,
        createdAt: Date
      });
      
      const Admin = mongoose.model('Admin', AdminSchema);
      
      // Tìm superadmin
      const superadmin = await Admin.findOne({ role: 'superadmin' });
      
      if (superadmin) {
        console.log('Thông tin superadmin:');
        console.log(`ID: ${superadmin._id}`);
        console.log(`Username: ${superadmin.username}`);
        console.log(`Email: ${superadmin.email}`);
        console.log(`Ngày tạo: ${superadmin.createdAt}`);
        
        console.log('\nSử dụng ID này trong file seedAutoReplies.js');
        console.log(`const SUPERADMIN_ID = process.env.SUPERADMIN_ID || '${superadmin._id}';`);
      } else {
        console.log('Không tìm thấy superadmin trong cơ sở dữ liệu');
      }
    } catch (error) {
      console.error('Lỗi khi tìm superadmin:', error);
    } finally {
      mongoose.disconnect();
      console.log('Đã ngắt kết nối MongoDB');
    }
  })
  .catch(err => {
    console.error('Lỗi kết nối MongoDB:', err);
  }); 