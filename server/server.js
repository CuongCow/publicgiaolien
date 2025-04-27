const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const qrcode = require('qrcode');
const config = require('./config');
const path = require('path');

const app = express();
const PORT = process.env.PORT || config.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Cho phép tất cả các origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));
app.use(express.json());

// Phục vụ các file tĩnh từ thư mục uploads
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://cuongdn:v446gy9nDmuyKsqg@cluster0.frhl2tm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  socketTimeoutMS: 45000,       // Close sockets after 45 seconds of inactivity
  family: 4                    // Use IPv4, skip trying IPv6
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Import Routes
const authRoutes = require('./routes/auth');
const stationRoutes = require('./routes/stations');
const teamRoutes = require('./routes/teams');
const submissionRoutes = require('./routes/submissions');
const settingsRoutes = require('./routes/settings');
const invitationRoutes = require('./routes/invitations');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/invitations', invitationRoutes);

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

// Middleware xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  
  // Kiểm tra lỗi kết nối MongoDB
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    return res.status(503).json({
      message: 'Không thể kết nối đến cơ sở dữ liệu. Vui lòng thử lại sau.'
    });
  }
  
  // Trả về lỗi chung
  res.status(err.status || 500).json({
    message: err.message || 'Có lỗi xảy ra ở máy chủ, vui lòng thử lại sau.'
  });
});

// Xử lý route không tồn tại
app.use((req, res) => {
  res.status(404).json({ message: 'Không tìm thấy endpoint' });
});

// Start server - lắng nghe trên tất cả các địa chỉ IP
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
}); 