/**
 * File xử lý gửi email thông báo tự động
 */
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const Admin = require('../models/Admin');
const Team = require('../models/Team');
const { emailService } = require('../controllers/authController');

/**
 * Hàm xử lý gửi email thông báo
 * Được gọi định kỳ hoặc khi cần thiết
 */
async function processNotificationEmails() {
  try {
    // Tìm các thông báo có sendEmail=true và chưa được gửi (emailSent=false)
    const notifications = await Notification.find({
      sendEmail: true,
      emailSent: false,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('createdBy', 'name username');

    if (notifications.length === 0) {
      console.log('Không có thông báo cần gửi email');
      return;
    }

    console.log(`Tìm thấy ${notifications.length} thông báo cần gửi email`);

    // Xử lý từng thông báo
    for (const notification of notifications) {
      try {
        const emails = await getTargetEmails(notification);
        
        if (emails.length === 0) {
          console.log(`Không có email nhận cho thông báo: ${notification.title}`);
          // Đánh dấu là đã gửi để không xử lý lại
          notification.emailSent = true;
          notification.emailSentAt = new Date();
          await notification.save();
          continue;
        }

        console.log(`Gửi thông báo "${notification.title}" đến ${emails.length} người dùng`);
        
        // Gửi email đến từng người dùng
        for (const email of emails) {
          try {
            await emailService.sendNotificationEmail(email, notification);
            console.log(`Đã gửi email thông báo đến: ${email}`);
          } catch (emailError) {
            console.error(`Lỗi khi gửi email đến ${email}:`, emailError);
          }
        }

        // Cập nhật trạng thái đã gửi
        notification.emailSent = true;
        notification.emailSentAt = new Date();
        await notification.save();
        
        console.log(`Đã gửi thông báo "${notification.title}" thành công`);
      } catch (notificationError) {
        console.error(`Lỗi xử lý thông báo ${notification._id}:`, notificationError);
      }
    }
  } catch (err) {
    console.error('Lỗi khi xử lý gửi email thông báo:', err);
  }
}

/**
 * Lấy danh sách email dựa trên targetUsers của thông báo
 */
async function getTargetEmails(notification) {
  let emails = [];

  switch (notification.targetUsers) {
    case 'all':
      // Lấy email của tất cả admin và đội chơi
      const allAdmins = await Admin.find({}, 'email');
      const allTeams = await Team.find({}, 'email');
      
      emails = [
        ...allAdmins.map(admin => admin.email),
        ...allTeams.map(team => team.email)
      ].filter(email => email); // Lọc bỏ các email null/undefined
      break;

    case 'admins':
      // Lấy email của tất cả admin
      const admins = await Admin.find({}, 'email');
      emails = admins.map(admin => admin.email).filter(email => email);
      break;

    case 'teams':
      // Lấy email của tất cả đội chơi
      const teams = await Team.find({}, 'email');
      emails = teams.map(team => team.email).filter(email => email);
      break;

    case 'specificAdmins':
      // Lấy email của các admin cụ thể
      if (notification.targetUsersList && notification.targetUsersList.length > 0) {
        const specificAdmins = await Admin.find({
          _id: { $in: notification.targetUsersList }
        }, 'email');
        emails = specificAdmins.map(admin => admin.email).filter(email => email);
      }
      break;

    case 'specificTeams':
      // Lấy email của các đội chơi cụ thể
      if (notification.targetUsersList && notification.targetUsersList.length > 0) {
        const specificTeams = await Team.find({
          _id: { $in: notification.targetUsersList }
        }, 'email');
        emails = specificTeams.map(team => team.email).filter(email => email);
      }
      break;

    default:
      break;
  }

  // Lọc bỏ email trùng lặp
  return [...new Set(emails)];
}

module.exports = {
  processNotificationEmails
}; 