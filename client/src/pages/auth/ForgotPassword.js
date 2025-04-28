import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, InputGroup, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập mã xác thực, 3: Đặt lại mật khẩu
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Gửi yêu cầu đặt lại mật khẩu
      await authApi.requestPasswordReset(email);
      
      setSuccess('Mã xác thực đã được gửi đến email của bạn.');
      setStep(2);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại.');
      } else {
        setError(
          err.response?.data?.message || 
          'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.'
        );
      }
      console.error('Password reset request error:', err);
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
      await authApi.verifyCode(email, verificationCode);
      
      setSuccess('Mã xác thực hợp lệ. Vui lòng nhập mật khẩu mới.');
      setStep(3);
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
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Kiểm tra mật khẩu xác nhận
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Đặt lại mật khẩu
      await authApi.resetPassword(email, verificationCode, newPassword);
      
      setSuccess('Đặt lại mật khẩu thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
      
      // Chuyển hướng đến trang đăng nhập sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Không thể đặt lại mật khẩu. Vui lòng thử lại sau.'
      );
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const resendVerificationCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await authApi.requestPasswordReset(email);
      
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

  const toggleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getStepProgress = () => {
    return (step / 3) * 100;
  };

  return (
    <div className="auth-page forgot-password-page">
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
                <div className="text-center mb-3">
                  <h2 className="auth-form-title">Quên mật khẩu</h2>
                  <p className="auth-form-subtitle">Đặt lại mật khẩu trong 3 bước đơn giản</p>
                </div>
                
                <div className="mb-4">
                  <div className="step-progress-container">
                    <div className="progress">
                      <div 
                        className="progress-bar" 
                        role="progressbar"
                        style={{ width: `${getStepProgress()}%` }}
                      ></div>
                    </div>
                    <div className="step-indicators">
                      <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1</div>
                      <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2</div>
                      <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>3</div>
                    </div>
                  </div>
                  <div className="step-labels d-flex justify-content-between">
                    <small className={step === 1 ? 'active' : ''}>Xác nhận Email</small>
                    <small className={step === 2 ? 'active' : ''}>Nhập mã</small>
                    <small className={step === 3 ? 'active' : ''}>Mật khẩu mới</small>
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
                  <Form onSubmit={handleRequestReset} className="step-form">
                    <div className="text-center mb-4">
                      <div className="form-icon">
                        <i className="bi bi-envelope"></i>
                      </div>
                      <p className="step-description">
                        Vui lòng nhập địa chỉ email bạn đã dùng để đăng ký tài khoản. 
                        Chúng tôi sẽ gửi mã xác thực để bạn có thể đặt lại mật khẩu.
                      </p>
                    </div>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>Email</Form.Label>
                      <InputGroup className="auth-input-group">
                        <InputGroup.Text>
                          <i className="bi bi-envelope-fill"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="Nhập địa chỉ email"
                          className="auth-input"
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
                            <i className="bi bi-send me-2"></i>
                            Gửi mã xác thực
                          </>
                        )}
                      </Button>
                      
                      <div className="text-center mt-3">
                        <Link to="/login" className="auth-link">
                          <i className="bi bi-arrow-left me-1"></i> Quay lại đăng nhập
                        </Link>
                      </div>
                    </div>
                  </Form>
                )}
                
                {step === 2 && (
                  <Form onSubmit={handleVerifyCode} className="step-form">
                    <div className="email-verification-container">
                      <div className="verification-icon mb-3">
                        <i className="bi bi-shield-lock"></i>
                      </div>
                      <p className="text-center mb-4 step-description">
                        Chúng tôi đã gửi mã xác thực đến email <strong>{email}</strong>. 
                        Vui lòng kiểm tra hộp thư (bao gồm thư mục spam) và nhập mã xác thực bên dưới.
                      </p>
                      
                      <Form.Group className="mb-4">
                        <Form.Label>Mã xác thực</Form.Label>
                        <InputGroup className="auth-input-group verification-code-input">
                          <InputGroup.Text>
                            <i className="bi bi-key-fill"></i>
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
                              Xác thực
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
                          onClick={() => setStep(1)}
                          className="auth-back-btn"
                        >
                          <i className="bi bi-arrow-left me-2"></i>
                          Quay lại
                        </Button>
                      </div>
                    </div>
                  </Form>
                )}
                
                {step === 3 && (
                  <Form onSubmit={handleResetPassword} className="step-form">
                    <div className="text-center mb-4">
                      <div className="form-icon">
                        <i className="bi bi-lock"></i>
                      </div>
                      <p className="step-description">
                        Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                      </p>
                    </div>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Mật khẩu mới</Form.Label>
                      <InputGroup className="auth-input-group">
                        <InputGroup.Text>
                          <i className="bi bi-lock-fill"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          placeholder="Nhập mật khẩu mới"
                          minLength="6"
                          className="auth-input"
                        />
                        <Button 
                          variant="link"
                          className="password-toggle-btn"
                          onClick={toggleShowNewPassword}
                          title={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          <i className={showNewPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                        </Button>
                      </InputGroup>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                      <InputGroup className="auth-input-group">
                        <InputGroup.Text>
                          <i className="bi bi-lock"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="Nhập lại mật khẩu mới"
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
                            <i className="bi bi-check2-all me-2"></i>
                            Đặt lại mật khẩu
                          </>
                        )}
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
                  </Form>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPassword; 