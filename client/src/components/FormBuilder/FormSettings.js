import React from 'react';
import { Card, Form, Row, Col, InputGroup } from 'react-bootstrap';

const FormSettings = ({ settings, onChange }) => {
  const handleChange = (field, value) => {
    const newSettings = { ...settings };
    
    // Xử lý trường hợp nested settings
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newSettings[parent] = {
        ...newSettings[parent],
        [child]: value
      };
    } else {
      newSettings[field] = value;
    }
    
    onChange(newSettings);
  };

  return (
    <div className="form-settings">
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Cài đặt biểu mẫu</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <h6 className="mb-3">Tùy chọn phản hồi</h6>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Check
                  type="switch"
                  id="collect-email"
                  label="Yêu cầu địa chỉ email"
                  checked={settings.collectEmail}
                  onChange={(e) => handleChange('collectEmail', e.target.checked)}
                  className="mb-2"
                />
                <Form.Text className="text-muted d-block mb-3">
                  Yêu cầu người dùng cung cấp email khi gửi biểu mẫu
                </Form.Text>
                
                <Form.Check
                  type="switch"
                  id="allow-anonymous"
                  label="Cho phép gửi ẩn danh"
                  checked={settings.allowAnonymous}
                  onChange={(e) => handleChange('allowAnonymous', e.target.checked)}
                  className="mb-2"
                />
                <Form.Text className="text-muted d-block mb-3">
                  Không yêu cầu thông tin định danh khi gửi biểu mẫu
                </Form.Text>
                
                <Form.Check
                  type="switch"
                  id="show-progress-bar"
                  label="Hiển thị thanh tiến trình"
                  checked={settings.showProgressBar}
                  onChange={(e) => handleChange('showProgressBar', e.target.checked)}
                  className="mb-2"
                />
                <Form.Text className="text-muted d-block mb-3">
                  Hiển thị thanh tiến trình khi điền biểu mẫu
                </Form.Text>
              </Col>
              
              <Col md={6}>
                <Form.Check
                  type="switch"
                  id="notify-email"
                  label="Thông báo qua email"
                  checked={settings.notifyEmail}
                  onChange={(e) => handleChange('notifyEmail', e.target.checked)}
                  className="mb-2"
                />
                <Form.Text className="text-muted d-block mb-3">
                  Nhận thông báo khi có phản hồi mới
                </Form.Text>
              </Col>
            </Row>
            
            <h6 className="mb-3">Tùy chỉnh xác nhận</h6>
            
            <Form.Group className="mb-3">
              <Form.Label>Thông báo xác nhận</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={settings.confirmationMessage}
                onChange={(e) => handleChange('confirmationMessage', e.target.value)}
                placeholder="Nhập thông báo xác nhận khi người dùng gửi biểu mẫu"
              />
              <Form.Text className="text-muted">
                Thông báo hiển thị sau khi người dùng gửi biểu mẫu thành công
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>URL chuyển hướng (tùy chọn)</Form.Label>
              <Form.Control
                type="text"
                value={settings.redirectUrl || ''}
                onChange={(e) => handleChange('redirectUrl', e.target.value)}
                placeholder="https://example.com/thank-you"
              />
              <Form.Text className="text-muted">
                Chuyển hướng người dùng đến URL này sau khi gửi biểu mẫu
              </Form.Text>
            </Form.Group>
            
            <h6 className="mb-3">Giao diện</h6>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Màu chủ đạo</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="color"
                      value={settings.customTheme?.primaryColor || '#0d6efd'}
                      onChange={(e) => handleChange('customTheme.primaryColor', e.target.value)}
                    />
                    <Form.Control
                      type="text"
                      value={settings.customTheme?.primaryColor || '#0d6efd'}
                      onChange={(e) => handleChange('customTheme.primaryColor', e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Màu nền</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="color"
                      value={settings.customTheme?.backgroundColor || '#ffffff'}
                      onChange={(e) => handleChange('customTheme.backgroundColor', e.target.value)}
                    />
                    <Form.Control
                      type="text"
                      value={settings.customTheme?.backgroundColor || '#ffffff'}
                      onChange={(e) => handleChange('customTheme.backgroundColor', e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Font chữ</Form.Label>
                  <Form.Select
                    value={settings.customTheme?.fontFamily || 'Roboto, sans-serif'}
                    onChange={(e) => handleChange('customTheme.fontFamily', e.target.value)}
                  >
                    <option value="Roboto, sans-serif">Roboto</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="'Open Sans', sans-serif">Open Sans</option>
                    <option value="'Segoe UI', sans-serif">Segoe UI</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FormSettings; 