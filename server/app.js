require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const app = express();
const settingsRouter = require('./routes/settings');
const adminAuth = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const autoReplyRoutes = require('./routes/autoReply');

// Kết nối MongoDB
connectDB();

// Middleware để xử lý CORS
app.use(cors());

// Tăng giới hạn kích thước request
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
app.use(express.raw({ limit: '200mb' }));
app.use(express.text({ limit: '200mb' }));

// Middleware để log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Cấu hình routes
app.use('/api/auth', adminAuth);
app.use('/api/teams', require('./routes/teams'));
app.use('/api/stations', require('./routes/stations'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/settings', settingsRouter);
app.use('/api/superadmin', require('./routes/superadmin'));
app.use('/api/secret-messages', require('./routes/secretMessageRoutes'));
app.use('/api/chat', chatRoutes);
app.use('/api/auto-reply', autoReplyRoutes);
app.use('/forms', require('./routes/formRoutes'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API hoạt động!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Có lỗi xảy ra từ server!' });
});

const PORT = process.env.PORT || 5000;
const http = require('http');
const server = http.createServer({
  maxHeaderSize: 16384, // 16KB
  headersTimeout: 60000, // 60 seconds
  keepAliveTimeout: 72000, // 72 seconds
}, app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server đang chạy trên port ${PORT}`);
  console.log(`Đường dẫn API: http://localhost:${PORT}/api`);
}); 