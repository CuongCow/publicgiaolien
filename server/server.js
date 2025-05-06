const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const qrcode = require('qrcode');
const config = require('./config');
const path = require('path');
const { processNotificationEmails } = require('./jobs/notificationEmailJob');
const fs = require('fs');

// Import models cần thiết
const Admin = require('./models/Admin');
const ChatMessage = require('./models/ChatMessage');

const app = express();
const PORT = process.env.PORT || config.PORT || 5000;

// Cấu hình CORS an toàn hơn
const allowedOrigins = [
  'https://www.giaolien.com', 
  'http://localhost:3000',
  'https://giaolien.vercel.app',
  'https://giaolien-fullstack.vercel.app',
  'https://giaolien-git-master-cuongcows-projects.vercel.app',
  'https://giaolien-9i2hk3zou-cuongcows-projects.vercel.app'
];

// Middleware CORS tùy chỉnh cho route đăng nhập
app.options('/api/auth/login', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-auth-token, Authorization');
  res.status(200).send();
});

// Middleware CORS tùy chỉnh cho route đăng nhập
app.post('/api/auth/login', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-auth-token, Authorization');
  next();
});

app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS Origin:', origin);
    
    // Cho phép tất cả các request trong môi trường production từ Vercel
    if (process.env.VERCEL || !origin) {
      return callback(null, true);
    }
    
    // Cho phép request từ origin trong danh sách
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('Origin rejected by CORS:', origin);
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
  credentials: true
}));
app.options('*', cors()); // Đảm bảo trả về 200 cho preflight
app.use(express.json());

// Phục vụ các file tĩnh từ thư mục uploads
// Sử dụng tmp folder cho uploads trên Vercel (stateless)
const uploadsPath = process.env.VERCEL 
  ? '/tmp/uploads' 
  : path.join(__dirname, 'uploads');

// Đảm bảo thư mục uploads tồn tại
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/api/uploads', express.static(uploadsPath));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || config.MONGODB_URI;
console.log('Connecting to MongoDB with URI:', MONGODB_URI.replace(/\/\/(.*)@/, '//***:***@')); // Ẩn thông tin nhạy cảm

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB Connected Successfully...');
    
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

// Middleware để log ra tất cả các request tới server
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Import Routes
const authRoutes = require('./routes/auth');
const stationRoutes = require('./routes/stations');
const teamRoutes = require('./routes/teams');
const submissionRoutes = require('./routes/submissions');
const settingsRoutes = require('./routes/settings');
const superAdminRoutes = require('./routes/superadmin');
const secretMessageRoutes = require('./routes/secretMessageRoutes');
const chatRoutes = require('./routes/chat');
const apiTestRoutes = require('./api-test');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/secret-messages', secretMessageRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/test', apiTestRoutes);

// API kiểm tra trạng thái
app.get('/api/status', (req, res) => {
  console.log('API Status endpoint was called');
  res.status(200).json({ 
    status: 'Server đang hoạt động', 
    environment: process.env.NODE_ENV, 
    vercel: process.env.VERCEL ? 'true' : 'false',
    time: new Date().toISOString(),
    host: req.get('host'),
    url: req.originalUrl,
    headers: req.headers
  });
});

// Endpoint API gốc
app.get('/api', (req, res) => {
  console.log('Root API endpoint was called');
  res.status(200).json({
    message: 'Giao Lien API',
    status: 'running',
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL ? 'true' : 'false',
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

// Thiết lập HTTP server và Socket.IO - thay thế cho app.listen
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  path: '/socket.io'
});

// Lưu trữ thông tin người dùng trực tuyến
const onlineUsers = new Map(); // userId -> socketId
const userRoles = new Map(); // socketId -> role (admin hoặc superadmin)

// Services
const AIService = require('./services/aiService');

// Xử lý kết nối socket
io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);
  
  // Quản lý đăng nhập người dùng
  socket.on('user_login', (data) => {
    const { userId, username, role } = data;
    
    // Lưu thông tin người dùng
    onlineUsers.set(userId, socket.id);
    userRoles.set(socket.id, { role, userId, username });
    
    // Thông báo cho tất cả mọi người về trạng thái online
    io.emit('user_status_change', {
      userId,
      username,
      role,
      status: 'online'
    });
    
    // Gửi danh sách người dùng đang online cho người dùng mới kết nối
    const onlineUsersList = [];
    userRoles.forEach((user, socketId) => {
      onlineUsersList.push({
        userId: user.userId,
        username: user.username,
        role: user.role,
        status: 'online'
      });
    });
    
    socket.emit('online_users', onlineUsersList);
  });
  
  // Xử lý tin nhắn
  socket.on('send_message', async (data) => {
    try {
      const { to, message, timestamp } = data;
      const sender = userRoles.get(socket.id);
      
      if (sender) {
        // Kiểm tra xem người nhận có online không
        const recipientSocketId = onlineUsers.get(to);
        
        if (recipientSocketId) {
          // Gửi tin nhắn cho người nhận
          io.to(recipientSocketId).emit('receive_message', {
            from: sender.userId,
            fromUsername: sender.username,
            fromRole: sender.role,
            message,
            timestamp
          });
        } else {
          // Người nhận không online - xử lý tin nhắn tự động nếu người nhận là superadmin
          console.log('Người nhận không online, kiểm tra vai trò để trả lời tự động');
          
          try {
            const recipient = await Admin.findById(to);
            console.log('Thông tin người nhận:', recipient ? { id: recipient._id, role: recipient.role, username: recipient.username } : 'Không tìm thấy');
            
            if (recipient && recipient.role === 'superadmin') {
              console.log('Người nhận là superadmin, xử lý tin nhắn tự động');
              // Chỉ xử lý tin nhắn tự động nếu người nhận là superadmin và không online
              const autoResponse = await AIService.processMessage(message, sender.userId);
              console.log('Kết quả trả lời tự động:', autoResponse);
              
              if (autoResponse) {
                // Lưu tin nhắn tự động vào database
                console.log('Lưu tin nhắn tự động vào database');
                const autoReplyMessage = new ChatMessage({
                  sender: to, // Superadmin là người gửi tin nhắn trả lời
                  recipient: sender.userId,
                  message: autoResponse.response,
                  isAutoReply: true,
                  autoReplySource: autoResponse.source
                });
                
                await autoReplyMessage.save();
                console.log('Đã lưu tin nhắn tự động, ID:', autoReplyMessage._id);
                
                // Gửi tin nhắn tự động về cho người gửi ban đầu
                console.log('Gửi tin nhắn tự động về cho người gửi, socketId:', socket.id);
                io.to(socket.id).emit('receive_message', {
                  from: to,
                  fromUsername: recipient.username,
                  message: autoResponse.response,
                  timestamp: new Date().toISOString(),
                  isAutoReply: true
                });
              } else {
                console.log('Không tìm thấy câu trả lời tự động phù hợp');
              }
            } else {
              console.log('Người nhận không phải superadmin, không xử lý tin nhắn tự động');
            }
          } catch (recipientError) {
            console.error('Lỗi khi tìm thông tin người nhận:', recipientError);
          }
        }
        
        // Gửi xác nhận lại cho người gửi
        socket.emit('message_sent', {
          to,
          message,
          timestamp
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });
  
  // Xử lý người dùng đăng xuất hoặc ngắt kết nối
  socket.on('disconnect', () => {
    const user = userRoles.get(socket.id);
    
    if (user) {
      onlineUsers.delete(user.userId);
      userRoles.delete(socket.id);
      
      // Thông báo cho tất cả mọi người về trạng thái offline
      io.emit('user_status_change', {
        userId: user.userId,
        username: user.username,
        status: 'offline'
      });
    }
    
    console.log('User disconnected:', socket.id);
  });
});

// Thiết lập HTTP server và Socket.IO - thay thế cho app.listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error('Lỗi server:', err);
  res.status(500).json({
    message: 'Đã xảy ra lỗi server',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Xử lý route không tồn tại
app.use((req, res) => {
  console.log(`Route không tồn tại: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: 'Endpoint không tồn tại',
    path: req.originalUrl,
    method: req.method
  });
}); 