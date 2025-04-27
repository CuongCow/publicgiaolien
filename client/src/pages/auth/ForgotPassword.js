import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
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
  const navigate = useNavigate();

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

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow-sm" style={{ width: '450px' }}>
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Quên mật khẩu</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          {step === 1 && (
            <Form onSubmit={handleRequestReset}>
              <p className="text-center mb-4">
                Vui lòng nhập địa chỉ email bạn đã dùng để đăng ký tài khoản. 
                Chúng tôi sẽ gửi mã xác thực để bạn có thể đặt lại mật khẩu.
              </p>
              
              <Form.Group className="mb-4">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Nhập địa chỉ email"
                />
              </Form.Group>
              
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Gửi mã xác thực'}
                </Button>
                
          <div className="text-center mt-3">
            <p className="mb-0">
              <Link to="/login">Quay lại đăng nhập</Link>
            </p>
          </div>
              </div>
            </Form>
          )}
          
          {step === 2 && (
            <Form onSubmit={handleVerifyCode}>
              <p className="text-center mb-4">
                Chúng tôi đã gửi mã xác thực đến email <strong>{email}</strong>. 
                Vui lòng kiểm tra hộp thư (bao gồm thư mục spam) và nhập mã xác thực bên dưới.
              </p>
              
              <Form.Group className="mb-4">
                <Form.Label>Mã xác thực</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    placeholder="Nhập mã xác thực"
                  />
                </InputGroup>
              </Form.Group>
              
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Xác thực'}
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  type="button" 
                  disabled={loading}
                  onClick={resendVerificationCode}
                >
                  Gửi lại mã xác thực
                </Button>
                
                <Button 
                  variant="link" 
                  type="button" 
                  disabled={loading}
                  onClick={() => setStep(1)}
                >
                  Quay lại
                </Button>
              </div>
            </Form>
          )}
          
          {step === 3 && (
            <Form onSubmit={handleResetPassword}>
              <p className="text-center mb-4">
                Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
              </p>
              
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu mới</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Nhập mật khẩu mới"
                    minLength="6"
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={toggleShowNewPassword}
                    title={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <i className={showNewPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </Button>
                </InputGroup>
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Nhập lại mật khẩu mới"
                    minLength="6"
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={toggleShowConfirmPassword}
                    title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <i className={showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </Button>
                </InputGroup>
              </Form.Group>
              
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </Button>
                
                <Button 
                  variant="link" 
                  type="button" 
                  disabled={loading}
                  onClick={() => setStep(2)}
                >
                  Quay lại
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ForgotPassword; 