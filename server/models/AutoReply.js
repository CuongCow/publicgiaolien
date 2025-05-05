const mongoose = require('mongoose');

const AutoReplySchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  response: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    trim: true,
    default: 'general'
  },
  priority: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Cập nhật thời gian chỉnh sửa
AutoReplySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Phương thức tìm câu trả lời phù hợp nhất với từ khóa
AutoReplySchema.statics.findBestMatch = async function(message) {
  // Chuyển đổi tin nhắn thành chữ thường để dễ so sánh
  const normalizedMessage = message.toLowerCase();
  console.log(`AutoReply.findBestMatch: Tìm từ khóa phù hợp cho '${normalizedMessage}'`);
  
  // Tìm tất cả từ khóa active
  const autoReplies = await this.find({ isActive: true }).sort({ priority: -1 });
  console.log(`AutoReply.findBestMatch: Đã tìm thấy ${autoReplies.length} từ khóa active`);
  
  // Kiểm tra xem tin nhắn có chứa từ khóa nào không
  console.log('AutoReply.findBestMatch: Kiểm tra từ khóa chính xác');
  for (const reply of autoReplies) {
    // Kiểm tra từ khóa chính xác
    if (normalizedMessage === reply.keyword) {
      console.log(`AutoReply.findBestMatch: Tìm thấy từ khóa chính xác '${reply.keyword}'`);
      return reply;
    }
  }
  
  // Kiểm tra xem tin nhắn có chứa từ khóa nào không
  console.log('AutoReply.findBestMatch: Kiểm tra từ khóa bao gồm');
  for (const reply of autoReplies) {
    // Kiểm tra nếu tin nhắn chứa từ khóa
    if (normalizedMessage.includes(reply.keyword)) {
      console.log(`AutoReply.findBestMatch: Tìm thấy từ khóa bao gồm '${reply.keyword}'`);
      return reply;
    }
  }
  
  console.log('AutoReply.findBestMatch: Không tìm thấy từ khóa phù hợp');
  // Không tìm thấy từ khóa phù hợp
  return null;
};

const AutoReply = mongoose.model('AutoReply', AutoReplySchema);

module.exports = AutoReply; 