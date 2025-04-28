const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const VerificationCode = require('../models/VerificationCode');
const LoginHistory = require('../models/LoginHistory');
const nodemailer = require('nodemailer');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const InvitationCode = require('../models/InvitationCode');

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
  try {
    const { username, password, name, email, inviteCode } = req.body;

    // Kiểm tra mã mời
    const code = await InvitationCode.findOne({ code: inviteCode });
    if (!code) {
      return res.status(400).json({ message: 'Mã mời không hợp lệ' });
    }

    if (code.isUsed) {
      return res.status(400).json({ message: 'Mã mời đã được sử dụng' });
    }

    // Kiểm tra username đã tồn tại chưa
    let admin = await Admin.findOne({ username });
    if (admin) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    // Kiểm tra email đã tồn tại chưa
    admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    // Tạo admin mới
    admin = new Admin({
      username,
      password,
      name,
      email,
      role: 'admin'
    });

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);

    await admin.save();

    // Đánh dấu mã mời đã sử dụng
    code.isUsed = true;
    code.usedBy = admin._id;
    code.usedAt = new Date();
    await code.save();

    // Tạo token
    const payload = {
      admin: {
        id: admin.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   POST api/auth/login
// @desc    Đăng nhập
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra username
    let admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Tạo token
    const payload = {
      admin: {
        id: admin.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/auth/me
// @desc    Lấy thông tin admin hiện tại
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json(admin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
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
// @desc    Lấy lịch sử đăng nhập của admin
// @access  Private
exports.getLoginHistory = async (req, res) => {
  try {
    const loginHistory = await LoginHistory.find({ admin: req.admin.id })
      .sort({ loginTime: -1 })
      .limit(10);
    
    res.json(loginHistory);
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
    const loginHistory = await LoginHistory.findOne({
      _id: req.params.id,
      admin: req.admin.id
    });
    
    if (!loginHistory) {
      return res.status(404).json({ message: 'Không tìm thấy lịch sử đăng nhập' });
    }
    
    res.json(loginHistory);
  } catch (err) {
    console.error('Get login history detail error:', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Hàm gửi email thông báo hệ thống
const sendNotificationEmail = async (email, notification) => {
  const mailOptions = {
    from: 'Hệ thống Giao Liên <cuong.dn@pctu.edu.vn>',
    to: email,
    subject: `Thông báo: ${notification.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #d9534f; text-align: center;">Hệ thống Giao Liên</h2>
        <h3 style="text-align: center;">Thông báo từ hệ thống</h3>
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <h4 style="color: #333; margin-top: 0;">${notification.title}</h4>
          <div style="color: #555;">
            ${notification.content}
          </div>
        </div>
        <p>Ngày tạo: ${new Date(notification.createdAt).toLocaleString('vi-VN')}</p>
        <p>Vui lòng đăng nhập vào hệ thống để xem chi tiết và các thông báo khác.</p>
        <p>Trân trọng,<br>Đội ngũ Hệ thống Giao Liên</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Export các hàm xử lý route
module.exports = {
  register: exports.register,
  login: exports.login,
  getMe: exports.getMe,
  updateProfile: exports.updateProfile,
  resetPassword: exports.resetPassword,
  checkEmail: exports.checkEmail,
  sendVerification: exports.sendVerification,
  verifyCode: exports.verifyCode,
  requestPasswordReset: exports.requestPasswordReset,
  getLoginHistory: exports.getLoginHistory,
  getLoginHistoryDetail: exports.getLoginHistoryDetail,
  emailService: {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendLoginAlertEmail,
    sendNotificationEmail
  }
}; 