import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Spinner, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { formApi } from '../../services/api';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import AdminNavbar from '../../components/Navbar';
import axiosInstance from '../../services/api';

const FormManagement = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [deletingForm, setDeletingForm] = useState(false);
  
  const navigate = useNavigate();

  // Tải danh sách biểu mẫu
  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Đang gọi API với baseURL:', axiosInstance.defaults.baseURL);
      console.log('Đường dẫn endpoint:', '/forms');
      
      const response = await formApi.getAllForms();
      
      if (response.data && response.data.success) {
        setForms(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải biểu mẫu:', error);
      console.log('Đường dẫn API đầy đủ:', error.config?.url);
      console.log('Phương thức API:', error.config?.method);
      setError('Không thể tải danh sách biểu mẫu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa biểu mẫu
  const handleDeleteForm = async () => {
    if (!formToDelete) return;
    
    try {
      setDeletingForm(true);
      
      const response = await formApi.deleteForm(formToDelete._id);
      
      if (response.data && response.data.success) {
        // Cập nhật danh sách biểu mẫu sau khi xóa
        setForms(forms.filter(form => form._id !== formToDelete._id));
        toast.success('Đã xóa biểu mẫu thành công');
      }
    } catch (error) {
      console.error('Lỗi khi xóa biểu mẫu:', error);
      toast.error('Không thể xóa biểu mẫu. Vui lòng thử lại sau.');
    } finally {
      setDeletingForm(false);
      setShowDeleteModal(false);
      setFormToDelete(null);
    }
  };

  // Xử lý hiển thị modal xác nhận xóa
  const openDeleteModal = (form) => {
    setFormToDelete(form);
    setShowDeleteModal(true);
  };

  // Định dạng thời gian tương đối
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Hiển thị trạng thái công khai
  const renderPublishedStatus = (published) => {
    if (published) {
      return <Badge bg="success">Công khai</Badge>;
    } else {
      return <Badge bg="secondary">Bản nháp</Badge>;
    }
  };

  // Hiển thị số lượng phản hồi
  const renderResponsesCount = (count) => {
    if (count === 0) {
      return <span className="text-muted">0</span>;
    }
    return <span className="fw-bold text-primary">{count}</span>;
  };

  return (
    <>
      <AdminNavbar />
      <Container className="py-4">
        <Row className="mb-3">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h1>Quản lý biểu mẫu</h1>
              <Button 
                variant="primary"
                onClick={() => navigate('/admin/forms/new')}
              >
                <i className="bi bi-plus-circle me-2"></i> Tạo biểu mẫu mới
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card>
              <Card.Body>
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Đang tải biểu mẫu...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-5 text-danger">
                    <i className="bi bi-exclamation-triangle fs-1"></i>
                    <p className="mt-3">{error}</p>
                    <Button variant="outline-primary" onClick={fetchForms}>
                      Thử lại
                    </Button>
                  </div>
                ) : forms.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-clipboard-data fs-1 text-muted"></i>
                    <p className="mt-3 mb-1">Bạn chưa có biểu mẫu nào</p>
                    <p className="text-muted mb-4">Tạo biểu mẫu đầu tiên của bạn để thu thập thông tin từ người dùng</p>
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/admin/forms/new')}
                    >
                      <i className="bi bi-plus-circle me-2"></i> Tạo biểu mẫu mới
                    </Button>
                  </div>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Tên biểu mẫu</th>
                        <th style={{ width: '120px' }}>Trạng thái</th>
                        <th style={{ width: '100px' }}>Phản hồi</th>
                        <th style={{ width: '180px' }}>Cập nhật lần cuối</th>
                        <th style={{ width: '170px' }} className="text-end">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forms.map((form) => (
                        <tr key={form._id}>
                          <td>
                            <div className="fw-bold">{form.title}</div>
                            {form.description && (
                              <div className="text-muted small text-truncate" style={{ maxWidth: '400px' }}>
                                {form.description}
                              </div>
                            )}
                          </td>
                          <td>{renderPublishedStatus(form.published)}</td>
                          <td className="text-center">{renderResponsesCount(form.responsesCount || 0)}</td>
                          <td>{formatRelativeTime(form.updatedAt)}</td>
                          <td>
                            <div className="d-flex justify-content-end">
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Xem phản hồi</Tooltip>}
                              >
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  className="me-1"
                                  as={Link}
                                  to={`/admin/forms/${form._id}/responses`}
                                >
                                  <i className="bi bi-bar-chart"></i>
                                </Button>
                              </OverlayTrigger>
                              
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Chỉnh sửa</Tooltip>}
                              >
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-1"
                                  as={Link}
                                  to={`/admin/forms/${form._id}/edit`}
                                >
                                  <i className="bi bi-pencil"></i>
                                </Button>
                              </OverlayTrigger>
                              
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Xóa</Tooltip>}
                              >
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => openDeleteModal(form)}
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </OverlayTrigger>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Modal xác nhận xóa */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận xóa</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {formToDelete && (
              <>
                <p>Bạn có chắc chắn muốn xóa biểu mẫu "<strong>{formToDelete.title}</strong>"?</p>
                <p className="text-danger mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Thao tác này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
                </p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteForm}
              disabled={deletingForm}
            >
              {deletingForm ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-1"
                  />
                  Đang xóa...
                </>
              ) : (
                'Xóa biểu mẫu'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default FormManagement; 