const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const qrcode = require('qrcode');
const config = require('./config');
const path = require('path');
const { processNotificationEmails } = require('./jobs/notificationEmailJob');

// Import models cần thiết
const Admin = require('./models/Admin');
const ChatMessage = require('./models/ChatMessage');

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
const secretMessageRoutes = require('./routes/secretMessageRoutes');
const chatRoutes = require('./routes/chat');
const formRoutes = require('./routes/formRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/secret-messages', secretMessageRoutes);
app.use('/api/chat', chatRoutes);
app.use('/forms', formRoutes);

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
      '/api/status',
      '/forms'
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
  }
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
  console.log(`Server đang chạy trên cổng ${PORT}`);
}); 