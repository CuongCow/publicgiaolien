import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Form, Button, Spinner, ProgressBar } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formApi } from '../../services/api';
import { getDefaultAnswerForQuestion } from '../../components/FormBuilder/QuestionTypes';
import { toast } from 'react-toastify';

const PublicFormView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Tải thông tin form
  useEffect(() => {
    fetchForm();
  }, [slug]);
  
  const fetchForm = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await formApi.getPublicFormBySlug(slug);
      
      if (response.data && response.data.success) {
        const formData = response.data.data;
        setForm(formData);
        
        // Khởi tạo câu trả lời mặc định
        const defaultAnswers = {};
        formData.questions.forEach((question) => {
          defaultAnswers[question._id] = getDefaultAnswerForQuestion(question.type);
        });
        setResponses(defaultAnswers);
      } else {
        setError('Không tìm thấy biểu mẫu. Vui lòng kiểm tra lại đường dẫn.');
      }
    } catch (error) {
      console.error('Lỗi khi tải biểu mẫu:', error);
      
      if (error.response?.status === 404) {
        setError('Không tìm thấy biểu mẫu. Vui lòng kiểm tra lại đường dẫn.');
      } else {
        setError('Đã xảy ra lỗi khi tải biểu mẫu. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý thay đổi câu trả lời
  const handleAnswerChange = (questionId, value) => {
    setResponses({
      ...responses,
      [questionId]: value
    });
    
    // Xóa lỗi nếu đã nhập giá trị
    if (formErrors[questionId] && value) {
      const newFormErrors = { ...formErrors };
      delete newFormErrors[questionId];
      setFormErrors(newFormErrors);
    }
  };
  
  // Kiểm tra form hợp lệ
  const validateForm = () => {
    const errors = {};
    
    // Kiểm tra email
    if (form.settings?.collectEmail && !email.trim()) {
      errors.email = 'Vui lòng nhập địa chỉ email';
    }
    
    // Kiểm tra các câu hỏi bắt buộc
    form.questions.forEach((question) => {
      if (question.required) {
        const answer = responses[question._id];
        
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
  
  // Xử lý gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra hợp lệ
    if (!validateForm()) {
      // Cuộn đến phần tử lỗi đầu tiên
      const firstErrorId = Object.keys(formErrors)[0];
      if (firstErrorId) {
        const element = document.getElementById(firstErrorId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Chuẩn bị dữ liệu gửi đi
      const responseData = {
        email: email || null,
        responses: Object.keys(responses).map(questionId => {
          // Tìm câu hỏi trong danh sách questions
          let question = form.questions.find(q => q._id === questionId);
          
          // Nếu không tìm thấy trong questions, tìm trong sections
          if (!question && form.sections) {
            for (const section of form.sections) {
              if (section.questions) {
                question = section.questions.find(q => q._id === questionId);
                if (question) break;
              }
            }
          }
          
          if (!question) {
            console.error(`Không tìm thấy câu hỏi với ID: ${questionId}`);
            return null;
          }
          
          return {
            questionId,
            questionType: question.type,
            questionTitle: question.title,
            answer: responses[questionId]
          };
        }).filter(Boolean) // Loại bỏ các giá trị null/undefined
      };
      
      console.log('Đang gửi dữ liệu phản hồi:', responseData);
      
      // Gửi phản hồi
      const response = await formApi.submitFormResponse(slug, responseData);
      console.log('Phản hồi từ server:', response.data);
      
      if (response.data && response.data.success) {
        setSubmitted(true);
        
        // Chuyển hướng nếu có
        if (form.settings?.redirectUrl) {
          setTimeout(() => {
            window.location.href = form.settings.redirectUrl;
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi:', error);
      
      let errorMessage = 'Không thể gửi phản hồi. Vui lòng thử lại sau.';
      
      // Hiển thị thông báo lỗi cụ thể từ server nếu có
      if (error.response && error.response.data) {
        console.error('Chi tiết lỗi từ server:', error.response.data);
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Render câu hỏi theo loại
  const renderQuestion = (question) => {
    const { _id, type, title, description, options, required, settings: questionSettings } = question;
    const error = formErrors[_id];
    
    switch (type) {
      case 'multiple_choice':
        return (
          <Form.Group className="mb-4" id={_id}>
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
                  checked={Array.isArray(responses[_id]) && responses[_id].includes(option.value)}
                  onChange={(e) => {
                    const newValues = [...(responses[_id] || [])];
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
                  checked={responses[_id] === option.value}
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
                          const newValues = [...(responses[_id] || [])];
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
          <Form.Group className="mb-4" id={_id}>
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
                checked={Array.isArray(responses[_id]) && responses[_id].includes(option.value)}
                onChange={(e) => {
                  const newValues = [...(responses[_id] || [])];
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
                        const newValues = [...(responses[_id] || [])];
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
          <Form.Group className="mb-4" id={_id}>
            <Form.Label>
              {title}
              {required && <span className="text-danger ms-1">*</span>}
            </Form.Label>
            {description && <div className="text-muted mb-2 small">{description}</div>}
            
            <Form.Select
              value={responses[_id] || ''}
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
          <Form.Group className="mb-4" id={_id}>
            <Form.Label>
              {title}
              {required && <span className="text-danger ms-1">*</span>}
            </Form.Label>
            {description && <div className="text-muted mb-2 small">{description}</div>}
            
            <Form.Control
              type="text"
              value={responses[_id] || ''}
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
          <Form.Group className="mb-4" id={_id}>
            <Form.Label>
              {title}
              {required && <span className="text-danger ms-1">*</span>}
            </Form.Label>
            {description && <div className="text-muted mb-2 small">{description}</div>}
            
            <Form.Control
              as="textarea"
              rows={3}
              value={responses[_id] || ''}
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
  
  return (
    <>
      <div className="form-header py-2 bg-light border-bottom">
        <Container>
          <div className="d-flex align-items-center">
            <Link to="/" className="text-decoration-none">
              <i className="bi bi-house-door me-1"></i> Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <span className="text-muted">Biểu mẫu</span>
          </div>
        </Container>
      </div>
    
      {/* Loading state */}
      {loading ? (
        <Container className="mt-5 mb-5">
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Đang tải biểu mẫu...</p>
          </div>
        </Container>
      ) : error ? (
        <Container className="mt-5 mb-5">
          <Alert variant="danger" className="text-center py-4">
            <i className="bi bi-exclamation-triangle-fill fs-1 d-block mb-3"></i>
            <h4>{error}</h4>
            <Button 
              variant="primary" 
              onClick={fetchForm}
              className="mt-3"
            >
              Thử lại
            </Button>
          </Alert>
        </Container>
      ) : !form || !form.published ? (
        <Container className="mt-5 mb-5">
          <Alert variant="warning" className="text-center py-4">
            <i className="bi bi-eye-slash-fill fs-1 d-block mb-3"></i>
            <h4>Biểu mẫu này không còn khả dụng</h4>
            <p>Biểu mẫu này có thể đã bị xóa hoặc chưa được công khai.</p>
          </Alert>
        </Container>
      ) : submitted ? (
        <Container className="mt-5 mb-5">
          <Card style={{ 
            fontFamily: form.settings?.customTheme?.fontFamily || 'Roboto, sans-serif',
            backgroundColor: form.settings?.customTheme?.backgroundColor || '#ffffff',
            maxWidth: '800px', 
            margin: '0 auto' 
          }}>
            <Card.Body className="text-center py-5">
              <i className="bi bi-check-circle-fill text-success fs-1"></i>
              <h4 className="mt-3 mb-3">{form.settings?.confirmationMessage || 'Cảm ơn bạn đã gửi phản hồi!'}</h4>
              
              {form.settings?.redirectUrl && (
                <p className="text-muted">
                  Bạn sẽ được chuyển hướng trong giây lát...
                </p>
              )}
              
              <Button 
                variant="outline-primary" 
                onClick={() => {
                  setSubmitted(false);
                  setResponses({});
                  window.scrollTo(0, 0);
                }}
                className="mt-3"
              >
                Gửi lại phản hồi khác
              </Button>
            </Card.Body>
          </Card>
        </Container>
      ) : (
        <Container className="mt-5 mb-5">
          <Card style={{ 
            fontFamily: form.settings?.customTheme?.fontFamily || 'Roboto, sans-serif',
            backgroundColor: form.settings?.customTheme?.backgroundColor || '#ffffff',
            '--primary-color': form.settings?.customTheme?.primaryColor || '#0d6efd',
            maxWidth: '800px', 
            margin: '0 auto' 
          }}>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <div className="text-center mb-4">
                  <h3>{form.title}</h3>
                  {form.description && <p className="text-muted">{form.description}</p>}
                </div>
                
                {form.settings?.showProgressBar && form.questions.length > 0 && (
                  <ProgressBar 
                    now={100} 
                    variant="primary" 
                    className="mb-4" 
                    style={{ '--bs-progress-bar-bg': form.settings?.customTheme?.primaryColor || '#0d6efd' }}
                  />
                )}
                
                {/* Email field if required */}
                {form.settings?.collectEmail && (
                  <Form.Group className="mb-4" id="email">
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
                {form.questions.map((question) => (
                  <div key={question._id} className="question-item">
                    {renderQuestion(question)}
                  </div>
                ))}
                
                <div className="d-grid mt-4">
                  <Button 
                    type="submit" 
                    variant="primary"
                    size="lg"
                    disabled={submitting}
                    style={{ 
                      backgroundColor: form.settings?.customTheme?.primaryColor || '#0d6efd', 
                      borderColor: form.settings?.customTheme?.primaryColor || '#0d6efd' 
                    }}
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Đang gửi...
                      </>
                    ) : (
                      'Gửi biểu mẫu'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      )}
    </>
  );
};

export default PublicFormView; 