import React, { useState } from 'react';
import { Card, Form, Button, InputGroup, ListGroup } from 'react-bootstrap';
import { getQuestionTypeIcon, getQuestionTypeName } from './QuestionTypes';

const QuestionEditor = ({ question, onChange, onDelete, index }) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleChange = (field, value) => {
    onChange({ ...question, [field]: value });
  };

  const handleSettingsChange = (field, value) => {
    onChange({
      ...question,
      settings: {
        ...question.settings,
        [field]: value
      }
    });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...question.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    
    // Cập nhật giá trị value tự động nếu không có
    if (field === 'text' && !newOptions[index].value) {
      newOptions[index].value = `option_${index + 1}`;
    }
    
    onChange({ ...question, options: newOptions });
  };

  const handleAddOption = () => {
    const newOptions = [...question.options];
    const optionNumber = newOptions.length + 1;
    newOptions.push({ text: `Lựa chọn ${optionNumber}`, value: `option_${optionNumber}` });
    onChange({ ...question, options: newOptions });
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...question.options];
    newOptions.splice(index, 1);
    onChange({ ...question, options: newOptions });
  };

  // Render các tùy chọn cho câu hỏi trắc nghiệm, checkbox, dropdown
  const renderOptions = () => {
    if (!['multiple_choice', 'checkbox', 'dropdown'].includes(question.type)) {
      return null;
    }

    return (
      <div className="mt-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Form.Label>Các lựa chọn:</Form.Label>
          <Button
            variant="link"
            size="sm"
            className="p-0 text-decoration-none"
            onClick={() => setShowOptions(!showOptions)}
          >
            {showOptions ? 'Ẩn tùy chọn' : 'Hiển thị tùy chọn'}
          </Button>
        </div>

        <ListGroup className="mb-3">
          {question.options.map((option, optionIndex) => (
            <ListGroup.Item key={optionIndex} className="p-2">
              <InputGroup size="sm">
                <InputGroup.Text>
                  {question.type === 'multiple_choice' && <i className="bi bi-circle me-1"></i>}
                  {question.type === 'checkbox' && <i className="bi bi-square me-1"></i>}
                  {question.type === 'dropdown' && <i className="bi bi-caret-down me-1"></i>}
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(optionIndex, 'text', e.target.value)}
                  placeholder={`Lựa chọn ${optionIndex + 1}`}
                />
                <Button 
                  variant="outline-danger" 
                  onClick={() => handleRemoveOption(optionIndex)}
                  disabled={question.options.length <= 1}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </InputGroup>
              
              {showOptions && (
                <InputGroup size="sm" className="mt-1">
                  <InputGroup.Text>Giá trị</InputGroup.Text>
                  <Form.Control
                    type="text"
                    value={option.value}
                    onChange={(e) => handleOptionChange(optionIndex, 'value', e.target.value)}
                    placeholder="Giá trị nội bộ"
                  />
                </InputGroup>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>

        <Button variant="outline-secondary" size="sm" onClick={handleAddOption} className="mb-3">
          <i className="bi bi-plus-circle me-1"></i> Thêm lựa chọn
        </Button>
        
        {(question.type === 'multiple_choice' || question.type === 'checkbox') && (
          <Form.Check
            type="switch"
            id={`allow-other-${index}`}
            label="Cho phép lựa chọn 'Khác'"
            checked={question.settings?.allowOther || false}
            onChange={(e) => handleSettingsChange('allowOther', e.target.checked)}
            className="mb-2"
          />
        )}
        
        {question.type === 'multiple_choice' && (
          <Form.Check
            type="switch"
            id={`multiple-answers-${index}`}
            label="Cho phép chọn nhiều đáp án"
            checked={question.settings?.multipleAnswers || false}
            onChange={(e) => handleSettingsChange('multipleAnswers', e.target.checked)}
          />
        )}
      </div>
    );
  };

  // Render các cài đặt cho câu trả lời ngắn và đoạn văn
  const renderTextSettings = () => {
    if (!['short_answer', 'paragraph'].includes(question.type)) {
      return null;
    }

    return (
      <Form.Group className="mt-3">
        <Form.Label>Độ dài tối đa:</Form.Label>
        <Form.Control
          type="number"
          min="1"
          max="10000"
          value={question.settings?.maxLength || (question.type === 'short_answer' ? 100 : 500)}
          onChange={(e) => handleSettingsChange('maxLength', parseInt(e.target.value))}
          size="sm"
        />
        <Form.Text className="text-muted">
          {question.type === 'short_answer' 
            ? 'Giới hạn số ký tự cho câu trả lời ngắn' 
            : 'Giới hạn số ký tự cho đoạn văn'}
        </Form.Text>
      </Form.Group>
    );
  };

  return (
    <Card className="mb-3 question-editor">
      <Card.Header className="d-flex justify-content-between align-items-center bg-light py-2">
        <div className="d-flex align-items-center">
          <i className={`bi ${getQuestionTypeIcon(question.type)} me-2`}></i>
          <span>{getQuestionTypeName(question.type)} #{index + 1}</span>
        </div>
        <Button variant="outline-danger" size="sm" onClick={onDelete}>
          <i className="bi bi-trash"></i>
        </Button>
      </Card.Header>

      <Card.Body>
        <Form.Group className="mb-3">
          <Form.Label>Tiêu đề câu hỏi:</Form.Label>
          <Form.Control
            type="text"
            value={question.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Nhập tiêu đề câu hỏi"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Mô tả (tùy chọn):</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={question.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Nhập mô tả hoặc hướng dẫn cho câu hỏi"
          />
        </Form.Group>

        {renderOptions()}
        {renderTextSettings()}

        <Form.Check
          type="switch"
          id={`required-${index}`}
          label="Bắt buộc trả lời"
          checked={question.required}
          onChange={(e) => handleChange('required', e.target.checked)}
          className="mt-3"
        />
      </Card.Body>
    </Card>
  );
};

export default QuestionEditor; 