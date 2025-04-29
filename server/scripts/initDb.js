require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('../models/Settings');

const initDatabase = async () => {
  try {
    const MONGO_URI = 'mongodb+srv://cuongdn:v446gy9nDmuyKsqg@cluster0.frhl2tm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    // Thêm các options để tránh warning
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(MONGO_URI, options);
    console.log('Đã kết nối MongoDB thành công');
    
    // Tạo cài đặt mặc định nếu chưa tồn tại
    const settings = await Settings.findOneAndUpdate(
      {}, 
      { language: 'vi' },
      { upsert: true, new: true }
    );
    
    console.log('Đã khởi tạo cài đặt mặc định:', settings);
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khởi tạo:', error);
    process.exit(1);
  }
};

initDatabase(); 