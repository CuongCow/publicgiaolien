import React, { useState, useRef, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { authApi, invitationApi } from '../../services/api';
import { handleApiError } from '../../utils/helpers';
import ErrorHandler from '../../components/ErrorHandler';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    invitationCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [step, setStep] = useState(1); // 1: Nhập thông tin, 2: Xác thực email, 3: Hoàn thành
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [invitationValid, setInvitationValid] = useState(null);
  const [checkingInvitation, setCheckingInvitation] = useState(false);
  const navigate = useNavigate();
  
  // Sử dụng useRef để debounce việc kiểm tra mã mời
  const invitationCodeTimeout = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Kiểm tra mã mời khi người dùng nhập
    if (e.target.name === 'invitationCode') {
      // Nếu trường mã mời được thay đổi
      const code = e.target.value.trim();
      
      // Xóa bỏ timeout trước đó để tránh gọi API nhiều lần
      if (invitationCodeTimeout.current) {
        clearTimeout(invitationCodeTimeout.current);
      }
      
      // Nếu mã quá ngắn, đặt trạng thái về null
      if (code.length < 5) {
        setInvitationValid(null);
        return;
      }
      
      // Đặt timeout để chỉ kiểm tra sau khi người dùng ngừng gõ 500ms
      invitationCodeTimeout.current = setTimeout(() => {
        checkInvitationCode(code);
      }, 500);
    }
  };

  // Clear timeout khi component unmount
  useEffect(() => {
    return () => {
      if (invitationCodeTimeout.current) {
        clearTimeout(invitationCodeTimeout.current);
      }
    };
  }, []);

  const checkInvitationCode = async (code) => {
    // Không kiểm tra nếu mã rỗng
    if (!code) {
      setInvitationValid(null);
      return;
    }
    
    try {
      setCheckingInvitation(true);
      const response = await invitationApi.verify(code);
      setInvitationValid(response.data.valid);
    } catch (err) {
      console.log('Mã mời không hợp lệ:', err);
      setInvitationValid(false);
    } finally {
      setCheckingInvitation(false);
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

    // Kiểm tra mã mời
    if (!formData.invitationCode) {
      setError('Mã mời là bắt buộc');
      return;
    }

    // Kiểm tra lại mã mời
    try {
      setLoading(true);
      setError(null);
      
      // Xác thực mã mời
      const inviteResponse = await invitationApi.verify(formData.invitationCode);
      if (!inviteResponse.data.valid) {
        setError('Mã mời không hợp lệ hoặc đã hết hạn');
        setLoading(false);
        return;
      }
      
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
      setError(handleApiError(err, 'Không thể gửi mã xác thực. Vui lòng thử lại sau.'));
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
      setError(handleApiError(err, 'Mã xác thực không đúng hoặc đã hết hạn. Vui lòng thử lại.'));
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
      setError(handleApiError(err, 'Không thể gửi lại mã xác thực. Vui lòng thử lại sau.'));
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
          
          {error && <ErrorHandler error={error} onClose={() => setError(null)} />}
          {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
          
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
                <Form.Label className="d-flex justify-content-between align-items-center">
                  Mã mời
                  {checkingInvitation && <Spinner animation="border" size="sm" />}
                </Form.Label>
                <Form.Control
                  type="text"
                  name="invitationCode"
                  value={formData.invitationCode}
                  onChange={handleChange}
                  required
                  placeholder="Nhập mã mời"
                  isValid={invitationValid === true}
                  isInvalid={invitationValid === false}
                />
                {invitationValid === true && (
                  <Form.Control.Feedback type="valid">
                    <i className="bi bi-check-circle-fill me-1"></i> Mã mời hợp lệ
                  </Form.Control.Feedback>
                )}
                {invitationValid === false && (
                  <Form.Control.Feedback type="invalid">
                    <i className="bi bi-x-circle-fill me-1"></i> Mã mời không hợp lệ hoặc đã hết hạn
                  </Form.Control.Feedback>
                )}
                <Form.Text className="text-muted">
                  Liên hệ với chủ sở hữu hệ thống để nhận mã mời. 
                  <br/>
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
                  disabled={loading || invitationValid === false}
                >
                  {loading ? 'Đang xử lý...' : 'Tiếp tục'}
                </Button>
              </div>

              <div className="text-center mt-3">
                <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
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
                <Form.Control
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  placeholder="Nhập mã xác thực 6 số"
                  className="text-center"
                  style={{ letterSpacing: '8px', fontSize: '1.2rem' }}
                  maxLength="6"
                />
              </Form.Group>
              
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? 'Đang xử lý...' : 'Xác thực & Hoàn tất đăng ký'}
                </Button>
                
                <Button 
                  variant="link" 
                  type="button" 
                  onClick={resendVerificationCode}
                  disabled={loading}
                >
                  Gửi lại mã xác thực
                </Button>
              </div>
            </Form>
          )}
          
          {step === 3 && (
            <div className="text-center">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
              <h4 className="mt-3">Đăng ký thành công!</h4>
              <p>Tài khoản của bạn đã được tạo. Bạn sẽ được chuyển đến trang đăng nhập.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register; 