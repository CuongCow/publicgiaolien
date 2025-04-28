const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const qrcode = require('qrcode');
const config = require('./config');
const path = require('path');
const { processNotificationEmails } = require('./jobs/notificationEmailJob');

const app = express();
const PORT = process.env.PORT || config.PORT || 5000;

// Cấu hình CORS an toàn hơn
const allowedOrigins = ['https://www.giaolien.com', 'http://localhost:3000'];
app.use(cors({
  origin: function(origin, callback) {
    // Cho phép request không có origin (như từ Postman) hoặc nằm trong danh sách
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token'],
  credentials: true
}));
app.options('*', cors()); // Đảm bảo trả về 200 cho preflight
app.use(express.json());

// Phục vụ các file tĩnh từ thư mục uploads
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || config.MONGODB_URI;
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected...');
    
    // Lên lịch chạy công việc gửi email thông báo hàng giờ
    setInterval(async () => {
      console.log('Đang chạy job gửi email thông báo tự động...');
      try {
        await processNotificationEmails();
      } catch (err) {
        console.error('Lỗi khi chạy job gửi email thông báo:', err);
      }
    }, 60 * 60 * 1000); // 1 giờ
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import Routes
const authRoutes = require('./routes/auth');
const stationRoutes = require('./routes/stations');
const teamRoutes = require('./routes/teams');
const submissionRoutes = require('./routes/submissions');
const settingsRoutes = require('./routes/settings');
const superAdminRoutes = require('./routes/superadmin');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/superadmin', superAdminRoutes);

// API kiểm tra trạng thái
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server đang hoạt động' });
});

// Đối với production, trả về trang chủ API
app.get('/', (req, res) => {
  res.json({
    message: 'Giao Lien API',
    status: 'running',
    endpoints: [
      '/api/auth',
      '/api/stations',
      '/api/teams',
      '/api/submissions',
      '/api/settings',
      '/api/status'
    ]
  });
});

// Start server - lắng nghe trên tất cả các địa chỉ IP
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
}); 