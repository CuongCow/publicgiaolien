import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import { handleApiError } from '../../utils/helpers';
import ErrorHandler from '../../components/ErrorHandler';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.login(formData);
      
      // Ghi log để debug
      console.log('Đăng nhập thành công, dữ liệu nhận được:', response.data);
      
      // Lưu token vào localStorage
      localStorage.setItem('token', response.data.token);
      
      // Đảm bảo response.data.admin có đầy đủ thông tin
      if (response.data.admin) {
        console.log('Thông tin admin đầy đủ:', response.data.admin);
        localStorage.setItem('admin', JSON.stringify(response.data.admin));
      } else {
        console.error('Dữ liệu admin không đầy đủ:', response.data);
      }
      
      // Chuyển hướng dựa trên vai trò
      const adminRole = response.data.admin?.role || 'admin';
      console.log('Vai trò từ response:', adminRole);
      
      if (adminRole === 'superadmin') {
        navigate('/superadmin');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(handleApiError(err, 'Không thể đăng nhập. Vui lòng thử lại sau.'));
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow-sm" style={{ width: '400px' }}>
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Đăng nhập Admin</h2>
          
          {error && <ErrorHandler error={error} />}
          
          <Form onSubmit={handleSubmit}>
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
              <Form.Label>Mật khẩu</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Nhập mật khẩu"
                />
                <Button 
                  variant="outline-secondary" 
                  onClick={toggleShowPassword}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                </Button>
              </InputGroup>
              <div className="d-flex justify-content-end mt-1">
                <Link to="/forgot-password" className="text-primary small">Quên mật khẩu?</Link>
              </div>
            </Form.Group>
            
            <div className="d-grid mt-4">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </Button>
            </div>
          </Form>
          
          <div className="text-center mt-3">
            <p className="mb-0">
              Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login; 