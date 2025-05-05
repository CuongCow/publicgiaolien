import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import AdminNavbar from '../../components/Navbar';
import { authApi, invitationApi } from '../../services/api';
import { formatDate, handleApiError } from '../../utils/helpers';
import ErrorHandler from '../../components/ErrorHandler';
import LoadingSpinner from '../../components/LoadingSpinner';

const SuperAdminDashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy danh sách admin
      const adminsRes = await authApi.getAllAdmins();
      
      // Kiểm tra và chuyển đổi dữ liệu trước khi cập nhật state
      const processedAdmins = adminsRes.data.map(admin => {
        // Đảm bảo rằng mỗi admin có dữ liệu là chuỗi hoặc số
        return {
          ...admin,
          _id: admin._id ? admin._id.toString() : '',
          username: admin.username || '',
          name: admin.name || '',
          email: admin.email || '',
          role: admin.role || 'admin',
          createdAt: admin.createdAt || ''
        };
      });
      
      setAdmins(processedAdmins);
      
      // Thử lấy danh sách mã mời, nếu lỗi thì bỏ qua
      try {
        const invitationsRes = await invitationApi.getAll();
        
        // Kiểm tra và chuyển đổi dữ liệu invitations
        const processedInvitations = invitationsRes.data.map(invitation => {
          return {
            ...invitation,
            _id: invitation._id ? invitation._id.toString() : '',
            code: invitation.code || '',
            isUsed: !!invitation.isUsed,
            createdAt: invitation.createdAt || '',
            expiresAt: invitation.expiresAt || '',
            usedBy: invitation.usedBy ? {
              _id: invitation.usedBy._id ? invitation.usedBy._id.toString() : '',
              username: invitation.usedBy.username || ''
            } : null
          };
        });
        
        setInvitations(processedInvitations);
      } catch (invitationError) {
        console.log('Không thể tải dữ liệu mã mời:', invitationError);
        // Không gán lỗi cho state error vì chức năng mã mời có thể chưa được cài đặt
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(handleApiError(error, 'Không thể tải dữ liệu. Vui lòng thử lại sau.'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await authApi.getAllAdmins();
      setAdmins(response.data);
      setError(null);
    } catch (err) {
      setError(handleApiError(err, 'Không thể tải dữ liệu. Vui lòng thử lại sau.'));
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await invitationApi.create();
      
      setInvitations([res.data, ...invitations]);
      setSuccess(`Đã tạo mã mời: ${res.data.code}`);
      setShowCreateModal(false);
    } catch (err) {
      setError(handleApiError(err, 'Không thể tạo mã mời. Vui lòng thử lại sau.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvitation = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã mời này?')) {
      return;
    }

    try {
      await invitationApi.delete(id);
      setInvitations(invitations.filter(invitation => invitation._id !== id));
      setSuccess('Đã xóa mã mời thành công');
    } catch (error) {
      setError(handleApiError(error, 'Không thể xóa mã mời. Vui lòng thử lại sau.'));
    }
  };

  const renderInvitationStatus = (invitation) => {
    if (invitation.isUsed) {
      return <Badge bg="secondary">Đã sử dụng</Badge>;
    }
    
    const now = new Date();
    const expiresAt = new Date(invitation.expiresAt);
    
    if (expiresAt < now) {
      return <Badge bg="danger">Hết hạn</Badge>;
    }
    
    return <Badge bg="success">Hoạt động</Badge>;
  };

  return (
    <>
      <AdminNavbar />
      <Container>
        <h1 className="mb-4">Quản lý hệ thống</h1>
        
        {loading && <LoadingSpinner text="Đang tải dữ liệu..." />}
        
        {error && <ErrorHandler error={error} onClose={() => setError(null)} />}
        
        {success && (
          <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
            {success}
          </Alert>
        )}
        
        {!loading && (
          <>
            <Row className="mb-4">
              <Col>
                <Card className="shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">Quản lý Admin</h4>
                  </Card.Header>
                  <Card.Body>
                    <Table responsive striped hover>
                      <thead>
                        <tr>
                          <th>Tên đăng nhập</th>
                          <th>Họ tên</th>
                          <th>Email</th>
                          <th>Vai trò</th>
                          <th>Ngày tạo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.map(admin => (
                          <tr key={admin._id}>
                            <td>{admin.username}</td>
                            <td>{admin.name}</td>
                            <td>{admin.email}</td>
                            <td>
                              <Badge bg={admin.role === 'superadmin' ? 'danger' : 'primary'}>
                                {admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                              </Badge>
                            </td>
                            <td>{formatDate(admin.createdAt)}</td>
                          </tr>
                        ))}
                        {admins.length === 0 && (
                          <tr>
                            <td colSpan="5" className="text-center">Không có dữ liệu</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <Row>
              <Col>
                <Card className="shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">Mã mời</h4>
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                      <i className="bi bi-plus-circle me-1"></i> Tạo mã mời
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Table responsive striped hover>
                      <thead>
                        <tr>
                          <th>Mã</th>
                          <th>Trạng thái</th>
                          <th>Ngày tạo</th>
                          <th>Hết hạn</th>
                          <th>Sử dụng bởi</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invitations.map(invitation => (
                          <tr key={invitation._id}>
                            <td>
                              <code>{invitation.code}</code>
                            </td>
                            <td>{renderInvitationStatus(invitation)}</td>
                            <td>{formatDate(invitation.createdAt)}</td>
                            <td>{formatDate(invitation.expiresAt)}</td>
                            <td>
                              {invitation.usedBy ? (
                                invitation.usedBy.username
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              {!invitation.isUsed && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteInvitation(invitation._id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {invitations.length === 0 && (
                          <tr>
                            <td colSpan="6" className="text-center">Không có dữ liệu</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>

      {/* Modal tạo mã mời */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tạo mã mời mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Tạo mã mời cho phép Admin đăng ký tài khoản mới. Mã mời sẽ có hiệu lực trong 7 ngày và chỉ sử dụng được một lần.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateInvitation}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Tạo mã mời'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SuperAdminDashboard; 