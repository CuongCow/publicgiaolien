import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, InputGroup, Row, Col, ProgressBar } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [step, setStep] = useState(1); // 1: Nhập mã mời, 2: Nhập thông tin, 3: Xác thực email, 4: Hoàn thành
  const [verificationCode, setVerificationCode] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleInviteCodeSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Xác thực mã mời
      await authApi.verifyInviteCode(inviteCode);
      
      setSuccess('Mã mời hợp lệ. Vui lòng nhập thông tin đăng ký.');
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Mã mời không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại.'
      );
      console.error('Invite code error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkEmailExists = async () => {
    try {
      const response = await authApi.checkEmail(formData.email);
      return response.data.exists;
    } catch (err) {
      console.error('Lỗi kiểm tra email:', err);
      return false;
    }
  };

  const handleSubmitInfo = async (e) => {
    e.preventDefault();
    
    // Kiểm tra mật khẩu xác nhận
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Kiểm tra email đã tồn tại chưa
      const emailExists = await checkEmailExists();
      if (emailExists) {
        setError('Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.');
        setLoading(false);
        return;
      }
      
      // Gửi mã xác thực đến email
      await authApi.sendVerificationCode(formData.email);
      
      setSuccess('Mã xác thực đã được gửi đến email của bạn.');
      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Không thể gửi mã xác thực. Vui lòng thử lại sau.'
      );
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Xác thực mã
      await authApi.verifyCode(formData.email, verificationCode);
      
      // Nếu xác thực thành công, tiến hành đăng ký
      const { confirmPassword, ...registerData } = formData;
      
      // Thêm mã mời vào dữ liệu đăng ký
      const response = await authApi.register({
        ...registerData,
        inviteCode: inviteCode
      });
      
      // Lưu token vào localStorage
      localStorage.setItem('token', response.data.token);
      
      setSuccess('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
      setStep(4);
      
      // Chuyển hướng đến trang đăng nhập sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Mã xác thực không đúng hoặc đã hết hạn. Vui lòng thử lại.'
      );
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const resendVerificationCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await authApi.sendVerificationCode(formData.email);
      
      setSuccess('Mã xác thực mới đã được gửi đến email của bạn.');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Không thể gửi lại mã xác thực. Vui lòng thử lại sau.'
      );
      console.error('Resend verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getStepProgress = () => {
    return (step / 4) * 100;
  };

  return (
    <div className="auth-page register-page">
      <Container fluid>
        <Row className="align-items-center min-vh-100">
          <Col md={6} className="d-none d-md-block auth-image">
            <div className="map-overlay">
              <img src="/logo192.png" alt="Logo" className="auth-logo" />
              <h1 className="auth-title">Giao Liên</h1>
              <p className="auth-subtitle">Hệ thống quản lý trò chơi</p>
            </div>
          </Col>
          <Col md={6} xs={12}>
            <div className={`auth-form-container ${mounted ? 'fade-in' : ''}`}>
              <div className="d-block d-md-none text-center mb-4">
                <img src="/logo192.png" alt="Logo" className="auth-mobile-logo" />
                <h1 className="auth-mobile-title">Giao Liên</h1>
              </div>
              
              <div className="auth-form">
                <h2 className="text-center mb-3 auth-form-title">Đăng ký tài khoản</h2>
                
                <div className="mb-4">
                  <div className="step-progress-container">
                    <ProgressBar now={getStepProgress()} variant="success" className="step-progress-bar" />
                    <div className="step-indicators">
                      <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1</div>
                      <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2</div>
                      <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>3</div>
                      <div className={`step-indicator ${step >= 4 ? 'active' : ''}`}>4</div>
                    </div>
                  </div>
                  <div className="step-labels d-flex justify-content-between">
                    <small className={step === 1 ? 'active' : ''}>Mã mời</small>
                    <small className={step === 2 ? 'active' : ''}>Thông tin</small>
                    <small className={step === 3 ? 'active' : ''}>Xác thực</small>
                    <small className={step === 4 ? 'active' : ''}>Hoàn tất</small>
                  </div>
                </div>
                
                {error && (
                  <Alert variant="danger" className="animated-alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </Alert>
                )}
                
                {success && (
                  <Alert variant="success" className="animated-alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {success}
                  </Alert>
                )}
                
                {step === 1 && (
                  <Form onSubmit={handleInviteCodeSubmit} className="step-form">
                    <p className="text-center mb-4 step-description">
                      Vui lòng nhập mã mời để tiếp tục đăng ký tài khoản Admin.
                    </p>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>Mã mời</Form.Label>
                      <InputGroup className="auth-input-group">
                        <InputGroup.Text>
                          <i className="bi bi-ticket-perforated-fill"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          required
                          placeholder="Nhập mã mời"
                          className="auth-input"
                        />
                      </InputGroup>
                      <Form.Text className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Mã mời phải được cung cấp bởi Super Admin.
                      </Form.Text>
                    </Form.Group>
                    
                    <div className="d-grid">
                      <Button 
                        className="auth-submit-btn"
                        type="submit" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-arrow-right-circle me-2"></i>
                            Xác thực mã mời
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                )}
                
                {step === 2 && (
                  <Form onSubmit={handleSubmitInfo} className="step-form">
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tên đầy đủ</Form.Label>
                          <InputGroup className="auth-input-group">
                            <InputGroup.Text>
                              <i className="bi bi-person-badge"></i>
                            </InputGroup.Text>
                            <Form.Control
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              placeholder="Nhập tên đầy đủ"
                              className="auth-input"
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tên đăng nhập</Form.Label>
                          <InputGroup className="auth-input-group">
                            <InputGroup.Text>
                              <i className="bi bi-person-fill"></i>
                            </InputGroup.Text>
                            <Form.Control
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              required
                              placeholder="Nhập tên đăng nhập"
                              className="auth-input"
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <InputGroup className="auth-input-group">
                            <InputGroup.Text>
                              <i className="bi bi-envelope-fill"></i>
                            </InputGroup.Text>
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              placeholder="Nhập địa chỉ email"
                              className="auth-input"
                            />
                          </InputGroup>
                          <Form.Text className="text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            Chúng tôi sẽ gửi mã xác thực đến email này.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Mật khẩu</Form.Label>
                          <InputGroup className="auth-input-group">
                            <InputGroup.Text>
                              <i className="bi bi-lock-fill"></i>
                            </InputGroup.Text>
                            <Form.Control
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              required
                              placeholder="Nhập mật khẩu"
                              minLength="6"
                              className="auth-input"
                            />
                            <Button 
                              variant="link"
                              className="password-toggle-btn"
                              onClick={toggleShowPassword}
                              title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                              <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                            </Button>
                          </InputGroup>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-4">
                          <Form.Label>Xác nhận mật khẩu</Form.Label>
                          <InputGroup className="auth-input-group">
                            <InputGroup.Text>
                              <i className="bi bi-lock"></i>
                            </InputGroup.Text>
                            <Form.Control
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              required
                              placeholder="Nhập lại mật khẩu"
                              minLength="6"
                              className="auth-input"
                            />
                            <Button 
                              variant="link"
                              className="password-toggle-btn"
                              onClick={toggleShowConfirmPassword}
                              title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                              <i className={showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                            </Button>
                          </InputGroup>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <div className="d-grid gap-2">
                      <Button 
                        className="auth-submit-btn"
                        type="submit" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-arrow-right-circle me-2"></i>
                            Tiếp tục
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline-secondary" 
                        type="button" 
                        disabled={loading}
                        onClick={() => setStep(1)}
                        className="auth-back-btn"
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Quay lại
                      </Button>
                    </div>
                  </Form>
                )}
                
                {step === 3 && (
                  <Form onSubmit={handleVerifyCode} className="step-form">
                    <div className="email-verification-container">
                      <div className="verification-icon mb-3">
                        <i className="bi bi-envelope-check"></i>
                      </div>
                      <p className="text-center mb-4 step-description">
                        Chúng tôi đã gửi mã xác thực đến email <strong>{formData.email}</strong>. 
                        Vui lòng kiểm tra hộp thư (bao gồm thư mục spam) và nhập mã xác thực bên dưới.
                      </p>
                      
                      <Form.Group className="mb-4">
                        <Form.Label>Mã xác thực</Form.Label>
                        <InputGroup className="auth-input-group verification-code-input">
                          <InputGroup.Text>
                            <i className="bi bi-shield-lock"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            required
                            placeholder="Nhập mã xác thực"
                            className="auth-input text-center"
                          />
                        </InputGroup>
                      </Form.Group>
                      
                      <div className="d-grid gap-2">
                        <Button 
                          className="auth-submit-btn"
                          type="submit" 
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle me-2"></i>
                              Xác thực và Đăng ký
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          variant="outline-primary" 
                          type="button" 
                          disabled={loading}
                          onClick={resendVerificationCode}
                          className="auth-resend-btn"
                        >
                          <i className="bi bi-arrow-repeat me-2"></i>
                          Gửi lại mã xác thực
                        </Button>
                        
                        <Button 
                          variant="outline-secondary" 
                          type="button" 
                          disabled={loading}
                          onClick={() => setStep(2)}
                          className="auth-back-btn"
                        >
                          <i className="bi bi-arrow-left me-2"></i>
                          Quay lại
                        </Button>
                      </div>
                    </div>
                  </Form>
                )}
                
                {step === 4 && (
                  <div className="success-container text-center">
                    <div className="success-icon">
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h3 className="mt-4">Đăng ký thành công!</h3>
                    <p className="mt-3">Tài khoản của bạn đã được tạo. Đang chuyển hướng đến trang đăng nhập...</p>
                    <div className="loading-dots mt-3">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                  </div>
                )}
                
                <div className="text-center mt-4 auth-links">
                  <p className="mb-0">
                    Đã có tài khoản? <Link to="/login" className="auth-link">Đăng nhập</Link>
                  </p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register; 