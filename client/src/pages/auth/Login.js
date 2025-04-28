import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, InputGroup, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login({ 
        username: formData.username, 
        password: formData.password 
      });
      
      // Lưu token vào localStorage
      localStorage.setItem('token', response.data.token);
      
      // Đặt flag để hiển thị thông báo khi vừa đăng nhập
      sessionStorage.setItem('justLoggedIn', 'true');
      
      // Thêm thông tin admin vào localStorage để tránh phải gọi API lại
      if (response.data.admin) {
        localStorage.setItem('admin', JSON.stringify(response.data.admin));
      }
      
      // Chuyển hướng đến dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.message) {
        setError(err.message);
      } else if (err.response?.status === 401) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng.');
      } else {
        setError(
          err.response?.data?.message || 
          'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-page login-page">
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
                <h2 className="text-center mb-4 auth-form-title">Đăng nhập</h2>
                
                {error && (
                  <Alert variant="danger" className="animated-alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
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
                    <div className="d-flex justify-content-end mt-1">
                      <Link to="/forgot-password" className="text-primary small auth-link">
                        <i className="bi bi-question-circle me-1"></i>
                        Quên mật khẩu?
                      </Link>
                    </div>
                  </Form.Group>
                  
                  <div className="d-grid mt-4">
                    <Button 
                      className="auth-submit-btn"
                      type="submit" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Đăng nhập
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
                
                <div className="text-center mt-4 auth-links">
                  <p className="mb-0">
                    Chưa có tài khoản? <Link to="/register" className="auth-link">Đăng ký</Link>
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

export default Login; 