import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Spinner, Alert, Modal, ProgressBar, Pagination } from 'react-bootstrap';
import AdminNavbar from '../../components/Navbar';
import SuperAdminMenu from '../../components/SuperAdminMenu';
import { superAdminApi } from '../../services/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Chart from 'react-apexcharts';
import { toast } from 'react-toastify';

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
  // State cho modal xóa document
  const [showDeleteDocumentModal, setShowDeleteDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [deleteDocumentLoading, setDeleteDocumentLoading] = useState(false);
  // State cho phân trang documents
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsPerPage, setDocumentsPerPage] = useState(10);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [isLoadingMoreDocuments, setIsLoadingMoreDocuments] = useState(false);
  const [adminFilter, setAdminFilter] = useState('');
  const [adminFilterTimeout, setAdminFilterTimeout] = useState(null);
  const [idFilter, setIdFilter] = useState('');
  const [idFilterTimeout, setIdFilterTimeout] = useState(null);
  
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

  // Danh sách đầy đủ các collections trong cơ sở dữ liệu
  const allCollections = [
    { name: 'admins', description: 'Thông tin tài khoản quản trị viên' },
    { name: 'teams', description: 'Thông tin các đội chơi' },
    { name: 'stations', description: 'Thông tin các trạm chơi' },
    { name: 'submissions', description: 'Lịch sử nộp đáp án của các đội' },
    { name: 'secretmessages', description: 'Thông tin các mật thư' },
    { name: 'secretmessageresponses', description: 'Phản hồi và đáp án mật thư của người dùng' },
    { name: 'notifications', description: 'Thông báo hệ thống' },
    { name: 'systemlogs', description: 'Nhật ký hoạt động hệ thống' },
    { name: 'loginhistories', description: 'Lịch sử đăng nhập' },
    { name: 'systemsettings', description: 'Cài đặt hệ thống' },
    { name: 'settings', description: 'Cài đặt chung' },
    { name: 'invitationcodes', description: 'Mã mời tham gia hệ thống' },
    { name: 'verificationcodes', description: 'Mã xác thực' }
  ];

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
    
    const labels = [];
    const series = [];
    
    // Cấu trúc dữ liệu mới, các giá trị là objects có thuộc tính count
    for (const [name, data] of Object.entries(collections)) {
      labels.push(name);
      series.push(data.count || 0);
    }
    
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

  // Hàm xử lý xem chi tiết collection
  const handleViewCollection = async (collectionName, page = 1, limit = null) => {
    try {
      // Nếu đang tải trang mới, chỉ hiển thị trạng thái loading cho phần documents
      if (page > 1) {
        setIsLoadingMoreDocuments(true);
      } else {
      setCollectionLoading(true);
        setSelectedCollection(collectionName);
      setShowCollectionModal(true);
        // Reset trang hiện tại khi xem collection mới
        setCurrentPage(1);
      }
      
      // Sử dụng limit từ state nếu không được chỉ định
      const pageLimit = limit || documentsPerPage;
      
      const response = await superAdminApi.getCollectionDetails(
        collectionName, 
        page, 
        pageLimit,
        adminFilter.trim() || null,
        idFilter.trim() || null
      );
      
      if (response.data) {
        if (page === 1) {
          // Nếu là trang đầu tiên, lưu toàn bộ thông tin
          setCollectionDetails(response.data);
          // Lưu tổng số documents
          setTotalDocuments(response.data.filteredCount || response.data.count || 0);
        } else {
          // Nếu là trang tiếp theo, chỉ cập nhật danh sách documents
          setCollectionDetails(prev => ({
            ...prev,
            documents: response.data.documents || []
          }));
        }
        
        // Cập nhật trang hiện tại
        setCurrentPage(page);
        
        // Nếu collection không tồn tại hoặc có lỗi, hiển thị thông báo nhưng không hiển thị lỗi
        if (!response.data.exists) {
          console.log(`Collection không tồn tại hoặc có lỗi: ${collectionName}`);
          toast.warning('Collection này không tồn tại hoặc không có dữ liệu');
        }
      } else {
        setCollectionDetails(null);
        toast.error('Không thể tải chi tiết collection');
      }
    } catch (error) {
      console.error('Error fetching collection details:', error);
      setCollectionDetails(null);
      toast.error('Không thể tải chi tiết collection');
    } finally {
      setCollectionLoading(false);
      setIsLoadingMoreDocuments(false);
    }
  };

  // Xóa tất cả documents trong một collection
  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;
    
    try {
      setDeleteLoading(true);
      setError(null);
      
      // Gọi API để xóa tất cả documents trong collection
      await superAdminApi.clearCollection(selectedCollection);
      
      setSuccess(`Đã xóa tất cả documents trong collection ${selectedCollection}`);
      setTimeout(() => setSuccess(null), 5000);
      setShowDeleteModal(false);
      
      // Tải lại thống kê
      fetchDatabaseStats();
    } catch (err) {
      console.error('Error clearing collection:', err);
      setError(err.response?.data?.message || `Lỗi khi xóa documents trong collection ${selectedCollection}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Xóa tất cả collections
  const handleDeleteAllCollections = async () => {
    try {
      setDeleteAllLoading(true);
      setError(null);
      
      // Gọi API để xóa tất cả collections
      await superAdminApi.deleteAllCollections();
      
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

  // Xóa một document cụ thể
  const handleDeleteDocument = async () => {
    if (!selectedCollection || !selectedDocument) return;
    
    try {
      setDeleteDocumentLoading(true);
      setError(null);
      
      // Gọi API để xóa document
      await superAdminApi.deleteDocument(selectedCollection, selectedDocument._id);
      
      setSuccess(`Đã xóa document từ collection ${selectedCollection}`);
      setTimeout(() => setSuccess(null), 5000);
      setShowDeleteDocumentModal(false);
      
      // Tải lại chi tiết collection sau khi xóa
      handleViewCollection(selectedCollection);
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err.response?.data?.message || `Lỗi khi xóa document từ collection ${selectedCollection}`);
    } finally {
      setDeleteDocumentLoading(false);
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

  // Render phân trang
  const renderPagination = () => {
    if (totalDocuments === 0) return null;
    
    const totalPages = Math.ceil(totalDocuments / documentsPerPage);
    if (totalPages <= 1) return null;
    
    let items = [];
    
    // Nút Previous
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => {
          if (currentPage > 1) {
            handleViewCollection(selectedCollection, currentPage - 1);
          }
        }}
        disabled={currentPage === 1 || isLoadingMoreDocuments}
      />
    );
    
    // Hiển thị các trang
    for (let page = 1; page <= totalPages; page++) {
      // Nếu có nhiều trang, chỉ hiển thị một số trang và nút "..."
      if (
        page === 1 || 
        page === totalPages || 
        (page >= currentPage - 1 && page <= currentPage + 1)
      ) {
        items.push(
          <Pagination.Item 
            key={page} 
            active={page === currentPage}
            onClick={() => {
              if (page !== currentPage) {
                handleViewCollection(selectedCollection, page);
              }
            }}
            disabled={isLoadingMoreDocuments}
          >
            {page}
          </Pagination.Item>
        );
      } else if (
        (page === currentPage - 2 && currentPage > 3) ||
        (page === currentPage + 2 && currentPage < totalPages - 2)
      ) {
        items.push(<Pagination.Ellipsis key={`ellipsis-${page}`} />);
      }
    }
    
    // Nút Next
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => {
          if (currentPage < totalPages) {
            handleViewCollection(selectedCollection, currentPage + 1);
          }
        }}
        disabled={currentPage === totalPages || isLoadingMoreDocuments}
      />
    );
    
    return (
      <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
        <div>
          <Form.Select 
            size="sm" 
            style={{ width: 'auto', display: 'inline-block' }}
            value={documentsPerPage}
            onChange={(e) => {
              const newLimit = Number(e.target.value);
              setDocumentsPerPage(newLimit);
              handleViewCollection(selectedCollection, 1, newLimit);
            }}
            disabled={isLoadingMoreDocuments}
          >
            <option value={10}>10 documents / trang</option>
            <option value={20}>20 documents / trang</option>
            <option value={50}>50 documents / trang</option>
          </Form.Select>
        </div>
        <Pagination size="sm">{items}</Pagination>
        <div className="text-muted small">
          {isLoadingMoreDocuments ? (
            <span>
              <Spinner animation="border" size="sm" className="me-1" />
              Đang tải...
            </span>
          ) : (
            <>Trang {currentPage}/{totalPages} (Tổng {totalDocuments.toLocaleString()} documents)</>
          )}
        </div>
      </div>
    );
  };

  // Modal xem chi tiết collection
  const renderCollectionModal = () => {
    return (
      <Modal 
        show={showCollectionModal} 
        onHide={() => setShowCollectionModal(false)} 
        size="xl" 
        dialogClassName="modal-90w"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Chi tiết Collection: {selectedCollection}
            {collectionDetails && !collectionDetails.exists && (
              <span className="badge bg-warning ms-2">Không tồn tại</span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {collectionLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Đang tải dữ liệu...</p>
            </div>
          ) : collectionDetails ? (
            collectionDetails.exists ? (
              <>
                <div className="mb-4">
                  <h5>Thông tin chung</h5>
                  <Table striped bordered hover>
                    <tbody>
                      <tr>
                        <td className="fw-bold" style={{ width: '30%' }}>Tên Collection</td>
                        <td>{collectionDetails.name}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Mô tả</td>
                        <td>{allCollections.find(c => c.name.toLowerCase() === collectionDetails.name.toLowerCase())?.description || 'Không có mô tả'}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Số lượng documents</td>
                        <td>{collectionDetails.count !== undefined ? collectionDetails.count.toLocaleString() : '0'}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Kích thước</td>
                        <td>{formatBytes(collectionDetails.sizeInBytes || 0)} ({parseFloat(collectionDetails.sizeInMB || 0).toFixed(2)} MB)</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Số lượng indexes</td>
                        <td>{collectionDetails.nindexes || 0}</td>
                      </tr>
                      {collectionDetails.latestDocument && (
                        <tr>
                          <td className="fw-bold">Document gần nhất</td>
                          <td>{new Date(collectionDetails.latestDocument?.createdAt || collectionDetails.latestDocument?.timestamp || Date.now()).toLocaleString()}</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
                
                {collectionDetails.indexDetails && collectionDetails.indexDetails.length > 0 && (
                  <div className="mb-4">
                    <h5>Danh sách Indexes</h5>
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Tên</th>
                          <th>Fields</th>
                          <th>Loại</th>
                        </tr>
                      </thead>
                      <tbody>
                        {collectionDetails.indexDetails.map((index, i) => (
                          <tr key={i}>
                            <td>{index.name || '-'}</td>
                            <td>{index.key || '-'}</td>
                            <td>{index.unique ? 'Unique' : 'Standard'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
                
                {/* Hiển thị danh sách documents */}
                {collectionDetails.documents && collectionDetails.documents.length > 0 && (
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="mb-0">Documents mới nhất</h5>
                      <small className="text-muted">
                        Hiển thị {collectionDetails.documents.length} / {adminFilter || idFilter ? 
                          <span>
                            {collectionDetails.filteredCount || collectionDetails.documents.length} documents
                            <span className="filtered-badge ms-1">Đã lọc</span>
                          </span> : 
                          `${collectionDetails.count} documents`}
                      </small>
                    </div>
                    
                    {/* Form tìm kiếm */}
                    <div className="filter-section">
                      <Form>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="admin-filter-container">
                              <Form.Label><strong>Tìm kiếm theo Admin</strong></Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Nhập ID hoặc tên admin..."
                                value={adminFilter}
                                onChange={handleAdminFilterChange}
                                className="admin-filter-input"
                              />
                              {adminFilter && (
                                <button 
                                  type="button" 
                                  className="admin-filter-clear"
                                  onClick={() => {
                                    setAdminFilter('');
                                    setTimeout(() => {
                                      handleViewCollection(selectedCollection, 1);
                                    }, 0);
                                  }}
                                >
                                  <i className="bi bi-x-circle"></i>
                                </button>
                              )}
                              <Form.Text className="text-muted">
                                Tìm kiếm theo adminId, tên hoặc username của admin
                              </Form.Text>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="id-filter-container">
                              <Form.Label><strong>Tìm kiếm theo ID</strong></Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Nhập ID document..."
                                value={idFilter}
                                onChange={handleIdFilterChange}
                                className="id-filter-input"
                              />
                              {idFilter && (
                                <button 
                                  type="button" 
                                  className="id-filter-clear"
                                  onClick={() => {
                                    setIdFilter('');
                                    setTimeout(() => {
                                      handleViewCollection(selectedCollection, 1);
                                    }, 0);
                                  }}
                                >
                                  <i className="bi bi-x-circle"></i>
                                </button>
                              )}
                              <Form.Text className="text-muted">
                                Tìm kiếm theo ID hoặc một phần của ID document
                              </Form.Text>
                            </Form.Group>
                          </Col>
                        </Row>
                        {(adminFilter || idFilter) && (
                          <div className="d-flex justify-content-end mt-2">
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={clearAllFilters}
                              className="me-2"
                            >
                              <i className="bi bi-x-circle me-1"></i>
                              Xóa tất cả bộ lọc
                            </Button>
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => handleViewCollection(selectedCollection, 1)}
                            >
                              <i className="bi bi-search me-1"></i>
                              Tìm kiếm
                            </Button>
                          </div>
                        )}
                      </Form>
                    </div>
                    
                    <div className="table-responsive">
                      <Table striped bordered hover size="sm">
                        <thead>
                          <tr>
                            <th style={{ width: '60px', minWidth: '60px' }}>STT</th>
                            <th style={{ width: '200px', minWidth: '200px' }}>ID</th>
                            <th>Dữ liệu</th>
                            <th style={{ width: '80px', minWidth: '80px' }}>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {collectionDetails.documents.map((doc, i) => (
                            <tr key={i}>
                              <td className="text-center" style={{ width: '60px', minWidth: '60px' }}>
                                {(currentPage - 1) * documentsPerPage + i + 1}
                              </td>
                              <td style={{ width: '200px', minWidth: '200px' }}>
                                <div className="text-muted text-truncate" style={{ maxWidth: '200px', fontSize: '0.8rem' }}>
                                  {doc._id}
                                </div>
                              </td>
                              <td>
                                <div className="document-data" style={{ 
                                  maxHeight: '120px', 
                                  maxWidth: '690px',
                                  overflow: 'auto', 
                                  fontSize: '0.8rem',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word'
                                }}>
                                  <pre className="mb-0" style={{ 
                                    fontFamily: 'monospace', 
                                    backgroundColor: '#f8f9fa',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid #dee2e6'
                                  }}>
                                    {JSON.stringify(doc, null, 2)}
                                  </pre>
                                </div>
                              </td>
                              <td className="text-center" style={{ width: '80px', minWidth: '80px' }}>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDocument(doc);
                                    setShowDeleteDocumentModal(true);
                                  }}
                                  title="Xóa document"
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      {/* Hiển thị phân trang */}
                      {renderPagination()}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Alert variant="warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Collection không tồn tại trong database</strong>
                <p className="mt-2 mb-0">
                  Collection "{selectedCollection}" không tồn tại trong MongoDB hoặc không thể truy cập.
                  {collectionDetails.error && (
                    <span className="d-block mt-1">
                      Lỗi: {collectionDetails.errorMessage || 'Không xác định'}
                    </span>
                  )}
                  {collectionDetails.suggestedCollection && (
                    <div className="mt-2">
                      <span className="d-block">Bạn có muốn xem collection này thay thế?</span>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="mt-1"
                        onClick={() => handleViewCollection(collectionDetails.suggestedCollection)}
                      >
                        <i className="bi bi-arrow-right me-1"></i>
                        Xem collection "{collectionDetails.suggestedCollection}"
                      </Button>
                    </div>
                  )}
                </p>
              </Alert>
            )
          ) : (
            <Alert variant="warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Không thể tải thông tin chi tiết collection
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCollectionModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  // Render danh sách collections
  const renderCollectionsList = () => {
    // Lấy danh sách collection từ dbStats hoặc sử dụng danh sách đầy đủ
    const collectionList = Object.keys(dbStats.collections || {}).length > 0 
      ? Object.keys(dbStats.collections || {}) 
      : allCollections.map(c => c.name);
    
    return (
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Chi tiết Collections</h5>
          <Button 
            variant="light" 
            size="sm"
            onClick={() => setShowDeleteAllModal(true)}
          >
            <i className="bi bi-trash me-1"></i> Xóa tất cả
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table striped bordered hover responsive className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Tên Collection</th>
                <th>Mô tả</th>
                <th className="text-end">Số lượng</th>
                <th className="text-end">Kích thước</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {collectionList.map((collection) => {
                const collInfo = (dbStats.collections || {})[collection.toLowerCase()] || {};
                const collDesc = allCollections.find(c => c.name.toLowerCase() === collection.toLowerCase())?.description || 'Không có mô tả';
                
                return (
                  <tr key={collection}>
                    <td className="fw-medium">{collection}</td>
                    <td>{collDesc}</td>
                    <td className="text-end">{collInfo.count !== undefined ? collInfo.count.toLocaleString() : '0'}</td>
                    <td className="text-end">
                      {collInfo.sizeInBytes ? (
                        <>
                          {formatBytes(collInfo.sizeInBytes)}
                        </>
                      ) : '0 Bytes'}
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleViewCollection(collection)}
                      >
                        <i className="bi bi-eye me-1"></i>
                        Chi tiết
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setSelectedCollection(collection);
                          setShowDeleteModal(true);
                        }}
                        disabled={(dbStats.collections || {})[collection.toLowerCase()] === undefined || (collInfo.count || 0) === 0}
                        title={(collInfo.count || 0) === 0 ? "Không có documents để xóa" : "Xóa tất cả documents trong collection"}
                      >
                        <i className="bi bi-eraser me-1"></i>
                        Xóa dữ liệu
                      </Button>
                    </td>
                  </tr>
                );
              })}
              
              {/* Hiển thị collections còn lại không có trong dbStats */}
              {Object.keys(dbStats.collections || {}).length > 0 && allCollections
                .filter(c => !Object.keys(dbStats.collections || {}).includes(c.name.toLowerCase()))
                .map(collection => (
                  <tr key={collection.name} className="table-secondary opacity-75">
                    <td className="fw-medium">{collection.name}</td>
                    <td>{collection.description}</td>
                    <td className="text-end">0</td>
                    <td className="text-end">0 Bytes</td>
                    <td className="text-center">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled
                      >
                        <i className="bi bi-eye me-1"></i>
                        Không có dữ liệu
                      </Button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  };

  // Modal xóa documents trong collection
  const renderDeleteModal = () => {
    return (
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa dữ liệu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Cảnh báo:</strong> Bạn đang chuẩn bị xóa <strong>tất cả documents</strong> trong collection <strong>{selectedCollection}</strong>
          </Alert>
          <p>
            Hành động này sẽ <strong>xóa toàn bộ dữ liệu</strong> trong collection nhưng giữ lại cấu trúc và indexes.
            Thao tác này không thể hoàn tác.
          </p>
          <p>
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
                <span className="ms-2">Đang xóa dữ liệu...</span>
              </>
            ) : (
              <>Xác nhận xóa</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  // Xử lý khi thay đổi bộ lọc admin
  const handleAdminFilterChange = (e) => {
    const value = e.target.value;
    setAdminFilter(value);
    
    // Xóa timeout trước đó nếu có
    if (adminFilterTimeout) {
      clearTimeout(adminFilterTimeout);
    }
    
    // Đặt timeout mới để tránh gọi API quá nhiều khi người dùng đang nhập
    const timeoutId = setTimeout(() => {
      // Reset về trang 1 và tải lại dữ liệu với bộ lọc mới
      if (selectedCollection) {
        handleViewCollection(selectedCollection, 1);
      }
    }, 500); // Delay 500ms
    
    setAdminFilterTimeout(timeoutId);
  };

  // Xử lý khi thay đổi bộ lọc _id
  const handleIdFilterChange = (e) => {
    const value = e.target.value;
    setIdFilter(value);
    
    // Xóa timeout trước đó nếu có
    if (idFilterTimeout) {
      clearTimeout(idFilterTimeout);
    }
    
    // Đặt timeout mới để tránh gọi API quá nhiều khi người dùng đang nhập
    const timeoutId = setTimeout(() => {
      // Reset về trang 1 và tải lại dữ liệu với bộ lọc mới
      if (selectedCollection) {
        handleViewCollection(selectedCollection, 1);
      }
    }, 500); // Delay 500ms
    
    setIdFilterTimeout(timeoutId);
  };

  // Xóa tất cả bộ lọc
  const clearAllFilters = () => {
    setAdminFilter('');
    setIdFilter('');
    setTimeout(() => {
      handleViewCollection(selectedCollection, 1);
    }, 0);
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
                          {Object.values(dbStats.collections || {})
                            .reduce((sum, collection) => sum + (collection.count || 0), 0)
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
                
                {renderCollectionsList()}
                
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

      {/* Modal xem chi tiết collection */}
      {renderCollectionModal()}

      {/* Modal Xóa documents trong Collection */}
      {renderDeleteModal()}

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

      {/* Modal xác nhận xóa document */}
      <Modal show={showDeleteDocumentModal} onHide={() => setShowDeleteDocumentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Cảnh báo:</strong> Bạn đang chuẩn bị xóa document này khỏi collection <strong>{selectedCollection}</strong>
          </Alert>
          {selectedDocument && (
            <div className="mt-3">
              <h6>Thông tin document:</h6>
              <div className="border rounded p-2 bg-light">
                <small className="d-block mb-1"><strong>ID:</strong> {selectedDocument._id}</small>
                <pre className="mb-0" style={{ maxHeight: '200px', overflow: 'auto', fontSize: '0.8rem' }}>
                  {JSON.stringify(selectedDocument, null, 2)}
                </pre>
              </div>
            </div>
          )}
          <p className="mt-3 mb-0">
            Hành động này <strong>không thể hoàn tác</strong>. Bạn có chắc chắn muốn tiếp tục?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteDocumentModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteDocument}
            disabled={deleteDocumentLoading}
          >
            {deleteDocumentLoading ? (
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

export default DatabaseManagement; 