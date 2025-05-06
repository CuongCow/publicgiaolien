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
    
    const response = await SecretMessageResponse.findById(responseId);
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phản hồi này'
      });
    }
    
    await SecretMessageResponse.findByIdAndDelete(responseId);
    
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

// Xóa tất cả phản hồi mật thư
exports.deleteAllResponses = async (req, res) => {
  try {
    // Xác định adminId từ req.admin
    const adminId = req.admin ? req.admin.id : null;
    
    // Nếu không có adminId, trả về lỗi
    if (!adminId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }
    
    console.log(`Xóa tất cả phản hồi mật thư cho admin ID: ${adminId}`);
    
    // Tìm tất cả mật thư của admin
    const secretMessages = await SecretMessage.find({ adminId });
    const secretMessageIds = secretMessages.map(message => message._id);
    
    console.log(`Tìm thấy ${secretMessages.length} mật thư thuộc admin ID ${adminId}`);

    // Xóa tất cả phản hồi liên quan đến mật thư của admin
    const deleteResult = await SecretMessageResponse.deleteMany({
      secretMessageId: { $in: secretMessageIds }
    });
    
    console.log(`Đã xóa ${deleteResult.deletedCount} phản hồi mật thư`);
    
    res.status(200).json({
      success: true,
      message: 'Xóa tất cả phản hồi mật thư thành công',
      deletedCount: deleteResult.deletedCount
    });
  } catch (error) {
    console.error('Error deleting all responses:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa tất cả phản hồi mật thư',
      error: error.message
    });
  }
};

// Lấy thống kê và xếp hạng người dùng
exports.getStatistics = async (req, res) => {
  try {
    // Xác định adminId từ req.admin nếu có
    const adminId = req.admin ? req.admin.id : null;
    
    // Nếu không có adminId, trả về lỗi
    if (!adminId) {
      console.log('Không tìm thấy adminId trong request');
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }
    
    console.log(`Lấy thống kê mật thư cho admin ID: ${adminId}`);
    
    // Tìm tất cả mật thư của admin với xử lý lỗi rõ ràng hơn
    let secretMessages = [];
    try {
      secretMessages = await SecretMessage.find({ adminId });
    } catch (err) {
      console.error('Lỗi khi truy vấn mật thư:', err);
      // Trả về thống kê rỗng thay vì lỗi 500
      return res.status(200).json({
        success: true,
        statistics: {
          totalResponses: 0,
          correctResponses: 0,
          incorrectResponses: 0,
          accuracyRate: "0.00",
          dailyStats: [],
          messageStats: [],
          userRankings: []
        }
      });
    }
    
    // Nếu không có mật thư nào, trả về thống kê rỗng
    if (!Array.isArray(secretMessages) || secretMessages.length === 0) {
      console.log(`Admin ${adminId} không có mật thư nào`);
      return res.status(200).json({
        success: true,
        statistics: {
          totalResponses: 0,
          correctResponses: 0,
          incorrectResponses: 0,
          accuracyRate: "0.00",
          dailyStats: [],
          messageStats: [],
          userRankings: []
        }
      });
    }
    
    const secretMessageIds = secretMessages.map(message => message._id);
    console.log(`Tìm thấy ${secretMessages.length} mật thư của admin ${adminId}`);
    
    // Lấy tất cả phản hồi từ mật thư của admin, với xử lý lỗi tốt hơn
    let responses = [];
    try {
      responses = await SecretMessageResponse.find({
        secretMessageId: { $in: secretMessageIds },
        isUserInfoSubmission: false
      });
    } catch (err) {
      console.error('Lỗi khi truy vấn phản hồi:', err);
      // Trả về thống kê với các mật thư nhưng không có phản hồi
      return res.status(200).json({
        success: true,
        statistics: {
          totalResponses: 0,
          correctResponses: 0,
          incorrectResponses: 0,
          accuracyRate: "0.00",
          dailyStats: [],
          messageStats: secretMessages.map(message => ({
            id: message._id,
            name: message.name || 'Không tên',
            total: 0,
            correct: 0,
            incorrect: 0
          })),
          userRankings: []
        }
      });
    }
    
    if (!Array.isArray(responses)) {
      responses = [];
    }
    
    console.log(`Tìm thấy ${responses.length} phản hồi từ các mật thư của admin ${adminId}`);
    
    // Thống kê tổng số
    const totalResponses = responses.length;
    const correctResponses = responses.filter(r => r.isCorrect).length;
    const incorrectResponses = totalResponses - correctResponses;
    
    // Tính tỉ lệ chính xác
    const accuracyRate = totalResponses > 0 ? (correctResponses / totalResponses * 100).toFixed(2) : "0.00";
    
    // Thống kê theo ngày (7 ngày gần nhất) - với xử lý lỗi tốt hơn
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    const dailyStats = last7Days.map(dateStr => {
      const startDate = new Date(dateStr);
      const endDate = new Date(dateStr);
      endDate.setDate(endDate.getDate() + 1);
      
      try {
        const dayResponses = responses.filter(r => {
          try {
            const timestamp = new Date(r.timestamp);
            return timestamp >= startDate && timestamp < endDate;
          } catch (err) {
            console.error('Lỗi khi phân tích timestamp:', err);
            return false;
          }
        });
        
        const dayCorrect = dayResponses.filter(r => r.isCorrect).length;
        
        return {
          date: dateStr,
          total: dayResponses.length,
          correct: dayCorrect,
          incorrect: dayResponses.length - dayCorrect
        };
      } catch (err) {
        console.error('Lỗi khi tính toán thống kê theo ngày:', err);
        return {
          date: dateStr,
          total: 0,
          correct: 0,
          incorrect: 0
        };
      }
    });
    
    // Thống kê theo mật thư
    const messageStats = secretMessages.map(message => {
      try {
        const messageResponses = responses.filter(r => {
          try {
            return r.secretMessageId && message._id && 
                  r.secretMessageId.toString() === message._id.toString();
          } catch (err) {
            console.error('Lỗi khi so sánh ID:', err);
            return false;
          }
        });
        
        const messageCorrect = messageResponses.filter(r => r.isCorrect).length;
        
        return {
          id: message._id,
          name: message.name || 'Không tên',
          total: messageResponses.length,
          correct: messageCorrect,
          incorrect: messageResponses.length - messageCorrect
        };
      } catch (err) {
        console.error('Lỗi khi tính toán thống kê theo mật thư:', err);
        return {
          id: message._id,
          name: message.name || 'Không tên',
          total: 0,
          correct: 0,
          incorrect: 0
        };
      }
    });
    
    // Xếp hạng người dùng (top 20) - với xử lý lỗi tốt hơn
    const userRankings = [];
    const userMap = new Map();
    
    // Nhóm dữ liệu theo userIdentifier
    try {
      responses.forEach(response => {
        if (!response || !response.userIdentifier) return;
        
        if (!userMap.has(response.userIdentifier)) {
          userMap.set(response.userIdentifier, {
            userIdentifier: response.userIdentifier,
            userName: response.userName || 'Định danh',
            totalAttempts: 0,
            correctAttempts: 0
          });
        }
        
        const userData = userMap.get(response.userIdentifier);
        userData.totalAttempts++;
        if (response.isCorrect) {
          userData.correctAttempts++;
        }
      });
      
      // Chuyển đổi map thành mảng và sắp xếp
      Array.from(userMap.values())
        .sort((a, b) => {
          // Sắp xếp theo số câu trả lời đúng giảm dần
          if (b.correctAttempts !== a.correctAttempts) {
            return b.correctAttempts - a.correctAttempts;
          }
          // Nếu bằng nhau thì sắp xếp theo tỉ lệ đúng
          const aRate = a.totalAttempts > 0 ? a.correctAttempts / a.totalAttempts : 0;
          const bRate = b.totalAttempts > 0 ? b.correctAttempts / b.totalAttempts : 0;
          return bRate - aRate;
        })
        .slice(0, 20) // Chỉ lấy top 20
        .forEach((user, index) => {
          userRankings.push({
            rank: index + 1,
            userName: user.userName,
            totalAttempts: user.totalAttempts,
            correctAttempts: user.correctAttempts,
            accuracy: user.totalAttempts > 0 
              ? (user.correctAttempts / user.totalAttempts * 100).toFixed(2) 
              : "0.00"
          });
        });
    } catch (err) {
      console.error('Lỗi khi tính toán xếp hạng người dùng:', err);
      // Để mảng userRankings trống nếu có lỗi
    }
    
    console.log(`Trả về thành công thống kê cho admin ${adminId}`);
    
    return res.status(200).json({
      success: true,
      statistics: {
        totalResponses,
        correctResponses,
        incorrectResponses,
        accuracyRate,
        dailyStats,
        messageStats,
        userRankings
      }
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    // Trả về dữ liệu rỗng thay vì lỗi 500
    return res.status(200).json({
      success: true,
      statistics: {
        totalResponses: 0,
        correctResponses: 0,
        incorrectResponses: 0,
        accuracyRate: "0.00",
        dailyStats: [],
        messageStats: [],
        userRankings: []
      },
      error: error.message
    });
  }
};

// Kiểm tra người dùng đã trả lời đúng mật thư chưa
exports.checkCorrectAnswer = async (req, res) => {
  try {
    const { secretMessageId } = req.params;
    const ipAddress = getClientIp(req);
    
    console.log(`Kiểm tra người dùng IP ${ipAddress} đã trả lời đúng mật thư ${secretMessageId} chưa`);
    
    // Tìm mật thư
    const secretMessage = await SecretMessage.findById(secretMessageId);
    if (!secretMessage) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mật thư'
      });
    }
    
    // Tìm phản hồi đúng từ địa chỉ IP này
    const correctResponse = await SecretMessageResponse.findOne({
      secretMessageId,
      ipAddress,
      isCorrect: true,
      isUserInfoSubmission: false
    });
    
    // Nếu tìm thấy phản hồi đúng, trả về thông tin
    if (correctResponse) {
      console.log(`Người dùng IP ${ipAddress} đã trả lời đúng mật thư ${secretMessageId}`);
      return res.status(200).json({
        success: true,
        hasCorrectAnswer: true,
        response: {
          answer: correctResponse.answer,
          timestamp: correctResponse.timestamp
        }
      });
    } else {
      console.log(`Người dùng IP ${ipAddress} chưa trả lời đúng mật thư ${secretMessageId}`);
      return res.status(200).json({
        success: true,
        hasCorrectAnswer: false
      });
    }
  } catch (error) {
    console.error('Error checking correct answer:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra câu trả lời',
      error: error.message
    });
  }
};