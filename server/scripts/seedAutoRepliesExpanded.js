/**
 * Script để nhập các câu trả lời tự động mở rộng vào cơ sở dữ liệu
 * Sử dụng: node seedAutoRepliesExpanded.js
 */

const mongoose = require('mongoose');
const AutoReply = require('../models/AutoReply');
const defaultReplies = require('../data/defaultReplies');
const expandedReplies = require('../data/expandedReplies');
const config = require('../config');

// ID của superadmin - cần thay đổi theo hệ thống thực tế
// Chú ý: Nếu không biết chính xác ID superadmin, hãy sử dụng script findSuperAdmin.js để lấy ID
const SUPERADMIN_ID = process.env.SUPERADMIN_ID || '680de9e1833ed1486a5eb3dc';

// Kết nối MongoDB
mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('Đã kết nối MongoDB'))
  .catch(err => {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });

// Kết hợp cả hai tập câu trả lời
const allReplies = [...defaultReplies, ...expandedReplies];

// Loại bỏ các câu trùng lặp (dựa trên từ khóa)
const uniqueReplies = [];
const keywordSet = new Set();

allReplies.forEach(reply => {
  const normalizedKeyword = reply.keyword.toLowerCase().trim();
  if (!keywordSet.has(normalizedKeyword)) {
    keywordSet.add(normalizedKeyword);
    uniqueReplies.push(reply);
  }
});

// Hàm nhập dữ liệu
async function seedExpandedAutoReplies() {
  try {
    // Đếm số lượng câu trả lời hiện có
    const count = await AutoReply.countDocuments();
    console.log(`Hiện có ${count} câu trả lời tự động trong cơ sở dữ liệu`);
    
    // Nếu đã có dữ liệu, hỏi người dùng có muốn tiếp tục không
    if (count > 0) {
      console.log('CẢNH BÁO: Tiếp tục sẽ thêm các câu trả lời mới vào cơ sở dữ liệu.');
      console.log('Các câu trả lời trùng lặp (cùng từ khóa) sẽ bị bỏ qua.');
      console.log('Nhấn Ctrl+C để hủy, hoặc đợi 5 giây để tiếp tục...');
      
      // Đợi 5 giây
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Bắt đầu nhập dữ liệu
    console.log(`Bắt đầu nhập ${uniqueReplies.length} câu trả lời tự động...`);
    
    let created = 0;
    let skipped = 0;
    
    for (const reply of uniqueReplies) {
      // Kiểm tra xem từ khóa đã tồn tại chưa
      const exists = await AutoReply.findOne({ keyword: reply.keyword.toLowerCase() });
      
      if (exists) {
        skipped++;
        continue;
      }
      
      // Tạo câu trả lời mới
      const newReply = new AutoReply({
        keyword: reply.keyword.toLowerCase(),
        response: reply.response,
        category: reply.category || 'general',
        priority: reply.priority || 0,
        isActive: true,
        createdBy: SUPERADMIN_ID
      });
      
      await newReply.save();
      created++;
      
      // In tiến độ sau mỗi 100 câu
      if (created % 100 === 0) {
        console.log(`Đã thêm ${created} câu trả lời...`);
      }
    }
    
    console.log(`Hoàn tất! Đã thêm ${created} câu trả lời mới, bỏ qua ${skipped} câu trùng lặp.`);
    
    // Thống kê theo danh mục
    const categories = await AutoReply.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nThống kê theo danh mục:');
    categories.forEach(cat => {
      console.log(`- ${cat._id}: ${cat.count} câu trả lời`);
    });
    
  } catch (error) {
    console.error('Lỗi khi nhập dữ liệu:', error);
  } finally {
    mongoose.disconnect();
    console.log('Đã ngắt kết nối MongoDB');
  }
}

// Chạy hàm nhập dữ liệu
seedExpandedAutoReplies(); 