const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const VerificationCode = require('../models/VerificationCode');
const LoginHistory = require('../models/LoginHistory');
const nodemailer = require('nodemailer');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

// Hàm tạo mã xác thực ngẫu nhiên
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'cuong.dn@pctu.edu.vn',
    pass: 'zant zcwr ksao czke',
  },
});

// @route   POST api/auth/register
// @desc    Đăng ký tài khoản admin
// @access  Public
exports.register = async (req, res) => {
  const { username, password, name, email, invitationCode } = req.body;

  try {
    // Kiểm tra mã mời
    if (!invitationCode) {
      return res.status(400).json({ message: 'Mã mời là bắt buộc' });
    }

    const InvitationCode = require('../models/InvitationCode');
    const invitation = await InvitationCode.findOne({ code: invitationCode, isUsed: false });
    
    if (!invitation || new Date(invitation.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'Mã mời không hợp lệ hoặc đã hết hạn' });
    }

    // Kiểm tra xem username đã tồn tại chưa
    let admin = await Admin.findOne({ username });
    if (admin) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    // Kiểm tra xem email đã tồn tại chưa
    admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Tạo admin mới
    admin = new Admin({
      username,
      password,
      name,
      email
    });

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);

    // Lưu admin
    await admin.save();

    // Đánh dấu mã mời đã được sử dụng
    invitation.isUsed = true;
    invitation.usedBy = admin._id;
    await invitation.save();

    // Gửi email chào mừng
    await sendWelcomeEmail(email, name);

    // Tạo token
    const payload = {
      admin: {
        id: admin.id,
        role: admin.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   POST api/auth/login
// @desc    Đăng nhập
// @access  Public
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Kiểm tra xem admin có tồn tại không
    const admin = await Admin.findOne({ username });
    if (!admin) {
      // Ghi lại đăng nhập thất bại
      await LoginHistory.create({
        username,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        status: 'failed'
      });
      
      return res.status(400).json({ message: 'Thông tin đăng nhập không đúng' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      // Ghi lại đăng nhập thất bại
      await LoginHistory.create({
        adminId: admin._id,
        username: admin.username,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        status: 'failed'
      });
      
      return res.status(400).json({ message: 'Thông tin đăng nhập không đúng' });
    }

    // Thu thập thông tin về người dùng đăng nhập
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const loginTime = new Date();
    
    // Phân tích user agent để lấy thông tin thiết bị
    let deviceInfo = 'Không xác định';
    try {
      if (userAgent) {
        const parser = new UAParser(userAgent);
        const result = parser.getResult();
        const browser = result.browser.name ? `${result.browser.name} ${result.browser.version}` : 'Không xác định';
        const os = result.os.name ? `${result.os.name} ${result.os.version}` : 'Không xác định';
        const device = result.device.vendor 
          ? `${result.device.vendor} ${result.device.model || ''} ${result.device.type || ''}`
          : (result.device.type || 'Desktop');
        deviceInfo = `${browser} trên ${os} (${device})`.trim();
      }
    } catch (uaError) {
      console.error('Lỗi phân tích user agent:', uaError);
      deviceInfo = userAgent || 'Không xác định';
    }
    
    // Lấy thông tin vị trí từ IP
    let locationInfo = 'Không xác định';
    try {
      // Làm sạch địa chỉ IP (xóa ::ffff: nếu có)
      const cleanIp = ipAddress.replace(/^::ffff:/, '');
      const geo = geoip.lookup(cleanIp);
      if (geo) {
        locationInfo = `${geo.city || ''}, ${geo.region || ''}, ${geo.country || ''}`.replace(/, ,/g, ',').replace(/^,|,$/g, '');
      }
    } catch (geoError) {
      console.error('Lỗi khi lấy thông tin vị trí:', geoError);
    }
    
    // Lưu lại lịch sử đăng nhập
    await LoginHistory.create({
      adminId: admin._id,
      username: admin.username,
      ipAddress,
      userAgent,
      deviceInfo,
      location: locationInfo,
      loginTime,
      status: 'success'
    });
    
    // Gửi email cảnh báo đăng nhập
    await sendLoginAlertEmail(admin.email, admin.name, {
      ipAddress,
      deviceInfo,
      loginTime: loginTime.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      username: admin.username,
      location: locationInfo
    });

    // Tạo token
    const payload = {
      admin: {
        id: admin.id,
        role: admin.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          admin: {
            id: admin.id,
            username: admin.username,
            name: admin.name,
            email: admin.email,
            role: admin.role
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   GET api/auth/me
// @desc    Lấy thông tin admin hiện tại
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Không tìm thấy admin' });
    }
    res.json(admin);
  } catch (err) {
    console.error('GetMe error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   PATCH api/auth/profile
// @desc    Cập nhật thông tin hồ sơ admin
// @access  Private
exports.updateProfile = async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: 'Không tìm thấy admin' });
    }
    
    // Cập nhật thông tin admin
    if (name) admin.name = name;
    if (email) admin.email = email;
    
    // Nếu có mật khẩu mới, hãy xác minh mật khẩu hiện tại trước
    if (newPassword) {
      // Kiểm tra xem mật khẩu hiện tại có chính xác không
      if (!currentPassword) {
        return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hiện tại' });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác' });
      }
      
      // Mã hóa mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(newPassword, salt);
      
      // Đánh dấu là đã sửa đổi để tránh hash lại trong pre save
      admin.markModified('password');
    }
    
    await admin.save();
    
    res.json({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      email: admin.email
    });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   POST api/auth/check-email
// @desc    Kiểm tra xem email đã tồn tại chưa
// @access  Public
exports.checkEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    res.json({ exists: !!admin });
  } catch (err) {
    console.error('Check email error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   POST api/auth/send-verification
// @desc    Gửi mã xác thực đến email khi đăng ký
// @access  Public
exports.sendVerification = async (req, res) => {
  const { email } = req.body;

  try {
    // Tạo mã xác thực
    const code = generateVerificationCode();
    
    // Lưu mã xác thực vào database
    let verification = await VerificationCode.findOne({ email });
    if (verification) {
      verification.code = code;
      verification.expiresAt = Date.now() + 10 * 60 * 1000; // 10 phút
    } else {
      verification = new VerificationCode({
        email,
        code,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 phút
      });
    }
    
    await verification.save();
    
    // Gửi email xác thực
    await sendVerificationEmail(email, code);
    
    res.json({ message: 'Mã xác thực đã được gửi đến email của bạn' });
  } catch (err) {
    console.error('Send verification error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   POST api/auth/verify-code
// @desc    Xác thực mã
// @access  Public
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const verification = await VerificationCode.findOne({ email });
    
    if (!verification) {
      return res.status(400).json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn' });
    }
    
    if (verification.code !== code) {
      return res.status(400).json({ message: 'Mã xác thực không đúng' });
    }
    
    // Kiểm tra xem mã có hết hạn chưa
    if (verification.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Mã xác thực đã hết hạn' });
    }
    
    res.json({ message: 'Xác thực thành công' });
  } catch (err) {
    console.error('Verify code error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   POST api/auth/request-reset
// @desc    Yêu cầu đặt lại mật khẩu
// @access  Public
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // Kiểm tra xem email có tồn tại không
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
    }
    
    // Tạo mã xác thực
    const code = generateVerificationCode();
    
    // Lưu mã xác thực vào database
    let verification = await VerificationCode.findOne({ email });
    if (verification) {
      verification.code = code;
      verification.expiresAt = Date.now() + 10 * 60 * 1000; // 10 phút
    } else {
      verification = new VerificationCode({
        email,
        code,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 phút
      });
    }
    
    await verification.save();
    
    // Gửi email xác thực
    await sendPasswordResetEmail(email, code);
    
    res.json({ message: 'Mã xác thực đã được gửi đến email của bạn' });
  } catch (err) {
    console.error('Request password reset error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   POST api/auth/reset-password
// @desc    Đặt lại mật khẩu
// @access  Public
exports.resetPassword = async (req, res) => {
  const { email, code, password } = req.body;

  try {
    // Kiểm tra mã xác thực
    const verification = await VerificationCode.findOne({ email });
    
    if (!verification) {
      return res.status(400).json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn' });
    }
    
    if (verification.code !== code) {
      return res.status(400).json({ message: 'Mã xác thực không đúng' });
    }
    
    // Kiểm tra xem mã có hết hạn chưa
    if (verification.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Mã xác thực đã hết hạn' });
    }
    
    // Tìm admin bằng email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }
    
    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);
    
    // Đánh dấu là đã sửa đổi để tránh hash lại trong pre save
    admin.markModified('password');
    
    // Lưu admin
    await admin.save();
    
    // Xóa mã xác thực
    await VerificationCode.findOneAndDelete({ email });
    
    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Hàm gửi email xác thực
const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: 'Hệ thống Giao Liên <cuong.dn@pctu.edu.vn>',
    to: email,
    subject: 'Mã xác thực từ Hệ thống Giao Liên',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #d9534f; text-align: center;">Hệ thống Giao Liên</h2>
        <h3 style="text-align: center;">Mã xác thực đăng ký tài khoản</h3>
        <p>Xin chào,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản trên Hệ thống Giao Liên. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã xác thực sau:</p>
        <div style="text-align: center; padding: 15px; background-color: #f8f9fa; border-radius: 4px; font-size: 24px; letter-spacing: 2px; font-weight: bold; margin: 20px 0;">
          ${code}
        </div>
        <p>Mã xác thực này sẽ hết hạn sau 10 phút.</p>
        <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        <p>Trân trọng,<br>Đội ngũ Hệ thống Giao Liên</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Hàm gửi email đặt lại mật khẩu
const sendPasswordResetEmail = async (email, code) => {
  const mailOptions = {
    from: 'Hệ thống Giao Liên <cuong.dn@pctu.edu.vn>',
    to: email,
    subject: 'Yêu cầu đặt lại mật khẩu từ Hệ thống Giao Liên',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #d9534f; text-align: center;">Hệ thống Giao Liên</h2>
        <h3 style="text-align: center;">Yêu cầu đặt lại mật khẩu</h3>
        <p>Xin chào,</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Để đặt lại mật khẩu, vui lòng sử dụng mã xác thực sau:</p>
        <div style="text-align: center; padding: 15px; background-color: #f8f9fa; border-radius: 4px; font-size: 24px; letter-spacing: 2px; font-weight: bold; margin: 20px 0;">
          ${code}
        </div>
        <p>Mã xác thực này sẽ hết hạn sau 10 phút.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Có thể có người khác đã nhập sai địa chỉ email của họ.</p>
        <p>Trân trọng,<br>Đội ngũ Hệ thống Giao Liên</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Hàm gửi email chào mừng
const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: 'Hệ thống Giao Liên <cuong.dn@pctu.edu.vn>',
    to: email,
    subject: 'Chào mừng bạn đến với Hệ thống Giao Liên',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #d9534f; text-align: center;">Hệ thống Giao Liên</h2>
        <h3 style="text-align: center;">Chào mừng bạn!</h3>
        <p>Xin chào ${name},</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản trên Hệ thống Giao Liên. Tài khoản của bạn đã được tạo thành công.</p>
        <p>Với tài khoản này, bạn có thể:</p>
        <ul>
          <li>Quản lý các trạm trong hệ thống</li>
          <li>Theo dõi tiến độ của các đội chơi</li>
          <li>Xem bảng xếp hạng và thống kê</li>
          <li>Và nhiều tính năng hữu ích khác</li>
        </ul>
        <p>Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi.</p>
        <p>Trân trọng,<br>Đội ngũ Hệ thống Giao Liên</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Hàm gửi email cảnh báo đăng nhập
const sendLoginAlertEmail = async (email, name, loginInfo) => {
  const mailOptions = {
    from: 'Hệ thống Giao Liên <cuong.dn@pctu.edu.vn>',
    to: email,
    subject: 'Cảnh báo: Đăng nhập mới vào tài khoản của bạn',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #d9534f; text-align: center;">Hệ thống Giao Liên</h2>
        <h3 style="text-align: center;">Cảnh báo bảo mật: Đăng nhập mới</h3>
        <p>Xin chào ${name},</p>
        <p>Chúng tôi phát hiện một đăng nhập mới vào tài khoản của bạn. Chi tiết như sau:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Tên đăng nhập:</strong> ${loginInfo.username}</p>
          <p><strong>Thời gian:</strong> ${loginInfo.loginTime}</p>
          <p><strong>Địa chỉ IP:</strong> ${loginInfo.ipAddress}</p>
          <p><strong>Vị trí:</strong> ${loginInfo.location}</p>
          <p><strong>Thiết bị:</strong> ${loginInfo.deviceInfo}</p>
        </div>
        <p>Nếu đây không phải là bạn, vui lòng thay đổi mật khẩu ngay lập tức và liên hệ với quản trị viên hệ thống.</p>
        <p>Trân trọng,<br>Đội ngũ Hệ thống Giao Liên</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// @route   GET api/auth/login-history
// @desc    Lấy lịch sử đăng nhập
// @access  Private
exports.getLoginHistory = async (req, res) => {
  try {
    const history = await LoginHistory.find({ adminId: req.admin.id })
      .sort({ loginTime: -1 })
      .limit(10);
    
    res.json(history);
  } catch (err) {
    console.error('Get login history error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   GET api/auth/login-history/:id
// @desc    Lấy chi tiết lịch sử đăng nhập
// @access  Private
exports.getLoginHistoryDetail = async (req, res) => {
  try {
    const history = await LoginHistory.findById(req.params.id);
    
    if (!history) {
      return res.status(404).json({ message: 'Không tìm thấy lịch sử đăng nhập' });
    }
    
    // Kiểm tra quyền truy cập
    if (history.adminId.toString() !== req.admin.id) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    res.json(history);
  } catch (err) {
    console.error('Get login history detail error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @route   GET api/auth/admins
// @desc    Lấy danh sách admin
// @access  Private (SuperAdmin)
exports.getAllAdmins = async (req, res) => {
  try {
    // Kiểm tra quyền SuperAdmin
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    console.error('Get all admins error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 