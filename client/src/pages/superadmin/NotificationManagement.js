import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import AdminNavbar from '../../components/Navbar';
import SuperAdminMenu from '../../components/SuperAdminMenu';
import { superAdminApi } from '../../services/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './NotificationManagement.css';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    targetUsers: 'all',
    targetUsersList: [],
    expiresAt: '',
    sendEmail: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sendingEmails, setSendingEmails] = useState(false);

  const notificationTypes = [
    { value: 'info', label: 'Thông tin', color: 'primary' },
    { value: 'warning', label: 'Cảnh báo', color: 'warning' },
    { value: 'error', label: 'Lỗi', color: 'danger' },
    { value: 'success', label: 'Thành công', color: 'success' }
  ];

  const targetUserTypes = [
    { value: 'all', label: 'Tất cả' },
    { value: 'admins', label: 'Tất cả Admin' },
    { value: 'teams', label: 'Tất cả Đội chơi' },
    { value: 'specificAdmins', label: 'Admin cụ thể' },
    { value: 'specificTeams', label: 'Đội chơi cụ thể' }
  ];

  useEffect(() => {
    fetchNotifications();
    fetchAdmins();
    fetchTeams();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await superAdminApi.getAllNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Không thể tải danh sách thông báo. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await superAdminApi.getAllAdmins();
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await superAdminApi.getAllTeams();
      setTeams(response.data?.teams || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleCreateClick = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      targetUsers: 'all',
      targetUsersList: [],
      expiresAt: '',
      sendEmail: false
    });
    setShowCreateModal(true);
  };

  const handleEditClick = (notification) => {
    setSelectedNotification(notification);
    
    // Format date for input
    const expiresDate = notification.expiresAt ? new Date(notification.expiresAt) : '';
    const formattedExpiresDate = expiresDate ? format(expiresDate, 'yyyy-MM-dd', { locale: vi }) : '';
    
    // Chuyển đổi targetUsersList từ đối tượng sang mảng id
    const targetUsersList = notification.targetUsersList?.map(user => user._id) || [];
    
    setFormData({
      title: notification.title,
      content: notification.content,
      type: notification.type,
      targetUsers: notification.targetUsers,
      targetUsersList: targetUsersList,
      isActive: notification.isActive,
      expiresAt: formattedExpiresDate,
      sendEmail: notification.sendEmail || false
    });
    
    setShowEditModal(true);
  };

  const handleDeleteClick = (notification) => {
    setSelectedNotification(notification);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'targetUsers') {
      // Khi thay đổi đối tượng nhận, xóa các đối tượng cụ thể đã chọn
      setFormData({
        ...formData,
        targetUsers: value,
        targetUsersList: []
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleTargetUsersListChange = (e) => {
    const options = e.target.options;
    const selected = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    
    setFormData({
      ...formData,
      targetUsersList: selected
    });
  };

  const handleContentChange = (content) => {
    setFormData({
      ...formData,
      content
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await superAdminApi.createNotification(formData);
      
      // Cập nhật state
      setNotifications([response.data, ...notifications]);
      
      setSuccess('Tạo thông báo mới thành công');
      setTimeout(() => setSuccess(null), 3000);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating notification:', err);
      setError(err.response?.data?.message || 'Lỗi khi tạo thông báo mới');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await superAdminApi.updateNotification(selectedNotification._id, formData);
      
      // Cập nhật state
      setNotifications(notifications.map(notification => 
        notification._id === selectedNotification._id ? response.data : notification
      ));
      
      setSuccess('Cập nhật thông báo thành công');
      setTimeout(() => setSuccess(null), 3000);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating notification:', err);
      setError(err.response?.data?.message || 'Lỗi khi cập nhật thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await superAdminApi.deleteNotification(selectedNotification._id);
      
      // Cập nhật state
      setNotifications(notifications.filter(notification => notification._id !== selectedNotification._id));
      
      setSuccess('Xóa thông báo thành công');
      setTimeout(() => setSuccess(null), 3000);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err.response?.data?.message || 'Lỗi khi xóa thông báo');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  const getNotificationTypeBadge = (type) => {
    const typeInfo = notificationTypes.find(t => t.value === type) || notificationTypes[0];
    return <Badge bg={typeInfo.color}>{typeInfo.label}</Badge>;
  };

  const getTargetUserLabel = (notification) => {
    const targetInfo = targetUserTypes.find(t => t.value === notification.targetUsers) || targetUserTypes[0];
    
    // Hiển thị thêm thông tin về đối tượng cụ thể nếu có
    if (notification.targetUsers === 'specificAdmins' && notification.targetUsersList?.length > 0) {
      const adminNames = notification.targetUsersList.map(admin => admin.name || admin.username).join(', ');
      return `${targetInfo.label}: ${adminNames}`;
    } else if (notification.targetUsers === 'specificTeams' && notification.targetUsersList?.length > 0) {
      const teamNames = notification.targetUsersList.map(team => team.name || team.teamName).join(', ');
      return `${targetInfo.label}: ${teamNames}`;
    }
    
    return targetInfo.label;
  };

  // Thêm phần hiển thị đối tượng trong form
  const renderTargetUsersSelect = () => {
    if (formData.targetUsers === 'specificAdmins') {
      return (
        <Form.Group className="mb-3">
          <Form.Label>Chọn Admin (nhấn giữ Ctrl để chọn nhiều)</Form.Label>
          <Form.Select 
            multiple 
            name="targetUsersList"
            value={formData.targetUsersList}
            onChange={handleTargetUsersListChange}
            style={{ height: '150px' }}
          >
            {admins.map(admin => (
              <option key={admin._id} value={admin._id}>
                {admin.name || admin.username}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      );
    } else if (formData.targetUsers === 'specificTeams') {
      return (
        <Form.Group className="mb-3">
          <Form.Label>Chọn Đội chơi (nhấn giữ Ctrl để chọn nhiều)</Form.Label>
          <Form.Select 
            multiple 
            name="targetUsersList"
            value={formData.targetUsersList}
            onChange={handleTargetUsersListChange}
            style={{ height: '150px' }}
          >
            {teams.map(team => (
              <option key={team._id} value={team._id}>
                {team.name || team.teamName}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      );
    }
    
    return null;
  };

  // Tùy chỉnh cấu hình ReactQuill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      [{'color': []}, {'background': []}],
      ['link'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link',
    'color', 'background'
  ];

  // Hàm kích hoạt gửi email thông báo
  const handleSendEmailsClick = async () => {
    try {
      setSendingEmails(true);
      setError(null);
      
      await superAdminApi.sendNotificationEmails();
      
      setSuccess('Đã kích hoạt gửi email thông báo thành công');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error sending notification emails:', err);
      setError(err.response?.data?.message || 'Lỗi khi gửi email thông báo');
    } finally {
      setSendingEmails(false);
    }
  };

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
              <h1 className="h2">Quản lý Thông báo</h1>
              <div>
                <Button 
                  variant="primary" 
                  className="me-2"
                  onClick={handleSendEmailsClick}
                  disabled={sendingEmails}
                >
                  {sendingEmails ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-envelope-fill me-1"></i> Gửi Email Thông báo
                    </>
                  )}
                </Button>
                <Button variant="success" onClick={handleCreateClick}>
                  <i className="bi bi-plus-circle me-1"></i> Tạo thông báo mới
                </Button>
              </div>
            </div>
            
            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h5 className="card-title mb-3">Danh sách thông báo</h5>
                
                {loading && !notifications.length ? (
                  <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Đang tải dữ liệu...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th width="20%">Tiêu đề</th>
                          <th>Loại</th>
                          <th width="20%">Đối tượng nhận</th>
                          <th>Trạng thái</th>
                          <th>Email</th>
                          <th>Ngày tạo</th>
                          <th>Ngày hết hạn</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notifications.map(notification => (
                          <tr key={notification._id}>
                            <td>{notification.title}</td>
                            <td>{getNotificationTypeBadge(notification.type)}</td>
                            <td>{getTargetUserLabel(notification)}</td>
                            <td>
                              {notification.isActive ? (
                                new Date(notification.expiresAt) < new Date() ? (
                                  <Badge bg="danger">Hết hạn</Badge>
                                ) : (
                                  <Badge bg="success">Đang hiển thị</Badge>
                                )
                              ) : (
                                <Badge bg="secondary">Đã tắt</Badge>
                              )}
                            </td>
                            <td>
                              {notification.sendEmail ? (
                                notification.emailSent ? (
                                  <Badge bg="success">
                                    <i className="bi bi-envelope-check me-1"></i>
                                    Đã gửi
                                  </Badge>
                                ) : (
                                  <Badge bg="warning text-dark">
                                    <i className="bi bi-envelope me-1"></i>
                                    Chờ gửi
                                  </Badge>
                                )
                              ) : (
                                <Badge bg="light text-dark">Không gửi</Badge>
                              )}
                            </td>
                            <td>{formatDate(notification.createdAt)}</td>
                            <td>{formatDate(notification.expiresAt)}</td>
                            <td>
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="me-1 mb-1"
                                onClick={() => handleEditClick(notification)}
                              >
                                <i className="bi bi-pencil-square"></i>
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                className="mb-1" 
                                onClick={() => handleDeleteClick(notification)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal Tạo Thông Báo */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tạo thông báo mới</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Body>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề thông báo</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Nội dung</Form.Label>
              <div className="quill-wrapper">
                <ReactQuill 
                  value={formData.content}
                  onChange={handleContentChange}
                  modules={quillModules}
                  formats={quillFormats}
                  theme="snow"
                  className="custom-quill"
                />
              </div>
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại thông báo</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    {notificationTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Đối tượng nhận</Form.Label>
                  <Form.Select
                    name="targetUsers"
                    value={formData.targetUsers}
                    onChange={handleInputChange}
                  >
                    {targetUserTypes.map(target => (
                      <option key={target.value} value={target.value}>{target.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            {renderTargetUsersSelect()}
            
            <Form.Group className="mb-3">
              <Form.Label>Ngày hết hạn (để trống nếu không có)</Form.Label>
              <Form.Control
                type="date"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="sendEmail"
                name="sendEmail"
                label="Gửi thông báo này qua email"
                checked={formData.sendEmail}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button variant="success" type="submit" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo thông báo'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Chỉnh sửa Thông Báo */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa thông báo</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề thông báo</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Nội dung</Form.Label>
              <div className="quill-wrapper">
                <ReactQuill 
                  value={formData.content}
                  onChange={handleContentChange}
                  modules={quillModules}
                  formats={quillFormats}
                  theme="snow"
                  className="custom-quill"
                />
              </div>
            </Form.Group>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại thông báo</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    {notificationTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Đối tượng nhận</Form.Label>
                  <Form.Select
                    name="targetUsers"
                    value={formData.targetUsers}
                    onChange={handleInputChange}
                  >
                    {targetUserTypes.map(target => (
                      <option key={target.value} value={target.value}>{target.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Check
                    type="switch"
                    id="isActive"
                    name="isActive"
                    label={formData.isActive ? "Đang hiển thị" : "Đã tắt"}
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {renderTargetUsersSelect()}
            
            <Form.Group className="mb-3">
              <Form.Label>Ngày hết hạn (để trống nếu không có)</Form.Label>
              <Form.Control
                type="date"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="sendEmail"
                name="sendEmail"
                label="Gửi thông báo này qua email"
                checked={formData.sendEmail}
                onChange={handleInputChange}
              />
              {selectedNotification?.emailSent && (
                <small className="text-success d-block mt-1">
                  <i className="bi bi-check-circle-fill me-1"></i>
                  Đã gửi email vào lúc {formatDate(selectedNotification.emailSentAt)}
                </small>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Xóa Thông Báo */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          
          <p>Bạn có chắc chắn muốn xóa thông báo "{selectedNotification?.title}"?</p>
          <p className="text-danger">Hành động này không thể hoàn tác.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteSubmit} disabled={loading}>
            {loading ? 'Đang xóa...' : 'Xóa thông báo'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NotificationManagement; 