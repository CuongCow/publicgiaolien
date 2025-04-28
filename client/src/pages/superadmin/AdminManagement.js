import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AdminNavbar from '../../components/Navbar';
import SuperAdminMenu from '../../components/SuperAdminMenu';
import { superAdminApi } from '../../services/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'admin',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await superAdminApi.getAllAdmins();
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Không thể tải danh sách admin. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role || 'admin',
      newPassword: '',
      confirmPassword: ''
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  const handleResetPasswordClick = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      ...formData,
      newPassword: '',
      confirmPassword: ''
    });
    setShowResetPasswordModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const updateData = {
        username: formData.username,
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      
      const response = await superAdminApi.updateAdmin(selectedAdmin._id, updateData);
      
      // Cập nhật state
      setAdmins(admins.map(admin => 
        admin._id === selectedAdmin._id ? { ...admin, ...updateData } : admin
      ));
      
      setSuccess('Cập nhật thông tin admin thành công');
      setTimeout(() => setSuccess(null), 3000);
      setShowEditModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin admin');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const resetData = {
        newPassword: formData.newPassword
      };
      
      await superAdminApi.resetAdminPassword(selectedAdmin._id, resetData);
      
      setSuccess('Đặt lại mật khẩu thành công');
      setTimeout(() => setSuccess(null), 3000);
      setShowResetPasswordModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await superAdminApi.deleteAdmin(selectedAdmin._id);
      
      // Cập nhật state
      setAdmins(admins.filter(admin => admin._id !== selectedAdmin._id));
      
      setSuccess('Xóa admin thành công');
      setTimeout(() => setSuccess(null), 3000);
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa admin');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
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
              <h1 className="h2">Quản lý Admin</h1>
              <Button as={Link} to="/superadmin/invite-codes" variant="primary">
                <i className="bi bi-ticket-perforated me-1"></i> Quản lý mã mời
              </Button>
            </div>
            
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h5 className="card-title mb-3">Danh sách Admin</h5>
                
                {loading && !admins.length ? (
                  <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Đang tải dữ liệu...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th>Tên đăng nhập</th>
                          <th>Họ tên</th>
                          <th>Email</th>
                          <th>Vai trò</th>
                          <th>Ngày tạo</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.map(admin => (
                          <tr key={admin._id}>
                            <td>{admin.username}</td>
                            <td>{admin.name}</td>
                            <td>{admin.email}</td>
                            <td>
                              {admin.role === 'superadmin' ? (
                                <Badge bg="danger">Super Admin</Badge>
                              ) : (
                                <Badge bg="primary">Admin</Badge>
                              )}
                            </td>
                            <td>{formatDate(admin.createdAt)}</td>
                            <td>
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="me-1 mb-1"
                                onClick={() => handleEditClick(admin)}
                              >
                                <i className="bi bi-pencil-square"></i>
                              </Button>
                              <Button 
                                variant="outline-warning" 
                                size="sm" 
                                className="me-1 mb-1"
                                onClick={() => handleResetPasswordClick(admin)}
                              >
                                <i className="bi bi-key"></i>
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                className="mb-1" 
                                onClick={() => handleDeleteClick(admin)}
                                disabled={admin.role === 'superadmin'}
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

      {/* Modal Chỉnh sửa Admin */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa Admin</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <Form.Group className="mb-3">
              <Form.Label>Tên đăng nhập</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Họ tên</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Vai trò</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Đặt lại mật khẩu */}
      <Modal show={showResetPasswordModal} onHide={() => setShowResetPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Đặt lại mật khẩu</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleResetPasswordSubmit}>
          <Modal.Body>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="alert alert-info">
              Đặt lại mật khẩu cho admin: <strong>{selectedAdmin?.username}</strong>
            </div>
            
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                minLength={6}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Xác nhận mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength={6}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowResetPasswordModal(false)}>
              Hủy
            </Button>
            <Button variant="warning" type="submit" disabled={loading}>
              {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Xác nhận xóa Admin */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          
          <div className="alert alert-warning">
            Bạn có chắc chắn muốn xóa admin <strong>{selectedAdmin?.username}</strong>?
            <br />
            Hành động này không thể hoàn tác.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteSubmit} disabled={loading}>
            {loading ? 'Đang xóa...' : 'Xóa admin'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminManagement; 