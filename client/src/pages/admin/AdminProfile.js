import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import AdminNavbar from '../../components/Navbar';
import { authApi } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const { t } = useLanguage();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await authApi.getMe();
      setAdmin(res.data);
      setFormData({
        name: res.data.name || '',
        email: res.data.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Failed to fetch admin data', error);
      setError(t('profile_load_error') || 'Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    
    // Reset thông báo
    setError(null);
    setSuccess(null);
    
    // Kiểm tra mật khẩu mới nếu đã nhập
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError(t('password_mismatch'));
        return;
      }
      
      if (!formData.currentPassword) {
        setError(t('enter_current_password'));
        return;
      }
    }
    
    try {
      setUpdating(true);
      
      // Chỉ gửi các trường cần cập nhật
      const updateData = {
        name: formData.name,
        email: formData.email
      };
      
      // Nếu có thay đổi mật khẩu, thêm vào dữ liệu cập nhật
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      await authApi.updateProfile(updateData);
      
      // Cập nhật lại thông tin admin
      await fetchAdminData();
      
      // Hiển thị thông báo thành công
      setSuccess(t('profile_update_success'));
      
      // Reset các trường mật khẩu
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('profile_update_error');
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <Container className="py-4">
        <h1 className="mb-4">{t('my_profile')}</h1>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">{t('loading_profile')}</p>
          </div>
        ) : (
          <Row>
            <Col md={4}>
              <Card className="mb-4">
                <Card.Body className="text-center">
                  <div 
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3" 
                    style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
                  >
                    <span>{admin?.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <h3>{admin?.username}</h3>
                  <p className="text-muted">{admin?.email}</p>
                  <p className="text-muted small">
                    {t('join_date')}: {new Date(admin?.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </Card.Body>
              </Card>
              
              <Card>
                <Card.Header>
                  <h5 className="mb-0">{t('account_info')}</h5>
                </Card.Header>
                <Card.Body>
                  <p><strong>{t('username')}:</strong> {admin?.username}</p>
                  <p><strong>Email:</strong> {admin?.email}</p>
                  <p><strong>{t('display_name')}:</strong> {admin?.name}</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={8}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">{t('update_info')}</h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={updateProfile}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('display_name')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>{t('email_label')}</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    
                    <hr className="my-4" />
                    <h5 className="mb-3">{t('change_password')}</h5>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>{t('current_password')}</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>{t('new_password')}</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>{t('confirm_password')}</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        {t('confirm_password_placeholder')}
                      </Form.Text>
                    </Form.Group>
                    
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          {t('updating_profile')}
                        </>
                      ) : (
                        t('update_profile')
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
};

export default AdminProfile; 