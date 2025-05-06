import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Modal, Badge, Pagination, Alert } from 'react-bootstrap';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

const AutoReplies = () => {
  // State
  const [autoReplies, setAutoReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    keyword: '',
    response: '',
    category: 'general',
    priority: 0,
    isActive: true
  });
  const [formMode, setFormMode] = useState('add'); // 'add' hoặc 'edit'
  const [editId, setEditId] = useState(null);
  
  // Trạng thái phân trang và lọc
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');
  
  // Import Modal
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  
  // Xóa Modal
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  // Xem chi tiết Modal
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  
  // Tải dữ liệu
  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [page, limit, filterCategory, search]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      if (filterCategory) {
        params.append('category', filterCategory);
      }
      
      if (search) {
        params.append('search', search);
      }
      
      const res = await api.get(`/api/auto-reply?${params.toString()}`);
      setAutoReplies(res.data.autoReplies);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.pages);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi tải danh sách câu trả lời tự động:', err);
      setError('Không thể tải danh sách câu trả lời tự động. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/auto-reply/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách danh mục:', err);
    }
  };
  
  // Xử lý form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const resetForm = () => {
    setFormData({
      keyword: '',
      response: '',
      category: 'general',
      priority: 0,
      isActive: true
    });
    setFormMode('add');
    setEditId(null);
  };
  
  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };
  
  const openEditForm = (item) => {
    setFormData({
      keyword: item.keyword,
      response: item.response,
      category: item.category,
      priority: item.priority,
      isActive: item.isActive
    });
    setEditId(item._id);
    setFormMode('edit');
    setShowForm(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formMode === 'add') {
        await api.post('/api/auto-reply', formData);
        toast.success('Đã thêm câu trả lời tự động mới');
      } else {
        await api.put(`/api/auto-reply/${editId}`, formData);
        toast.success('Đã cập nhật câu trả lời tự động');
      }
      
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Lỗi khi lưu câu trả lời tự động:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };
  
  // Xử lý xóa
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };
  
  const handleDelete = async () => {
    try {
      await api.delete(`/api/auto-reply/${deleteId}`);
      toast.success('Đã xóa câu trả lời tự động');
      setShowDelete(false);
      fetchData();
    } catch (err) {
      console.error('Lỗi khi xóa câu trả lời tự động:', err);
      toast.error('Không thể xóa. Vui lòng thử lại sau.');
    }
  };
  
  // Xử lý import
  const handleImport = async () => {
    try {
      if (!importText.trim()) {
        toast.error('Vui lòng nhập dữ liệu để import');
        return;
      }
      
      let dataToImport;
      try {
        dataToImport = JSON.parse(importText);
      } catch (parseError) {
        toast.error('Dữ liệu không đúng định dạng JSON');
        return;
      }
      
      if (!Array.isArray(dataToImport)) {
        dataToImport = [dataToImport];
      }
      
      const res = await api.post('/api/auto-reply/batch-import', {
        autoReplies: dataToImport
      });
      
      toast.success(`Đã import thành công ${res.data.results.success} mục, bỏ qua ${res.data.results.duplicates} mục trùng lặp, lỗi ${res.data.results.failed} mục`);
      setShowImport(false);
      setImportText('');
      fetchData();
    } catch (err) {
      console.error('Lỗi khi import dữ liệu:', err);
      toast.error('Không thể import dữ liệu. Vui lòng kiểm tra định dạng và thử lại.');
    }
  };
  
  // Xem chi tiết
  const viewDetail = (item) => {
    setDetailData(item);
    setShowDetail(true);
  };
  
  // Hiển thị phân trang
  const renderPagination = () => {
    const items = [];
    
    // Nút Previous
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
        disabled={page === 1}
      />
    );
    
    // Tính toán các trang hiển thị
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    // Trang đầu tiên
    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => setPage(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
    }
    
    // Các trang giữa
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item 
          key={i} 
          active={i === page}
          onClick={() => setPage(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    // Trang cuối cùng
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      items.push(
        <Pagination.Item 
          key={totalPages} 
          onClick={() => setPage(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }
    
    // Nút Next
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
        disabled={page === totalPages}
      />
    );
    
    return <Pagination>{items}</Pagination>;
  };
  
  return (
    <Container fluid className="py-3">
      <Row className="mb-3">
        <Col>
          <h2>Quản lý câu trả lời tự động</h2>
          <p className="text-muted">
            Quản lý các câu trả lời tự động khi admin nhắn tin cho superadmin
          </p>
        </Col>
      </Row>
      
      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}
      
      <Row className="mb-3">
        <Col md={6} lg={3} className="mb-2">
          <InputGroup>
            <Form.Control
              placeholder="Tìm kiếm từ khóa/câu trả lời..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <Button 
                variant="outline-secondary" 
                onClick={() => setSearch('')}
              >
                <i className="bi bi-x"></i>
              </Button>
            )}
          </InputGroup>
        </Col>
        
        <Col md={6} lg={3} className="mb-2">
          <Form.Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Form.Select>
        </Col>
        
        <Col lg={6} className="d-flex justify-content-end mb-2">
          <Button variant="outline-primary" className="me-2" onClick={() => setShowImport(true)}>
            <i className="bi bi-upload me-1"></i> Import
          </Button>
          <Button variant="primary" onClick={openAddForm}>
            <i className="bi bi-plus-circle me-1"></i> Thêm mới
          </Button>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th style={{ width: '20%' }}>Từ khóa</th>
                    <th style={{ width: '40%' }}>Câu trả lời</th>
                    <th style={{ width: '10%' }}>Danh mục</th>
                    <th style={{ width: '10%' }}>Độ ưu tiên</th>
                    <th style={{ width: '10%' }}>Trạng thái</th>
                    <th style={{ width: '10%' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Đang tải...</span>
                        </div>
                      </td>
                    </tr>
                  ) : autoReplies.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    autoReplies.map((item) => (
                      <tr key={item._id}>
                        <td>{item.keyword}</td>
                        <td className="text-truncate" style={{ maxWidth: '300px' }}>
                          {item.response}
                        </td>
                        <td>
                          <Badge bg="info">{item.category}</Badge>
                        </td>
                        <td>{item.priority}</td>
                        <td>
                          {item.isActive ? (
                            <Badge bg="success">Kích hoạt</Badge>
                          ) : (
                            <Badge bg="secondary">Vô hiệu</Badge>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => viewDetail(item)}
                            className="p-0 me-2"
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => openEditForm(item)}
                            className="p-0 me-2 text-primary"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => confirmDelete(item._id)}
                            className="p-0 text-danger"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
              
              {!loading && autoReplies.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Hiển thị {autoReplies.length} / {total} mục
                  </div>
                  {renderPagination()}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Modal thêm/sửa */}
      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {formMode === 'add' ? 'Thêm câu trả lời tự động' : 'Sửa câu trả lời tự động'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Từ khóa <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="keyword"
                value={formData.keyword}
                onChange={handleInputChange}
                placeholder="Nhập từ khóa (ví dụ: chào, xin chào, hello, hi)"
                required
              />
              <Form.Text className="text-muted">
                Từ khóa sẽ được chuyển đổi thành chữ thường khi lưu
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Câu trả lời <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="response"
                value={formData.response}
                onChange={handleInputChange}
                placeholder="Nhập câu trả lời..."
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Nhập danh mục (ví dụ: greeting, help)"
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Độ ưu tiên</Form.Label>
                  <Form.Control
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    min={0}
                    max={100}
                  />
                  <Form.Text className="text-muted">
                    Giá trị cao hơn có độ ưu tiên cao hơn (0-100)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Kích hoạt"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {formMode === 'add' ? 'Thêm mới' : 'Cập nhật'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Modal import */}
      <Modal show={showImport} onHide={() => setShowImport(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Import câu trả lời tự động</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Dữ liệu JSON</Form.Label>
            <Form.Control
              as="textarea"
              rows={10}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='[{"keyword": "xin chào", "response": "Chào bạn!", "category": "greeting", "priority": 100}]'
            />
            <Form.Text className="text-muted">
              Dán dữ liệu dạng JSON Array hoặc Object vào đây. Mỗi mục cần có ít nhất các trường: keyword, response
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImport(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleImport}>
            Import
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal xóa */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa câu trả lời tự động này?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelete(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal xem chi tiết */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết câu trả lời tự động</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailData && (
            <div>
              <h5>Từ khóa</h5>
              <p className="border p-2 rounded bg-light">{detailData.keyword}</p>
              
              <h5>Câu trả lời</h5>
              <p className="border p-2 rounded bg-light">{detailData.response}</p>
              
              <Row>
                <Col md={6}>
                  <h5>Danh mục</h5>
                  <p><Badge bg="info">{detailData.category}</Badge></p>
                </Col>
                <Col md={6}>
                  <h5>Độ ưu tiên</h5>
                  <p>{detailData.priority}</p>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <h5>Trạng thái</h5>
                  <p>
                    {detailData.isActive ? (
                      <Badge bg="success">Kích hoạt</Badge>
                    ) : (
                      <Badge bg="secondary">Vô hiệu</Badge>
                    )}
                  </p>
                </Col>
                <Col md={6}>
                  <h5>Người tạo</h5>
                  <p>{detailData.createdBy?.username || 'Không có thông tin'}</p>
                </Col>
              </Row>
              
              {detailData.createdAt && (
                <p className="text-muted small">
                  Tạo lúc: {new Date(detailData.createdAt).toLocaleString('vi-VN')}
                </p>
              )}
              {detailData.updatedAt && (
                <p className="text-muted small">
                  Cập nhật lúc: {new Date(detailData.updatedAt).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetail(false)}>
            Đóng
          </Button>
          {detailData && (
            <Button variant="primary" onClick={() => {
              setShowDetail(false);
              openEditForm(detailData);
            }}>
              Sửa
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AutoReplies; 