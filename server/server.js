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
const MONGODB_URI = process.env.MONGODB_URI || config.MONGODB_URI;
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Import Routes
const authRoutes = require('./routes/auth');
const stationRoutes = require('./routes/stations');
const teamRoutes = require('./routes/teams');
const submissionRoutes = require('./routes/submissions');
const settingsRoutes = require('./routes/settings');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/settings', settingsRoutes);

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