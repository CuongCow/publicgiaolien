import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import AdminNavbar from '../../components/Navbar';
import SuperAdminMenu from '../../components/SuperAdminMenu';
import { superAdminApi } from '../../services/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const InviteCodeManagement = () => {
  const [inviteCodes, setInviteCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchInviteCodes();
  }, []);

  const fetchInviteCodes = async () => {
    try {
      setLoading(true);
      const response = await superAdminApi.getAllInviteCodes();
      setInviteCodes(response.data);
    } catch (error) {
      console.error('Error fetching invite codes:', error);
      setError('Không thể tải danh sách mã mời. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInviteCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await superAdminApi.createInviteCode();
      setInviteCodes([response.data, ...inviteCodes]);
      
      setSuccess('Tạo mã mời mới thành công');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating invite code:', err);
      setError(err.response?.data?.message || 'Lỗi khi tạo mã mời mới');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (code) => {
    setSelectedCode(code);
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await superAdminApi.deleteInviteCode(selectedCode._id);
      
      // Cập nhật state
      setInviteCodes(inviteCodes.filter(code => code._id !== selectedCode._id));
      
      setSuccess('Xóa mã mời thành công');
      setTimeout(() => setSuccess(null), 3000);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting invite code:', err);
      setError(err.response?.data?.message || 'Lỗi khi xóa mã mời');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <h1 className="h2">Quản lý Mã mời</h1>
              <Button variant="success" onClick={handleCreateInviteCode} disabled={loading}>
                <i className="bi bi-plus-circle me-1"></i> Tạo mã mới
              </Button>
            </div>
            
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h5 className="card-title mb-3">Danh sách Mã mời</h5>
                
                <div className="alert alert-info">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  Mã mời dùng để đăng ký tài khoản admin mới. Mỗi mã chỉ có thể sử dụng một lần và bắt đầu bằng "GL-".
                </div>
                
                {loading && !inviteCodes.length ? (
                  <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Đang tải dữ liệu...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th>Mã mời</th>
                          <th>Trạng thái</th>
                          <th>Người tạo</th>
                          <th>Người sử dụng</th>
                          <th>Ngày tạo</th>
                          <th>Hết hạn</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inviteCodes.map(code => (
                          <tr key={code._id}>
                            <td>
                              <code className="bg-light p-1 rounded">{code.code}</code>
                              <CopyToClipboard text={code.code} onCopy={handleCopy}>
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="ms-1 p-0 text-primary"
                                  title="Sao chép mã"
                                >
                                  <i className="bi bi-clipboard"></i>
                                </Button>
                              </CopyToClipboard>
                            </td>
                            <td>
                              {code.isUsed ? (
                                <Badge bg="secondary">Đã sử dụng</Badge>
                              ) : (
                                new Date(code.expiresAt) < new Date() ? (
                                  <Badge bg="danger">Hết hạn</Badge>
                                ) : (
                                  <Badge bg="success">Có hiệu lực</Badge>
                                )
                              )}
                            </td>
                            <td>{code.createdBy?.name || code.createdBy?.username || '-'}</td>
                            <td>{code.usedBy?.name || code.usedBy?.username || '-'}</td>
                            <td>{formatDate(code.createdAt)}</td>
                            <td>{formatDate(code.expiresAt)}</td>
                            <td>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => handleDeleteClick(code)}
                                disabled={code.isUsed}
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

      {/* Thông báo sao chép */}
      {copied && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 5 }}>
          <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
              <strong className="me-auto">Thông báo</strong>
              <button type="button" className="btn-close" onClick={() => setCopied(false)}></button>
            </div>
            <div className="toast-body">
              Đã sao chép mã mời vào clipboard
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác nhận xóa Mã mời */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          
          <div className="alert alert-warning">
            Bạn có chắc chắn muốn xóa mã mời <strong>{selectedCode?.code}</strong>?
            <br />
            Hành động này không thể hoàn tác.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteSubmit} disabled={loading}>
            {loading ? 'Đang xóa...' : 'Xóa mã mời'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InviteCodeManagement; 