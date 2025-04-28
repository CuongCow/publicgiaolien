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

// Xóa nhật ký cũ
router.delete('/logs/cleanup', auth, superAdminAuth, async (req, res) => {
  try {
    const { olderThanDays } = req.body;
    
    if (!olderThanDays || olderThanDays < 1) {
      return res.status(400).json({ message: 'Vui lòng cung cấp số ngày hợp lệ' });
    }
    
    const date = new Date();
    date.setDate(date.getDate() - olderThanDays);
    
    const result = await SystemLog.deleteMany({ createdAt: { $lt: date } });
    
    // Ghi nhật ký về việc xóa
    await SystemLog.create({
      adminId: req.admin.id,
      action: 'delete',
      target: 'systemLogs',
      details: { deletedCount: result.deletedCount, olderThanDays },
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
    const collections = {
      admins: await Admin.countDocuments(),
      teams: await mongoose.connection.db.collection('teams').countDocuments(),
      stations: await mongoose.connection.db.collection('stations').countDocuments(),
      submissions: await mongoose.connection.db.collection('submissions').countDocuments(),
      systemLogs: await SystemLog.countDocuments(),
      inviteCodes: await InvitationCode.countDocuments(),
      notifications: await Notification.countDocuments(),
      loginHistory: await mongoose.connection.db.collection('loginhistories').countDocuments()
    };
    
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

module.exports = router; 