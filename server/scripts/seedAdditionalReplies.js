/**
 * Script để nhập các câu trả lời tự động bổ sung vào cơ sở dữ liệu
 * Nhập dữ liệu từ các file additionalReplies.js, additionalReplies3.js, additionalReplies4.js, additionalReplies5.js, additionalReplies6.js
 * Sử dụng: node seedAdditionalReplies.js
 */

const mongoose = require('mongoose');
const AutoReply = require('../models/AutoReply');
const additionalReplies = require('../data/additionalReplies');
const additionalReplies3 = require('../data/additionalReplies3');
const additionalReplies4 = require('../data/additionalReplies4');
const additionalReplies5 = require('../data/additionalReplies5');
const additionalReplies6 = require('../data/additionalReplies6');
const config = require('../config');

// ID của superadmin - cần thay đổi theo hệ thống thực tế
// Chú ý: Nếu không biết chính xác ID superadmin, hãy sử dụng script findSuperAdmin.js để lấy ID
const SUPERADMIN_ID = process.env.SUPERADMIN_ID || '680de9e1833ed1486a5eb3dc';

// Kết nối MongoDB
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Đã kết nối MongoDB'))
.catch(err => {
  console.error('Lỗi kết nối MongoDB:', err);
  process.exit(1);
});

// Hàm nhập dữ liệu
async function seedAdditionalReplies() {
  try {
    // Đếm số lượng câu trả lời hiện có
    const count = await AutoReply.countDocuments();
    console.log(`Hiện có ${count} câu trả lời tự động trong cơ sở dữ liệu`);
    
    // Nếu đã có dữ liệu, hỏi người dùng có muốn tiếp tục không
    if (count > 0) {
      console.log('CẢNH BÁO: Tiếp tục sẽ thêm các câu trả lời bổ sung vào cơ sở dữ liệu.');
      console.log('Các câu trả lời trùng lặp (cùng từ khóa) sẽ bị bỏ qua.');
      console.log('Nhấn Ctrl+C để hủy, hoặc đợi 5 giây để tiếp tục...');
      
      // Đợi 5 giây
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Bắt đầu nhập dữ liệu
    console.log('Bắt đầu nhập dữ liệu bổ sung...');
    
    // Tổng hợp tất cả các câu trả lời từ các file
    const allReplies = [
      ...additionalReplies,
      ...additionalReplies3,
      ...additionalReplies4,
      ...additionalReplies5,
      ...additionalReplies6
    ];
    
    console.log(`Tổng số câu trả lời bổ sung: ${allReplies.length}`);
    
    let created = 0;
    let skipped = 0;
    
    for (const reply of allReplies) {
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
    
    // Thống kê theo file nguồn
    console.log('\nThống kê theo file nguồn:');
    console.log(`- additionalReplies.js: ${additionalReplies.length} câu trả lời`);
    console.log(`- additionalReplies3.js: ${additionalReplies3.length} câu trả lời`);
    console.log(`- additionalReplies4.js: ${additionalReplies4.length} câu trả lời`);
    console.log(`- additionalReplies5.js: ${additionalReplies5.length} câu trả lời`);
    console.log(`- additionalReplies6.js: ${additionalReplies6.length} câu trả lời`);
    console.log(`- Tổng cộng: ${allReplies.length} câu trả lời`);
    
  } catch (error) {
    console.error('Lỗi khi nhập dữ liệu:', error);
  } finally {
    mongoose.disconnect();
    console.log('Đã ngắt kết nối MongoDB');
  }
}

// Chạy hàm nhập dữ liệu
seedAdditionalReplies(); 