import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import AdminNavbar from '../../components/Navbar';
import SuperAdminMenu from '../../components/SuperAdminMenu';
import { superAdminApi } from '../../services/api';

const SafetySettings = () => {
  const [settings, setSettings] = useState({
    maxLoginAttempts: 5,
    loginLockoutTime: 30,
    sessionTimeout: 60,
    passwordComplexity: {
      minLength: 8,
      requireCapital: true,
      requireNumber: true,
      requireSpecial: true
    },
    blockedIPs: [],
    newBlockedIP: '',
    backupSchedule: 'daily',
    backupRetention: 30,
    twoFactorAuth: false,
    logRetention: 90,
    emergencyContact: '',
    systemNotifications: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(null);
  const [backupError, setBackupError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await superAdminApi.getSystemSettings();
      if (response.data) {
        // Lấy cài đặt của hệ thống từ response
        const systemSettings = response.data;
        
        setSettings(prevSettings => ({
          ...prevSettings,
          maxLoginAttempts: systemSettings.securitySettings?.maxLoginAttempts || 5,
          loginLockoutTime: systemSettings.securitySettings?.lockoutTimeMinutes || 30,
          sessionTimeout: systemSettings.securitySettings?.sessionTimeoutMinutes || 60,
          blockedIPs: systemSettings.securitySettings?.blockedIPs || [],
          newBlockedIP: '',
          backupRetention: systemSettings.databaseRetentionDays || 30,
          systemNotifications: systemSettings.notificationSettings?.enableSystemNotifications || true
        }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Không thể tải cài đặt hệ thống. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setSettings(prevSettings => ({ ...prevSettings, [name]: checked }));
    } else {
      setSettings(prevSettings => ({ ...prevSettings, [name]: value }));
    }
  };

  const handlePasswordComplexityChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setSettings(prevSettings => ({
      ...prevSettings,
      passwordComplexity: {
        ...prevSettings.passwordComplexity,
        [name]: type === 'checkbox' ? checked : parseInt(value, 10)
      }
    }));
  };

  const handleAddBlockedIP = async () => {
    if (!settings.newBlockedIP) return;
    
    // Simple IP validation regex
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    if (!ipRegex.test(settings.newBlockedIP)) {
      setError('Định dạng địa chỉ IP không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }
    
    try {
      setLoading(true);
      // Gọi API để thêm IP vào danh sách chặn
      const response = await superAdminApi.addBlockedIP(settings.newBlockedIP);
      
      // Cập nhật state với danh sách IP mới
      setSettings(prevSettings => ({
        ...prevSettings,
        blockedIPs: response.data.blockedIPs || [...prevSettings.blockedIPs, settings.newBlockedIP],
        newBlockedIP: ''
      }));
      
      setSuccess('Đã thêm địa chỉ IP vào danh sách chặn thành công.');
      setTimeout(() => setSuccess(null), 3000);
      
      setError(null);
    } catch (err) {
      console.error('Error adding blocked IP:', err);
      setError(err.response?.data?.message || 'Không thể thêm địa chỉ IP vào danh sách chặn.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBlockedIP = async (ip) => {
    try {
      setLoading(true);
      // Gọi API để xóa IP khỏi danh sách chặn
      const response = await superAdminApi.removeBlockedIP(ip);
      
      // Cập nhật state với danh sách IP mới
      setSettings(prevSettings => ({
        ...prevSettings,
        blockedIPs: response.data.blockedIPs || prevSettings.blockedIPs.filter(blockedIP => blockedIP !== ip)
      }));
      
      setSuccess('Đã xóa địa chỉ IP khỏi danh sách chặn thành công.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error removing blocked IP:', err);
      setError(err.response?.data?.message || 'Không thể xóa địa chỉ IP khỏi danh sách chặn.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      await superAdminApi.updateSystemSettings({
        databaseRetentionDays: parseInt(settings.backupRetention, 10),
        securitySettings: {
          maxLoginAttempts: parseInt(settings.maxLoginAttempts, 10),
          lockoutTimeMinutes: parseInt(settings.loginLockoutTime, 10),
          sessionTimeoutMinutes: parseInt(settings.sessionTimeout, 10),
          requireStrongPasswords: settings.passwordComplexity?.requireCapital || true
        },
        notificationSettings: {
          enableSystemNotifications: settings.systemNotifications
        }
      });
      
      setSuccess('Cài đặt hệ thống đã được lưu thành công.');
      
      // Tự động ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Không thể lưu cài đặt. Vui lòng thử lại sau.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setBackupLoading(true);
      setBackupError(null);
      setBackupSuccess(null);
      
      const response = await superAdminApi.createDatabaseBackup();
      
      setBackupSuccess(`Sao lưu cơ sở dữ liệu thành công. File: ${response.data.fileName}`);
      
      // Tự động ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setBackupSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error creating backup:', err);
      setBackupError('Không thể tạo bản sao lưu. Lỗi: ' + (err.response?.data?.message || 'Không xác định'));
    } finally {
      setBackupLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <Container fluid>
          <Row>
            <Col md={3} lg={2} className="d-none d-md-block bg-light sidebar">
              <SuperAdminMenu />
            </Col>
            <Col md={9} lg={10} className="ms-sm-auto px-md-4">
              <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-2">Đang tải cài đặt...</span>
              </div>
            </Col>
          </Row>
        </Container>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <Container fluid>
        <Row>
          <Col md={3} lg={2} className="d-none d-md-block bg-light sidebar">
            <SuperAdminMenu />
          </Col>
          
          <Col md={9} lg={10} className="ms-sm-auto px-md-4">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2">Cài đặt An toàn & Bảo mật</h1>
            </div>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h5 className="card-title mb-3">Bảo mật Đăng nhập</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Số lần đăng nhập tối đa</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxLoginAttempts"
                    value={settings.maxLoginAttempts}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                  />
                  <Form.Text className="text-muted">
                    Số lần thử đăng nhập tối đa trước khi khóa tài khoản.
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Thời gian khóa đăng nhập (phút)</Form.Label>
                  <Form.Control
                    type="number"
                    name="loginLockoutTime"
                    value={settings.loginLockoutTime}
                    onChange={handleInputChange}
                    min="5"
                    max="1440"
                  />
                  <Form.Text className="text-muted">
                    Thời gian khóa tài khoản sau khi đăng nhập thất bại nhiều lần.
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Thời gian phiên đăng nhập (phút)</Form.Label>
                  <Form.Control
                    type="number"
                    name="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={handleInputChange}
                    min="5"
                    max="1440"
                  />
                  <Form.Text className="text-muted">
                    Thời gian tự động đăng xuất sau khi không hoạt động.
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Bật xác thực hai yếu tố (2FA)"
                    name="twoFactorAuth"
                    checked={settings.twoFactorAuth}
                    onChange={handleInputChange}
                  />
                  <Form.Text className="text-muted">
                    Yêu cầu mã xác thực qua email khi đăng nhập từ thiết bị mới.
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
            
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h5 className="card-title mb-3">Độ phức tạp Mật khẩu</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Độ dài tối thiểu</Form.Label>
                  <Form.Control
                    type="number"
                    name="minLength"
                    value={settings.passwordComplexity.minLength}
                    onChange={handlePasswordComplexityChange}
                    min="6"
                    max="20"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Yêu cầu chữ hoa"
                    name="requireCapital"
                    checked={settings.passwordComplexity.requireCapital}
                    onChange={handlePasswordComplexityChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Yêu cầu số"
                    name="requireNumber"
                    checked={settings.passwordComplexity.requireNumber}
                    onChange={handlePasswordComplexityChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Yêu cầu ký tự đặc biệt"
                    name="requireSpecial"
                    checked={settings.passwordComplexity.requireSpecial}
                    onChange={handlePasswordComplexityChange}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
            
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h5 className="card-title mb-3">Hạn chế IP</h5>
                
                <p>Các địa chỉ IP dưới đây sẽ không được phép truy cập vào hệ thống.</p>
                
                <Form.Group className="mb-3">
                  <Form.Label>Thêm địa chỉ IP mới</Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      type="text"
                      placeholder="Ví dụ: 192.168.1.1"
                      value={settings.newBlockedIP}
                      onChange={(e) => setSettings({...settings, newBlockedIP: e.target.value})}
                    />
                    <Button 
                      variant="primary" 
                      className="ms-2" 
                      onClick={handleAddBlockedIP}
                      disabled={!settings.newBlockedIP}
                    >
                      Thêm
                    </Button>
                  </div>
                  <Form.Text className="text-muted">
                    Nhập địa chỉ IP định dạng IPv4 (ví dụ: 192.168.1.1)
                  </Form.Text>
                </Form.Group>
                
                {settings.blockedIPs.length > 0 ? (
                  <div className="mt-3">
                    <strong>Danh sách IP bị chặn:</strong>
                    <ul className="list-group mt-2">
                      {settings.blockedIPs.map((ip, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          {ip}
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleRemoveBlockedIP(ip)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-muted fst-italic">Chưa có địa chỉ IP nào bị chặn.</p>
                )}
              </Card.Body>
            </Card>
            
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h5 className="card-title mb-3">Sao lưu Dữ liệu</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Lịch sao lưu tự động</Form.Label>
                  <Form.Select
                    name="backupSchedule"
                    value={settings.backupSchedule}
                    onChange={handleInputChange}
                  >
                    <option value="hourly">Hàng giờ</option>
                    <option value="daily">Hàng ngày</option>
                    <option value="weekly">Hàng tuần</option>
                    <option value="monthly">Hàng tháng</option>
                    <option value="manual">Thủ công</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Thời gian lưu trữ bản sao lưu (ngày)</Form.Label>
                  <Form.Control
                    type="number"
                    name="backupRetention"
                    value={settings.backupRetention}
                    onChange={handleInputChange}
                    min="1"
                    max="365"
                  />
                </Form.Group>
                
                <div className="d-flex align-items-center">
                  <Button 
                    variant="success" 
                    onClick={handleCreateBackup}
                    disabled={backupLoading}
                  >
                    {backupLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        <span className="ms-2">Đang sao lưu...</span>
                      </>
                    ) : (
                      <>Tạo bản sao lưu ngay</>
                    )}
                  </Button>
                  <div className="ms-3">
                    {backupSuccess && <Alert variant="success" className="mb-0 py-1">{backupSuccess}</Alert>}
                    {backupError && <Alert variant="danger" className="mb-0 py-1">{backupError}</Alert>}
                  </div>
                </div>
              </Card.Body>
            </Card>
            
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h5 className="card-title mb-3">Cài đặt Khác</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Thời gian lưu trữ log (ngày)</Form.Label>
                  <Form.Control
                    type="number"
                    name="logRetention"
                    value={settings.logRetention}
                    onChange={handleInputChange}
                    min="7"
                    max="365"
                  />
                  <Form.Text className="text-muted">
                    Thời gian lưu trữ nhật ký hệ thống trước khi tự động xóa.
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Liên hệ khẩn cấp</Form.Label>
                  <Form.Control
                    type="email"
                    name="emergencyContact"
                    value={settings.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="Email liên hệ khẩn cấp"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Gửi thông báo khi có sự cố hệ thống"
                    name="systemNotifications"
                    checked={settings.systemNotifications}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
            
            <div className="d-flex justify-content-end mb-4">
              <Button 
                variant="secondary" 
                className="me-2"
                onClick={fetchSettings}
                disabled={saving}
              >
                Hủy
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span className="ms-2">Đang lưu...</span>
                  </>
                ) : (
                  <>Lưu cài đặt</>
                )}
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default SafetySettings; 