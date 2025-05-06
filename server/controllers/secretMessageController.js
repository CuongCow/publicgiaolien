const SecretMessage = require('../models/SecretMessage');
const SystemLog = require('../models/SystemLog');
const mongoose = require('mongoose');

// Tạo mật thư mới
exports.create = async (req, res) => {
  try {
    const { 
      name, 
      title,
      teamNote, 
      content, 
      contentType, 
      fontSize, 
      fontWeight, 
      lineHeight, 
      letterSpacing, 
      paragraphSpacing,
      correctAnswer,
      userInfoFields,
      ottContent,
      nwContent,
      showText,
      showImage,
      showOTT,
      showNW,
      maxAttempts
    } = req.body;
    
    // Kiểm tra xem có admin hay không
    if (!req.admin || !req.admin.id) {
      console.log('[CREATE] Không tìm thấy thông tin admin trong request:', req.admin);
      return res.status(401).json({
        success: false,
        message: 'Không có quyền tạo mật thư, vui lòng đăng nhập lại'
      });
    }
    
    const adminId = req.admin.id;
    console.log(`[CREATE] Đang tạo mật thư với admin ID: ${adminId}`);
    
    // Tạo mật thư mới
    const newSecretMessage = new SecretMessage({
      name: name || 'Mật thư mới',
      title: title || '',
      adminId: adminId, // Gán adminId từ request
      teamNote: teamNote || '',
      content: content || '',  // Lưu trực tiếp content, không phụ thuộc vào contentType
      contentType: contentType || 'text',
      fontSize: fontSize || '1.05rem',
      fontWeight: fontWeight || '500',
      lineHeight: lineHeight || '1.5',
      letterSpacing: letterSpacing || 'normal',
      paragraphSpacing: paragraphSpacing || '0.8rem',
      correctAnswer: Array.isArray(correctAnswer) ? correctAnswer : correctAnswer ? [correctAnswer] : [],
      userInfoFields: Array.isArray(userInfoFields) ? userInfoFields : [],
      ottContent: ottContent || '',
      nwContent: nwContent || '',
      showText: showText !== undefined ? showText : true,
      showImage: showImage !== undefined ? showImage : false,
      showOTT: showOTT !== undefined ? showOTT : true,
      showNW: showNW !== undefined ? showNW : true,
      maxAttempts: maxAttempts !== undefined ? maxAttempts : 0
    });
    
    console.log('Đang lưu mật thư:', newSecretMessage);
    await newSecretMessage.save();
    console.log('Đã lưu mật thư thành công với ID:', newSecretMessage._id);

    // Ghi log nếu có admin
    try {
      await new SystemLog({
        action: 'CREATE_SECRET_MESSAGE',
        adminId: adminId,
        details: `Admin đã tạo mật thư mới: ${name}`,
        metadata: { secretMessageId: newSecretMessage._id }
      }).save();
    } catch (logError) {
      console.error('Không thể ghi log:', logError);
    }
    
    // Trả về kết quả
    res.status(201).json({
      success: true,
      message: 'Tạo mật thư thành công',
      data: newSecretMessage
    });
  } catch (error) {
    console.error('Error creating secret message:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo mật thư',
      error: error.message
    });
  }
};

// Lấy tất cả mật thư của admin
exports.getAllByAdmin = async (req, res) => {
  try {
    let secretMessages = [];
    
    if (req.admin) {
      // Nếu có admin, chỉ lấy mật thư của admin đó
      secretMessages = await SecretMessage.find({ adminId: req.admin.id }).sort({ createdAt: -1 });
      console.log(`Tìm thấy ${secretMessages.length} mật thư cho admin ID: ${req.admin.id}`);
    } else {
      // Nếu không có admin, lấy tất cả mật thư (chế độ test)
      secretMessages = await SecretMessage.find().sort({ createdAt: -1 });
      console.log('Đã tìm thấy tất cả mật thư trong chế độ test:', secretMessages.length);
    }
    
    res.status(200).json({
      success: true,
      message: req.admin ? 'Lấy danh sách mật thư thành công' : 'Lấy danh sách mật thư trong chế độ test',
      count: secretMessages.length,
      data: secretMessages
    });
  } catch (error) {
    console.error('Error getting secret messages:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách mật thư',
      error: error.message
    });
  }
};

// Lấy chi tiết một mật thư dựa theo ID
exports.getById = async (req, res) => {
  try {
    console.log('Đang lấy chi tiết mật thư ID:', req.params.id);
    
    const secretMessage = await SecretMessage.findById(req.params.id);
    
    if (!secretMessage) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mật thư'
      });
    }
    
    // Kiểm tra quyền sở hữu nếu có thông tin admin
    if (req.admin && secretMessage.adminId.toString() !== req.admin.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xem mật thư này'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết mật thư thành công',
      data: secretMessage
    });
  } catch (error) {
    console.error('Error getting secret message by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết mật thư',
      error: error.message
    });
  }
};

// Cập nhật thông tin mật thư
exports.update = async (req, res) => {
  try {
    console.log('Yêu cầu cập nhật mật thư ID:', req.params.id);
    
    // Tìm mật thư hiện có
    const secretMessage = await SecretMessage.findById(req.params.id);
    
    if (!secretMessage) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mật thư'
      });
    }
    
    // Lấy dữ liệu từ request body
    const { 
      name, 
      title,
      teamNote, 
      content, 
      contentType, 
      fontSize, 
      fontWeight, 
      lineHeight, 
      letterSpacing, 
      paragraphSpacing,
      correctAnswer,
      userInfoFields,
      ottContent,
      nwContent,
      showText,
      showImage,
      showOTT,
      showNW,
      maxAttempts
    } = req.body;
    
    // Kiểm tra quyền sở hữu nếu có admin
    if (req.admin && secretMessage.adminId.toString() !== req.admin.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền chỉnh sửa mật thư này'
      });
    }
    
    // Cập nhật thông tin
    secretMessage.name = name || secretMessage.name;
    secretMessage.title = title !== undefined ? title : secretMessage.title;
    secretMessage.teamNote = teamNote !== undefined ? teamNote : secretMessage.teamNote;
    
    // Cập nhật nội dung
    if (content !== undefined) {
      secretMessage.content = content;
    }
    
    secretMessage.contentType = contentType || secretMessage.contentType;
    secretMessage.fontSize = fontSize || secretMessage.fontSize;
    secretMessage.fontWeight = fontWeight || secretMessage.fontWeight;
    secretMessage.lineHeight = lineHeight || secretMessage.lineHeight;
    secretMessage.letterSpacing = letterSpacing || secretMessage.letterSpacing;
    secretMessage.paragraphSpacing = paragraphSpacing || secretMessage.paragraphSpacing || '0.8rem';
    
    if (correctAnswer !== undefined) {
      secretMessage.correctAnswer = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
    }
    
    // Cập nhật các trường mới nếu có
    if (userInfoFields !== undefined) {
      secretMessage.userInfoFields = Array.isArray(userInfoFields) ? userInfoFields : [];
    }
    
    if (ottContent !== undefined) {
      secretMessage.ottContent = ottContent;
    }
    
    if (nwContent !== undefined) {
      secretMessage.nwContent = nwContent;
    }
    
    if (showText !== undefined) {
      secretMessage.showText = showText;
    }
    
    if (showImage !== undefined) {
      secretMessage.showImage = showImage;
    }
    
    if (showOTT !== undefined) {
      secretMessage.showOTT = showOTT;
    }
    
    if (showNW !== undefined) {
      secretMessage.showNW = showNW;
    }
    
    if (maxAttempts !== undefined) {
      secretMessage.maxAttempts = maxAttempts;
    }
    
    console.log('Đang lưu mật thư với dữ liệu:', {
      name: secretMessage.name,
      ottContent: secretMessage.ottContent?.substring(0, 50) + '...'
    });
    
    await secretMessage.save();

    // Ghi log nếu có admin
    if (req.admin) {
      try {
        await new SystemLog({
          action: 'UPDATE_SECRET_MESSAGE',
          adminId: req.admin.id,
          details: `Admin đã cập nhật mật thư: ${name}`,
          metadata: { secretMessageId: secretMessage._id }
        }).save();
      } catch (logError) {
        console.error('Error saving log:', logError);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật mật thư thành công',
      data: secretMessage
    });
  } catch (error) {
    console.error('Error updating secret message:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật mật thư',
      error: error.message
    });
  }
};

// Xóa mật thư
exports.delete = async (req, res) => {
  try {
    console.log('Yêu cầu xóa mật thư ID:', req.params.id);
    
    // Tìm mật thư theo ID
    const secretMessage = await SecretMessage.findById(req.params.id);
    
    if (!secretMessage) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mật thư'
      });
    }
    
    // Kiểm tra quyền sở hữu nếu có admin
    if (req.admin && secretMessage.adminId.toString() !== req.admin.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa mật thư này'
      });
    }
    
    // Xóa mật thư
    await SecretMessage.findByIdAndDelete(req.params.id);
    console.log('Đã xóa mật thư thành công:', req.params.id);

    // Ghi log nếu có admin
    if (req.admin) {
      try {
        await new SystemLog({
          action: 'DELETE_SECRET_MESSAGE',
          adminId: req.admin.id,
          details: `Admin đã xóa mật thư: ${secretMessage.name}`,
          metadata: { secretMessageId: secretMessage._id }
        }).save();
      } catch (logError) {
        console.error('Error saving log:', logError);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Xóa mật thư thành công'
    });
  } catch (error) {
    console.error('Error deleting secret message:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa mật thư',
      error: error.message
    });
  }
}; 