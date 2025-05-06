import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, InputGroup, Modal, Badge, Alert, Tabs, Tab, Spinner, OverlayTrigger, Tooltip, Popover } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminNavbar from '../../components/Navbar';
import { secretMessageApi } from '../../services/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { QRCodeSVG } from 'qrcode.react';

const SecretMessageList = () => {
  const [secretMessages, setSecretMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [messageResponses, setMessageResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [selectedMessageForDetail, setSelectedMessageForDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [selectedUserResponse, setSelectedUserResponse] = useState(null);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [selectedResponseForDelete, setSelectedResponseForDelete] = useState(null);
  const [showDeleteResponseModal, setShowDeleteResponseModal] = useState(false);

  // Lấy danh sách mật thư
  useEffect(() => {
    const fetchSecretMessages = async () => {
      try {
        setLoading(true);
        const response = await secretMessageApi.getAllByAdmin();
        setSecretMessages(response.data.data);
        setFilteredMessages(response.data.data);
      } catch (error) {
        console.error('Error fetching secret messages:', error);
        toast.error('Không thể tải danh sách mật thư');
      } finally {
        setLoading(false);
      }
    };

    fetchSecretMessages();
  }, []);

  // Xử lý tìm kiếm
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMessages(secretMessages);
    } else {
      const filtered = secretMessages.filter(message => 
        message.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMessages(filtered);
    }
  }, [searchTerm, secretMessages]);

  // Lấy danh sách phản hồi mật thư theo thời gian thực
  useEffect(() => {
    if (activeTab === 'responses') {
      fetchMessageResponses();
      
      // Thiết lập cập nhật tự động mỗi 10 giây
      const interval = setInterval(() => {
        fetchMessageResponses();
      }, 10000);
      
      setRefreshInterval(interval);
    } else {
      // Xóa interval khi rời khỏi tab responses
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [activeTab]);

  // Hàm lấy danh sách phản hồi
  const fetchMessageResponses = useCallback(async () => {
    try {
      setLoadingResponses(true);
      // Gọi API lấy phản hồi
      const response = await secretMessageApi.getMessageResponses();
      console.log('API response:', response); // Debug log để kiểm tra cấu trúc dữ liệu
      
      // Đảm bảo messageResponses luôn là một mảng
      // Kiểm tra cấu trúc đúng của dữ liệu: response.data.data
      const responseData = response.data && response.data.data;
      
      // Sắp xếp dữ liệu theo thứ tự thời gian mới nhất trước
      const sortedData = Array.isArray(responseData) 
        ? [...responseData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        : [];
      
      setMessageResponses(sortedData);
    } catch (error) {
      console.error('Error fetching message responses:', error);
      // Đảm bảo messageResponses vẫn là mảng khi có lỗi
      setMessageResponses([]);
      // Không hiển thị toast lỗi khi cập nhật tự động để tránh làm phiền người dùng
    } finally {
      setLoadingResponses(false);
    }
  }, []);

  // Xác nhận xóa mật thư
  const handleDeleteClick = (message) => {
    setSelectedMessage(message);
    setShowDeleteModal(true);
  };

  // Xóa mật thư
  const handleDeleteConfirm = async () => {
    if (!selectedMessage || !selectedMessage._id) {
      toast.error('Không thể xóa mật thư: ID không hợp lệ');
      setShowDeleteModal(false);
      return;
    }
    
    try {
      const messageId = selectedMessage._id;
      console.log('Đang xóa mật thư ID:', messageId);
      
      const response = await secretMessageApi.delete(messageId);
      console.log('Kết quả xóa mật thư:', response);
      
      if (response && response.data && response.data.success) {
        toast.success('Xóa mật thư thành công');
        
        // Cập nhật danh sách
        setSecretMessages(prevMessages => 
          prevMessages.filter(message => message._id !== messageId)
        );
        setFilteredMessages(prevMessages => 
          prevMessages.filter(message => message._id !== messageId)
        );
      } else {
        toast.warning('Xóa mật thư thành công nhưng không nhận được phản hồi từ server');
      }
      
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting secret message:', error);
      toast.error(`Không thể xóa mật thư: ${error.message || 'Lỗi không xác định'}`);
      setShowDeleteModal(false);
    }
  };

  // Hiển thị mã QR
  const handleShowQR = async (message) => {
    try {
      // Đầu tiên hiển thị QR code đã lưu trong model để không bị chậm
      setQrCode(message.qrCode);
      setSelectedMessage(message);
      setShowQRModal(true);
      
      // Thay vì gọi API, tạo QR code ở client với URL thực tế
      // QR code này sẽ hiển thị trong Modal thay vì ảnh base64 từ server
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/secret-message/${message._id}`;
      console.log('Đã tạo QR code với URL:', url);
      
      // Không cần gọi API nữa vì chúng ta sẽ hiển thị QRCodeSVG trực tiếp
      // const response = await secretMessageApi.getQRCode(message._id);
      // 
      // if (response && response.data && response.data.qrCode) {
      //   // Cập nhật QR code mới khi API trả về
      //   setQrCode(response.data.qrCode);
      // }
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Không hiển thị toast lỗi vì đã hiển thị QR code từ model
    }
  };

  // Tải mã QR
  const handleDownloadQR = () => {
    if (!selectedMessage) return;
    
    try {
      // Tìm SVG element từ DOM
      const svg = document.querySelector('.qr-code-container svg');
      if (!svg) {
        toast.error('Không thể tạo hình ảnh QR code');
        return;
      }
      
      // Tạo canvas để chuyển đổi SVG thành hình ảnh
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Thiết lập kích thước canvas
      canvas.width = 300;
      canvas.height = 300;
      
      // Tạo đối tượng Image từ SVG
      const image = new Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      image.onload = () => {
        // Vẽ background trắng
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Vẽ SVG lên canvas
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        
        // Chuyển đổi canvas thành data URL
        const dataUrl = canvas.toDataURL('image/png');
        
        // Tạo link để tải xuống
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `mathu-qrcode-${selectedMessage._id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Giải phóng URL
        URL.revokeObjectURL(svgUrl);
      };
      
      image.src = svgUrl;
    } catch (err) {
      console.error('Lỗi khi tạo file tải xuống:', err);
      toast.error('Không thể tải xuống QR code');
    }
  };
  
  // Sao chép link mật thư
  const handleCopyLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/secret-message/${selectedMessage._id}`;
    
    navigator.clipboard.writeText(link)
      .then(() => {
        setShowCopiedAlert(true);
        setTimeout(() => setShowCopiedAlert(false), 3000);
        toast.success('Đã sao chép liên kết mật thư');
      })
      .catch((err) => {
        console.error('Không thể sao chép:', err);
        toast.error('Không thể sao chép liên kết');
      });
  };

  // Xem chi tiết mật thư
  const handleViewDetail = (message) => {
    setSelectedMessageForDetail(message);
    setShowDetailModal(true);
  };

  // Hàm hiển thị modal thông tin người dùng
  const handleViewUserInfo = (response) => {
    setSelectedUserResponse(response);
    setShowUserInfoModal(true);
  };
  
  // Hàm kiểm tra xem response có chứa thông tin người dùng hay không
  const hasUserInfo = (response) => {
    return response.userInfo && typeof response.userInfo === 'object' && Object.keys(response.userInfo).length > 0;
  };
  
  // Render thông tin người dùng trong tooltip
  const renderUserInfoTooltip = (response) => {
    if (!hasUserInfo(response)) return "Không có thông tin";
    
    return (
      <Popover id={`user-info-${response._id}`} style={{ maxWidth: '300px' }}>
        <Popover.Header as="h3">Thông tin người dùng</Popover.Header>
        <Popover.Body>
          <div className="user-info-details">
            {Object.entries(response.userInfo).map(([key, value]) => (
              <div key={key} className="mb-1">
                <strong>{key}:</strong> {value}
              </div>
            ))}
          </div>
        </Popover.Body>
      </Popover>
    );
  };

  // Xóa phản hồi mật thư
  const handleDeleteResponse = (response) => {
    setSelectedResponseForDelete(response);
    setShowDeleteResponseModal(true);
  };
  
  // Xác nhận xóa phản hồi
  const handleDeleteResponseConfirm = async () => {
    if (!selectedResponseForDelete || !selectedResponseForDelete._id) {
      toast.error('Không thể xóa phản hồi: ID không hợp lệ');
      setShowDeleteResponseModal(false);
      return;
    }
    
    try {
      const response = await secretMessageApi.deleteMessageResponse(selectedResponseForDelete._id);
      
      if (response && response.data && response.data.success) {
        toast.success('Xóa phản hồi thành công');
        
        // Cập nhật danh sách
        setMessageResponses(prevResponses => 
          prevResponses.filter(r => r._id !== selectedResponseForDelete._id)
        );
      } else {
        toast.warning('Xóa phản hồi thành công nhưng không nhận được phản hồi từ server');
      }
      
      setShowDeleteResponseModal(false);
    } catch (error) {
      console.error('Error deleting response:', error);
      toast.error(`Không thể xóa phản hồi: ${error.message || 'Lỗi không xác định'}`);
      setShowDeleteResponseModal(false);
    }
  };
  
  // Export lịch sử phản hồi ra Excel
  const handleExportExcel = () => {
    try {
      if (!Array.isArray(messageResponses) || messageResponses.length === 0) {
        toast.warning('Không có dữ liệu để xuất');
        return;
      }
      
      // Chuẩn bị dữ liệu cho Excel
      const exportData = messageResponses.map(response => {
        const formattedTimestamp = format(new Date(response.timestamp), 'HH:mm:ss dd/MM/yyyy', { locale: vi });
        
        // Xử lý thông tin người dùng
        let userInfoText = '';
        if (response.userInfo) {
          userInfoText = Object.entries(response.userInfo)
            .map(([key, value]) => `${key}: ${value}`)
            .join('; ');
        }
        
        return {
          'Thời gian': formattedTimestamp,
          'Tên mật thư': response.messageName || '',
          'Người dùng': response.userName || 'Định danh',
          'Thông tin người dùng': userInfoText,
          'Câu trả lời': response.answer || '',
          'Kết quả': response.isUserInfoSubmission ? 'Thông tin' : (response.isCorrect ? 'Đúng' : 'Sai')
        };
      });
      
      // Tạo workbook và thêm worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Lịch sử trả lời');
      
      // Xuất file Excel
      const fileName = `lich-su-tra-loi-mat-thu-${format(new Date(), 'dd-MM-yyyy', { locale: vi })}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success('Xuất Excel thành công');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error(`Không thể xuất Excel: ${error.message || 'Lỗi không xác định'}`);
    }
  };

  // Render danh sách mật thư
  const renderMessageList = () => (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <Row className="mb-3">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Tìm kiếm mật thư..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-2">Đang tải danh sách mật thư...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox display-1 text-muted"></i>
            <p className="mt-3">Không có mật thư nào được tìm thấy</p>
            <Button as={Link} to="/admin/secret-messages/new" variant="outline-primary">
              Tạo mật thư đầu tiên
            </Button>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Tên mật thư</th>
                  <th style={{ width: '10%' }}>Loại nội dung</th>
                  <th style={{ width: '20%' }}>Ghi chú</th>
                  <th style={{ width: '5%' }}>Ngày tạo</th>
                  <th style={{ width: '25%' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((message) => (
                  <tr key={message._id}>
                    <td>
                      <div className="fw-bold">{message.name}</div>
                    </td>
                    <td>
                      {message.contentType === 'text' && <Badge bg="info">Văn bản</Badge>}
                      {message.contentType === 'image' && <Badge bg="success">Hình ảnh</Badge>}
                      {message.contentType === 'both' && <Badge bg="warning">Hỗn hợp</Badge>}
                    </td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '200px' }}>
                        {message.teamNote || <span className="text-muted fst-italic">Không có</span>}
                      </div>
                    </td>
                    <td>
                      {format(new Date(message.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </td>
                    <td>
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        className="me-1"
                        onClick={() => handleViewDetail(message)}
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-1"
                        onClick={() => handleShowQR(message)}
                      >
                        <i className="bi bi-qr-code"></i>
                      </Button>
                      <Button 
                        as={Link} 
                        to={`/admin/secret-messages/edit/${message._id}`} 
                        variant="outline-secondary" 
                        size="sm"
                        className="me-1"
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteClick(message)}
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
  );

  // Render lịch sử phản hồi
  const renderResponseHistory = () => (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">Lịch sử trả lời mật thư</h5>
          <div>
            <Button 
              variant="outline-success" 
              size="sm"
              className="me-2"
              onClick={handleExportExcel}
            >
              <i className="bi bi-file-earmark-excel me-2"></i>
              Xuất Excel
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={fetchMessageResponses}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Làm mới
            </Button>
          </div>
        </div>

        {loadingResponses ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Đang tải dữ liệu...</p>
          </div>
        ) : (!Array.isArray(messageResponses) || messageResponses.length === 0) ? (
          <div className="text-center py-5">
            <i className="bi bi-clipboard-check display-4 text-muted"></i>
            <p className="mt-3">Chưa có phản hồi nào cho mật thư</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th style={{ width: '10%' }}>Thời gian</th>
                  <th style={{ width: '20%' }}>Tên mật thư</th>
                  <th style={{ width: '20%' }}>Người dùng</th>
                  <th style={{ width: '35%' }}>Câu trả lời</th>
                  <th style={{ width: '5%' }}>Kết quả</th>
                  <th style={{ width: '10%' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(messageResponses) && messageResponses.map((response, index) => (
                  <tr key={index} className={response.isCorrect ? 'table-success' : (response.isUserInfoSubmission ? 'table-info' : 'table-danger')}>
                    <td>{format(new Date(response.timestamp), 'HH:mm:ss dd/MM/yyyy', { locale: vi })}</td>
                    <td>{response.messageName}</td>
                    <td>
                      {hasUserInfo(response) ? (
                        <OverlayTrigger
                          placement="right"
                          overlay={renderUserInfoTooltip(response)}
                        >
                          <Button 
                            variant="link" 
                            className="p-0 text-decoration-none" 
                            onClick={() => handleViewUserInfo(response)}
                          >
                            {response.userName || 'Định danh'} <i className="bi bi-info-circle-fill text-primary ms-1"></i>
                          </Button>
                        </OverlayTrigger>
                      ) : (
                        response.userName || 'Định danh'
                      )}
                    </td>
                    <td>{response.answer || (response.isUserInfoSubmission ? <Badge bg="info">Thông tin người dùng</Badge> : '')}</td>
                    <td>
                      {!response.isUserInfoSubmission ? (
                        response.isCorrect ? 
                          <Badge bg="success">Đúng</Badge> : 
                          <Badge bg="danger">Sai</Badge>
                      ) : (
                        <Badge bg="info">Thông tin</Badge>
                      )}
                    </td>
                    <td>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteResponse(response)}
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
  );

  return (
    <>
      <AdminNavbar />
      <Container className="py-4">
        <Row className="mb-4 align-items-center">
          <Col>
            <h1 className="mb-0">Quản lý mật thư</h1>
            <p className="text-muted">Tạo và quản lý mật thư của bạn</p>
          </Col>
          <Col xs="auto">
            <Button as={Link} to="/admin/secret-messages/new" variant="primary">
              <i className="bi bi-plus-circle me-2"></i>Tạo mật thư mới
            </Button>
          </Col>
        </Row>

        <Tabs 
          activeKey={activeTab} 
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tab eventKey="list" title={<span><i className="bi bi-list me-2"></i>Danh sách mật thư</span>}>
            {renderMessageList()}
          </Tab>
          <Tab eventKey="responses" title={<span><i className="bi bi-reply-all me-2"></i>Lịch sử trả lời</span>}>
            {renderResponseHistory()}
          </Tab>
        </Tabs>
      </Container>

      {/* Modal xác nhận xóa */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa mật thư "{selectedMessage?.name}"?<br />
          Hành động này không thể hoàn tác.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal hiển thị mã QR */}
      <Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Mã QR</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedMessage && (
            <>
              <div className="position-relative qr-code-container" style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                <QRCodeSVG
                  value={`${window.location.origin}/secret-message/${selectedMessage._id}`}
                  size={300}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/logo192.png",
                    height: 60,
                    width: 60,
                    excavate: true
                  }}
                />
              </div>
              <p className="mt-3">Quét mã QR để xem mật thư</p>
              
              {showCopiedAlert && (
                <Alert variant="success" className="mt-2">
                  <i className="bi bi-check-circle me-2"></i>
                  Đã sao chép liên kết!
                </Alert>
              )}
              
              <div className="d-grid gap-2 mt-3">
                <Button variant="outline-primary" onClick={handleCopyLink}>
                  <i className="bi bi-clipboard me-2"></i>Sao chép liên kết
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleDownloadQR}>
            <i className="bi bi-download me-2"></i>Tải xuống
          </Button>
          <Button variant="secondary" onClick={() => setShowQRModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal chi tiết mật thư */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết mật thư</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMessageForDetail && (
            <div className="secret-message-detail">
              <h3 className="text-center mb-2">{selectedMessageForDetail.name}</h3>
              {selectedMessageForDetail.title && (
                <h5 className="text-center mb-3">{selectedMessageForDetail.title}</h5>
              )}
              
              {selectedMessageForDetail.teamNote && (
                <Alert variant="info" className="mb-4">
                  <i className="bi bi-info-circle me-2"></i>
                  {selectedMessageForDetail.teamNote}
                </Alert>
              )}

              <Card className="mb-4">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Nội dung</h5>
                </Card.Header>
                <Card.Body>
                  <div className="secret-message-content">
                    
                    {(selectedMessageForDetail.contentType === 'text' || selectedMessageForDetail.contentType === 'both') && selectedMessageForDetail.ottContent && (
                      <div className="mb-4">
                        <div className="d-flex align-items-center mb-2">
                          <div style={{ backgroundColor: '#0d6efd', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                            OTT:
                          </div>
                        </div>
                        <div 
                          className="content-container p-3 bg-light-subtle rounded"
                          style={{
                            fontSize: selectedMessageForDetail.fontSize,
                            fontWeight: selectedMessageForDetail.fontWeight,
                            lineHeight: selectedMessageForDetail.lineHeight,
                            letterSpacing: selectedMessageForDetail.letterSpacing,
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {selectedMessageForDetail.ottContent}
                        </div>
                      </div>
                    )}
                    
                    {selectedMessageForDetail.nwContent && (
                      <div className="mb-4">
                        <div className="d-flex align-items-center mb-2">
                          <div style={{ backgroundColor: '#0d6efd', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                            NW:
                          </div>
                        </div>
                        <div 
                          className="content-container p-3 bg-light-subtle rounded"
                          style={{
                            fontSize: selectedMessageForDetail.fontSize,
                            fontWeight: selectedMessageForDetail.fontWeight,
                            lineHeight: selectedMessageForDetail.lineHeight,
                            letterSpacing: selectedMessageForDetail.letterSpacing,
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {selectedMessageForDetail.nwContent}
                        </div>
                      </div>
                    )}
                                        {selectedMessageForDetail.contentType === 'image' || selectedMessageForDetail.contentType === 'both' ? (
                      <div className="text-center mb-4">
                        {selectedMessageForDetail.content.startsWith('data:image') && (
                          <img 
                            src={selectedMessageForDetail.content} 
                            alt="Mật thư" 
                            className="img-fluid" 
                            style={{ maxHeight: '400px' }}
                          />
                        )}
                      </div>
                    ) : null}
                  </div>
                </Card.Body>
              </Card>
              
              <Card>
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Đáp án</h5>
                </Card.Header>
                <Card.Body>
                  <ul className="list-group">
                    {selectedMessageForDetail.correctAnswer?.map((answer, index) => (
                      <li key={index} className="list-group-item">
                        <Badge bg="success" className="me-2">Đáp án {index + 1}</Badge>
                        {answer}
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" as={Link} to={`/admin/secret-messages/edit/${selectedMessageForDetail?._id}`}>
            <i className="bi bi-pencil me-2"></i>Chỉnh sửa
          </Button>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal thông tin người dùng */}
      <Modal show={showUserInfoModal} onHide={() => setShowUserInfoModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thông tin người dùng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUserResponse && selectedUserResponse.userInfo ? (
            <div className="user-info-details">
              {Object.entries(selectedUserResponse.userInfo).map(([key, value]) => (
                <div key={key} className="mb-3">
                  <h6 className="fw-bold mb-1">{key}:</h6>
                  <div>{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">Không có thông tin người dùng</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserInfoModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xác nhận xóa phản hồi */}
      <Modal show={showDeleteResponseModal} onHide={() => setShowDeleteResponseModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa phản hồi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa phản hồi này?<br />
          Hành động này không thể hoàn tác.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteResponseModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteResponseConfirm}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SecretMessageList; 