const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Thêm trường để đánh dấu tin nhắn tự động
  isAutoReply: {
    type: Boolean,
    default: false
  },
  // Nguồn của tin nhắn tự động (database hoặc ai)
  autoReplySource: {
    type: String,
    enum: ['database', 'ai', null],
    default: null
  }
});

// Index để tìm kiếm nhanh các tin nhắn giữa 2 người dùng
ChatMessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

module.exports = ChatMessage; 