const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  termType: {
    type: String,
    enum: ['default', 'custom', 'journey'],
    default: 'default'
  },
  customTerm: {
    type: String,
    default: ''
  },
  customCopyTemplates: {
    stationCentered: {
      type: String,
      default: `THÔNG TIN ĐĂNG NHẬP TRẠM
------------------------------------------
Tên đội: {teamName}
Mật khẩu: {teamPassword}
------------------------------------------
HƯỚNG DẪN ĐĂNG NHẬP:
1. Quét QR của ban tổ chức cung cấp để vào trạm
2. Nhập thông tin đăng nhập:
   - Chọn đội tham gia: {teamName}
   - Mật khẩu: {teamPassword}
3. Nhấn nút "XÁC NHẬN"
4. Giải mật thư và nhập đáp án vào ô trả lời

LƯU Ý:
- Giữ kín Mật khẩu, không chia sẻ cho đội khác
- Chỉ đăng nhập trên một thiết bị tại một thời điểm
- Ban tổ chức có thể giới hạn số lần trả lời sai cho mỗi đội
- Trả lời sai quá số lần sẽ bị khóa tùy vào thời gian của ban tổ chức chọn
- Nếu gặp lỗi, hãy:
  + Kiểm tra kết nối mạng
  + Đảm bảo chọn đúng đội và nhập đúng mật khẩu
  + Liên hệ ban tổ chức để được hỗ trợ`
    },
    stationRace: {
      type: String,
      default: `THÔNG TIN ĐĂNG NHẬP TRẠM
------------------------------------------
Tên đội: {teamName}
Mật khẩu: {teamPassword}
------------------------------------------
HƯỚNG DẪN ĐĂNG NHẬP:
1. Truy cập đường dẫn website: {websiteUrl}/station/team/{adminId}
2. Nhập thông tin đăng nhập:
   - Nhập tên đội: {teamName}
   - Mật khẩu: {teamPassword}
3. Nhấn nút "XÁC NHẬN"
4. Chờ tất cả các đội đều đăng nhập vào Ban tổ chức sẽ bắt đầu trạm
5. Giải mật thư và nhập đáp án vào ô trả lời

LƯU Ý:
- Giữ kín Mật khẩu, không chia sẻ cho đội khác
- Chỉ đăng nhập trên một thiết bị tại một thời điểm
- Ban tổ chức có thể giới hạn số lần trả lời sai cho mỗi đội
- Trả lời sai quá số lần sẽ bị khóa tùy vào thời gian của ban tổ chức chọn
- Nếu gặp lỗi, hãy:
  + Kiểm tra kết nối mạng
  + Đảm bảo chọn đúng đội và nhập đúng mật khẩu
  + Liên hệ ban tổ chức để được hỗ trợ`
    }
  },
  databaseRetentionDays: {
    type: Number,
    default: 30,
    min: 1,
    max: 365
  },
  securitySettings: {
    maxLoginAttempts: {
      type: Number,
      default: 5
    },
    lockoutTimeMinutes: {
      type: Number,
      default: 30
    },
    sessionTimeoutMinutes: {
      type: Number,
      default: 60
    },
    requireStrongPasswords: {
      type: Boolean,
      default: true
    },
    blockedIPs: {
      type: [String],
      default: []
    }
  },
  notificationSettings: {
    enableLoginAlerts: {
      type: Boolean,
      default: true
    },
    enableSystemNotifications: {
      type: Boolean,
      default: true
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema); 