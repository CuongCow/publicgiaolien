import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Tabs, Tab, Badge } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { secretMessageApi } from '../../services/api';
import { toast } from 'react-toastify';
import LanguageSelector from '../../components/LanguageSelector';
import { useTranslation } from '../../context/TranslationContext';

const SecretMessageDetail = () => {
  const { id } = useParams();
  const { changeLanguage } = useTranslation();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [answerResult, setAnswerResult] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [isUserInfoValid, setIsUserInfoValid] = useState(true);
  const [userInfoSubmitted, setUserInfoSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('main');
  const [previousCorrectAnswer, setPreviousCorrectAnswer] = useState(null);
  const [remainingAttempts, setRemainingAttempts] = useState({
    hasLimit: false,
    maxAttempts: 0,
    usedAttempts: 0,
    remainingAttempts: 0
  });
  
  // Khóa localStorage để lưu trữ thông tin người dùng
  const USER_INFO_STORAGE_KEY = `secret_message_user_info_${id}`;
  const USER_INFO_SUBMITTED_KEY = `secret_message_user_info_submitted_${id}`;
  
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        const response = await secretMessageApi.getById(id);
        setMessage(response.data.data);
        
        // Khởi tạo đối tượng thông tin người dùng
        if (response.data.data.userInfoFields && response.data.data.userInfoFields.length > 0) {
          // Kiểm tra trong localStorage trước
          const savedUserInfo = localStorage.getItem(USER_INFO_STORAGE_KEY);
          const savedSubmitted = localStorage.getItem(USER_INFO_SUBMITTED_KEY);
          
          if (savedUserInfo) {
            try {
              const parsedUserInfo = JSON.parse(savedUserInfo);
              setUserInfo(parsedUserInfo);
            } catch (err) {
              console.error('Lỗi khi phân tích dữ liệu từ localStorage:', err);
              initializeUserInfo(response.data.data.userInfoFields);
            }
          } else {
            initializeUserInfo(response.data.data.userInfoFields);
          }
          
          // Kiểm tra xem đã nộp thông tin chưa
          if (savedSubmitted === 'true') {
            setUserInfoSubmitted(true);
          } else {
            setUserInfoSubmitted(false);
          }
        } else {
          // Nếu không có trường thông tin người dùng, đánh dấu là đã nộp
          setUserInfoSubmitted(true);
        }
        
        // Kiểm tra nếu có đáp án
        if (response.data.data.correctAnswer && response.data.data.correctAnswer.length > 0) {
          setShowAnswerInput(true);
          
          // Kiểm tra xem người dùng đã trả lời đúng trước đó chưa
          const correctAnswerResponse = await secretMessageApi.checkCorrectAnswer(id);
          if (correctAnswerResponse && correctAnswerResponse.data && correctAnswerResponse.data.hasCorrectAnswer) {
            // Người dùng đã trả lời đúng trước đó
            setPreviousCorrectAnswer(correctAnswerResponse.data.response.answer);
            setAnswerResult({
              isCorrect: true,
              message: 'Chúc mừng! Bạn đã trả lời đúng trước đó.',
              previousAnswer: correctAnswerResponse.data.response.answer
            });
          }
        }
        
        // Lấy thông tin số lần thử còn lại
        fetchRemainingAttempts(response.data.data._id);
      } catch (error) {
        console.error('Error fetching message:', error);
        toast.error('Không thể tải thông tin mật thư');
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id, USER_INFO_STORAGE_KEY, USER_INFO_SUBMITTED_KEY]);
  
  // Hàm helper để khởi tạo đối tượng userInfo
  const initializeUserInfo = (userInfoFields) => {
    const initialUserInfo = {};
    userInfoFields.forEach(field => {
      initialUserInfo[field.label] = '';
    });
    setUserInfo(initialUserInfo);
  };
  
  // Lưu thông tin người dùng vào localStorage mỗi khi thay đổi
  useEffect(() => {
    if (Object.keys(userInfo).length > 0) {
      localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(userInfo));
    }
  }, [userInfo, USER_INFO_STORAGE_KEY]);
  
  // Lấy số lần thử còn lại
  const fetchRemainingAttempts = async (messageId) => {
    try {
      const response = await secretMessageApi.getRemainingAttempts(messageId);
      setRemainingAttempts(response.data);
    } catch (error) {
      console.error('Error fetching remaining attempts:', error);
    }
  };
  
  const handleUserInfoSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra xem thông tin đã nhập đầy đủ chưa
    let isValid = true;
    message.userInfoFields.forEach(field => {
      if (field.required && (!userInfo[field.label] || userInfo[field.label].trim() === '')) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      setIsUserInfoValid(false);
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }
    
    try {
      // Gửi thông tin người dùng lên server
      await secretMessageApi.submitUserInfo(message._id, userInfo);
      
      setIsUserInfoValid(true);
      setUserInfoSubmitted(true);
      
      // Lưu trạng thái đã nộp vào localStorage
      localStorage.setItem(USER_INFO_SUBMITTED_KEY, 'true');
      
      toast.success('Thông tin đã được ghi nhận');
    } catch (error) {
      console.error('Error submitting user info:', error);
      toast.error('Không thể gửi thông tin người dùng');
    }
  };
  
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra nếu trường đáp án trống
    if (!answer.trim()) {
      toast.error('Vui lòng nhập đáp án');
      return;
    }
    
    // Kiểm tra số lần thử còn lại
    if (remainingAttempts.hasLimit && remainingAttempts.remainingAttempts <= 0) {
      toast.error('Bạn đã hết số lần thử');
      return;
    }
    
    setCheckingAnswer(true);
    
    try {
      // Gửi đáp án lên server
      const response = await secretMessageApi.submitAnswer(message._id, answer);
      
      setAnswerResult({
        isCorrect: response.data.isCorrect,
        message: response.data.isCorrect ? 'Chúc mừng! Bạn đã trả lời đúng.' : 'Đáp án chưa chính xác. Vui lòng thử lại.'
      });
      
      // Cập nhật số lần thử còn lại
      await fetchRemainingAttempts(message._id);
    } catch (error) {
      console.error('Error submitting answer:', error);
      
      if (error.response && error.response.status === 403) {
        setAnswerResult({
          isCorrect: false,
          message: 'Bạn đã hết số lần thử.'
        });
      } else {
        toast.error('Không thể gửi đáp án');
      }
    } finally {
      setCheckingAnswer(false);
    }
  };
  
  // Hàm helper để lấy class CSS cho khoảng cách đoạn
  const getParagraphSpacingClass = (spacing) => {
    if (!spacing || spacing === '0') return 'paragraph-spacing-none';
    if (spacing === '0.5rem') return 'paragraph-spacing-small';
    if (spacing === '0.8rem') return 'paragraph-spacing-medium';
    if (spacing === '1.2rem') return 'paragraph-spacing-large';
    if (spacing === '1.8rem') return 'paragraph-spacing-xlarge';
    
    // Fallback to medium spacing if unknown value
    return 'paragraph-spacing-medium';
  };
  
  // Phần hiển thị form nhập đáp án và kết quả
  const renderAnswerForm = () => {
    // Nếu đã trả lời đúng trước đó, hiển thị thông báo và đáp án
    if (answerResult && answerResult.isCorrect && previousCorrectAnswer) {
      return (
        <div className="mt-4">
          <Alert variant="success" className="d-flex align-items-center" data-translatable>
            <i className="bi bi-check-circle-fill me-2 fs-4"></i>
            <div>
              <p className="mb-1 fw-bold">{answerResult.message}</p>
              <p className="mb-0 small" data-translatable>Đáp án của bạn: <strong>{previousCorrectAnswer}</strong></p>
            </div>
          </Alert>
        </div>
      );
    }

    return (
      <>
        {/* Hiển thị form nhập đáp án nếu người dùng chưa trả lời đúng hoặc chưa có kết quả */}
        {(!answerResult || !answerResult.isCorrect) && (
          <Form onSubmit={handleAnswerSubmit} className="mt-4">
            <Form.Group className="mb-3">
              <Form.Label data-translatable>Nhập đáp án:</Form.Label>
              <Form.Control
                type="text"
                as="textarea"
                rows={4}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Nhập đáp án của bạn tại đây"
                disabled={checkingAnswer || (remainingAttempts.hasLimit && remainingAttempts.remainingAttempts <= 0)}
                data-translatable
              />
            </Form.Group>
            
            {/* Hiển thị thông tin số lần thử còn lại nếu có giới hạn */}
            {remainingAttempts.hasLimit && (
              <div className="d-flex justify-content-between mb-3" data-translatable>
                <small className="text-muted">
                  Số lần thử: {remainingAttempts.usedAttempts}/{remainingAttempts.maxAttempts}
                </small>
                <small className={`${remainingAttempts.remainingAttempts > 0 ? 'text-success' : 'text-danger'} fw-bold`}>
                  Còn lại: {remainingAttempts.remainingAttempts}
                </small>
              </div>
            )}
            
            <Button
              type="submit"
              variant="primary"
              disabled={checkingAnswer || (remainingAttempts.hasLimit && remainingAttempts.remainingAttempts <= 0)}
            >
              <span data-translatable>
                {checkingAnswer ? "Đang kiểm tra..." : 'Gửi đáp án'}
              </span>
            </Button>
          </Form>
        )}
        
        {/* Hiển thị kết quả */}
        {answerResult && (
          <Alert variant={answerResult.isCorrect ? 'success' : 'danger'} className="mt-3" data-translatable>
            <i className={`bi ${answerResult.isCorrect ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
            {answerResult.message}
          </Alert>
        )}
      </>
    );
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3" data-translatable>Đang tải mật thư...</p>
      </Container>
    );
  }
  
  if (!message) {
    return (
      <Container className="py-5">
        <Card className="shadow-sm border-0">
          <Card.Body className="text-center py-5">
            <i className="bi bi-exclamation-triangle display-1 text-warning"></i>
            <h3 className="mt-4" data-translatable>Không tìm thấy mật thư</h3>
            <p className="text-muted" data-translatable>Mật thư này không tồn tại hoặc đã bị xóa</p>
            <Button as={Link} to="/" variant="primary" className="mt-3">
              <span data-translatable>Quay về trang chủ</span>
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  // Form nhập thông tin người dùng
  if (!userInfoSubmitted && message.userInfoFields && message.userInfoFields.length > 0) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-primary text-white py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="mb-0" data-translatable>{message.name}</h3>
                  <LanguageSelector onSelectLanguage={changeLanguage} />
                </div>
              </Card.Header>
              <Card.Body className="p-md-5 p-4">
                <div className="text-center mb-4">
                  {message.title && <h5 className="mb-4" data-translatable>{message.title}</h5>}
                </div>
                
                <Alert variant="info" className="mb-4" data-translatable>
                  <i className="bi bi-info-circle me-2"></i>
                  Vui lòng nhập thông tin trước khi xem mật thư
                </Alert>
                
                {!isUserInfoValid && (
                  <Alert variant="danger" className="mb-4" data-translatable>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Vui lòng điền đầy đủ thông tin bắt buộc
                  </Alert>
                )}
                
                <Form onSubmit={handleUserInfoSubmit}>
                  {message.userInfoFields.map((field, index) => (
                    <Form.Group key={index} className="mb-3">
                      <Form.Label data-translatable>
                        {field.label} {field.required && <span className="text-danger">*</span>}
                      </Form.Label>
                      <Form.Control 
                        type="text"
                        value={userInfo[field.label] || ''}
                        onChange={(e) => {
                          setUserInfo({
                            ...userInfo,
                            [field.label]: e.target.value
                          });
                        }}
                        required={field.required}
                        isInvalid={!isUserInfoValid && field.required && (!userInfo[field.label] || userInfo[field.label].trim() === '')}
                        data-translatable
                      />
                      {!isUserInfoValid && field.required && (!userInfo[field.label] || userInfo[field.label].trim() === '') && (
                        <Form.Control.Feedback type="invalid" data-translatable>
                          Thông tin này là bắt buộc
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  ))}
                  
                  <div className="d-flex justify-content-between">
                    <Button 
                      variant="outline-secondary" 
                      className="mt-3"
                      onClick={() => {
                        // Xóa thông tin và khởi tạo lại
                        initializeUserInfo(message.userInfoFields);
                        // Xóa thông tin từ localStorage
                        localStorage.removeItem(USER_INFO_STORAGE_KEY);
                      }}
                    >
                      <i className="bi bi-arrow-counterclockwise me-2"></i>
                      <span data-translatable>Nhập lại</span>
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="mt-3"
                    >
                      <span data-translatable>Tiếp tục</span>
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0" data-translatable>{message.name}</h3>
                <LanguageSelector onSelectLanguage={changeLanguage} />
              </div>
            </Card.Header>
            <Card.Body className="p-md-5 p-4">
              <div className="text-center mb-4">
                {message.title && <h5 className="mb-3" data-translatable>{message.title}</h5>}
                {message.teamNote && (
                  <Alert variant="info" data-translatable>
                    <i className="bi bi-info-circle me-2"></i>
                    {message.teamNote}
                  </Alert>
                )}
              </div>
              
              {/* Nút quay lại form thông tin người dùng */}
              {message.userInfoFields && message.userInfoFields.length > 0 && (
                <div className="text-end mb-3">
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => {
                      setUserInfoSubmitted(false);
                      localStorage.removeItem(USER_INFO_SUBMITTED_KEY);
                    }}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    <span data-translatable>Sửa thông tin</span>
                  </Button>
                </div>
              )}
                
                {message.showOTT && message.ottContent && (
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <div style={{ backgroundColor: '#0d6efd', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                        OTT:
                      </div>
                    </div>
                    <div 
                      className={`content-container p-3 bg-light-subtle rounded ${getParagraphSpacingClass(message.paragraphSpacing || '0.8rem')}`}
                      style={{
                        fontSize: message.fontSize,
                        fontWeight: message.fontWeight,
                        lineHeight: message.lineHeight,
                        letterSpacing: message.letterSpacing,
                        whiteSpace: 'pre-wrap'
                      }}
                      data-translatable
                    >
                      {message.ottContent}
                    </div>
                  </div>
                )}
                
                {message.showNW && message.nwContent && (
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <div style={{ backgroundColor: '#0d6efd', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                        NW:
                      </div>
                    </div>
                    <div 
                      className={`content-container p-3 bg-light-subtle rounded ${getParagraphSpacingClass(message.paragraphSpacing || '0.8rem')}`}
                      style={{
                        fontSize: message.fontSize,
                        fontWeight: message.fontWeight,
                        lineHeight: message.lineHeight,
                        letterSpacing: message.letterSpacing,
                        whiteSpace: 'pre-wrap'
                      }}
                      data-translatable
                    >
                      {message.nwContent}
                    </div>
                  </div>
                )}

                              {/* Hiển thị mật thư trực tiếp */}
              <div className="secret-message-content mb-4">
                {message.showImage && (message.contentType === 'image' || message.contentType === 'both') && message.content.startsWith('data:image') && (
                  <div className="text-center mb-4">
                    <img 
                      src={message.content} 
                      alt="Mật thư" 
                      className="img-fluid" 
                      style={{ maxHeight: '800px' }}
                      data-translatable
                    />
                  </div>
                )}

              </div>
              
              {renderAnswerForm()}
              
              <div className="text-center mt-4">
                <Button 
                  as={Link} 
                  to="/" 
                  variant="outline-secondary" 
                  className="mt-3"
                  onClick={() => {
                    // Xóa thông tin khỏi localStorage khi quay về trang chủ
                    localStorage.removeItem(USER_INFO_STORAGE_KEY);
                    localStorage.removeItem(USER_INFO_SUBMITTED_KEY);
                  }}
                >
                  <i className="bi bi-house me-2"></i>
                  <span data-translatable>Quay về trang chủ</span>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SecretMessageDetail; 