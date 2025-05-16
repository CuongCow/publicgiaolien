import React from 'react';

// Danh sách các loại câu hỏi hỗ trợ
export const QUESTION_TYPES = [
  {
    id: 'multiple_choice',
    name: 'Trắc nghiệm',
    icon: 'bi-list-check',
    description: 'Câu hỏi với các lựa chọn, chọn một hoặc nhiều đáp án'
  },
  {
    id: 'short_answer',
    name: 'Câu trả lời ngắn',
    icon: 'bi-input-cursor-text',
    description: 'Yêu cầu câu trả lời ngắn gọn'
  },
  {
    id: 'paragraph',
    name: 'Đoạn văn',
    icon: 'bi-textarea-t',
    description: 'Yêu cầu câu trả lời dài, nhiều dòng'
  },
  {
    id: 'checkbox',
    name: 'Hộp kiểm',
    icon: 'bi-check-square',
    description: 'Cho phép người dùng chọn nhiều lựa chọn'
  },
  {
    id: 'dropdown',
    name: 'Danh sách thả xuống',
    icon: 'bi-menu-down',
    description: 'Chọn một lựa chọn từ danh sách thả xuống'
  }
];

// Helper hiển thị icon theo loại câu hỏi
export const getQuestionTypeIcon = (type) => {
  const questionType = QUESTION_TYPES.find(q => q.id === type);
  return questionType ? questionType.icon : 'bi-question-square';
};

// Helper lấy tên loại câu hỏi
export const getQuestionTypeName = (type) => {
  const questionType = QUESTION_TYPES.find(q => q.id === type);
  return questionType ? questionType.name : 'Không xác định';
};

// Helper tạo câu hỏi mới theo loại
export const createNewQuestion = (type, order = 0) => {
  const baseQuestion = {
    type,
    title: '',
    description: '',
    required: false,
    order
  };

  // Thêm các thuộc tính đặc thù theo loại câu hỏi
  switch (type) {
    case 'multiple_choice':
    case 'checkbox':
    case 'dropdown':
      return {
        ...baseQuestion,
        options: [
          { text: 'Lựa chọn 1', value: 'option_1' },
          { text: 'Lựa chọn 2', value: 'option_2' }
        ],
        settings: {
          allowOther: false,
          multipleAnswers: type === 'multiple_choice',
          otherLabel: 'Khác'
        }
      };
    case 'short_answer':
      return {
        ...baseQuestion,
        settings: {
          maxLength: 100
        }
      };
    case 'paragraph':
      return {
        ...baseQuestion,
        settings: {
          maxLength: 500
        }
      };
    default:
      return baseQuestion;
  }
};

// Helper tạo giá trị mặc định theo loại câu hỏi
export const getDefaultAnswerForQuestion = (questionType) => {
  switch (questionType) {
    case 'multiple_choice':
      return '';
    case 'checkbox':
      return [];
    case 'dropdown':
      return '';
    case 'short_answer':
    case 'paragraph':
      return '';
    default:
      return null;
  }
};

// Component hiển thị danh sách các loại câu hỏi
const QuestionTypes = ({ onSelectType }) => {
  return (
    <div className="question-types-list">
      <h6 className="mb-3">Chọn loại câu hỏi:</h6>
      <div className="list-group">
        {QUESTION_TYPES.map(type => (
          <button
            key={type.id}
            className="list-group-item list-group-item-action d-flex align-items-center"
            onClick={() => onSelectType(type.id)}
          >
            <i className={`bi ${type.icon} me-3 fs-5`}></i>
            <div>
              <div className="fw-bold">{type.name}</div>
              <small className="text-muted">{type.description}</small>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionTypes; 