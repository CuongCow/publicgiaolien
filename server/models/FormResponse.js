const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema cho câu trả lời của từng câu hỏi
const QuestionResponseSchema = new Schema({
  questionId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  questionType: {
    type: String,
    enum: ['multiple_choice', 'short_answer', 'paragraph', 'checkbox', 'dropdown'],
    required: true
  },
  questionTitle: {
    type: String,
    required: true
  },
  answer: {
    type: Schema.Types.Mixed, // Có thể là string, array hoặc object tùy vào loại câu hỏi
    default: null
  }
});

// Schema chính cho phản hồi biểu mẫu
const FormResponseSchema = new Schema({
  formId: {
    type: Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  formTitle: {
    type: String,
    required: true
  },
  formSlug: {
    type: String,
    required: true
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  email: {
    type: String,
    trim: true
  },
  respondentInfo: {
    name: String,
    ipAddress: String,
    userAgent: String,
    deviceInfo: String
  },
  responses: [QuestionResponseSchema],
  status: {
    type: String,
    enum: ['new', 'viewed', 'processed', 'archived'],
    default: 'new'
  },
  notes: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware trước khi lưu để cập nhật updatedAt
FormResponseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware sau khi lưu để tăng responsesCount trong Form
FormResponseSchema.post('save', async function() {
  try {
    const Form = mongoose.model('Form');
    await Form.updateOne(
      { _id: this.formId },
      { $inc: { responsesCount: 1 } }
    );
  } catch (error) {
    console.error('Lỗi khi cập nhật số lượng phản hồi:', error);
  }
});

module.exports = mongoose.model('FormResponse', FormResponseSchema); 