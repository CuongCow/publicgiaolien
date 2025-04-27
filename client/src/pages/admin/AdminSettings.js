import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import AdminNavbar from '../../components/Navbar';
import { useSystemSettings } from '../../context/SystemSettingsContext';

const AdminSettings = () => {
  const { settings: systemSettings, updateSettings, loading: apiLoading, error: apiError } = useSystemSettings();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  
  const [settings, setSettings] = useState({
    darkMode: localStorage.getItem('darkMode') === 'true',
    notifications: localStorage.getItem('notifications') === 'true',
    autoLogout: parseInt(localStorage.getItem('autoLogout')) || 60,
    language: localStorage.getItem('language') || 'vi',
    termType: 'default',
    customTerm: ''
  });

  // Cập nhật form khi lấy được settings từ API
  useEffect(() => {
    if (systemSettings) {
      setSettings(prev => ({
        ...prev,
        termType: systemSettings.termType || 'default',
        customTerm: systemSettings.customTerm || ''
      }));
    }
  }, [systemSettings]);

  useEffect(() => {
    // Áp dụng chế độ tối nếu được bật
    if (settings.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [settings.darkMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (name) => {
    setSettings(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Lưu cài đặt giao diện vào localStorage
      localStorage.setItem('darkMode', settings.darkMode);
      localStorage.setItem('notifications', settings.notifications);
      localStorage.setItem('autoLogout', settings.autoLogout);
      localStorage.setItem('language', settings.language);
      
      // Cập nhật cài đặt thuật ngữ lên server
      await updateSettings({
        termType: settings.termType,
        customTerm: settings.customTerm
      });
      
      // Hiển thị thông báo thành công
      setSuccess('Cài đặt đã được lưu thành công');
    } catch (err) {
      setError('Không thể lưu cài đặt. Vui lòng thử lại.');
      console.error('Error saving settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = async () => {
    try {
      setLoading(true);
      
      // Xóa các cài đặt giao diện khỏi localStorage
      localStorage.removeItem('darkMode');
      localStorage.removeItem('notifications');
      localStorage.removeItem('autoLogout');
      localStorage.removeItem('language');
      
      // Đặt lại trạng thái cài đặt
      setSettings({
        darkMode: false,
        notifications: true,
        autoLogout: 60,
        language: 'vi',
        termType: 'default',
        customTerm: ''
      });
      
      // Đặt lại cài đặt hệ thống trên server
      await updateSettings({
        termType: 'default',
        customTerm: ''
      });
      
      // Xóa chế độ tối nếu đang được áp dụng
      document.body.classList.remove('dark-mode');
      
      setSuccess('Đã khôi phục về cài đặt mặc định');
    } catch (err) {
      setError('Không thể khôi phục cài đặt mặc định. Vui lòng thử lại.');
      console.error('Error resetting settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <Container className="py-4">
        <h1 className="mb-4">Cài đặt</h1>
        
        {(error || apiError) && <Alert variant="danger">{error || apiError}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Row>
          <Col md={8}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Tùy chỉnh hệ thống</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={saveSettings}>
                  <Form.Group className="mb-4">
                    <Form.Label>Giao diện</Form.Label>
                    <div className="d-flex flex-wrap gap-3">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="darkModeToggle"
                          checked={settings.darkMode}
                          onChange={() => handleToggleChange('darkMode')}
                        />
                        <label className="form-check-label" htmlFor="darkModeToggle">
                          Chế độ tối
                        </label>
                      </div>
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Thông báo</Form.Label>
                    <div className="d-flex flex-wrap gap-3">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="notificationsToggle"
                          checked={settings.notifications}
                          onChange={() => handleToggleChange('notifications')}
                        />
                        <label className="form-check-label" htmlFor="notificationsToggle">
                          Bật thông báo
                        </label>
                      </div>
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Đổi tên phương thức</Form.Label>
                    <div className="mb-3">
                      <Form.Check
                        type="radio"
                        id="term-default"
                        name="termType"
                        label="Mặc định (Trạm)"
                        value="default"
                        checked={settings.termType === 'default'}
                        onChange={handleChange}
                      />
                      <Form.Check
                        type="radio"
                        id="term-journey"
                        name="termType"
                        label="Hành trình"
                        value="journey"
                        checked={settings.termType === 'journey'}
                        onChange={handleChange}
                      />
                      <Form.Check
                        type="radio"
                        id="term-custom"
                        name="termType"
                        label="Tùy chỉnh"
                        value="custom"
                        checked={settings.termType === 'custom'}
                        onChange={handleChange}
                      />
                    </div>
                    
                    {settings.termType === 'custom' && (
                      <div className="ms-4 mb-3">
                        <Form.Control
                          type="text"
                          name="customTerm"
                          value={settings.customTerm}
                          onChange={handleChange}
                          placeholder="Nhập tên thay thế cho 'Trạm'"
                          maxLength={20}
                        />
                        <Form.Text className="text-muted">
                          Từ này sẽ thay thế cho "Trạm" trong toàn bộ hệ thống.
                        </Form.Text>
                      </div>
                    )}
                    
                    <Alert variant="info">
                      <i className="bi bi-info-circle me-2"></i>
                      Thay đổi thuật ngữ "Trạm" thành thuật ngữ khác trong toàn bộ hệ thống.
                      <div className="mt-2">
                        <strong>Lưu ý: </strong>
                        Thay đổi này sẽ được áp dụng cho tất cả người dùng và thiết bị trong hệ thống.
                      </div>
                      {settings.termType !== 'default' && (
                        <div className="mt-2">
                          <strong>Xem trước: </strong>
                          {settings.termType === 'journey' ? 'Hành trình' : settings.customTerm || '[Chưa nhập]'} 1, {settings.termType === 'journey' ? 'Hành trình' : settings.customTerm || '[Chưa nhập]'} 2, ...
                        </div>
                      )}
                    </Alert>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Thời gian tự động đăng xuất (phút)</Form.Label>
                    <Form.Control
                      type="number"
                      name="autoLogout"
                      min="15"
                      max="480"
                      value={settings.autoLogout}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-muted">
                      Thời gian không hoạt động trước khi hệ thống tự động đăng xuất
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Ngôn ngữ</Form.Label>
                    <Form.Select
                      name="language"
                      value={settings.language}
                      onChange={handleChange}
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading || apiLoading}
                    >
                      {(loading || apiLoading) ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Đang lưu...
                        </>
                      ) : (
                        'Lưu cài đặt'
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={resetSettings}
                      disabled={loading || apiLoading}
                    >
                      Khôi phục mặc định
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Thông tin hệ thống</h5>
              </Card.Header>
              <Card.Body>
                <p><strong>Phiên bản:</strong> 1.0.0</p>
                <p><strong>Khung giao diện:</strong> React + Bootstrap 5</p>
                <p><strong>Backend:</strong> Node.js + Express</p>
                <p><strong>Cơ sở dữ liệu:</strong> MongoDB</p>
                <hr />
                <p className="text-muted small">
                  © 2025 Hệ thống Giao Liên. <br />
                  Phát triển bởi CuongCow
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AdminSettings; 