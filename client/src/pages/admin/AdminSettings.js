import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import AdminNavbar from '../../components/Navbar';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import { useLanguage } from '../../context/LanguageContext';

const AdminSettings = () => {
  const { settings: systemSettings, updateSettings, loading: apiLoading, error: apiError } = useSystemSettings();
  const { language, changeLanguage, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  
  const [settings, setSettings] = useState({
    darkMode: localStorage.getItem('darkMode') === 'true',
    notifications: localStorage.getItem('notifications') === 'true',
    autoLogout: parseInt(localStorage.getItem('autoLogout')) || 60,
    termType: 'default',
    customTerm: '',
    customCopyTemplates: {
      stationCentered: '',
      stationRace: ''
    }
  });

  // Cập nhật form khi lấy được settings từ API
  useEffect(() => {
    if (systemSettings) {
      setSettings(prev => ({
        ...prev,
        termType: systemSettings.termType || 'default',
        customTerm: systemSettings.customTerm || '',
        customCopyTemplates: {
          stationCentered: systemSettings.customCopyTemplates?.stationCentered || '',
          stationRace: systemSettings.customCopyTemplates?.stationRace || ''
        }
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

  const handleLanguageChange = async (e) => {
    const newLanguage = e.target.value;
    await changeLanguage(newLanguage);
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
      
      // Cập nhật cài đặt thuật ngữ lên server
      await updateSettings({
        termType: settings.termType,
        customTerm: settings.customTerm,
        customCopyTemplates: settings.customCopyTemplates
      });
      
      // Lưu cài đặt vào localStorage để TeamList có thể sử dụng
      localStorage.setItem('systemSettings', JSON.stringify({
        termType: settings.termType,
        customTerm: settings.customTerm,
        customCopyTemplates: settings.customCopyTemplates
      }));
      
      // Hiển thị thông báo thành công
      setSuccess(t('settings_save_success'));
    } catch (err) {
      setError(t('settings_save_error'));
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
      
      // Đặt lại trạng thái cài đặt
      setSettings({
        darkMode: false,
        notifications: true,
        autoLogout: 60,
        termType: 'default',
        customTerm: '',
        customCopyTemplates: {
          stationCentered: '',
          stationRace: ''
        }
      });
      
      // Đặt lại cài đặt hệ thống trên server
      await updateSettings({
        termType: 'default',
        customTerm: '',
        customCopyTemplates: {
          stationCentered: '',
          stationRace: ''
        }
      });
      
      // Xóa chế độ tối nếu đang được áp dụng
      document.body.classList.remove('dark-mode');
      
      setSuccess(t('settings_reset_success'));
    } catch (err) {
      setError(t('settings_reset_error'));
      console.error('Error resetting settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <Container className="py-4">
        <h1 className="mb-4">{t('settings_heading')}</h1>
        
        {(error || apiError) && <Alert variant="danger">{error || apiError}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Row>
          <Col md={8}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">{t('system_customization')}</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={saveSettings}>
                  <Form.Group className="mb-4">
                    <Form.Label>{t('theme')}</Form.Label>
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
                          {t('dark_mode')}
                        </label>
                      </div>
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>{t('notifications')}</Form.Label>
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
                          {t('enable_notifications')}
                        </label>
                      </div>
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>{t('term_rename')}</Form.Label>
                    <div className="mb-3">
                      <Form.Check
                        type="radio"
                        id="term-default"
                        name="termType"
                        label={t('default_term_label')}
                        value="default"
                        checked={settings.termType === 'default'}
                        onChange={handleChange}
                      />
                      <Form.Check
                        type="radio"
                        id="term-journey"
                        name="termType"
                        label={t('journey_term_label')}
                        value="journey"
                        checked={settings.termType === 'journey'}
                        onChange={handleChange}
                      />
                      <Form.Check
                        type="radio"
                        id="term-custom"
                        name="termType"
                        label={t('custom_term_label')}
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
                          placeholder={t('custom_term_placeholder')}
                          maxLength={20}
                        />
                        <Form.Text className="text-muted">
                          {t('custom_term_note')}
                        </Form.Text>
                      </div>
                    )}
                    
                    <Alert variant="info">
                      <i className="bi bi-info-circle me-2"></i>
                      {t('term_change_info')}
                      <div className="mt-2">
                      </div>
                      {settings.termType !== 'default' && (
                        <div className="mt-2">
                          <strong>{t('preview_term')}</strong>
                          {settings.termType === 'journey' ? t('journey_term_label') : settings.customTerm || '[Chưa nhập]'} 1, {settings.termType === 'journey' ? t('journey_term_label') : settings.customTerm || '[Chưa nhập]'} 2, ...
                        </div>
                      )}
                    </Alert>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>{t('auto_logout')}</Form.Label>
                    <Form.Control
                      type="number"
                      name="autoLogout"
                      min="15"
                      max="480"
                      value={settings.autoLogout}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-muted">
                      {t('auto_logout_note')}
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>{t('language_label')}</Form.Label>
                    <Form.Select
                      name="language"
                      value={language}
                      onChange={handleLanguageChange}
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>{t('copy_template_customization')}</Form.Label>
                    <div className="mb-3">
                      <Form.Label>{t('station_centered_template_label')}</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="customCopyTemplates.stationCentered"
                        rows={10}
                        value={settings.customCopyTemplates?.stationCentered || ''}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          customCopyTemplates: {
                            ...prev.customCopyTemplates,
                            stationCentered: e.target.value
                          }
                        }))}
                      />
                      <Form.Text className="text-muted">
                        {t('station_centered_template_placeholders')}
                      </Form.Text>
                    </div>
                    
                    <div className="mb-3">
                      <Form.Label>{t('station_race_template_label')}</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="customCopyTemplates.stationRace"
                        rows={10}
                        value={settings.customCopyTemplates?.stationRace || ''}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          customCopyTemplates: {
                            ...prev.customCopyTemplates,
                            stationRace: e.target.value
                          }
                        }))}
                      />
                      <Form.Text className="text-muted">
                        {t('station_race_template_placeholders')}
                      </Form.Text>
                    </div>
                  </Form.Group>
                  
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading || apiLoading}
                    >
                      {(loading || apiLoading) ? (
                        <>
                          {t('saving_settings')}
                        </>
                      ) : (
                        t('save_settings')
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={resetSettings}
                      disabled={loading || apiLoading}
                    >
                      {t('reset_defaults')}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">{t('system_info')}</h5>
              </Card.Header>
              <Card.Body>
                <p><strong>{t('app_version')}</strong> 1.0.8</p>
                <p>{t('app_version_note_content')}</p>
                <p>1.0.4: Cho phép admin tạo mật thư chung cho tất cả đội hoặc mật thư riêng cho từng đội   </p>
                <p>1.0.5: Trạng thái User và cập nhật Form tạo trạm   </p>
                <p>1.0.7: Thêm Cài đặt phông chữ cho từng trạm</p>
                <p>1.0.8: Sửa các lỗi trong form tạo trạm riêng cho từng đội</p>
                <hr />
                <p><strong>{t('app_framework')}</strong> React + Bootstrap 5</p>
                <p><strong>{t('app_backend')}</strong> Node.js + Express</p>
                <p><strong>{t('app_database')}</strong> MongoDB</p>
                <hr />
                <p className="text-muted small">
                  {t('app_copyright')} <br />
                  {t('app_developer')}
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