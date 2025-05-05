const SecretMessageResponse = require('../models/SecretMessageResponse');
const SecretMessage = require('../models/SecretMessage');
const mongoose = require('mongoose');

// Hàm lấy địa chỉ IP thực của người dùng
const getClientIp = (req) => {
  // Lấy địa chỉ IP thực của khách hàng, ưu tiên X-Forwarded-For nếu có
  const forwardedIps = (req.headers['x-forwarded-for'] || '').split(',').map(ip => ip.trim());
  
  // Lấy IP từ các nguồn khác nhau theo thứ tự ưu tiên
  const ip = 
    forwardedIps[0] || // IP đầu tiên trong x-forwarded-for (thường là IP thực của khách hàng)
    req.headers['x-real-ip'] || // Một số proxy (như Nginx) đặt IP thực vào đây
    req.connection.remoteAddress || 
    req.socket.remoteAddress || 
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    'unknown';
  
  // Đảm bảo đã loại bỏ ipv6 prefix nếu có
  const cleanIp = ip.replace(/^::ffff:/, '');
  
  // Xử lý trường hợp ::1 (localhost)
  const finalIp = cleanIp === '::1' || cleanIp === '127.0.0.1' ? 
    (req.headers['user-agent'] || 'local-device') : // Nếu là localhost, dùng user-agent để phân biệt
    cleanIp;
    
  console.log(`Địa chỉ IP khách hàng: ${finalIp} (Gốc: ${ip})`);
  return finalIp;
};

// Helper tạo mã định danh người dùng từ IP và user agent
const createUserIdentifier = (req) => {
  const finalIp = getClientIp(req);
  console.log(`Tạo định danh người dùng từ IP: ${finalIp}`);
  return Buffer.from(finalIp).toString('base64');
};

// Thêm trả lời mới
exports.submitAnswer = async (req, res) => {
  try {
    const { secretMessageId, answer } = req.body;
    const userIdentifier = createUserIdentifier(req);
    const ipAddress = getClientIp(req);

    // Tìm mật thư
    const secretMessage = await SecretMessage.findById(secretMessageId);
    if (!secretMessage) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mật thư'
      });
    }

    // Kiểm tra số lần thử tối đa
    if (secretMessage.maxAttempts) {
      // Kiểm tra số lần thử dựa trên địa chỉ IP trực tiếp
      console.log(`Đang kiểm tra số lần thử cho IP: ${ipAddress}`);
      
      const attemptCount = await SecretMessageResponse.countDocuments({
        secretMessageId,
        ipAddress: ipAddress,
        isUserInfoSubmission: false
      });

      console.log(`Số lần thử hiện tại: ${attemptCount}, Giới hạn: ${secretMessage.maxAttempts}`);

      if (attemptCount >= secretMessage.maxAttempts) {
        return res.status(403).json({
          success: false,
          message: 'Bạn đã hết số lần thử',
          attemptCount,
          maxAttempts: secretMessage.maxAttempts
        });
      }
    }

    // Kiểm tra đáp án
    const normalizedAnswer = answer.trim().toLowerCase();
    const correctAnswers = secretMessage.correctAnswer.map(ans => ans.toLowerCase().trim());
    const isCorrect = correctAnswers.includes(normalizedAnswer);

    // Tìm thông tin người dùng từ bản ghi đã lưu trước đó
    let userName = 'Định danh';
    let userInfo = {};

    const previousUserInfo = await SecretMessageResponse.findOne({
      secretMessageId,
      ipAddress: ipAddress,
      isUserInfoSubmission: true
    }).sort({ timestamp: -1 });

    if (previousUserInfo) {
      userName = previousUserInfo.userName || 'Định danh';
      userInfo = previousUserInfo.userInfo || {};
    }

    // Tạo bản ghi mới
    const response = new SecretMessageResponse({
      secretMessageId,
      messageName: secretMessage.name,
      userIdentifier,
      userName,
      userInfo,
      answer,
      isCorrect,
      isUserInfoSubmission: false,
      ipAddress: ipAddress // Lưu địa chỉ IP đã xử lý
    });

    await response.save();

    res.status(200).json({
      success: true,
      isCorrect,
      message: isCorrect ? 'Đáp án chính xác' : 'Đáp án chưa chính xác',
      response: {
        ...response.toObject(),
        ipAddress: undefined // Không trả về địa chỉ IP cho client
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi câu trả lời',
      error: error.message
    });
  }
};

// Ghi nhận thông tin người dùng
exports.submitUserInfo = async (req, res) => {
  try {
    const { secretMessageId, userInfo } = req.body;
    const userIdentifier = createUserIdentifier(req);
    const ipAddress = getClientIp(req);
    
    // Đảm bảo userInfo là object
    if (typeof userInfo !== 'object' || userInfo === null) {
      return res.status(400).json({
        success: false,
        message: 'Thông tin người dùng không hợp lệ'
      });
    }
    
    // Tìm mật thư
    const secretMessage = await SecretMessage.findById(secretMessageId);
    if (!secretMessage) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mật thư'
      });
    }
    
    // Lấy tên người dùng nếu có
    let userName = 'Định danh';
    if (userInfo) {
      // Tìm tên người dùng từ các trường thông tin
      // Ưu tiên theo thứ tự: Tên, Họ tên, bất kỳ trường nào có chứa "tên"
      const nameKeys = Object.keys(userInfo).filter(key => {
        const lowerKey = key.toLowerCase();
        return lowerKey === 'tên' || 
               lowerKey === 'họ tên' || 
               lowerKey.includes('tên') ||
               lowerKey === 'name';
      });
      
      if (nameKeys.length > 0) {
        userName = userInfo[nameKeys[0]];
      }
    }
    
    // Tạo bản ghi mới
    const response = new SecretMessageResponse({
      secretMessageId,
      messageName: secretMessage.name,
      userIdentifier,
      userName,
      userInfo,
      isUserInfoSubmission: true,
      ipAddress: ipAddress // Lưu địa chỉ IP đã xử lý
    });
    
    await response.save();
    
    res.status(200).json({
      success: true,
      message: 'Thông tin người dùng đã được ghi nhận',
      response: {
        ...response.toObject(),
        ipAddress: undefined // Không trả về địa chỉ IP cho client
      }
    });
  } catch (error) {
    console.error('Error submitting user info:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi thông tin người dùng',
      error: error.message
    });
  }
};

// Lấy tất cả phản hồi cho admin
exports.getAllByAdmin = async (req, res) => {
  try {
    // Xác định adminId từ req.admin nếu có
    const adminId = req.admin ? req.admin.id : null;
    
    // Nếu không có adminId, trả về lỗi
    if (!adminId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }
    
    console.log(`Lấy phản hồi mật thư cho admin ID: ${adminId}`);
    
    // Tìm tất cả mật thư của admin
    const secretMessages = await SecretMessage.find({ adminId });
    const secretMessageIds = secretMessages.map(message => message._id);
    
    console.log(`Tìm thấy ${secretMessages.length} mật thư thuộc admin ID ${adminId}`);
    
    // Lấy 200 phản hồi gần nhất, sắp xếp theo thời gian giảm dần, chỉ từ mật thư của admin
    const responses = await SecretMessageResponse.find({
      secretMessageId: { $in: secretMessageIds }
    })
      .sort({ timestamp: -1 })
      .limit(200);
    
    console.log(`Tìm thấy ${responses.length} phản hồi cho admin ID ${adminId}`);
    
    // Thêm trường color để giúp client hiển thị màu dựa trên isCorrect
    const processedResponses = responses.map(response => {
      const resObj = response.toObject();
      
      // Loại bỏ các trường không cần thiết
      if (resObj.isUserInfoSubmission) {
        // Đối với bản ghi thông tin người dùng, không cần trường answer
        resObj.answer = '';
      }
      
      return resObj;
    });
    
    res.status(200).json({
      success: true,
      count: processedResponses.length,
      data: processedResponses
    });
  } catch (error) {
    console.error('Error getting responses:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách phản hồi',
      error: error.message
    });
  }
};

// Lấy số lượt thử còn lại cho người dùng
exports.getRemainingAttempts = async (req, res) => {
  try {
    const { secretMessageId } = req.params;
    const userIdentifier = createUserIdentifier(req);
    const ipAddress = getClientIp(req);
    
    // Tìm mật thư
    const secretMessage = await SecretMessage.findById(secretMessageId);
    if (!secretMessage) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mật thư'
      });
    }
    
    // Nếu không giới hạn số lần thử
    if (!secretMessage.maxAttempts) {
      return res.status(200).json({
        success: true,
        hasLimit: false,
        maxAttempts: -1,
        usedAttempts: 0,
        remainingAttempts: -1
      });
    }
    
    // Đếm số lần thử đã sử dụng dựa trên IP
    console.log(`Kiểm tra số lần thử còn lại cho IP: ${ipAddress}`);
    
    const usedAttempts = await SecretMessageResponse.countDocuments({
      secretMessageId,
      ipAddress: ipAddress,
      isUserInfoSubmission: false
    });
    
    console.log(`Đã sử dụng ${usedAttempts}/${secretMessage.maxAttempts} lần thử cho IP: ${ipAddress}`);
    
    const remainingAttempts = Math.max(0, secretMessage.maxAttempts - usedAttempts);
    
    res.status(200).json({
      success: true,
      hasLimit: true,
      maxAttempts: secretMessage.maxAttempts,
      usedAttempts,
      remainingAttempts,
      debug: { ip: ipAddress } // Chỉ để debug
    });
  } catch (error) {
    console.error('Error getting remaining attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin số lần thử',
      error: error.message
    });
  }
};

// Xóa một phản hồi mật thư
exports.deleteResponse = async (req, res) => {
  try {
    const { responseId } = req.params;
    
    // Xác định adminId từ req.admin nếu có
    const adminId = req.admin ? req.admin.id : null;
    
    // Nếu không có adminId, trả về lỗi
    if (!adminId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    // Kiểm tra xem responseId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(responseId)) {
      return res.status(400).json({
        success: false,
        message: 'ID phản hồi không hợp lệ'
      });
    }

    // Tìm phản hồi trước khi xóa để lấy thông tin secretMessageId
    const response = await SecretMessageResponse.findById(responseId);

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phản hồi với ID này'
      });
    }
    
    // Kiểm tra xem mật thư có thuộc về admin này không
    const secretMessage = await SecretMessage.findById(response.secretMessageId);
    
    if (!secretMessage) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mật thư liên quan'
      });
    }
    
    // So sánh adminId từ request với adminId của mật thư
    if (secretMessage.adminId.toString() !== adminId.toString()) {
      console.log(`Lỗi quyền truy cập: Admin ${adminId} không sở hữu mật thư ${secretMessage._id} (thuộc về admin ${secretMessage.adminId})`);
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa phản hồi này'
      });
    }

    // Xóa phản hồi sau khi đã kiểm tra quyền truy cập
    await SecretMessageResponse.findByIdAndDelete(responseId);
    
    console.log(`Admin ${adminId} đã xóa phản hồi ${responseId} của mật thư ${secretMessage.name}`);

    res.status(200).json({
      success: true,
      message: 'Xóa phản hồi thành công',
      deletedResponse: response
    });
  } catch (error) {
    console.error('Error deleting response:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa phản hồi mật thư',
      error: error.message
    });
  }
}; 