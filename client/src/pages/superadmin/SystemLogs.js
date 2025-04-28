import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Pagination, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import AdminNavbar from '../../components/Navbar';
import SuperAdminMenu from '../../components/SuperAdminMenu';
import { superAdminApi } from '../../services/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(50);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(30);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [page, limit]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await superAdminApi.getLogs(page, limit);
      setLogs(response.data.logs);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Không thể tải nhật ký hệ thống. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupSubmit = async () => {
    try {
      setCleanupLoading(true);
      const response = await superAdminApi.cleanupLogs(cleanupDays);
      setSuccess(`Đã xóa ${response.data.deletedCount} bản ghi nhật ký cũ hơn ${cleanupDays} ngày`);
      setTimeout(() => setSuccess(null), 5000);
      setShowCleanupModal(false);
      
      // Tải lại danh sách
      fetchLogs();
    } catch (err) {
      console.error('Error cleaning up logs:', err);
      setError(err.response?.data?.message || 'Lỗi khi xóa nhật ký cũ');
    } finally {
      setCleanupLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value, 10));
    setPage(1); // Reset về trang đầu tiên khi thay đổi số lượng hiển thị
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: vi });
  };

  const getActionBadge = (action) => {
    const actionColors = {
      create: 'success',
      update: 'primary',
      delete: 'danger',
      login: 'info',
      logout: 'secondary',
      other: 'warning'
    };
    
    return <Badge bg={actionColors[action] || 'warning'}>{action}</Badge>;
  };

  const renderPagination = () => {
    const items = [];
    
    // Thêm nút "Previous"
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(Math.max(1, page - 1))}
        disabled={page === 1}
      />
    );
    
    // Hiển thị tối đa 5 trang
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item 
          key={i} 
          active={i === page}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    // Thêm nút "Next"
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      />
    );
    
    return <Pagination>{items}</Pagination>;
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
              <h1 className="h2">Nhật ký Hệ thống</h1>
              <Button variant="warning" onClick={() => setShowCleanupModal(true)}>
                <i className="bi bi-trash me-1"></i> Dọn dẹp nhật ký cũ
              </Button>
            </div>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Danh sách nhật ký hoạt động</h5>
                  
                  <Form.Group>
                    <Form.Select 
                      size="sm" 
                      value={limit} 
                      onChange={handleLimitChange}
                      style={{ width: '120px' }}
                    >
                      <option value={10}>10 dòng</option>
                      <option value={25}>25 dòng</option>
                      <option value={50}>50 dòng</option>
                      <option value={100}>100 dòng</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                
                {loading ? (
                  <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Đang tải nhật ký...</p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <Table striped hover>
                        <thead>
                          <tr>
                            <th>Thời gian</th>
                            <th>Admin</th>
                            <th>Hành động</th>
                            <th>Đối tượng</th>
                            <th>Chi tiết</th>
                            <th>IP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.length > 0 ? (
                            logs.map(log => (
                              <tr key={log._id}>
                                <td>{formatDate(log.createdAt)}</td>
                                <td>{log.adminId?.username || log.adminId?.name || '-'}</td>
                                <td>{getActionBadge(log.action)}</td>
                                <td>{log.target}</td>
                                <td>
                                  <small>
                                    {log.details ? (
                                      typeof log.details === 'object' 
                                        ? Object.entries(log.details)
                                            .filter(([key]) => key !== '_id')
                                            .map(([key, value]) => 
                                              <div key={key}>
                                                {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                                              </div>
                                            )
                                        : log.details
                                    ) : '-'}
                                  </small>
                                </td>
                                <td>{log.ipAddress}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="text-center">Không có nhật ký nào</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      {renderPagination()}
                      <span>
                        Trang {page} / {totalPages} (Tổng {logs.length} bản ghi)
                      </span>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal Dọn dẹp nhật ký cũ */}
      <Modal show={showCleanupModal} onHide={() => setShowCleanupModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Dọn dẹp nhật ký</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Hệ thống sẽ xóa các bản ghi nhật ký cũ hơn số ngày được chỉ định. 
            Hành động này không thể hoàn tác.
          </p>
          
          <Form.Group className="mb-3">
            <Form.Label>Xóa nhật ký cũ hơn (ngày)</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={365}
              value={cleanupDays}
              onChange={(e) => setCleanupDays(parseInt(e.target.value, 10))}
            />
          </Form.Group>
          
          <Alert variant="warning">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Cảnh báo: Hành động này sẽ xóa vĩnh viễn các bản ghi nhật ký cũ và không thể khôi phục.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCleanupModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCleanupSubmit}
            disabled={cleanupLoading}
          >
            {cleanupLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="ms-2">Đang xóa...</span>
              </>
            ) : (
              <>Xác nhận xóa</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SystemLogs; 