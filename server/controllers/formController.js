const Form = require('../models/Form');
const FormResponse = require('../models/FormResponse');
const mongoose = require('mongoose');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');

// Hàm tạo slug từ title và thêm id ngẫu nhiên để đảm bảo duy nhất
const generateSlug = (title) => {
  const baseSlug = slugify(title, {
    lower: true,
    strict: true,
    trim: true
  });
  const shortId = uuidv4().substring(0, 8);
  return `${baseSlug}-${shortId}`;
};

// Lấy tất cả biểu mẫu của admin đăng nhập
exports.getAllForms = async (req, res) => {
  try {
    const forms = await Form.find({ adminId: req.admin.id })
      .select('title description slug published responsesCount createdAt updatedAt')
      .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      data: forms
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách biểu mẫu:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách biểu mẫu'
    });
  }
};

// Lấy chi tiết biểu mẫu theo ID
exports.getFormById = async (req, res) => {
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      adminId: req.admin.id
    });
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy biểu mẫu'
      });
    }
    
    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết biểu mẫu:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy chi tiết biểu mẫu'
    });
  }
};

// Tạo biểu mẫu mới
exports.createForm = async (req, res) => {
  try {
    const { title, description, questions, sections, settings, published } = req.body;
    
    // Tạo slug từ title
    const slug = req.body.slug || generateSlug(title);
    
    const newForm = new Form({
      title,
      description,
      slug,
      questions: questions || [],
      sections: sections || [],
      settings: settings || {},
      published: published || false,
      adminId: req.admin.id
    });
    
    const savedForm = await newForm.save();
    
    res.status(201).json({
      success: true,
      data: savedForm
    });
  } catch (error) {
    console.error('Lỗi khi tạo biểu mẫu:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tạo biểu mẫu'
    });
  }
};

// Cập nhật biểu mẫu
exports.updateForm = async (req, res) => {
  try {
    const { title, description, questions, sections, settings, published, slug } = req.body;
    
    const form = await Form.findOne({
      _id: req.params.id,
      adminId: req.admin.id
    });
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy biểu mẫu'
      });
    }
    
    // Cập nhật thông tin biểu mẫu
    if (title) form.title = title;
    if (description !== undefined) form.description = description;
    if (questions) form.questions = questions;
    if (sections) form.sections = sections;
    if (settings) form.settings = { ...form.settings, ...settings };
    if (published !== undefined) form.published = published;
    if (slug) form.slug = slug;
    
    const updatedForm = await form.save();
    
    res.json({
      success: true,
      data: updatedForm
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật biểu mẫu:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi cập nhật biểu mẫu'
    });
  }
};

// Xóa biểu mẫu
exports.deleteForm = async (req, res) => {
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      adminId: req.admin.id
    });
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy biểu mẫu'
      });
    }
    
    // Xóa tất cả phản hồi của biểu mẫu
    await FormResponse.deleteMany({ formId: form._id });
    
    // Xóa biểu mẫu
    await Form.deleteOne({ _id: form._id });
    
    res.json({
      success: true,
      message: 'Đã xóa biểu mẫu và tất cả phản hồi liên quan'
    });
  } catch (error) {
    console.error('Lỗi khi xóa biểu mẫu:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xóa biểu mẫu'
    });
  }
};

// Lấy biểu mẫu công khai theo slug
exports.getPublicFormBySlug = async (req, res) => {
  try {
    const form = await Form.findOne({
      slug: req.params.slug,
      published: true
    }).select('-adminId');
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy biểu mẫu hoặc biểu mẫu chưa được công khai'
      });
    }
    
    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    console.error('Lỗi khi lấy biểu mẫu công khai:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy biểu mẫu công khai'
    });
  }
};

// Gửi phản hồi biểu mẫu
exports.submitFormResponse = async (req, res) => {
  try {
    const { responses, email } = req.body;
    
    // Tìm biểu mẫu theo slug
    const form = await Form.findOne({
      slug: req.params.slug,
      published: true
    });
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy biểu mẫu hoặc biểu mẫu chưa được công khai'
      });
    }
    
    // Kiểm tra các câu hỏi bắt buộc đã được trả lời chưa
    const requiredQuestions = [];
    
    // Kiểm tra câu hỏi bắt buộc trong các phần
    form.sections.forEach(section => {
      section.questions.forEach(question => {
        if (question.required) {
          requiredQuestions.push(question._id.toString());
        }
      });
    });
    
    // Kiểm tra câu hỏi bắt buộc không thuộc phần nào
    form.questions.forEach(question => {
      if (question.required) {
        requiredQuestions.push(question._id.toString());
      }
    });
    
    // Kiểm tra xem tất cả câu hỏi bắt buộc đều có câu trả lời
    const answeredQuestions = responses.map(r => r.questionId.toString());
    const missingRequiredQuestions = requiredQuestions.filter(q => !answeredQuestions.includes(q));
    
    if (missingRequiredQuestions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng trả lời tất cả câu hỏi bắt buộc'
      });
    }
    
    // Kiểm tra email nếu biểu mẫu yêu cầu
    if (form.settings.collectEmail && !email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email của bạn'
      });
    }
    
    // Tạo đối tượng phản hồi mới
    const formResponse = new FormResponse({
      formId: form._id,
      formTitle: form.title,
      formSlug: form.slug,
      adminId: form.adminId,
      email: email || null,
      respondentInfo: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        deviceInfo: req.headers['user-agent']
      },
      responses: responses.map(response => {
        // Tìm thông tin câu hỏi từ form
        let question = null;
        
        // Tìm trong các phần
        for (const section of form.sections) {
          const foundQuestion = section.questions.find(q => q._id.toString() === response.questionId);
          if (foundQuestion) {
            question = foundQuestion;
            break;
          }
        }
        
        // Nếu không tìm thấy trong các phần, tìm trong danh sách câu hỏi chung
        if (!question) {
          question = form.questions.find(q => q._id.toString() === response.questionId);
        }
        
        if (!question) {
          return null; // Bỏ qua câu hỏi không tồn tại
        }
        
        return {
          questionId: question._id,
          questionType: question.type,
          questionTitle: question.title,
          answer: response.answer
        };
      }).filter(Boolean) // Loại bỏ các câu hỏi null
    });
    
    await formResponse.save();
    
    res.status(201).json({
      success: true,
      message: form.settings.confirmationMessage || 'Cảm ơn bạn đã gửi phản hồi!',
      redirectUrl: form.settings.redirectUrl || null
    });
  } catch (error) {
    console.error('Lỗi khi gửi phản hồi biểu mẫu:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi gửi phản hồi biểu mẫu'
    });
  }
};

// Lấy danh sách phản hồi của biểu mẫu
exports.getFormResponses = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    // Kiểm tra quyền truy cập biểu mẫu
    const form = await Form.findOne({
      _id: req.params.id,
      adminId: req.admin.id
    });
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy biểu mẫu'
      });
    }
    
    // Đếm tổng số phản hồi
    const total = await FormResponse.countDocuments({ formId: form._id });
    
    // Lấy danh sách phản hồi theo phân trang
    const responses = await FormResponse.find({ formId: form._id })
      .select('email status submittedAt responses')
      .sort({ submittedAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);
    
    res.json({
      success: true,
      data: {
        responses,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber)
        }
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phản hồi:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách phản hồi'
    });
  }
};

// Lấy chi tiết phản hồi
exports.getFormResponseById = async (req, res) => {
  try {
    const { formId, responseId } = req.params;
    
    // Kiểm tra form có thuộc về admin không
    const form = await Form.findOne({
      _id: formId,
      adminId: req.admin.id
    });
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy biểu mẫu'
      });
    }
    
    // Lấy chi tiết phản hồi
    const response = await FormResponse.findOne({
      _id: responseId,
      formId: form._id
    });
    
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phản hồi'
      });
    }
    
    // Cập nhật trạng thái thành đã xem nếu là mới
    if (response.status === 'new') {
      response.status = 'viewed';
      await response.save();
    }
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết phản hồi:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy chi tiết phản hồi'
    });
  }
};

// Cập nhật trạng thái phản hồi
exports.updateResponseStatus = async (req, res) => {
  try {
    const { responseId } = req.params;
    const { status, notes } = req.body;
    
    // Tìm phản hồi
    const response = await FormResponse.findById(responseId);
    
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phản hồi'
      });
    }
    
    // Kiểm tra quyền sở hữu
    if (response.adminId.toString() !== req.admin.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật phản hồi này'
      });
    }
    
    // Cập nhật trạng thái và ghi chú
    if (status) response.status = status;
    if (notes !== undefined) response.notes = notes;
    
    await response.save();
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái phản hồi:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi cập nhật trạng thái phản hồi'
    });
  }
};

// Xuất phản hồi dạng CSV
exports.exportFormResponses = async (req, res) => {
  try {
    // Kiểm tra form có thuộc về admin không
    const form = await Form.findOne({
      _id: req.params.id,
      adminId: req.admin.id
    });
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy biểu mẫu'
      });
    }
    
    // Lấy tất cả phản hồi của biểu mẫu
    const responses = await FormResponse.find({ formId: form._id })
      .sort({ submittedAt: 1 });
    
    // Tạo tiêu đề cho file CSV
    let csvContent = 'ID,Email,Trạng thái,Thời gian gửi';
    
    // Tạo tiêu đề cho các câu hỏi
    const allQuestions = [];
    
    // Thêm câu hỏi từ các phần
    form.sections.forEach(section => {
      section.questions.forEach(question => {
        allQuestions.push(question);
      });
    });
    
    // Thêm câu hỏi không thuộc phần nào
    form.questions.forEach(question => {
      allQuestions.push(question);
    });
    
    // Sắp xếp câu hỏi theo thứ tự
    allQuestions.sort((a, b) => a.order - b.order);
    
    // Thêm tiêu đề cho các câu hỏi
    allQuestions.forEach(question => {
      csvContent += `,${question.title.replace(/,/g, ' ')}`;
    });
    
    csvContent += '\n';
    
    // Thêm dữ liệu từng phản hồi
    responses.forEach(response => {
      // Thông tin cơ bản
      csvContent += `${response._id},${response.email || ''},${response.status},${new Date(response.submittedAt).toLocaleString()}`;
      
      // Thêm câu trả lời cho từng câu hỏi
      allQuestions.forEach(question => {
        const questionId = question._id.toString();
        const questionResponse = response.responses.find(r => r.questionId.toString() === questionId);
        
        let answerValue = '';
        
        if (questionResponse) {
          if (Array.isArray(questionResponse.answer)) {
            answerValue = questionResponse.answer.join('; ').replace(/,/g, ' ');
          } else if (typeof questionResponse.answer === 'object' && questionResponse.answer !== null) {
            answerValue = JSON.stringify(questionResponse.answer).replace(/,/g, ' ');
          } else {
            answerValue = (questionResponse.answer || '').toString().replace(/,/g, ' ');
          }
        }
        
        csvContent += `,${answerValue}`;
      });
      
      csvContent += '\n';
    });
    
    // Đặt header cho response
    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', `attachment; filename=${form.slug}-responses.csv`);
    
    // Gửi nội dung CSV
    res.send(csvContent);
  } catch (error) {
    console.error('Lỗi khi xuất phản hồi biểu mẫu:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xuất phản hồi biểu mẫu'
    });
  }
};

// Cập nhật lại số lượng phản hồi cho biểu mẫu
exports.updateFormResponseCount = async (req, res) => {
  try {
    // Chỉ admin mới được phép cập nhật
    if (!req.admin || !req.admin.id) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }
    
    const formId = req.params.id;
    
    // Đếm số lượng phản hồi thực tế trong database
    const actualCount = await FormResponse.countDocuments({ formId });
    
    // Cập nhật lại trường responsesCount trong Form
    const form = await Form.findByIdAndUpdate(
      formId, 
      { responsesCount: actualCount },
      { new: true }
    );
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy biểu mẫu'
      });
    }
    
    res.json({
      success: true,
      data: {
        formId: form._id,
        title: form.title,
        previousCount: form.responsesCount,
        newCount: actualCount,
        updated: form.responsesCount !== actualCount
      }
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật số lượng phản hồi:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi cập nhật số lượng phản hồi'
    });
  }
}; 