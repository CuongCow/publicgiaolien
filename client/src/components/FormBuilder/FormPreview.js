import React, { useState } from 'react';
import { Card, Form, Button, ProgressBar, Alert } from 'react-bootstrap';
import { getQuestionTypeIcon, getDefaultAnswerForQuestion } from './QuestionTypes';

const FormPreview = ({ formTitle, formDescription, questions, sections, settings }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Khởi tạo câu trả lời mặc định khi questions thay đổi
  React.useEffect(() => {
    const defaultAnswers = {};
    questions.forEach((question) => {
      if (!answers[question._id]) {
        defaultAnswers[question._id] = getDefaultAnswerForQuestion(question.type);
      }
    });
    setAnswers({ ...answers, ...defaultAnswers });
  }, [questions]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
    
    // Xóa lỗi nếu đã nhập giá trị
    if (formErrors[questionId] && value) {
      const newFormErrors = { ...formErrors };
      delete newFormErrors[questionId];
      setFormErrors(newFormErrors);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Kiểm tra email
    if (settings.collectEmail && !email.trim()) {
      errors.email = 'Vui lòng nhập địa chỉ email';
    }
    
    // Kiểm tra các câu hỏi bắt buộc
    questions.forEach((question) => {
      if (question.required) {
        const answer = answers[question._id];
        
        // Kiểm tra dựa vào loại câu hỏi
        switch (question.type) {
          case 'multiple_choice':
          case 'dropdown':
            if (!answer) {
              errors[question._id] = 'Vui lòng chọn một lựa chọn';
            }
            break;
          case 'checkbox':
            if (!answer || answer.length === 0) {
              errors[question._id] = 'Vui lòng chọn ít nhất một lựa chọn';
            }
            break;
          case 'short_answer':
          case 'paragraph':
            if (!answer || !answer.trim()) {
              errors[question._id] = 'Vui lòng nhập câu trả lời';
            }
            break;
          default:
            break;
        }
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Kiểm tra hợp lệ
    if (validateForm()) {
      // Trong thực tế, đây là nơi gửi dữ liệu đến API
      console.log('Form data:', { email, answers });
      
      // Hiển thị thông báo thành công
      setSubmitted(true);
      
      // Trong trường hợp có URL chuyển hướng
      if (settings.redirectUrl) {
        setTimeout(() => {
          window.location.href = settings.redirectUrl;
        }, 2000);
      }
    }
  };

  // Render câu hỏi theo loại
  const renderQuestion = (question) => {
    const { _id, type, title, description, options, required, settings: questionSettings } = question;
    const error = formErrors[_id];
    
    switch (type) {
      case 'multiple_choice':
        return (
          <Form.Group className="mb-4">
            <Form.Label>
              {title}
              {required && <span className="text-danger ms-1">*</span>}
            </Form.Label>
            {description && <div className="text-muted mb-2 small">{description}</div>}
            
            {questionSettings?.multipleAnswers ? (
              // Multiple selection
              options.map((option, index) => (
                <Form.Check
                  key={index}
                  type="checkbox"
                  id={`mc-${_id}-${index}`}
                  label={option.text}
                  checked={Array.isArray(answers[_id]) && answers[_id].includes(option.value)}
                  onChange={(e) => {
                    const newValues = [...(answers[_id] || [])];
                    if (e.target.checked) {
                      newValues.push(option.value);
                    } else {
                      const idx = newValues.indexOf(option.value);
                      if (idx > -1) newValues.splice(idx, 1);
                    }
                    handleAnswerChange(_id, newValues);
                  }}
                  className="mb-2"
                />
              ))
            ) : (
              // Single selection
              options.map((option, index) => (
                <Form.Check
                  key={index}
                  type="radio"
                  name={`mc-${_id}`}
                  id={`mc-${_id}-${index}`}
                  label={option.text}
                  checked={answers[_id] === option.value}
                  onChange={() => handleAnswerChange(_id, option.value)}
                  className="mb-2"
                />
              ))
            )}
            
            {questionSettings?.allowOther && (
              <Form.Check
                type={questionSettings?.multipleAnswers ? "checkbox" : "radio"}
                name={`mc-${_id}`}
                id={`mc-${_id}-other`}
                label={
                  <div className="d-flex align-items-center">
                    <span>Khác:</span>
                    <Form.Control
                      type="text"
                      size="sm"
                      className="ms-2"
                      placeholder="Nhập câu trả lời khác"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        if (questionSettings?.multipleAnswers) {
                          // For checkbox
                          const newValues = [...(answers[_id] || [])];
                          if (!newValues.includes('other')) {
                            newValues.push('other');
                          }
                          handleAnswerChange(_id, newValues);
                        } else {
                          // For radio
                          handleAnswerChange(_id, 'other');
                        }
                      }}
                    />
                  </div>
                }
              />
            )}
            
            {error && <div className="text-danger small mt-1">{error}</div>}
          </Form.Group>
        );
        
      case 'checkbox':
        return (
          <Form.Group className="mb-4">
            <Form.Label>
              {title}
              {required && <span className="text-danger ms-1">*</span>}
            </Form.Label>
            {description && <div className="text-muted mb-2 small">{description}</div>}
            
            {options.map((option, index) => (
              <Form.Check
                key={index}
                type="checkbox"
                id={`cb-${_id}-${index}`}
                label={option.text}
                checked={Array.isArray(answers[_id]) && answers[_id].includes(option.value)}
                onChange={(e) => {
                  const newValues = [...(answers[_id] || [])];
                  if (e.target.checked) {
                    newValues.push(option.value);
                  } else {
                    const idx = newValues.indexOf(option.value);
                    if (idx > -1) newValues.splice(idx, 1);
                  }
                  handleAnswerChange(_id, newValues);
                }}
                className="mb-2"
              />
            ))}
            
            {questionSettings?.allowOther && (
              <Form.Check
                type="checkbox"
                id={`cb-${_id}-other`}
                label={
                  <div className="d-flex align-items-center">
                    <span>Khác:</span>
                    <Form.Control
                      type="text"
                      size="sm"
                      className="ms-2"
                      placeholder="Nhập câu trả lời khác"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const newValues = [...(answers[_id] || [])];
                        if (!newValues.includes('other')) {
                          newValues.push('other');
                        }
                        handleAnswerChange(_id, newValues);
                      }}
                    />
                  </div>
                }
              />
            )}
            
            {error && <div className="text-danger small mt-1">{error}</div>}
          </Form.Group>
        );
        
      case 'dropdown':
        return (
          <Form.Group className="mb-4">
            <Form.Label>
              {title}
              {required && <span className="text-danger ms-1">*</span>}
            </Form.Label>
            {description && <div className="text-muted mb-2 small">{description}</div>}
            
            <Form.Select
              value={answers[_id] || ''}
              onChange={(e) => handleAnswerChange(_id, e.target.value)}
              isInvalid={!!error}
            >
              <option value="">-- Chọn một lựa chọn --</option>
              {options.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.text}
                </option>
              ))}
            </Form.Select>
            
            {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
          </Form.Group>
        );
        
      case 'short_answer':
        return (
          <Form.Group className="mb-4">
            <Form.Label>
              {title}
              {required && <span className="text-danger ms-1">*</span>}
            </Form.Label>
            {description && <div className="text-muted mb-2 small">{description}</div>}
            
            <Form.Control
              type="text"
              value={answers[_id] || ''}
              onChange={(e) => handleAnswerChange(_id, e.target.value)}
              placeholder="Nhập câu trả lời ngắn"
              isInvalid={!!error}
              maxLength={questionSettings?.maxLength || 100}
            />
            
            {questionSettings?.maxLength && (
              <Form.Text className="text-muted">
                Tối đa {questionSettings.maxLength} ký tự
              </Form.Text>
            )}
            
            {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
          </Form.Group>
        );
        
      case 'paragraph':
        return (
          <Form.Group className="mb-4">
            <Form.Label>
              {title}
              {required && <span className="text-danger ms-1">*</span>}
            </Form.Label>
            {description && <div className="text-muted mb-2 small">{description}</div>}
            
            <Form.Control
              as="textarea"
              rows={3}
              value={answers[_id] || ''}
              onChange={(e) => handleAnswerChange(_id, e.target.value)}
              placeholder="Nhập câu trả lời dài"
              isInvalid={!!error}
              maxLength={questionSettings?.maxLength || 500}
            />
            
            {questionSettings?.maxLength && (
              <Form.Text className="text-muted">
                Tối đa {questionSettings.maxLength} ký tự
              </Form.Text>
            )}
            
            {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
          </Form.Group>
        );
        
      default:
        return null;
    }
  };

  // Xác định style dựa trên themes
  const customStyle = {
    fontFamily: settings.customTheme?.fontFamily || 'Roboto, sans-serif',
    backgroundColor: settings.customTheme?.backgroundColor || '#ffffff',
    '--primary-color': settings.customTheme?.primaryColor || '#0d6efd'
  };

  // Nếu đã gửi form, hiển thị thông báo thành công
  if (submitted) {
    return (
      <Card style={{ ...customStyle, maxWidth: '800px', margin: '0 auto' }}>
        <Card.Body className="text-center py-5">
          <i className="bi bi-check-circle-fill text-success fs-1"></i>
          <h4 className="mt-3 mb-3">{settings.confirmationMessage}</h4>
          
          {settings.redirectUrl && (
            <p className="text-muted">
              Bạn sẽ được chuyển hướng trong giây lát...
            </p>
          )}
          
          <Button 
            variant="outline-primary" 
            onClick={() => setSubmitted(false)}
            className="mt-3"
          >
            Quay lại biểu mẫu
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="form-preview">
      <Card style={{ ...customStyle, maxWidth: '800px', margin: '0 auto' }}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <div className="text-center mb-4">
              <h3>{formTitle || 'Tiêu đề biểu mẫu'}</h3>
              {formDescription && <p className="text-muted">{formDescription}</p>}
            </div>
            
            {settings.showProgressBar && questions.length > 0 && (
              <ProgressBar 
                now={100} 
                variant="primary" 
                className="mb-4" 
                style={{ '--bs-progress-bar-bg': customStyle['--primary-color'] }}
              />
            )}
            
            {/* Email field if required */}
            {settings.collectEmail && (
              <Form.Group className="mb-4">
                <Form.Label>
                  Email
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email của bạn"
                  isInvalid={!!formErrors.email}
                />
                {formErrors.email && (
                  <Form.Control.Feedback type="invalid">
                    {formErrors.email}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            )}
            
            {/* Questions */}
            {questions.map((question) => (
              <div key={question._id || `preview-${question.order}`} className="question-item">
                {renderQuestion(question)}
              </div>
            ))}
            
            <div className="d-grid mt-4">
              <Button 
                type="submit" 
                variant="primary"
                size="lg"
                style={{ backgroundColor: customStyle['--primary-color'], borderColor: customStyle['--primary-color'] }}
              >
                Gửi biểu mẫu
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FormPreview; 