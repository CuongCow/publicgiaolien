import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
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
  const [step, setStep] = useState(1); // 1: Nhập thông tin, 2: Xác thực email, 3: Hoàn thành
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      setStep(2);
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
      
      const response = await authApi.register(registerData);
      
      // Lưu token vào localStorage
      localStorage.setItem('token', response.data.token);
      
      setSuccess('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
      setStep(3);
      
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

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow-sm" style={{ width: '500px' }}>
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Đăng ký Admin</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          {step === 1 && (
            <Form onSubmit={handleSubmitInfo}>
              <Form.Group className="mb-3">
                <Form.Label>Tên đầy đủ</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Nhập tên đầy đủ"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Tên đăng nhập</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Nhập tên đăng nhập"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Nhập địa chỉ email"
                />
                <Form.Text className="text-muted">
                  Chúng tôi sẽ gửi mã xác thực đến email này.
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Nhập mật khẩu"
                    minLength="6"
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={toggleShowPassword}
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </Button>
                </InputGroup>
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label>Xác nhận mật khẩu</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Nhập lại mật khẩu"
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
              
              <div className="d-grid">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Tiếp tục'}
                </Button>
              </div>
            </Form>
          )}
          
          {step === 2 && (
            <Form onSubmit={handleVerifyCode}>
              <p className="text-center mb-4">
                Chúng tôi đã gửi mã xác thực đến email <strong>{formData.email}</strong>. 
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
                  {loading ? 'Đang xử lý...' : 'Xác thực và Đăng ký'}
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
            <div className="text-center">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
              <p className="mt-3">Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...</p>
            </div>
          )}
          
          <div className="text-center mt-3">
            <p className="mb-0">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register; 