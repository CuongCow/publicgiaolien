import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Form, 
  InputGroup, Tab, Nav, Alert, Spinner, Modal, Tabs, Badge
} from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminNavbar from '../../components/Navbar';
import { secretMessageApi, stationApi } from '../../services/api';

const SecretMessageForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newAnswer, setNewAnswer] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    teamNote: '',
    content: '',
    contentType: 'text',
    fontSize: '1.05rem',
    fontWeight: '500',
    lineHeight: '1.5',
    letterSpacing: 'normal',
    paragraphSpacing: '0.8rem',
    correctAnswer: [],
    userInfoFields: [],
    ottContent: '',
    nwContent: '',
    showText: true,
    showImage: false,
    showOTT: true,
    showNW: true,
    maxAttempts: 0
  });
  
  // Tải mật thư khi chỉnh sửa
  useEffect(() => {
    const fetchMessage = async () => {
      if (!isEditing) return;
      
      try {
        setLoading(true);
        const response = await secretMessageApi.getById(id);
        const message = response.data.data;
        
        // Cập nhật form data
        setFormData({
          name: message.name || '',
          title: message.title || '',
          teamNote: message.teamNote || '',
          content: message.content || '',
          contentType: message.contentType || 'text',
          fontSize: message.fontSize || '1.05rem',
          fontWeight: message.fontWeight || '500',
          lineHeight: message.lineHeight || '1.5',
          letterSpacing: message.letterSpacing || 'normal',
          paragraphSpacing: message.paragraphSpacing || '0.8rem',
          correctAnswer: message.correctAnswer || [],
          userInfoFields: message.userInfoFields || [],
          ottContent: message.ottContent || '',
          nwContent: message.nwContent || '',
          showText: message.showText !== undefined ? message.showText : true,
          showImage: message.showImage !== undefined ? message.showImage : false,
          showOTT: message.showOTT !== undefined ? message.showOTT : true,
          showNW: message.showNW !== undefined ? message.showNW : true,
          maxAttempts: message.maxAttempts || 0
        });
      } catch (error) {
        console.error('Error fetching message:', error);
        toast.error('Không thể tải thông tin mật thư');
        navigate('/admin/secret-messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id, isEditing, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleArrayChange = (e) => {
    const { name, value } = e.target;
    // Phân tách chuỗi thành mảng, loại bỏ khoảng trắng đầu/cuối
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [name]: arrayValue }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Xử lý upload hình ảnh nếu cần
      let formattedData = {...formData};
      
      // Kiểm tra nếu contentType là image nhưng không có nội dung ảnh
      if (formattedData.contentType === 'image' && !formattedData.content.startsWith('data:image')) {
        toast.error('Vui lòng tải lên hình ảnh cho mật thư');
        setSubmitting(false);
        return;
      }

      // Đảm bảo dữ liệu maxAttempts là số
      formattedData.maxAttempts = parseInt(formattedData.maxAttempts) || 0;
      
      // Đảm bảo dữ liệu hình ảnh được gửi đúng cách
      if ((formattedData.contentType === 'image' || formattedData.contentType === 'both') && formattedData.content.startsWith('data:image')) {
        console.log('Đã xác nhận hình ảnh có định dạng base64');
      }
      
      // Kiểm tra kích thước dữ liệu
      const dataSize = JSON.stringify(formattedData).length;
      const sizeInMB = dataSize / (1024 * 1024);
      console.log(`Kích thước dữ liệu: ${sizeInMB.toFixed(2)}MB`);
      
      // Cảnh báo nếu kích thước lớn nhưng vẫn cho phép gửi
      if (sizeInMB > 50) {
        const confirmUpload = window.confirm(`Dữ liệu khá lớn (${sizeInMB.toFixed(2)}MB). Việc tải lên có thể mất nhiều thời gian hoặc gặp lỗi. Bạn có muốn tiếp tục không?`);
        if (!confirmUpload) {
          setSubmitting(false);
          return;
        }
      }
      
      console.log('Gửi dữ liệu:', {
        contentType: formattedData.contentType,
        hasImageContent: formattedData.content.startsWith('data:image'),
        maxAttempts: formattedData.maxAttempts,
        dataSize: `${sizeInMB.toFixed(2)}MB`
      });
      
      // Gọi API tạo mới hoặc cập nhật
      if (isEditing) {
        await secretMessageApi.update(id, formattedData);
        toast.success('Cập nhật mật thư thành công');
      } else {
        await secretMessageApi.create(formattedData);
        toast.success('Tạo mật thư thành công');
      }
      
      // Quay lại trang danh sách
      navigate('/admin/secret-messages');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(`Lỗi khi ${isEditing ? 'cập nhật' : 'tạo'} mật thư: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Hàm kiểm tra kích thước file
  const checkFileSize = async (file) => {
    // Chuyển file thành base64 mà không nén
    const base64 = await fileToBase64(file);
    
    // Kiểm tra kích thước
    const base64Size = base64.length * 0.75; // ước tính byte
    const sizeMB = base64Size / (1024 * 1024);
    
    console.log(`Kích thước hình ảnh: ${sizeMB.toFixed(2)}MB`);
    
    if (sizeMB > 5) {
      toast.warning(`Hình ảnh có kích thước lớn (${sizeMB.toFixed(2)}MB). Việc tải lên có thể mất nhiều thời gian.`);
    }
    
    return { base64, sizeMB };
  };
  
  // Hàm chuyển File thành base64
  const fileToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  };
  
  // Xử lý upload hình ảnh
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Kiểm tra kích thước file (tối đa 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Hình ảnh không được vượt quá 10MB');
      e.target.value = null; // Xóa lựa chọn file
      return;
    }
    
    // Kiểm tra định dạng file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ các định dạng JPG, PNG, GIF và WEBP');
      e.target.value = null; // Xóa lựa chọn file
      return;
    }
    
    try {
      // Hiển thị trạng thái đang tải
      setLoading(true);
      // Lưu lại tab hiện tại để tránh bị chuyển về tab mặc định
      const currentTab = activeTab;
      
      // Chuyển đổi hình ảnh thành base64 mà không nén
      const { base64 } = await checkFileSize(file);
      
      // Lưu vào state
      setFormData(prev => ({ ...prev, content: base64 }));
      setLoading(false);
      // Đảm bảo tab không bị thay đổi sau khi tải xong
      setActiveTab(currentTab);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Không thể tải hình ảnh lên');
      setLoading(false);
    }
  };
  
  // Render preview
  const renderPreview = () => {
    return (
      <Modal 
        show={showPreview} 
        onHide={() => setShowPreview(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Xem trước mật thư</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3 className="text-center mb-2">{formData.name}</h3>
          {formData.title && (
            <h5 className="text-center mb-3">{formData.title}</h5>
          )}
          
          {formData.teamNote && (
            <Alert variant="info" className="mb-4">
              <i className="bi bi-info-circle me-2"></i>
              {formData.teamNote}
            </Alert>
          )}

          {/* Hiển thị form thông tin người dùng nếu có */}
          {formData.userInfoFields && formData.userInfoFields.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <h5 className="mb-3">Thông tin người dùng</h5>
                <Form>
                  {formData.userInfoFields.map((field, index) => (
                    <Form.Group key={index} className="mb-3">
                      <Form.Label>
                        {field.label} {field.required && <span className="text-danger">*</span>}
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder={`Điền ${field.label.toLowerCase()}`}
                        disabled
                      />
                    </Form.Group>
                  ))}
                  <Button variant="primary" disabled>Tiếp tục</Button>
                </Form>
              </Card.Body>
            </Card>
          )}
          
          {/* Hiển thị các tab nội dung */}
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Nội dung</h5>
            </Card.Header>
            <Card.Body>
              <Tabs defaultActiveKey="main" className="mb-3">
                <Tab eventKey="main" title="Nội dung">
                  <div 
                    className={`content-container p-3 bg-light-subtle rounded paragraph-spacing-${getParagraphSpacingClass(formData.paragraphSpacing)}`}
                    style={{
                      fontSize: formData.fontSize,
                      fontWeight: formData.fontWeight,
                      lineHeight: formData.lineHeight,
                      letterSpacing: formData.letterSpacing
                    }}
                  >
                    {formData.showText && (formData.contentType === 'text' || formData.contentType === 'both') ? (
                      <div className="mb-4">
                        <div className="d-flex align-items-center mb-2">
                          <div style={{ backgroundColor: '#0d6efd', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                            OTT:
                          </div>
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{formData.ottContent}</div>
                      </div>
                    ) : null}
                    
                    {formData.showNW && formData.nwContent ? (
                      <div className="mb-4">
                        <div className="d-flex align-items-center mb-2">
                          <div style={{ backgroundColor: '#0d6efd', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                            NW:
                          </div>
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{formData.nwContent}</div>
                      </div>
                    ) : null}
                                        
                                        {formData.showImage && (formData.contentType === 'image' || formData.contentType === 'both') && formData.content.startsWith('data:image') ? (
                      <div className="text-center mb-4">
                        <img 
                          src={formData.content} 
                          alt="Mật thư" 
                          className="img-fluid" 
                          style={{ maxHeight: '400px' }}
                        />
                      </div>
                    ) : null}
                  </div>
                </Tab>
                
                {formData.ottContent && formData.showOTT && (
                  <Tab eventKey="ott" title="Nội dung OTT">
                    <div 
                      className={`content-container p-3 bg-light-subtle rounded paragraph-spacing-${getParagraphSpacingClass(formData.paragraphSpacing)}`}
                      style={{
                        fontSize: formData.fontSize,
                        fontWeight: formData.fontWeight,
                        lineHeight: formData.lineHeight,
                        letterSpacing: formData.letterSpacing
                      }}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <div style={{ backgroundColor: '#0d6efd', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                          OTT:
                        </div>
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{formData.ottContent}</div>
                    </div>
                  </Tab>
                )}
                
                {formData.nwContent && formData.showNW && (
                  <Tab eventKey="nw" title="Nội dung NW">
                    <div 
                      className={`content-container p-3 bg-light-subtle rounded paragraph-spacing-${getParagraphSpacingClass(formData.paragraphSpacing)}`}
                      style={{
                        fontSize: formData.fontSize,
                        fontWeight: formData.fontWeight,
                        lineHeight: formData.lineHeight,
                        letterSpacing: formData.letterSpacing
                      }}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <div style={{ backgroundColor: '#0d6efd', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                          NW:
                        </div>
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{formData.nwContent}</div>
                    </div>
                  </Tab>
                )}
              </Tabs>
            </Card.Body>
          </Card>
          
          {formData.correctAnswer && formData.correctAnswer.length > 0 && (
            <Card>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Đáp án</h5>
              </Card.Header>
              <Card.Body>
                <ul className="list-group list-group-flush">
                  {formData.correctAnswer.map((answer, index) => (
                    <li key={index} className="list-group-item">
                      <Badge bg="success" className="me-2">Đáp án {index + 1}</Badge>
                      {answer}
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
  
  // Hàm helper để lấy class CSS cho khoảng cách đoạn
  const getParagraphSpacingClass = (spacing) => {
    if (!spacing || spacing === '0') return 'none';
    if (spacing === '0.5rem') return 'small';
    if (spacing === '0.8rem') return 'medium';
    if (spacing === '1.2rem') return 'large';
    if (spacing === '1.8rem') return 'xlarge';
    
    // Fallback to medium spacing if unknown value
    return 'medium';
  };
  
  // Hàm xử lý thêm đáp án mới
  const handleAddAnswer = () => {
    if (!newAnswer.trim()) return;
    
    // Thêm đáp án mới vào danh sách
    setFormData(prev => ({
      ...prev,
      correctAnswer: [...prev.correctAnswer, newAnswer.trim()]
    }));
    
    // Reset input
    setNewAnswer('');
  };
  
  // Hàm xử lý xóa đáp án
  const handleRemoveAnswer = (index) => {
    setFormData(prev => ({
      ...prev,
      correctAnswer: prev.correctAnswer.filter((_, i) => i !== index)
    }));
  };
  
  if (loading) {
    return (
      <>
        <AdminNavbar />
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải thông tin mật thư...</p>
        </Container>
      </>
    );
  }
  
  return (
    <>
      <AdminNavbar />
      <Container className="py-4">
        <Row className="mb-4 align-items-center">
          <Col>
            <h1 className="mb-0">{isEditing ? 'Chỉnh sửa mật thư' : 'Tạo mật thư mới'}</h1>
            <p className="text-muted">
              {isEditing 
                ? 'Cập nhật thông tin mật thư của bạn' 
                : 'Tạo một mật thư mới cho hội trại'}
            </p>
          </Col>
          <Col xs="auto">
            <Button 
              as={Link} 
              to="/admin/secret-messages" 
              variant="outline-secondary"
              className="me-2"
            >
              <i className="bi bi-arrow-left me-2"></i>Quay lại
            </Button>
            <Button 
              variant="primary"
              onClick={() => setShowPreview(true)}
            >
              <i className="bi bi-eye me-2"></i>Xem trước
            </Button>
          </Col>
        </Row>

        <Card className="shadow-sm border-0">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Tab.Container 
                activeKey={activeTab} 
                onSelect={(key) => setActiveTab(key)}
              >
                <Row>
                  <Col md={3}>
                    <Nav 
                      variant="pills" 
                      className="flex-column mb-4 secret-message-nav"
                      style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        padding: '15px',
                        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <Nav.Item style={{ marginBottom: '10px', width: '100%' }}>
                        <Nav.Link 
                          eventKey="basic" 
                          className="mb-2 nav-link-basic"
                          style={{ borderLeft: '3px solid #007bff' }}
                        >
                          <i className="bi bi-info-circle me-2"></i>
                          Thông tin cơ bản
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item style={{ marginBottom: '10px', width: '100%' }}>
                        <Nav.Link 
                          eventKey="content" 
                          className="mb-2 nav-link-content"
                          style={{ borderLeft: '3px solid #28a745' }}
                        >
                          <i className="bi bi-file-text me-2"></i>
                          Nội dung mật thư
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item style={{ marginBottom: '10px', width: '100%' }}>
                        <Nav.Link 
                          eventKey="user-info" 
                          className="mb-2 nav-link-user-info"
                          style={{ borderLeft: '3px solid #ffc107' }}
                        >
                          <i className="bi bi-person-badge me-2"></i>
                          Thông tin người dùng
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item style={{ marginBottom: '10px', width: '100%' }}>
                        <Nav.Link 
                          eventKey="formatting" 
                          className="mb-2 nav-link-formatting"
                          style={{ borderLeft: '3px solid #dc3545' }}
                        >
                          <i className="bi bi-type me-2"></i>
                          Định dạng hiển thị
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item style={{ marginBottom: '10px', width: '100%' }}>
                        <Nav.Link 
                          eventKey="answer" 
                          className="nav-link-answer"
                          style={{ borderLeft: '3px solid #6f42c1' }}
                        >
                          <i className="bi bi-check-circle me-2"></i>
                          Đáp án
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item style={{ marginBottom: '10px', width: '100%' }}>
                        <Nav.Link 
                          eventKey="attempts" 
                          className="nav-link-attempts"
                          style={{ borderLeft: '3px solid #fd7e14' }}
                        >
                          <i className="bi bi-123 me-2"></i>
                          Số lần thử
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Col>
                  <Col md={9}>
                    <Tab.Content>
                      <Tab.Pane eventKey="basic">
                        <h4 className="mb-4">Thông tin cơ bản</h4>
                        <Form.Group className="mb-3">
                          <Form.Label>Tên mật thư <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Nhập tên mật thư"
                            required
                          />
                          <Form.Text className="text-muted">
                            Tên dùng để nhận diện mật thư, sẽ hiện cho người dùng
                          </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Tiêu đề mật thư</Form.Label>
                          <Form.Control
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Nhập tiêu đề mật thư (không bắt buộc)"
                          />
                          <Form.Text className="text-muted">
                            Tiêu đề sẽ hiển thị ngay dưới tên mật thư (ví dụ: "Bí mật từ đội trưởng")
                          </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Ghi chú cho đội chơi</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            name="teamNote"
                            value={formData.teamNote}
                            onChange={handleChange}
                            placeholder="Nhập ghi chú cho đội chơi (không bắt buộc)"
                          />
                          <Form.Text className="text-muted">
                            Ghi chú này sẽ hiển thị cho đội chơi khi họ quét mã QR, có thể là gợi ý hoặc hướng dẫn
                          </Form.Text>
                        </Form.Group>
                      </Tab.Pane>
                      
                      <Tab.Pane eventKey="content">
                        <h4 className="mb-4">Nội dung mật thư</h4>
                        <Form.Group className="mb-3">
                          <Form.Label>Loại nội dung <span className="text-danger">*</span></Form.Label>
                          <Form.Select
                            name="contentType"
                            value={formData.contentType}
                            onChange={handleChange}
                            required
                          >
                            <option value="text">Văn bản</option>
                            <option value="image">Hình ảnh</option>
                            <option value="both">Cả văn bản và hình ảnh</option>
                          </Form.Select>
                        </Form.Group>
                        
                        {(formData.contentType === 'text' || formData.contentType === 'both') && (
                          <>
                            <Form.Group className="mb-4">
                              <Form.Label>Nội dung dạng OTT <span className="text-danger">*</span></Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={4}
                                name="ottContent"
                                value={formData.ottContent}
                                onChange={(e) => {
                                  handleChange(e);
                                  // Đồng bộ nội dung OTT với nội dung chính
                                  setFormData(prev => ({
                                    ...prev,
                                    content: e.target.value
                                  }));
                                }}
                                placeholder="Nhập nội dung định dạng OTT"
                                required={formData.contentType === 'text'}
                              />
                              <Form.Text className="text-muted">
                             Chìa khóa (Ký hiệu OTT): Là một hình thức gợi ý cho người dịch tìm ra hướng giải mật thư. Chìa khóa có thể là một câu thơ hoặc một ký hiệu nào đó bằng hình vẽ
                              </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label>Nội dung dạng NW</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={4}
                                name="nwContent"
                                value={formData.nwContent}
                                onChange={handleChange}
                                placeholder="Nhập nội dung định dạng NW (không bắt buộc)"
                              />
                              <Form.Text className="text-muted">
                              Bản mật mã (Ký hiệu NW): Là những ký tự hoặc hình vẽ, thoạt đầu có vẽ rất khó hiểu. Sau khi nghiên cứu kỹ chìa khóa, ta sẽ tìm ra hướng giải bằng cách đối chiếu những dữ kiện mà chìa khoá đã gợi ý.
                              </Form.Text>
                            </Form.Group>

                            <Row className="mb-4">
                              <Col md={4}>
                                <Form.Check 
                                  type="checkbox"
                                  id="showOTT"
                                  label="Hiển thị OTT"
                                  checked={formData.showOTT}
                                  onChange={(e) => setFormData({...formData, showOTT: e.target.checked})}
                                />
                              </Col>
                              <Col md={4}>
                                <Form.Check
                                  type="checkbox" 
                                  id="showNW"
                                  label="Hiển thị NW"
                                  checked={formData.showNW}
                                  onChange={(e) => setFormData({...formData, showNW: e.target.checked})}
                                />
                              </Col>
                              <Col md={4}>
                                <Form.Check
                                  type="checkbox" 
                                  id="showImage"
                                  label="Hiển thị ảnh"
                                  checked={formData.showImage}
                                  onChange={(e) => setFormData({...formData, showImage: e.target.checked})}
                                  disabled={formData.contentType === 'text'}
                                />
                              </Col>
                            </Row>
                          </>
                        )}
                        
                        {(formData.contentType === 'image' || formData.contentType === 'both') && (
                          <Form.Group className="mb-3">
                            <Form.Label>Hình ảnh mật thư</Form.Label>
                            <Form.Control
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                            <Alert variant="warning" className="mt-2 p-2 small">
                              <i className="bi bi-exclamation-triangle-fill me-2"></i>
                              Giới hạn hình ảnh: tối đa 10MB, định dạng JPG/PNG/GIF/WEBP. Hình ảnh sẽ được giữ nguyên chất lượng gốc.
                            </Alert>
                            {formData.content && formData.content.startsWith('data:image') && (
                              <div className="mt-3 text-center">
                                <img 
                                  src={formData.content} 
                                  alt="Preview" 
                                  className="img-thumbnail" 
                                  style={{ maxHeight: '800px' }}
                                />
                              </div>
                            )}
                            {formData.contentType === 'image' && (
                              <Form.Check 
                                type="checkbox"
                                id="showImage"
                                label="Hiển thị hình ảnh"
                                className="mt-3"
                                checked={formData.showImage}
                                onChange={(e) => setFormData({...formData, showImage: e.target.checked})}
                              />
                            )}
                          </Form.Group>
                        )}

                        <Alert variant="info">
                          <i className="bi bi-info-circle me-2"></i>
                          Các định dạng OTT và NW giúp tạo ra nhiều loại thử thách cho người dùng
                        </Alert>
                      </Tab.Pane>
                      
                      <Tab.Pane eventKey="user-info">
                        <h4 className="mb-4">Thông tin người dùng</h4>
                        <p className="text-muted mb-3">
                          Thêm các trường thông tin mà người dùng cần nhập khi xem mật thư
                        </p>
                        
                        {formData.userInfoFields.map((field, index) => (
                          <Row key={index} className="mb-3 align-items-center">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Tên trường</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={field.label}
                                  onChange={(e) => {
                                    const updatedFields = [...formData.userInfoFields];
                                    updatedFields[index].label = e.target.value;
                                    setFormData(prev => ({ ...prev, userInfoFields: updatedFields }));
                                  }}
                                  placeholder="VD: Tên đội trưởng"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group className="mt-md-0 mt-2">
                                <Form.Check 
                                  type="checkbox" 
                                  label="Bắt buộc"
                                  checked={field.required}
                                  onChange={(e) => {
                                    const updatedFields = [...formData.userInfoFields];
                                    updatedFields[index].required = e.target.checked;
                                    setFormData(prev => ({ ...prev, userInfoFields: updatedFields }));
                                  }}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={2}>
                              <Button 
                                variant="outline-danger" 
                                className="mt-md-0 mt-2"
                                onClick={() => {
                                  const updatedFields = [...formData.userInfoFields];
                                  updatedFields.splice(index, 1);
                                  setFormData(prev => ({ ...prev, userInfoFields: updatedFields }));
                                }}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </Col>
                          </Row>
                        ))}
                        
                        <Button 
                          variant="outline-primary"
                          className="mt-2 mb-4"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              userInfoFields: [
                                ...prev.userInfoFields,
                                { label: '', required: false }
                              ]
                            }));
                          }}
                        >
                          <i className="bi bi-plus-circle me-2"></i>
                          Thêm trường thông tin
                        </Button>
                        
                        <Alert variant="info">
                          <i className="bi bi-info-circle me-2"></i>
                          Người dùng sẽ được yêu cầu nhập các thông tin này trước khi xem mật thư.
                        </Alert>
                      </Tab.Pane>
                      
                      <Tab.Pane eventKey="formatting">
                        <h4 className="mb-4">Định dạng hiển thị</h4>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Kích thước chữ</Form.Label>
                              <Form.Select
                                name="fontSize"
                                value={formData.fontSize}
                                onChange={handleChange}
                              >
                                <option value="0.85rem">Rất nhỏ</option>
                                <option value="0.95rem">Nhỏ</option>
                                <option value="1.05rem">Vừa</option>
                                <option value="1.15rem">Lớn</option>
                                <option value="1.25rem">Rất lớn</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Độ đậm chữ</Form.Label>
                              <Form.Select
                                name="fontWeight"
                                value={formData.fontWeight}
                                onChange={handleChange}
                              >
                                <option value="300">Mỏng</option>
                                <option value="400">Thường</option>
                                <option value="500">Vừa</option>
                                <option value="600">Đậm</option>
                                <option value="700">Rất đậm</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Khoảng cách dòng</Form.Label>
                              <Form.Select
                                name="lineHeight"
                                value={formData.lineHeight}
                                onChange={handleChange}
                              >
                                <option value="1.2">Sát</option>
                                <option value="1.5">Vừa</option>
                                <option value="1.8">Rộng</option>
                                <option value="2.0">Rất rộng</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Khoảng cách chữ</Form.Label>
                              <Form.Select
                                name="letterSpacing"
                                value={formData.letterSpacing}
                                onChange={handleChange}
                              >
                                <option value="normal">Bình thường</option>
                                <option value="0.05em">Hơi rộng</option>
                                <option value="0.1em">Rộng</option>
                                <option value="0.15em">Rất rộng</option>
                                <option value="-0.05em">Hơi hẹp</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Khoảng cách đoạn văn</Form.Label>
                              <Form.Select
                                name="paragraphSpacing"
                                value={formData.paragraphSpacing}
                                onChange={handleChange}
                              >
                                <option value="0">Không có</option>
                                <option value="0.5rem">Nhỏ</option>
                                <option value="0.8rem">Vừa</option>
                                <option value="1.2rem">Lớn</option>
                                <option value="1.8rem">Rất lớn</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Alert variant="info">
                          <i className="bi bi-info-circle me-2"></i>
                          Định dạng hiển thị giúp bạn tùy chỉnh cách mật thư của bạn được hiện thị cho người dùng
                        </Alert>
                      </Tab.Pane>
                      
                      <Tab.Pane eventKey="answer">
                        <h4 className="mb-4">Đáp án mật thư</h4>
                        <Form.Group className="mb-4">
                          <Form.Label>Thêm đáp án mới</Form.Label>
                          <InputGroup>
                            <Form.Control
                              type="text"
                              placeholder="Nhập đáp án mới"
                              value={newAnswer || ''}
                              onChange={(e) => setNewAnswer(e.target.value)}
                            />
                            <Button 
                              variant="primary"
                              onClick={handleAddAnswer}
                              disabled={!newAnswer.trim()}
                            >
                              <i className="bi bi-plus-lg me-2"></i>Thêm
                            </Button>
                          </InputGroup>
                          <Form.Text className="text-muted">
                            Thêm từng đáp án riêng biệt. Hệ thống sẽ chấp nhận bất kỳ đáp án nào trong danh sách.
                          </Form.Text>
                        </Form.Group>
                        
                        {formData.correctAnswer.length > 0 ? (
                          <div className="mb-3">
                            <Form.Label>Danh sách đáp án ({formData.correctAnswer.length})</Form.Label>
                            <Card>
                              <Card.Body className="p-0">
                                <div className="list-group list-group-flush">
                                  {formData.correctAnswer.map((answer, index) => (
                                    <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                      <span>
                                        <Badge bg="secondary" className="me-2">{index + 1}</Badge>
                                        {answer}
                                      </span>
                                      <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={() => handleRemoveAnswer(index)}
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </Card.Body>
                            </Card>
                          </div>
                        ) : (
                          <Alert variant="warning">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            Chưa có đáp án nào được thêm. Mật thư có thể không cần đáp án nếu bạn chỉ muốn hiển thị thông tin.
                          </Alert>
                        )}
                      </Tab.Pane>
                      
                      <Tab.Pane eventKey="attempts">
                        <h4 className="mb-4">Giới hạn số lần thử</h4>
                        <Form.Group className="mb-3">
                          <Form.Label>Số lần thử tối đa</Form.Label>
                          <Form.Control
                            type="number"
                            min="0"
                            name="maxAttempts"
                            value={formData.maxAttempts}
                            onChange={(e) => setFormData({...formData, maxAttempts: parseInt(e.target.value) || 0})}
                            placeholder="Nhập số lần thử tối đa (0 = không giới hạn)"
                          />
                          <Form.Text className="text-muted">
                            Giới hạn số lần người dùng có thể trả lời mật thư này. Nhập 0 nếu không muốn giới hạn.
                          </Form.Text>
                        </Form.Group>
                        
                        <Alert variant="info">
                          <i className="bi bi-info-circle me-2"></i>
                          Hệ thống sẽ lưu số lần thử của người dùng dựa vào địa chỉ IP, giúp duy trì giới hạn ngay cả khi họ làm mới trang.
                        </Alert>

                        <Alert variant="warning">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                       Nên lưu ý tới người dùng về vấn đề này, giả sử 5 người dùng chung IP mạng cục bộ, tức là dùng chung 1 wifi thì Số lần thử vẫn được lưu trong tất cả 5 người dùng đó.
                        </Alert>
                        <Alert variant="warning">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          <strong>Lưu ý quan trọng:</strong> Nếu cả 5 người đó mong muốn giải mật thư riêng lẻ thì hãy bật mí cho họ biết vấn đề ở trên nhé, còn lại hãy giữ bí mật vấn đề này, vì họ có thể gian lận số lần thử.
                        </Alert>
                      </Tab.Pane>
                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>
              
              <div className="d-flex justify-content-end mt-4">
                <Button 
                  variant="secondary" 
                  as={Link}
                  to="/admin/secret-messages"
                  className="me-2"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Đang xử lý...
                    </>
                  ) : (
                    isEditing ? 'Cập nhật mật thư' : 'Tạo mật thư'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
      
      {renderPreview()}
    </>
  );
};

export default SecretMessageForm; 