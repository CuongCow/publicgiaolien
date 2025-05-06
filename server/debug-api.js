/**
 * Debug API endpoints - Chạy script này để kiểm tra API endpoints
 */
const axios = require('axios');
const mongoose = require('mongoose');
const config = require('./config');
const Admin = require('./models/Admin');

// Kết nối với MongoDB
mongoose
  .connect(config.MONGO_URI)
  .then(() => console.log('Kết nối MongoDB thành công'))
  .catch(err => {
    console.error('Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  });

// Biến lưu trữ token
let token = '';

// Hàm debug API
const debugAPI = async () => {
  try {
    // 1. Đăng nhập để lấy token
    console.log('\n[1] Đang đăng nhập để lấy token...');
    // Tìm admin đầu tiên trong database
    const admin = await Admin.findOne();
    
    if (!admin) {
      console.error('Không tìm thấy tài khoản admin nào trong database');
      process.exit(1);
    }
    
    console.log(`Tìm thấy admin: ${admin.email}`);
    
    // Đăng nhập
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: admin.email,
        password: 'admin' // Mật khẩu mặc định cho debug
      });
      
      token = loginResponse.data.token;
      console.log('Đăng nhập thành công, token:', token.substring(0, 20) + '...');
    } catch (err) {
      console.error('Lỗi đăng nhập:', err.response?.data || err.message);
      process.exit(1);
    }
    
    // 2. Gọi API statistics
    console.log('\n[2] Đang gọi API statistics...');
    try {
      const response = await axios.get('http://localhost:5000/api/secret-messages/statistics', {
        headers: {
          'x-auth-token': token
        }
      });
      
      console.log('Phản hồi API statistics:');
      console.log(JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error('Lỗi khi gọi API statistics:');
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
        console.error('Headers:', err.response.headers);
      } else if (err.request) {
        console.error('Không nhận được phản hồi từ server');
        console.error(err.request);
      } else {
        console.error('Lỗi:', err.message);
      }
    }
    
    console.log('\nHoàn tất debug API');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi không xác định:', err);
    process.exit(1);
  }
};

// Thực thi
debugAPI(); 