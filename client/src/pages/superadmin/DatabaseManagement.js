import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Spinner, Alert, Modal, ProgressBar } from 'react-bootstrap';
import AdminNavbar from '../../components/Navbar';
import SuperAdminMenu from '../../components/SuperAdminMenu';
import { superAdminApi } from '../../services/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Chart from 'react-apexcharts';

const DatabaseManagement = () => {
  const [dbStats, setDbStats] = useState({
    collections: {},
    databaseSize: {
      sizeInBytes: 0,
      sizeInMB: 0,
      storageSize: 0,
      storageSizeInMB: 0
    },
    indexes: 0,
    indexSize: 0,
    indexSizeInMB: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(30);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupOptions, setCleanupOptions] = useState({
    cleanupSubmissions: true,
    cleanupTeams: false,
    cleanupLogs: true,
    cleanupNotifications: true
  });
  // State cho modal xem chi tiết collection
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionDetails, setCollectionDetails] = useState(null);
  const [collectionLoading, setCollectionLoading] = useState(false);
  // State cho modal xóa collection
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // State cho modal xóa tất cả
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  
  // Biểu đồ phân bố dữ liệu
  const [collectionChartData, setCollectionChartData] = useState({
    series: [],
    options: {
      chart: {
        type: 'pie',
        height: 350
      },
      labels: [],
      colors: ['#0d6efd', '#198754', '#dc3545', '#ffc107', '#6610f2', '#fd7e14', '#20c997', '#0dcaf0'],
      legend: {
        position: 'bottom'
      },
      title: {
        text: 'Phân bố dữ liệu theo collections',
        align: 'center',
        style: {
          fontSize: '18px',
          fontWeight: 'bold'
        }
      }
    }
  });

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true);
      const response = await superAdminApi.getDatabaseStats();
      setDbStats(response.data);
      
      // Chuẩn bị dữ liệu cho biểu đồ
      prepareChartData(response.data.collections);
    } catch (error) {
      console.error('Error fetching database stats:', error);
      setError('Không thể tải thông tin database. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (collections) => {
    if (!collections) return;
    
    const labels = Object.keys(collections);
    const series = Object.values(collections);
    
    setCollectionChartData(prevState => ({
      ...prevState,
      series,
      options: {
        ...prevState.options,
        labels
      }
    }));
  };

  const handleCleanupSubmit = async () => {
    try {
      setCleanupLoading(true);
      setError(null);
      
      const cleanupTasks = [];
      let totalDeleted = 0;
      
      // Xử lý từng loại dữ liệu cần dọn dẹp
      if (cleanupOptions.cleanupSubmissions) {
        const submissionsResponse = await superAdminApi.cleanupSubmissions(cleanupDays);
        cleanupTasks.push(`Xóa ${submissionsResponse.data.deletedCount} bản ghi submissions`);
        totalDeleted += submissionsResponse.data.deletedCount;
      }
      
      if (cleanupOptions.cleanupLogs) {
        const logsResponse = await superAdminApi.cleanupLogs(cleanupDays);
        cleanupTasks.push(`Xóa ${logsResponse.data.deletedCount} bản ghi logs`);
        totalDeleted += logsResponse.data.deletedCount;
      }
      
      if (cleanupOptions.cleanupNotifications) {
        const notificationsResponse = await superAdminApi.cleanupNotifications(cleanupDays);
        cleanupTasks.push(`Xóa ${notificationsResponse.data.deletedCount} thông báo`);
        totalDeleted += notificationsResponse.data.deletedCount;
      }
      
      if (cleanupOptions.cleanupTeams) {
        const teamsResponse = await superAdminApi.cleanupInactiveTeams(cleanupDays);
        cleanupTasks.push(`Xóa ${teamsResponse.data.deletedCount} đội không hoạt động`);
        totalDeleted += teamsResponse.data.deletedCount;
      }
      
      setSuccess(`Đã xóa tổng cộng ${totalDeleted} bản ghi: ${cleanupTasks.join(', ')}`);
      setTimeout(() => setSuccess(null), 5000);
      setShowCleanupModal(false);
      
      // Tải lại thống kê
      fetchDatabaseStats();
    } catch (err) {
      console.error('Error cleaning up database:', err);
      setError(err.response?.data?.message || 'Lỗi khi dọn dẹp dữ liệu');
    } finally {
      setCleanupLoading(false);
    }
  };

  // Xem chi tiết collection
  const handleViewCollection = async (collection) => {
    try {
      setSelectedCollection(collection);
      setCollectionLoading(true);
      setShowCollectionModal(true);
      
      // API call để lấy chi tiết collection (giả định)
      // Trong thực tế, bạn cần tạo API endpoint tương ứng trên backend
      // const response = await superAdminApi.getCollectionDetails(collection);
      // setCollectionDetails(response.data);
      
      // Demo data - thay thế bằng API call thực tế
      setTimeout(() => {
        setCollectionDetails({
          name: collection,
          count: dbStats.collections[collection],
          fields: ['_id', 'name', 'createdAt', 'updatedAt'],
          indexes: ['_id_', 'name_1'],
          avgDocumentSize: '1.2KB',
          lastModified: new Date()
        });
        setCollectionLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching collection details:', error);
      setError('Không thể tải thông tin chi tiết collection. Vui lòng thử lại sau.');
      setCollectionLoading(false);
    }
  };

  // Xóa một collection
  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;
    
    try {
      setDeleteLoading(true);
      setError(null);
      
      // API call để xóa collection (giả định)
      // Trong thực tế, bạn cần tạo API endpoint tương ứng trên backend
      // await superAdminApi.deleteCollection(selectedCollection);
      
      // Demo - thay thế bằng API call thực tế
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(`Đã xóa collection ${selectedCollection} thành công`);
      setTimeout(() => setSuccess(null), 5000);
      setShowDeleteModal(false);
      
      // Tải lại thống kê
      fetchDatabaseStats();
    } catch (err) {
      console.error('Error deleting collection:', err);
      setError(err.response?.data?.message || `Lỗi khi xóa collection ${selectedCollection}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Xóa tất cả collections
  const handleDeleteAllCollections = async () => {
    try {
      setDeleteAllLoading(true);
      setError(null);
      
      // API call để xóa tất cả collections (giả định)
      // Trong thực tế, bạn cần tạo API endpoint tương ứng trên backend
      // await superAdminApi.deleteAllCollections();
      
      // Demo - thay thế bằng API call thực tế
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(`Đã xóa tất cả collections thành công`);
      setTimeout(() => setSuccess(null), 5000);
      setShowDeleteAllModal(false);
      
      // Tải lại thống kê
      fetchDatabaseStats();
    } catch (err) {
      console.error('Error deleting all collections:', err);
      setError(err.response?.data?.message || 'Lỗi khi xóa tất cả collections');
    } finally {
      setDeleteAllLoading(false);
    }
  };

  const handleCleanupOptionChange = (e) => {
    const { name, checked } = e.target;
    setCleanupOptions(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: vi });
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };

  const getSpaceUsagePercent = () => {
    // Giả định giới hạn là 1GB (thay đổi theo môi trường thực tế)
    const limitInBytes = 1024 * 1024 * 1024;
    const usedBytes = dbStats.databaseSize.sizeInBytes || 0;
    
    return Math.min(100, Math.round((usedBytes / limitInBytes) * 100));
  };

  const getProgressVariant = (percent) => {
    if (percent < 50) return 'success';
    if (percent < 75) return 'warning';
    return 'danger';
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
              <h1 className="h2">Quản lý Database</h1>
              <div>
                <Button variant="success" className="me-2" onClick={fetchDatabaseStats} disabled={loading}>
                  <i className="bi bi-arrow-clockwise me-1"></i> Làm mới
                </Button>
                <Button variant="warning" onClick={() => setShowCleanupModal(true)}>
                  <i className="bi bi-trash me-1"></i> Dọn dẹp dữ liệu
                </Button>
              </div>
            </div>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            {loading ? (
              <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tải thông tin database...</p>
              </div>
            ) : (
              <>
                {/* Thống kê khái quát */}
                <Row className="mb-4">
                  <Col md={4} className="mb-3">
                    <Card className="shadow-sm h-100">
                      <Card.Body>
                        <h5 className="card-title">Dung lượng Database</h5>
                        <h2>{formatBytes(dbStats.databaseSize.sizeInBytes)}</h2>
                        <ProgressBar 
                          variant={getProgressVariant(getSpaceUsagePercent())}
                          now={getSpaceUsagePercent()} 
                          className="mt-2"
                        />
                        <small className="text-muted mt-2 d-block">
                          Đã sử dụng {getSpaceUsagePercent()}% dung lượng
                        </small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Card className="shadow-sm h-100">
                      <Card.Body>
                        <h5 className="card-title">Dung lượng Index</h5>
                        <h2>{formatBytes(dbStats.indexSize)}</h2>
                        <p className="text-muted mb-0">
                          Số lượng indexes: <span className="fw-bold">{dbStats.indexes}</span>
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Card className="shadow-sm h-100">
                      <Card.Body>
                        <h5 className="card-title">Tổng số bản ghi</h5>
                        <h2>
                          {Object.values(dbStats.collections)
                            .reduce((sum, count) => sum + count, 0)
                            .toLocaleString()}
                        </h2>
                        <p className="text-muted mb-0">
                          Tổng số collections: <span className="fw-bold">{Object.keys(dbStats.collections).length}</span>
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Biểu đồ phân bố dữ liệu */}
                <Card className="shadow-sm mb-4">
                  <Card.Body>
                    <Chart 
                      options={collectionChartData.options} 
                      series={collectionChartData.series} 
                      type="pie" 
                      height={350} 
                    />
                  </Card.Body>
                </Card>
                
                {/* Chi tiết Collections */}
                <Card className="shadow-sm mb-4">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="card-title mb-0">Chi tiết Collections</h5>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => setShowDeleteAllModal(true)}
                      >
                        <i className="bi bi-trash me-1"></i> Xóa tất cả
                      </Button>
                    </div>
                    
                    <div className="table-responsive">
                      <Table striped hover>
                        <thead>
                          <tr>
                            <th>Collection</th>
                            <th>Số lượng bản ghi</th>
                            <th>Tỷ lệ</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(dbStats.collections).map(([collection, count]) => (
                            <tr key={collection}>
                              <td>{collection}</td>
                              <td>{count.toLocaleString()}</td>
                              <td>
                                {(count / Object.values(dbStats.collections)
                                  .reduce((sum, c) => sum + c, 0) * 100).toFixed(1)}%
                              </td>
                              <td>
                                <Button 
                                  variant="outline-info" 
                                  size="sm"
                                  className="me-1"
                                  onClick={() => handleViewCollection(collection)}
                                >
                                  <i className="bi bi-eye"></i>
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCollection(collection);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
                
                {/* Thông tin bổ sung */}
                <Card className="shadow-sm mb-4">
                  <Card.Body>
                    <h5 className="card-title mb-3">Thông tin bổ sung</h5>
                    
                    <Row>
                      <Col md={6}>
                        <Table striped>
                          <tbody>
                            <tr>
                              <td>Kích thước dữ liệu thực tế</td>
                              <td>{formatBytes(dbStats.databaseSize.sizeInBytes)}</td>
                            </tr>
                            <tr>
                              <td>Kích thước lưu trữ</td>
                              <td>{formatBytes(dbStats.databaseSize.storageSize)}</td>
                            </tr>
                            <tr>
                              <td>Kích thước index</td>
                              <td>{formatBytes(dbStats.indexSize)}</td>
                            </tr>
                            <tr>
                              <td>Số lượng indexes</td>
                              <td>{dbStats.indexes}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Col>
                      <Col md={6}>
                        <Alert variant="info">
                          <p><strong>Lưu ý khi sử dụng Database:</strong></p>
                          <ul className="mb-0">
                            <li>Nên thường xuyên dọn dẹp dữ liệu cũ để tối ưu hiệu suất</li>
                            <li>Xây dựng indexes phù hợp để tăng tốc độ truy vấn</li>
                            <li>Thực hiện sao lưu dữ liệu định kỳ</li>
                          </ul>
                        </Alert>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </>
            )}
          </Col>
        </Row>
      </Container>

      {/* Modal Dọn dẹp dữ liệu */}
      <Modal show={showCleanupModal} onHide={() => setShowCleanupModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Dọn dẹp Dữ liệu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Hệ thống sẽ xóa các dữ liệu cũ hơn số ngày được chỉ định.
            Hành động này không thể hoàn tác.
          </p>
          
          <Form.Group className="mb-3">
            <Form.Label>Xóa dữ liệu cũ hơn (ngày)</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={365}
              value={cleanupDays}
              onChange={(e) => setCleanupDays(parseInt(e.target.value, 10))}
            />
          </Form.Group>
          
          <Form.Group>
            <Form.Label>Loại dữ liệu cần xóa:</Form.Label>
            
            <Form.Check 
              type="checkbox"
              id="cleanupSubmissions"
              label="Bản ghi trả lời cũ"
              name="cleanupSubmissions"
              checked={cleanupOptions.cleanupSubmissions}
              onChange={handleCleanupOptionChange}
              className="mb-2"
            />
            
            <Form.Check 
              type="checkbox"
              id="cleanupLogs"
              label="Nhật ký hệ thống"
              name="cleanupLogs"
              checked={cleanupOptions.cleanupLogs}
              onChange={handleCleanupOptionChange}
              className="mb-2"
            />
            
            <Form.Check 
              type="checkbox"
              id="cleanupNotifications"
              label="Thông báo đã hết hạn"
              name="cleanupNotifications"
              checked={cleanupOptions.cleanupNotifications}
              onChange={handleCleanupOptionChange}
              className="mb-2"
            />
            
            <Form.Check 
              type="checkbox"
              id="cleanupTeams"
              label="Đội không hoạt động"
              name="cleanupTeams"
              checked={cleanupOptions.cleanupTeams}
              onChange={handleCleanupOptionChange}
            />
          </Form.Group>
          
          <Alert variant="warning" className="mt-3">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Cảnh báo: Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể khôi phục.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCleanupModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCleanupSubmit}
            disabled={cleanupLoading || 
              (!cleanupOptions.cleanupSubmissions && 
              !cleanupOptions.cleanupLogs && 
              !cleanupOptions.cleanupNotifications &&
              !cleanupOptions.cleanupTeams)}
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

      {/* Modal Xem Chi tiết Collection */}
      <Modal show={showCollectionModal} onHide={() => setShowCollectionModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết Collection: {selectedCollection}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {collectionLoading ? (
            <div className="text-center my-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Đang tải thông tin chi tiết...</p>
            </div>
          ) : collectionDetails ? (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <h6>Thông tin cơ bản</h6>
                      <Table striped>
                        <tbody>
                          <tr>
                            <td>Tên collection</td>
                            <td>{collectionDetails.name}</td>
                          </tr>
                          <tr>
                            <td>Số bản ghi</td>
                            <td>{collectionDetails.count?.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td>Kích thước trung bình</td>
                            <td>{collectionDetails.avgDocumentSize}</td>
                          </tr>
                          <tr>
                            <td>Lần chỉnh sửa gần nhất</td>
                            <td>{formatDate(collectionDetails.lastModified)}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <h6>Danh sách Indexes</h6>
                      <ul className="list-group">
                        {collectionDetails.indexes?.map((index, i) => (
                          <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                            {index}
                            <span className="badge bg-primary rounded-pill">Index</span>
                          </li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <Card>
                <Card.Body>
                  <h6>Cấu trúc dữ liệu (Fields)</h6>
                  <div className="d-flex flex-wrap">
                    {collectionDetails.fields?.map((field, i) => (
                      <span key={i} className="badge bg-secondary me-2 mb-2 p-2">
                        {field}
                      </span>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </div>
          ) : (
            <Alert variant="warning">
              Không có thông tin chi tiết về collection này.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCollectionModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Xóa Collection */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Cảnh báo:</strong> Bạn đang chuẩn bị xóa collection <strong>{selectedCollection}</strong>
          </Alert>
          <p>
            Hành động này sẽ xóa <strong>tất cả dữ liệu</strong> trong collection và không thể hoàn tác.
            Bạn có chắc chắn muốn tiếp tục?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteCollection}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
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

      {/* Modal Xóa tất cả Collections */}
      <Modal show={showDeleteAllModal} onHide={() => setShowDeleteAllModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa tất cả collections</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Cảnh báo nghiêm trọng:</strong> Bạn đang chuẩn bị xóa <strong>TẤT CẢ</strong> collections trong database
          </Alert>
          <p>
            Hành động này sẽ xóa <strong>toàn bộ dữ liệu</strong> trong database và không thể hoàn tác.
            Hệ thống sẽ không hoạt động cho đến khi dữ liệu được tạo lại.
          </p>
          <p className="fw-bold text-danger">
            Bạn có chắc chắn muốn tiếp tục? Vui lòng cân nhắc kỹ trước khi xác nhận.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteAllModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteAllCollections}
            disabled={deleteAllLoading}
          >
            {deleteAllLoading ? (
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
              <>Xác nhận xóa tất cả</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DatabaseManagement; 