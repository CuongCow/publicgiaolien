const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { superAdminAuth } = require('../middleware/superAdminAuth');
const InvitationCode = require('../models/InvitationCode');
const Admin = require('../models/Admin');
const SystemLog = require('../models/SystemLog');
const SystemSettings = require('../models/SystemSettings');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Team = require('../models/Team');
const bcrypt = require('bcrypt');
const { processNotificationEmails } = require('../jobs/notificationEmailJob');
const path = require('path');
const fs = require('fs');

// Middleware để kiểm tra có phải Super Admin hay không
const checkSuperAdmin = [auth, superAdminAuth];

// ===== QUẢN LÝ ADMIN =====

// Lấy danh sách tất cả admin
router.get('/admins', checkSuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật thông tin admin
router.patch('/admins/:id', auth, superAdminAuth, async (req, res) => {
  try {
    const { username, name, email, role } = req.body;
    
    // Kiểm tra xem admin có tồn tại không
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Không tìm thấy admin' });
    }
    
    // Kiểm tra xem username hoặc email đã tồn tại chưa (nếu thay đổi)
    if (username && username !== admin.username) {
      const existingAdmin = await Admin.findOne({ username });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
      }
      admin.username = username;
    }
    
    if (email && email !== admin.email) {
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Email đã tồn tại' });
      }
      admin.email = email;
    }
    
    if (name) admin.name = name;
    if (role) admin.role = role;
    
    await admin.save();
    
    // Ghi nhật ký
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'update',
      target: 'admin',
      details: { adminId: admin._id },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({ message: 'Cập nhật thông tin admin thành công' });
  } catch (err) {
    console.error('Error updating admin:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Đặt lại mật khẩu cho admin
router.post('/admins/:id/reset-password', auth, superAdminAuth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }
    
    // Kiểm tra xem admin có tồn tại không
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Không tìm thấy admin' });
    }
    
    // Mã hóa mật khẩu mới sử dụng phương thức đồng bộ
    const salt = bcrypt.genSaltSync(10);
    admin.password = bcrypt.hashSync(newPassword, salt);
    
    // Tắt hàm pre save bằng cách không đánh dấu password đã được sửa đổi
    admin.$locals.skipPasswordHash = true;
    
    // Lưu admin
    await admin.save();
    
    // Ghi nhật ký
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'update',
      target: 'admin_password',
      details: { adminId: admin._id },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    console.error('Error resetting admin password:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa admin
router.delete('/admins/:id', auth, superAdminAuth, async (req, res) => {
  try {
    // Kiểm tra xem admin có tồn tại không
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Không tìm thấy admin' });
    }
    
    // Không cho phép xóa chính mình
    if (admin._id.toString() === req.admin.id) {
      return res.status(400).json({ message: 'Không thể xóa tài khoản của chính mình' });
    }
    
    // Không cho phép xóa Super Admin (nếu bạn muốn thêm logic này)
    if (admin.role === 'superadmin') {
      return res.status(400).json({ message: 'Không thể xóa tài khoản Super Admin' });
    }
    
    await Admin.findByIdAndDelete(req.params.id);
    
    // Ghi nhật ký
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'delete',
      target: 'admin',
      details: { adminId: admin._id },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({ message: 'Xóa admin thành công' });
  } catch (err) {
    console.error('Error deleting admin:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ===== QUẢN LÝ ĐỘI CHƠI =====

// Lấy tất cả đội chơi (cho Super Admin)
router.get('/teams', auth, superAdminAuth, async (req, res) => {
  try {
    // Tìm tất cả đội chơi từ tất cả admin
    const teams = await Team.find()
      .populate('adminId', 'username name email')
      .sort({ createdAt: -1 });
    
    // Xử lý dữ liệu để đảm bảo tính nhất quán
    const processedTeams = teams.map(team => {
      const teamObj = team.toObject();
      
      // Chuyển đổi trạng thái nếu cần
      teamObj.isActive = teamObj.status === 'active';
      
      // Đảm bảo createdBy cũng có (dành cho các component dùng createdBy thay vì adminId)
      if (teamObj.adminId && !teamObj.createdBy) {
        teamObj.createdBy = teamObj.adminId;
      }
      
      return teamObj;
    });
    
    // Nhóm đội theo admin
    const teamsByAdmin = [];
    const adminMap = {};
    
    processedTeams.forEach(team => {
      if (!team.adminId) return;
      
      const adminId = team.adminId._id.toString();
      
      if (!adminMap[adminId]) {
        adminMap[adminId] = {
          adminId: adminId,
          adminName: team.adminId.name || team.adminId.username || 'Không xác định',
          teams: [],
          totalTeams: 0,
          activeTeams: 0
        };
        teamsByAdmin.push(adminMap[adminId]);
      }
      
      adminMap[adminId].teams.push(team);
      adminMap[adminId].totalTeams++;
      if (team.isActive || team.status === 'active') {
        adminMap[adminId].activeTeams++;
      }
    });
    
    // Ghi log
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'other',
      target: 'teams',
      details: { count: teams.length },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({
      teams: processedTeams,
      teamsByAdmin
    });
  } catch (err) {
    console.error('Error getting teams:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ===== QUẢN LÝ MÃ MỜI =====

// Tạo mã mời mới
router.post('/invite-codes', auth, superAdminAuth, async (req, res) => {
  try {
    // Tạo mã ngẫu nhiên
    const randomCode = crypto.randomBytes(6).toString('hex').toUpperCase();
    const inviteCode = `GL-${randomCode}`;
    
    // Tính thời gian hết hạn (30 ngày từ hiện tại)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const newInviteCode = new InvitationCode({
      code: inviteCode,
      createdBy: req.admin.id,
      expiresAt: expiresAt
    });
    
    await newInviteCode.save();
    
    // Ghi nhật ký
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'create',
      target: 'inviteCode',
      details: { inviteCode },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json(newInviteCode);
  } catch (err) {
    console.error('Error creating invite code:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy danh sách mã mời
router.get('/invite-codes', auth, superAdminAuth, async (req, res) => {
  try {
    const inviteCodes = await InvitationCode.find()
      .populate('createdBy', 'username name')
      .populate('usedBy', 'username name')
      .sort({ createdAt: -1 });
    
    res.json(inviteCodes);
  } catch (err) {
    console.error('Error getting invite codes:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa mã mời
router.delete('/invite-codes/:id', auth, superAdminAuth, async (req, res) => {
  try {
    const inviteCode = await InvitationCode.findByIdAndDelete(req.params.id);
    if (!inviteCode) {
      return res.status(404).json({ message: 'Không tìm thấy mã mời' });
    }
    
    // Ghi nhật ký
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'delete',
      target: 'inviteCode',
      details: { inviteCode: inviteCode.code },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({ message: 'Đã xóa mã mời thành công' });
  } catch (err) {
    console.error('Error deleting invite code:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ===== QUẢN LÝ THÔNG BÁO =====

// Tạo thông báo mới
router.post('/notifications', auth, superAdminAuth, async (req, res) => {
  try {
    const { title, content, type, targetUsers, targetUsersList, expiresAt, sendEmail } = req.body;
    
    const notification = new Notification({
      title,
      content,
      type: type || 'info',
      targetUsers: targetUsers || 'all',
      createdBy: req.admin.id,
      expiresAt: expiresAt || undefined,
      sendEmail: sendEmail || false
    });
    
    // Nếu là thông báo cho các đối tượng cụ thể, lưu danh sách ID
    if (targetUsers === 'specificAdmins' || targetUsers === 'specificTeams') {
      notification.targetUsersList = Array.isArray(targetUsersList) ? targetUsersList : [];
    }
    
    await notification.save();
    
    // Ghi nhật ký
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'create',
      target: 'notification',
      details: { notificationId: notification._id, title, targetUsers, sendEmail },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json(notification);
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy danh sách thông báo
router.get('/notifications', auth, superAdminAuth, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('createdBy', 'username name')
      .populate('targetUsersList', 'username name')
      .sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (err) {
    console.error('Error getting notifications:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật thông báo
router.patch('/notifications/:id', auth, superAdminAuth, async (req, res) => {
  try {
    const { title, content, type, targetUsers, targetUsersList, isActive, expiresAt, sendEmail } = req.body;
    
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }
    
    if (title) notification.title = title;
    if (content) notification.content = content;
    if (type) notification.type = type;
    if (targetUsers) notification.targetUsers = targetUsers;
    if (isActive !== undefined) notification.isActive = isActive;
    if (expiresAt) notification.expiresAt = expiresAt;
    if (sendEmail !== undefined) notification.sendEmail = sendEmail;
    
    // Nếu thay đổi tùy chọn gửi email từ false thành true, đặt lại trạng thái emailSent
    if (sendEmail === true && !notification.emailSent) {
      notification.emailSent = false;
      notification.emailSentAt = undefined;
    }
    
    // Cập nhật danh sách đối tượng cụ thể nếu cần
    if ((targetUsers === 'specificAdmins' || targetUsers === 'specificTeams') && targetUsersList) {
      notification.targetUsersList = Array.isArray(targetUsersList) ? targetUsersList : [];
    } else if (targetUsers && targetUsers !== 'specificAdmins' && targetUsers !== 'specificTeams') {
      // Nếu là loại thông báo khác, xóa danh sách đối tượng cụ thể
      notification.targetUsersList = [];
    }
    
    await notification.save();
    
    // Ghi nhật ký
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'update',
      target: 'notification',
      details: { 
        notificationId: notification._id, 
        title: notification.title, 
        targetUsers: notification.targetUsers,
        sendEmail: notification.sendEmail 
      },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json(notification);
  } catch (err) {
    console.error('Error updating notification:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa thông báo
router.delete('/notifications/:id', auth, superAdminAuth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }
    
    // Ghi nhật ký
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'delete',
      target: 'notification',
      details: { notificationId: notification._id, title: notification.title },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({ message: 'Đã xóa thông báo thành công' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Kích hoạt gửi email thông báo thủ công
router.post('/notifications/send-emails', auth, superAdminAuth, async (req, res) => {
  try {
    // Gọi hàm xử lý gửi email
    await processNotificationEmails();
    
    // Ghi nhật ký
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'other',
      target: 'notification_emails',
      details: { triggeredBy: 'manual' },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({ message: 'Đã kích hoạt gửi email thông báo thành công' });
  } catch (err) {
    console.error('Error sending notification emails:', err);
    res.status(500).json({ message: 'Lỗi server khi gửi email thông báo' });
  }
});

// ===== QUẢN LÝ CÀI ĐẶT HỆ THỐNG =====

// Cập nhật cài đặt hệ thống
router.put('/settings', auth, superAdminAuth, async (req, res) => {
  try {
    const { databaseRetentionDays, securitySettings, notificationSettings } = req.body;
    
    let settings = await SystemSettings.findOne();
    
    if (!settings) {
      settings = new SystemSettings();
    }
    
    if (databaseRetentionDays) settings.databaseRetentionDays = databaseRetentionDays;
    
    if (securitySettings) {
      if (securitySettings.maxLoginAttempts !== undefined) {
        settings.securitySettings.maxLoginAttempts = securitySettings.maxLoginAttempts;
      }
      if (securitySettings.lockoutTimeMinutes !== undefined) {
        settings.securitySettings.lockoutTimeMinutes = securitySettings.lockoutTimeMinutes;
      }
      if (securitySettings.sessionTimeoutMinutes !== undefined) {
        settings.securitySettings.sessionTimeoutMinutes = securitySettings.sessionTimeoutMinutes;
      }
      if (securitySettings.requireStrongPasswords !== undefined) {
        settings.securitySettings.requireStrongPasswords = securitySettings.requireStrongPasswords;
      }
      if (securitySettings.blockedIPs !== undefined) {
        settings.securitySettings.blockedIPs = securitySettings.blockedIPs;
      }
    }
    
    if (notificationSettings) {
      if (notificationSettings.enableLoginAlerts !== undefined) {
        settings.notificationSettings.enableLoginAlerts = notificationSettings.enableLoginAlerts;
      }
      if (notificationSettings.enableSystemNotifications !== undefined) {
        settings.notificationSettings.enableSystemNotifications = notificationSettings.enableSystemNotifications;
      }
    }
    
    settings.lastUpdated = Date.now();
    
    await settings.save();
    
    // Ghi nhật ký
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'update',
      target: 'systemSettings',
      details: { settingsId: settings._id },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json(settings);
  } catch (err) {
    console.error('Error updating system settings:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// API để thêm IP vào danh sách chặn
router.post('/settings/blocked-ips', auth, superAdminAuth, async (req, res) => {
  try {
    const { ip } = req.body;
    
    if (!ip || !validateIPAddress(ip)) {
      return res.status(400).json({ message: 'Địa chỉ IP không hợp lệ' });
    }
    
    let settings = await SystemSettings.findOne();
    
    if (!settings) {
      settings = new SystemSettings();
    }
    
    // Kiểm tra xem IP đã tồn tại trong danh sách chưa
    if (settings.securitySettings.blockedIPs.includes(ip)) {
      return res.status(400).json({ message: 'Địa chỉ IP này đã có trong danh sách chặn' });
    }
    
    // Thêm IP vào danh sách
    settings.securitySettings.blockedIPs.push(ip);
    settings.lastUpdated = Date.now();
    await settings.save();
    
    // Ghi nhật ký
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'create',
      target: 'blockedIP',
      details: { ip },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({ 
      message: 'Đã thêm địa chỉ IP vào danh sách chặn', 
      blockedIPs: settings.securitySettings.blockedIPs 
    });
  } catch (err) {
    console.error('Error adding blocked IP:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// API để xóa IP khỏi danh sách chặn
router.delete('/settings/blocked-ips/:ip', auth, superAdminAuth, async (req, res) => {
  try {
    const { ip } = req.params;
    
    let settings = await SystemSettings.findOne();
    
    if (!settings || !settings.securitySettings.blockedIPs.includes(ip)) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ IP trong danh sách chặn' });
    }
    
    // Xóa IP khỏi danh sách
    settings.securitySettings.blockedIPs = settings.securitySettings.blockedIPs.filter(
      blockedIP => blockedIP !== ip
    );
    
    settings.lastUpdated = Date.now();
    await settings.save();
    
    // Ghi nhật ký
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'delete',
      target: 'blockedIP',
      details: { ip },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({ 
      message: 'Đã xóa địa chỉ IP khỏi danh sách chặn', 
      blockedIPs: settings.securitySettings.blockedIPs 
    });
  } catch (err) {
    console.error('Error removing blocked IP:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Hàm hỗ trợ xác thực định dạng IP
function validateIPAddress(ip) {
  // Regex cho IPv4
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  
  if (!ipv4Pattern.test(ip)) {
    return false;
  }
  
  const parts = ip.split('.');
  
  // Kiểm tra từng phần của địa chỉ IP
  for (const part of parts) {
    const num = parseInt(part, 10);
    if (num < 0 || num > 255) {
      return false;
    }
  }
  
  return true;
}

// Lấy cài đặt hệ thống
router.get('/settings', auth, superAdminAuth, async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    
    if (!settings) {
      settings = new SystemSettings();
      await settings.save();
    }
    
    res.json(settings);
  } catch (err) {
    console.error('Error getting system settings:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ===== QUẢN LÝ NHẬT KÝ HỆ THỐNG =====

// Lấy danh sách nhật ký
router.get('/logs', auth, superAdminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const logs = await SystemLog.find()
      .populate('adminId', 'username name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await SystemLog.countDocuments();
    
    res.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error getting system logs:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa nhật ký cũ (POST method)
router.post('/logs/cleanup', auth, superAdminAuth, async (req, res) => {
  try {
    const { olderThanDays } = req.body;
    
    if (!olderThanDays || olderThanDays < 1) {
      return res.status(400).json({ message: 'Vui lòng cung cấp số ngày hợp lệ' });
    }
    
    const date = new Date();
    date.setDate(date.getDate() - olderThanDays);
    
    console.log(`Xóa nhật ký cũ hơn ngày: ${date.toISOString()}`);
    
    // Tìm bản ghi cũ nhất trước khi xóa để debug
    const oldestLog = await SystemLog.findOne().sort({ createdAt: 1 });
    console.log(`Bản ghi cũ nhất: ${oldestLog ? oldestLog.createdAt.toISOString() : 'Không có'}`);
    
    // Đếm số bản ghi cần xóa để debug
    const countToDelete = await SystemLog.countDocuments({ createdAt: { $lt: date } });
    console.log(`Số bản ghi cần xóa: ${countToDelete}`);
    
    // Sử dụng deleteMany với mongoose
    const result = await SystemLog.deleteMany({ createdAt: { $lt: date } });
    
    // Kiểm tra nếu không xóa được bản ghi, thử xóa trực tiếp qua collection native
    if (result.deletedCount === 0 && countToDelete > 0) {
      console.log(`Thử xóa trực tiếp qua MongoDB driver`);
      const nativeResult = await mongoose.connection.db.collection('systemlogs').deleteMany({ 
        createdAt: { $lt: date } 
      });
      
      console.log(`Kết quả xóa native: ${JSON.stringify(nativeResult)}`);
      
      if (nativeResult.deletedCount > 0) {
        // Ghi nhật ký về việc xóa
        await SystemLog.create({
          adminId: req.admin.id,
          action: 'delete',
          target: 'systemLogs',
          details: { deletedCount: nativeResult.deletedCount, olderThanDays, method: 'native' },
          ipAddress: req.ip || req.connection.remoteAddress
        });
        
        return res.json({
          message: `Đã xóa ${nativeResult.deletedCount} bản ghi nhật ký cũ hơn ${olderThanDays} ngày`,
          deletedCount: nativeResult.deletedCount
        });
      }
    }
    
    // Ghi nhật ký về việc xóa
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'delete',
      target: 'systemLogs',
      details: { deletedCount: result.deletedCount, olderThanDays, logsToDelete: countToDelete },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({
      message: `Đã xóa ${result.deletedCount} bản ghi nhật ký cũ hơn ${olderThanDays} ngày`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error cleaning up system logs:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa nhật ký cũ (DELETE method)
router.delete('/logs/cleanup', auth, superAdminAuth, async (req, res) => {
  try {
    const { olderThanDays } = req.body;
    
    if (!olderThanDays || olderThanDays < 1) {
      return res.status(400).json({ message: 'Vui lòng cung cấp số ngày hợp lệ' });
    }
    
    const date = new Date();
    date.setDate(date.getDate() - olderThanDays);
    
    console.log(`Xóa nhật ký cũ hơn ngày: ${date.toISOString()}`);
    
    // Tìm bản ghi cũ nhất trước khi xóa để debug
    const oldestLog = await SystemLog.findOne().sort({ createdAt: 1 });
    console.log(`Bản ghi cũ nhất: ${oldestLog ? oldestLog.createdAt.toISOString() : 'Không có'}`);
    
    // Đếm số bản ghi cần xóa để debug
    const countToDelete = await SystemLog.countDocuments({ createdAt: { $lt: date } });
    console.log(`Số bản ghi cần xóa: ${countToDelete}`);
    
    // Sử dụng deleteMany với mongoose
    const result = await SystemLog.deleteMany({ createdAt: { $lt: date } });
    
    // Kiểm tra nếu không xóa được bản ghi, thử xóa trực tiếp qua collection native
    if (result.deletedCount === 0 && countToDelete > 0) {
      console.log(`Thử xóa trực tiếp qua MongoDB driver`);
      const nativeResult = await mongoose.connection.db.collection('systemlogs').deleteMany({ 
        createdAt: { $lt: date } 
      });
      
      console.log(`Kết quả xóa native: ${JSON.stringify(nativeResult)}`);
      
      if (nativeResult.deletedCount > 0) {
        // Ghi nhật ký về việc xóa
        await SystemLog.create({
          adminId: req.admin.id,
          action: 'delete',
          target: 'systemLogs',
          details: { deletedCount: nativeResult.deletedCount, olderThanDays, method: 'native' },
          ipAddress: req.ip || req.connection.remoteAddress
        });
        
        return res.json({
          message: `Đã xóa ${nativeResult.deletedCount} bản ghi nhật ký cũ hơn ${olderThanDays} ngày`,
          deletedCount: nativeResult.deletedCount
        });
      }
    }
    
    // Ghi nhật ký về việc xóa
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'delete',
      target: 'systemLogs',
      details: { deletedCount: result.deletedCount, olderThanDays, logsToDelete: countToDelete },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({
      message: `Đã xóa ${result.deletedCount} bản ghi nhật ký cũ hơn ${olderThanDays} ngày`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error cleaning up system logs:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ===== THỐNG KÊ DATABASE =====

// Lấy thông tin tổng quan về database
router.get('/database/stats', auth, superAdminAuth, async (req, res) => {
  try {
    // Lấy danh sách các collection
    const collectionList = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collectionList.map(c => c.name);
    
    const collections = {};
    
    // Lấy thông tin số lượng và kích thước của từng collection
    for (const collName of collectionNames) {
      try {
        const stats = await mongoose.connection.db.collection(collName).stats();
        collections[collName.toLowerCase()] = {
          count: stats.count || 0,
          sizeInBytes: stats.size || 0,
          storageSize: stats.storageSize || 0,
          indexSize: stats.totalIndexSize || 0
        };
      } catch (err) {
        console.error(`Error getting stats for collection ${collName}:`, err);
        collections[collName.toLowerCase()] = {
          count: 0, 
          sizeInBytes: 0,
          storageSize: 0,
          indexSize: 0,
          error: true
        };
      }
    }
    
    // Lấy kích thước database
    const stats = await mongoose.connection.db.stats();
    
    res.json({
      collections,
      databaseSize: {
        sizeInBytes: stats.dataSize,
        sizeInMB: (stats.dataSize / (1024 * 1024)).toFixed(2),
        storageSize: stats.storageSize,
        storageSizeInMB: (stats.storageSize / (1024 * 1024)).toFixed(2)
      },
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      indexSizeInMB: (stats.indexSize / (1024 * 1024)).toFixed(2)
    });
  } catch (err) {
    console.error('Error getting database stats:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy danh sách các bản sao lưu
router.get('/database/backups', auth, superAdminAuth, async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../backups');
    
    // Kiểm tra xem thư mục backup có tồn tại không
    if (!fs.existsSync(backupDir)) {
      return res.json({ backups: [] });
    }
    
    // Đọc danh sách các file trong thư mục backup
    const files = fs.readdirSync(backupDir);
    
    // Lọc ra chỉ lấy các file .json
    const backupFiles = files.filter(file => file.endsWith('.json'));
    
    // Lấy thông tin chi tiết về từng file backup
    const backups = backupFiles.map(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      
      // Đọc metadata từ file để lấy thông tin
      let metadata = {};
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        metadata = data.metadata || {};
      } catch (err) {
        console.error(`Error reading backup file ${file}:`, err);
      }
      
      return {
        fileName: file,
        size: stats.size,
        created: stats.mtime,
        collections: metadata.collections || {},
        version: metadata.version
      };
    });
    
    // Sắp xếp theo thời gian tạo giảm dần (mới nhất lên đầu)
    backups.sort((a, b) => new Date(b.created) - new Date(a.created));
    
    res.json({ backups });
  } catch (err) {
    console.error('Error listing database backups:', err);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách bản sao lưu' });
  }
});

// Tải xuống một bản sao lưu cụ thể
router.get('/database/backups/:filename', auth, superAdminAuth, async (req, res) => {
  try {
    const { filename } = req.params;
    const backupDir = path.join(__dirname, '../backups');
    const filePath = path.join(backupDir, filename);
    
    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Không tìm thấy file sao lưu' });
    }
    
    // Ghi nhật ký
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'download',
      target: 'database_backup',
      details: { fileName: filename },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    // Trả về file để tải xuống
    res.download(filePath);
  } catch (err) {
    console.error('Error downloading backup:', err);
    res.status(500).json({ message: 'Lỗi khi tải bản sao lưu' });
  }
});

// Xóa một bản sao lưu
router.delete('/database/backups/:filename', auth, superAdminAuth, async (req, res) => {
  try {
    const { filename } = req.params;
    const backupDir = path.join(__dirname, '../backups');
    const filePath = path.join(backupDir, filename);
    
    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Không tìm thấy file sao lưu' });
    }
    
    // Xóa file
    fs.unlinkSync(filePath);
    
    // Ghi nhật ký
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'delete',
      target: 'database_backup',
      details: { fileName: filename },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({ message: 'Đã xóa bản sao lưu thành công' });
  } catch (err) {
    console.error('Error deleting backup:', err);
    res.status(500).json({ message: 'Lỗi khi xóa bản sao lưu' });
  }
});

// Tạo bản sao lưu database
router.post('/database/backup', auth, superAdminAuth, async (req, res) => {
  try {
    // Xác định thời gian hiện tại để đặt tên file backup
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${dateStr}.json`;
    
    // Lấy dữ liệu từ các collection chính
    const admins = await Admin.find({}, { password: 0 }).lean(); // Loại bỏ mật khẩu
    const teams = await mongoose.connection.db.collection('teams').find({}).toArray();
    const stations = await mongoose.connection.db.collection('stations').find({}).toArray();
    const submissions = await mongoose.connection.db.collection('submissions').find({}).toArray();
    const systemSettings = await SystemSettings.find({}).lean();
    
    // Tạo đối tượng dữ liệu backup
    const backupData = {
      timestamp: now,
      metadata: {
        version: '1.0',
        createdBy: req.admin.id,
        collections: {
          admins: admins.length,
          teams: teams.length,
          stations: stations.length,
          submissions: submissions.length,
          systemSettings: systemSettings.length
        }
      },
      data: {
        admins,
        teams,
        stations,
        submissions,
        systemSettings
      }
    };
    
    // Tạo đường dẫn thư mục backup
    const backupDir = path.join(__dirname, '../backups');
    
    // Kiểm tra và tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Đường dẫn đầy đủ tới file backup
    const backupPath = path.join(backupDir, backupFileName);
    
    // Ghi dữ liệu vào file
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    // Ghi nhật ký
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'backup',
      target: 'database',
      details: { 
        fileName: backupFileName,
        fileSize: fs.statSync(backupPath).size,
        collections: backupData.metadata.collections
      },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({ 
      message: 'Sao lưu dữ liệu thành công',
      fileName: backupFileName,
      timestamp: now,
      collections: backupData.metadata.collections
    });
  } catch (err) {
    console.error('Error creating database backup:', err);
    res.status(500).json({ message: 'Lỗi khi tạo bản sao lưu dữ liệu' });
  }
});

// Lấy thông tin chi tiết về một collection cụ thể
router.get('/database/collections/:collectionName', auth, superAdminAuth, async (req, res) => {
  try {
    const { collectionName } = req.params;
    const limit = parseInt(req.query.limit) || 50;  // Tăng số documents tối đa trả về lên 50
    const page = parseInt(req.query.page) || 1;   // Thêm tham số page cho phân trang
    const skip = (page - 1) * limit;               // Tính toán vị trí bắt đầu
    const adminFilter = req.query.adminFilter || null; // Lọc theo adminId
    const idFilter = req.query.idFilter || null;       // Lọc theo _id
    
    // Định nghĩa các alias cho collection (để xử lý tên gọi khác nhau cho cùng một collection)
    const collectionAliases = {
      'invitecodes': 'invitationcodes',
      'invitationcode': 'invitationcodes',
      'invitecode': 'invitationcodes',
      'systemlog': 'systemlogs',
      'systemslog': 'systemlogs',
      'systemlogs': 'systemlogs',
      'loginhistory': 'loginhistories',
      'secretmessage': 'secretmessages',
      'secretmessageresponse': 'secretmessageresponses'
    };
    
    // Kiểm tra nếu tên collection có alias
    const normalizedName = collectionName.toLowerCase();
    const aliasedName = collectionAliases[normalizedName] || normalizedName;
    
    // Kiểm tra collection có tồn tại không
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(coll => coll.name.toLowerCase());
    
    // Tìm tên collection chính xác (không phân biệt hoa thường) 
    // Ưu tiên tìm tên gốc, nếu không có thì tìm tên alias
    const normalizedCollectionName = normalizedName;
    const normalizedAliasedName = aliasedName;
    
    let collectionExists = collectionNames.includes(normalizedCollectionName);
    let exactCollectionName;
    
    if (collectionExists) {
      // Nếu tên gốc tồn tại, sử dụng tên gốc
      exactCollectionName = collections.find(
        coll => coll.name.toLowerCase() === normalizedCollectionName
      )?.name || collectionName;
    } else if (collectionNames.includes(normalizedAliasedName)) {
      // Nếu tên gốc không tồn tại nhưng tên alias tồn tại, sử dụng tên alias
      collectionExists = true;
      exactCollectionName = collections.find(
        coll => coll.name.toLowerCase() === normalizedAliasedName
      )?.name || aliasedName;
    } else {
      // Không tìm thấy cả tên gốc và tên alias
      collectionExists = false;
    }
    
    // Nếu collection không tồn tại, trả về thông tin rỗng nhưng không báo lỗi
    if (!collectionExists) {
      console.log(`Collection không tồn tại: ${collectionName} (kiểm tra cả alias: ${aliasedName})`);
      return res.json({
        name: collectionName,
        count: 0,
        sizeInBytes: 0,
        sizeInMB: 0,
        storageSize: 0,
        storageSizeInMB: 0,
        nindexes: 0,
        indexSize: 0,
        indexSizeInMB: 0,
        latestDocument: null,
        indexDetails: [],
        documents: [],
        exists: false,
        error: true,
        errorMessage: err.message,
        suggestedCollection: collectionNames.length > 0 ? findSimilarCollection(normalizedName, collectionNames) : null
      });
    }
    
    // Lấy thông tin chi tiết của collection
    const stats = await mongoose.connection.db.collection(exactCollectionName).stats();
    
    // Lấy danh sách indexes
    const indexes = await mongoose.connection.db.collection(exactCollectionName).indexes();
    
    // Lấy document mới nhất (nếu có)
    const latestDocument = await mongoose.connection.db.collection(exactCollectionName)
      .find({})
      .sort({ _id: -1 })
      .limit(1)
      .toArray();
    
    // Tạo query dựa trên các bộ lọc được cung cấp
    const query = {};
    
    // Lọc theo adminId
    if (adminFilter) {
      // Thử các trường phổ biến liên quan đến admin
      query.$or = [
        { adminId: { $regex: adminFilter, $options: 'i' } },
        { 'adminId.username': { $regex: adminFilter, $options: 'i' } },
        { 'adminId.name': { $regex: adminFilter, $options: 'i' } },
        { createdBy: { $regex: adminFilter, $options: 'i' } },
        { 'createdBy.username': { $regex: adminFilter, $options: 'i' } },
        { 'createdBy.name': { $regex: adminFilter, $options: 'i' } },
        { admin: { $regex: adminFilter, $options: 'i' } },
        { 'admin.username': { $regex: adminFilter, $options: 'i' } },
        { 'admin.name': { $regex: adminFilter, $options: 'i' } }
      ];
      
      // Thử kiểm tra nếu chuỗi có thể là ObjectId
      if (adminFilter.match(/^[0-9a-fA-F]{24}$/)) {
        query.$or.push({ adminId: adminFilter });
        query.$or.push({ createdBy: adminFilter });
      }
    }
    
    // Lọc theo _id
    if (idFilter) {
      if (idFilter.match(/^[0-9a-fA-F]{24}$/)) {
        // Nếu là ObjectId hợp lệ
        if (query.$or) {
          query.$and = [{ _id: new mongoose.Types.ObjectId(idFilter) }];
        } else {
          query._id = new mongoose.Types.ObjectId(idFilter);
        }
      } else {
        // Nếu không phải ObjectId, tìm theo chuỗi regex
        if (query.$or) {
          query.$and = [{ _id: { $regex: idFilter, $options: 'i' } }];
        } else {
          query._id = { $regex: idFilter, $options: 'i' };
        }
      }
    }
    
    // Đếm tổng số documents đáp ứng điều kiện lọc
    const filteredCount = adminFilter || idFilter
      ? await mongoose.connection.db.collection(exactCollectionName).countDocuments(query)
      : stats.count;
    
    // Lấy một số documents để hiển thị
    const documents = await mongoose.connection.db.collection(exactCollectionName)
      .find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
      
    // Chuyển đổi ObjectId thành string để có thể trả về qua JSON
    const processedDocuments = documents.map(doc => {
      const processedDoc = { ...doc };
      if (doc._id) {
        processedDoc._id = doc._id.toString();
      }
      return processedDoc;
    });
    
    // Chuẩn bị dữ liệu trả về
    const result = {
      name: exactCollectionName,
      count: stats.count || 0,
      filteredCount,
      sizeInBytes: stats.size || 0,
      sizeInMB: parseFloat((stats.size / (1024 * 1024)).toFixed(2)),
      storageSize: stats.storageSize || 0,
      storageSizeInMB: parseFloat((stats.storageSize / (1024 * 1024)).toFixed(2)),
      nindexes: stats.nindexes || 0,
      indexSize: stats.totalIndexSize || 0,
      indexSizeInMB: parseFloat((stats.totalIndexSize / (1024 * 1024)).toFixed(2)),
      latestDocument: latestDocument.length > 0 ? latestDocument[0] : null,
      indexDetails: indexes.map(index => ({
        name: index.name,
        key: Object.entries(index.key).map(([k, v]) => `${k}:${v}`).join(', '),
        unique: !!index.unique
      })),
      exists: true,
      documents: processedDocuments,
      hasFilters: !!(adminFilter || idFilter)
    };
    
    // Ghi log
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'other',
      target: 'collection_details',
      details: { collectionName: exactCollectionName },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json(result);
  } catch (err) {
    console.error(`Error getting collection details for ${req.params.collectionName}:`, err);
    // Trả về thông tin rỗng thay vì báo lỗi 500
    const collections = await mongoose.connection.db.listCollections().toArray().catch(() => []);
    const collectionNames = collections.map(coll => coll.name.toLowerCase());
    const normalizedName = req.params.collectionName.toLowerCase();
    
    res.json({
      name: req.params.collectionName,
      count: 0,
      sizeInBytes: 0,
      sizeInMB: 0,
      storageSize: 0,
      storageSizeInMB: 0,
      nindexes: 0,
      indexSize: 0,
      indexSizeInMB: 0,
      latestDocument: null,
      indexDetails: [],
      documents: [],
      exists: false,
      error: true,
      errorMessage: err.message,
      suggestedCollection: collectionNames.length > 0 ? findSimilarCollection(normalizedName, collectionNames) : null
    });
  }
});

// Xóa tất cả documents trong collection
router.post('/database/collections/:collectionName/clear', auth, superAdminAuth, async (req, res) => {
  try {
    const { collectionName } = req.params;
    
    // Kiểm tra collection có tồn tại không
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(coll => coll.name.toLowerCase() === collectionName.toLowerCase());
    
    if (!collectionExists) {
      return res.status(404).json({ message: 'Collection không tồn tại' });
    }
    
    // Lấy số lượng documents trước khi xóa
    const countBefore = await mongoose.connection.db.collection(collectionName).countDocuments();
    
    // Xóa tất cả documents
    const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
    
    // Ghi log
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'delete',
      target: 'collection_documents',
      details: { collectionName, deletedCount: result.deletedCount },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({ 
      message: `Đã xóa ${result.deletedCount} documents trong collection ${collectionName}`,
      deletedCount: result.deletedCount,
      countBefore
    });
  } catch (err) {
    console.error(`Error clearing collection ${req.params.collectionName}:`, err);
    res.status(500).json({ message: 'Lỗi server khi xóa dữ liệu' });
  }
});

// Xóa tất cả documents trong tất cả collections
router.delete('/database/collections', auth, superAdminAuth, async (req, res) => {
  try {
    // Lấy danh sách tất cả collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    let results = {};
    let totalDeleted = 0;
    
    // Xóa documents trong từng collection
    for (const collName of collectionNames) {
      try {
        // Bỏ qua một số collection hệ thống nếu cần
        if (collName.startsWith('system.')) continue;
        
        const countBefore = await mongoose.connection.db.collection(collName).countDocuments();
        const result = await mongoose.connection.db.collection(collName).deleteMany({});
        
        results[collName] = {
          deletedCount: result.deletedCount,
          countBefore
        };
        
        totalDeleted += result.deletedCount;
      } catch (collErr) {
        console.error(`Error clearing collection ${collName}:`, collErr);
        results[collName] = { error: collErr.message };
      }
    }
    
    // Ghi log
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'delete',
      target: 'all_collections',
      details: { totalDeleted, collectionCount: collectionNames.length },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({
      message: `Đã xóa tổng cộng ${totalDeleted} documents từ ${collectionNames.length} collections`,
      results,
      totalDeleted
    });
  } catch (err) {
    console.error('Error clearing all collections:', err);
    res.status(500).json({ message: 'Lỗi server khi xóa dữ liệu' });
  }
});

// Hàm tìm collection tương tự dựa trên tên
function findSimilarCollection(name, collectionNames) {
  // Nếu tên quá ngắn, không tìm kiếm
  if (name.length < 3) return null;
  
  let bestMatch = null;
  let highestScore = 0;
  
  for (const colName of collectionNames) {
    // Tính điểm tương đồng dựa trên số ký tự xuất hiện chung
    let score = 0;
    
    // Tính điểm dựa trên prefix matching
    if (colName.startsWith(name)) {
      score += name.length * 3; // Trọng số cao hơn khi bắt đầu giống nhau
    } else if (name.startsWith(colName)) {
      score += colName.length * 2; 
    }
    
    // Tính thêm điểm cho các ký tự chung
    const nameSet = new Set(name.split(''));
    for (const char of colName) {
      if (nameSet.has(char)) {
        score += 1;
      }
    }
    
    // Nếu có ít nhất 60% độ dài tương tự
    if (Math.abs(name.length - colName.length) <= Math.max(name.length, colName.length) * 0.4) {
      score += 5;
    }
    
    // Thêm điểm cho các chuỗi con chung
    for (let i = 3; i <= Math.min(name.length, colName.length); i++) {
      for (let j = 0; j <= name.length - i; j++) {
        const subName = name.substring(j, j + i);
        if (colName.includes(subName)) {
          score += i * 2; // Điểm dựa trên độ dài chuỗi con
          break;
        }
      }
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = colName;
    }
  }
  
  // Chỉ trả về kết quả nếu điểm đủ cao
  return highestScore >= 5 ? bestMatch : null;
}

// Xóa một document cụ thể từ collection
router.delete('/database/collections/:collectionName/documents/:documentId', auth, superAdminAuth, async (req, res) => {
  try {
    const { collectionName, documentId } = req.params;
    
    // Kiểm tra collection có tồn tại không
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(coll => coll.name.toLowerCase() === collectionName.toLowerCase());
    
    if (!collectionExists) {
      return res.status(404).json({ message: 'Collection không tồn tại' });
    }
    
    // Tìm tên collection chính xác (phân biệt hoa thường)
    const exactCollectionName = collections.find(
      coll => coll.name.toLowerCase() === collectionName.toLowerCase()
    )?.name || collectionName;
    
    // Kiểm tra document có tồn tại không
    const document = await mongoose.connection.db.collection(exactCollectionName)
      .findOne({ _id: new mongoose.Types.ObjectId(documentId) });
    
    if (!document) {
      return res.status(404).json({ message: 'Document không tồn tại' });
    }
    
    // Xóa document
    const result = await mongoose.connection.db.collection(exactCollectionName)
      .deleteOne({ _id: new mongoose.Types.ObjectId(documentId) });
    
    // Ghi log
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'delete',
      target: 'document',
      details: { collectionName: exactCollectionName, documentId },
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    res.json({
      message: `Đã xóa document khỏi collection ${exactCollectionName}`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error(`Error deleting document from ${req.params.collectionName}:`, err);
    res.status(500).json({ message: 'Lỗi server khi xóa document' });
  }
});

module.exports = router; 