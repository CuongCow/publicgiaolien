const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema cho câu hỏi trong biểu mẫu
const QuestionSchema = new Schema({
  type: {
    type: String,
    enum: ['multiple_choice', 'short_answer', 'paragraph', 'checkbox', 'dropdown'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  options: [{
    text: String,
    value: String
  }],
  settings: {
    allowOther: Boolean,
    multipleAnswers: Boolean,
    otherLabel: String,
    maxLength: Number
  }
});

// Schema cho phần riêng biệt trong biểu mẫu
const SectionSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  questions: [QuestionSchema]
});

// Schema chính cho biểu mẫu
const FormSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  published: {
    type: Boolean,
    default: false
  },
  settings: {
    collectEmail: {
      type: Boolean,
      default: false
    },
    allowAnonymous: {
      type: Boolean,
      default: true
    },
    confirmationMessage: {
      type: String,
      default: 'Cảm ơn bạn đã gửi phản hồi!'
    },
    showProgressBar: {
      type: Boolean,
      default: true
    },
    redirectUrl: {
      type: String
    },
    notifyEmail: {
      type: Boolean,
      default: false
    },
    customTheme: {
      primaryColor: {
        type: String,
        default: '#0d6efd'
      },
      backgroundColor: {
        type: String,
        default: '#ffffff'
      },
      fontFamily: {
        type: String,
        default: 'Roboto, sans-serif'
      }
    }
  },
  sections: [SectionSchema],
  questions: [QuestionSchema], // Cho những câu hỏi không thuộc phần nào
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  responsesCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware trước khi lưu để cập nhật updatedAt
FormSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Đảm bảo slug là duy nhất
FormSchema.path('slug').validate(async function(value) {
  const Form = mongoose.model('Form');
  const count = await Form.countDocuments({
    slug: value,
    _id: { $ne: this._id },
    adminId: this.adminId
  });
  return count === 0;
}, 'Slug đã tồn tại, vui lòng chọn slug khác');

module.exports = mongoose.model('Form', FormSchema); 