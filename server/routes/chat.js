const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const { auth } = require('../middleware/auth');

// @route   GET api/chat/messages/:recipientId
// @desc    Lấy tin nhắn giữa người dùng hiện tại và một người dùng khác
// @access  Private
router.get('/messages/:recipientId', auth, async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      $or: [
        { sender: req.admin.id, recipient: req.params.recipientId },
        { sender: req.params.recipientId, recipient: req.admin.id }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'username role name')
    .populate('recipient', 'username role name');
    
    res.json(messages);
  } catch (err) {
    console.error('Error fetching chat messages:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   GET api/chat/unread
// @desc    Lấy số lượng tin nhắn chưa đọc
// @access  Private
router.get('/unread', auth, async (req, res) => {
  try {
    const unreadCount = await ChatMessage.countDocuments({
      recipient: req.admin.id,
      read: false
    });
    
    res.json({ unreadCount });
  } catch (err) {
    console.error('Error counting unread messages:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   PUT api/chat/read/:senderId
// @desc    Đánh dấu tất cả tin nhắn từ một người dùng là đã đọc
// @access  Private
router.put('/read/:senderId', auth, async (req, res) => {
  try {
    await ChatMessage.updateMany(
      { sender: req.params.senderId, recipient: req.admin.id, read: false },
      { $set: { read: true } }
    );
    
    res.json({ message: 'Đã đánh dấu tin nhắn là đã đọc' });
  } catch (err) {
    console.error('Error marking messages as read:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   POST api/chat/message
// @desc    Gửi tin nhắn mới (lưu trữ trong DB)
// @access  Private
router.post('/message', auth, async (req, res) => {
  const { recipient, message } = req.body;
  
  if (!recipient || !message) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }
  
  try {
    const newMessage = new ChatMessage({
      sender: req.admin.id,
      recipient,
      message
    });
    
    const savedMessage = await newMessage.save();
    
    // Populate thông tin người gửi và người nhận
    const populatedMessage = await ChatMessage.findById(savedMessage._id)
      .populate('sender', 'username role name')
      .populate('recipient', 'username role name');
    
    res.json(populatedMessage);
  } catch (err) {
    console.error('Error sending message:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   GET api/chat/contacts
// @desc    Lấy danh sách người dùng đã từng chat với người dùng hiện tại
// @access  Private
router.get('/contacts', auth, async (req, res) => {
  try {
    // Tìm tất cả các tin nhắn mà người dùng hiện tại đã tham gia
    const messages = await ChatMessage.find({
      $or: [
        { sender: req.admin.id },
        { recipient: req.admin.id }
      ]
    })
    .populate('sender', 'username role name')
    .populate('recipient', 'username role name');
    
    // Lấy danh sách các ID người dùng duy nhất (không bao gồm người dùng hiện tại)
    const contactIds = new Set();
    
    messages.forEach(message => {
      if (message.sender._id.toString() !== req.admin.id) {
        contactIds.add(message.sender._id.toString());
      }
      if (message.recipient._id.toString() !== req.admin.id) {
        contactIds.add(message.recipient._id.toString());
      }
    });
    
    // Lấy thông tin chi tiết của các người dùng
    const contacts = [];
    
    messages.forEach(message => {
      const contact = message.sender._id.toString() === req.admin.id 
        ? message.recipient 
        : message.sender;
      
      const contactId = contact._id.toString();
      
      // Kiểm tra xem người dùng đã được thêm vào danh sách chưa
      const existingContact = contacts.find(c => c._id.toString() === contactId);
      
      if (!existingContact && contactId !== req.admin.id) {
        contacts.push({
          _id: contact._id,
          username: contact.username,
          role: contact.role,
          name: contact.name,
          lastMessage: message.message,
          lastMessageTime: message.createdAt
        });
      }
    });
    
    // Sắp xếp theo thời gian tin nhắn gần nhất
    contacts.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    
    res.json(contacts);
  } catch (err) {
    console.error('Error fetching chat contacts:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router; 