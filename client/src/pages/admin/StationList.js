import React, { useState, useEffect, useRef } from 'react';
import { Container, Table, Button, Card, Modal, Spinner, Row, Col, Badge, InputGroup, Form, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import AdminNavbar from '../../components/Navbar';
import { stationApi } from '../../services/api';
import { formatDateTime, replaceStationTerm } from '../../utils/helpers';
import TermReplacer from '../../utils/TermReplacer';
import { useLanguage } from '../../context/LanguageContext';

const StationList = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const qrCodeRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await stationApi.getAll();
      setStations(response.data);
      setError(null);
    } catch (err) {
      setError(t('load_station_list_error'));
      console.error('Error fetching stations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('delete_station_confirm'))) {
      try {
        await stationApi.delete(id);
        fetchStations();
      } catch (err) {
        setError(t('delete_station_error'));
        console.error('Error deleting station:', err);
      }
    }
  };

  const showQRCode = (station) => {
    setSelectedStation(station);
    setShowQRModal(true);
  };

  // Hàm in mã QR
  const handlePrintQR = async () => {
    if (!qrCodeRef.current) return;
    
    try {
      // Tạo canvas từ phần tử DOM chứa mã QR và thông tin
      const canvas = await html2canvas(qrCodeRef.current);
      const imageDataUrl = canvas.toDataURL('image/png');
      
      const printWindow = window.open('', '_blank');
      const stationName = selectedStation?.name || replaceStationTerm(t('station_label'));
      const maxAttempts = selectedStation?.maxAttempts || '';
      const stationIndex = filteredStations.findIndex(s => s._id === selectedStation?._id) + 1;
      
      printWindow.document.write(`
        <html>
          <head>
            <title>${t('qr_print_title')} - Trạm ${stationIndex}: ${stationName}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
            <style>
              body { 
                font-family: 'Inter', 'Roboto', sans-serif;
                text-align: center;
                padding: 20px;
              }
              .container {
                max-width: 500px;
                margin: 0 auto;
                border: 1px solid #ddd;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
              }
              h1 {
                margin-bottom: 5px;
                font-size: 24px;
                color: #3498db;
              }
              .info {
                margin-bottom: 20px;
                font-size: 16px;
              }
              .qr-image {
                margin: 20px auto;
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .station-name {
                font-size: 24px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 10px;
              }
              .station-info {
                color: #7f8c8d;
                font-size: 14px;
                margin-bottom: 20px;
              }
              .max-attempts {
                color: #e74c3c;
                font-weight: 500;
                margin: 10px 0;
              }
              @media print {
                .container {
                  border: none;
                  box-shadow: none;
                }
                .no-print {
                  display: none;
                }
              }
              .btn {
                padding: 10px 16px;
                border-radius: 8px;
                border: none;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                margin: 0 5px;
              }
              .btn-primary {
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
              }
              .btn-secondary {
                background: linear-gradient(135deg, #95a5a6, #7f8c8d);
                color: white;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="station-name">
                <i class="bi bi-geo-alt-fill me-2"></i>
                Trạm ${stationIndex}: ${stationName}
              </div>
              <div class="station-info">
                <div class="mt-3 mb-2">
                  <span class="badge bg-primary p-2" style="font-size: 14px; width: 100%; display: block;">
                    <i class="bi bi-repeat me-1"></i>${t('max_attempts_label')}: <strong>${maxAttempts}</strong>
                  </span>
                </div>
                <div>
                  <span class="badge bg-secondary p-2" style="font-size: 14px; width: 100%; display: block;">
                    <i class="bi bi-fingerprint me-1"></i>ID: <small>${selectedStation?._id}</small>
                  </span>
                </div>
              </div>
              <div>
                <img src="${imageDataUrl}" alt="QR Code" class="qr-image"/>
              </div>
              <div class="no-print" style="margin-top: 30px;">
                <button class="btn btn-primary" onclick="window.print()">
                  <i class="bi bi-printer me-2"></i>${t('print')}
                </button>
                <button class="btn btn-secondary" onclick="window.close()">
                  <i class="bi bi-x-lg me-2"></i>${t('close')}
                </button>
              </div>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    } catch (err) {
      console.error('Error preparing print:', err);
      alert(t('print_error'));
    }
  };

  // Hàm lưu mã QR thành hình ảnh
  const handleSaveQRImage = async () => {
    if (!qrCodeRef.current) return;
    
    try {
      setIsDownloading(true);
      
      // Tìm SVG element từ DOM
      const svg = qrCodeRef.current.querySelector('svg');
      if (!svg) {
        alert(t('save_image_error'));
        setIsDownloading(false);
        return;
      }
      
      // Tạo canvas mới để xử lý QR code riêng
      const qrCanvas = document.createElement('canvas');
      const qrCtx = qrCanvas.getContext('2d');
      
      // Thiết lập kích thước canvas cho QR
      qrCanvas.width = 300;
      qrCanvas.height = 300;
      
      // Tạo đối tượng Image từ SVG
      const qrImage = new Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      // Tạo đối tượng Image để load logo
      const logoImg = new Image();
      
      // Xử lý sự kiện khi QR code được tải
      qrImage.onload = async () => {
        // Vẽ background trắng
        qrCtx.fillStyle = 'white';
        qrCtx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);
        
        // Vẽ QR code lên canvas
        qrCtx.drawImage(qrImage, 0, 0, qrCanvas.width, qrCanvas.height);
        
        // Vẽ logo ở giữa QR code
        const logoSize = qrCanvas.width * 0.2; // Logo chiếm 20% kích thước QR
        const logoX = (qrCanvas.width - logoSize) / 2;
        const logoY = (qrCanvas.height - logoSize) / 2;
        
        qrCtx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        
        // Tạo canvas cuối cùng với đầy đủ thông tin
        const finalCanvas = await html2canvas(qrCodeRef.current);
        const finalCtx = finalCanvas.getContext('2d');
        
        // Tìm vị trí của QR code trong finalCanvas để vẽ đè QR code mới có logo
        const qrPosition = findQRPositionInCanvas(finalCanvas, svg);
        
        // Vẽ QR code mới có logo lên vị trí của QR code cũ
        if (qrPosition) {
          finalCtx.drawImage(qrCanvas, qrPosition.x, qrPosition.y, qrPosition.width, qrPosition.height);
        }
        
        // Chuyển canvas thành blob
        finalCanvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('Không thể tạo blob từ canvas');
          }
          
          // Tạo URL từ blob
          const url = URL.createObjectURL(blob);
          
          // Tạo thẻ a để tải xuống
          const link = document.createElement('a');
          link.href = url;
          link.download = `QR_${selectedStation?.name || t('station_label')}.png`;
          
          // Kích hoạt sự kiện click để tải xuống
          document.body.appendChild(link);
          link.click();
          
          // Dọn dẹp
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            URL.revokeObjectURL(svgUrl);
            setIsDownloading(false);
          }, 100);
        }, 'image/png', 1.0);
      };
      
      // Hàm tìm vị trí của QR code trong canvas
      const findQRPositionInCanvas = (canvas, svgElement) => {
        const svgRect = svgElement.getBoundingClientRect();
        const containerRect = qrCodeRef.current.getBoundingClientRect();
        
        const x = svgRect.left - containerRect.left;
        const y = svgRect.top - containerRect.top;
        
        return {
          x: x,
          y: y,
          width: svgRect.width,
          height: svgRect.height
        };
      };
      
      // Xử lý sự kiện tải logo
      logoImg.onload = () => {
        // Khi logo đã được tải, tải tiếp SVG QR code
        qrImage.src = svgUrl;
      };
      
      // Tải logo từ public folder
      logoImg.src = `${window.location.origin}/logo192.png`;
      
    } catch (err) {
      console.error('Error saving image:', err);
      alert(t('save_image_error'));
      setIsDownloading(false);
    }
  };
  
  // Lọc trạm theo từ khóa
  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(filterText.toLowerCase()) ||
    station.teams.some(team => team.toLowerCase().includes(filterText.toLowerCase()))
  );

  // Hàm sao chép link
  const copyLink = () => {
    const link = `${window.location.origin}/station/${selectedStation._id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <AdminNavbar />
      <Container className="py-4 animate__animated animate__fadeIn">
        <Row className="mb-4 align-items-center">
          <Col>
            <h1 className="mb-0 d-flex align-items-center">
              <i className="bi bi-geo-alt-fill me-3 text-primary" style={{ fontSize: '2rem' }}></i>
              <TermReplacer>{t('station_management_title')}</TermReplacer>
            </h1>
            <p className="text-muted mb-0 mt-2">
              <TermReplacer>{t('manage_all_stations')}</TermReplacer>
            </p>
          </Col>
          <Col xs="auto" className="d-flex gap-2">
            <Button 
              as={Link} 
              to="/station/admin" 
              variant="info" 
              className="d-flex align-items-center me-2" 
              onClick={(e) => {
                e.preventDefault();
                // Lấy adminId từ localStorage
                const adminData = localStorage.getItem('admin');
                let adminId = null;
                
                if (adminData) {
                  try {
                    const admin = JSON.parse(adminData);
                    // ID có thể là id hoặc _id
                    adminId = admin.id || admin._id;
                    
                    if (!adminId) {
                      console.error('Admin object found but no ID property:', admin);
                      return;
                    }
                    
                    // Chuyển đến trang quản lý trạm trực tiếp
                    navigate(`/station/admin/${adminId}`);
                  } catch (err) {
                    console.error('Error parsing admin data:', err);
                  }
                } else {
                  console.error('Admin data not found in localStorage');
                  alert('Không tìm thấy thông tin đăng nhập admin. Vui lòng đăng nhập lại.');
                }
              }}
            >
              <i className="bi bi-display me-2"></i>
              Quản lý trạm trực tiếp
            </Button>
            <Button as={Link} to="/admin/stations/new" variant="primary" className="d-flex align-items-center">
              <i className="bi bi-plus-circle me-2"></i>
              {t('create_station')}
            </Button>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {t('load_stations_error') || error}
          </Alert>
        )}
        
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Row className="mb-4 align-items-center">
              <Col md={6} className="mb-3 mb-md-0">
                <div className="d-flex align-items-center">
                  <i className="bi bi-clipboard-data me-2 text-primary" style={{ fontSize: '1.2rem' }}></i>
                  <h5 className="mb-0">
                    <TermReplacer>{t('total_stations')}:</TermReplacer> <Badge bg="primary">{stations.length}</Badge>
                  </h5>
                </div>
              </Col>
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text className="bg-white">
                    <i className="bi bi-search text-primary"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder={t('search_placeholder')}
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                  {filterText && (
                    <Button variant="outline-secondary" onClick={() => setFilterText('')}>
                      <i className="bi bi-x"></i>
                    </Button>
                  )}
                </InputGroup>
              </Col>
            </Row>

            {loading ? (
              <div className="text-center my-5 py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">{t('loading_data')}</p>
              </div>
            ) : filteredStations.length === 0 ? (
              <Card className="text-center p-5 bg-light border-0">
                <Card.Body>
                  <div className="mb-3">
                    <i className="bi bi-geo-alt text-muted" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h3>{filterText ? <TermReplacer>{t('no_matching_station')}</TermReplacer> : <TermReplacer>{t('no_stations')}</TermReplacer>}</h3>
                  <p className="text-muted mb-4">
                    {filterText 
                      ? <TermReplacer>{t('no_matching_station_note')}</TermReplacer>
                      : <TermReplacer>{t('first_station_instruction')}</TermReplacer>
                    }
                  </p>
                  <Button as={Link} to="/admin/stations/new" variant="primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    {t('create_station')}
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th width="60" className="text-center">#</th>
                      <th>
                        <TermReplacer>{t('station_label')}</TermReplacer>
                      </th>
                      <th>{t('teams')}</th>
                      <th>{t('content_type')}</th>
                      <th width="180" className="text-center">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStations.map((station, index) => (
                      <tr key={station._id}>
                        <td className="text-center">{index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div>
                              <h6 className="mb-0">{station.name}</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap" style={{ gap: '4px' }}>
                            {station.teams.length === 0 ? (
                              <span className="text-muted">{t('no_teams')}</span>
                            ) : station.teams.length <= 3 ? (
                              station.teams.map((team, idx) => (
                                <Badge key={idx} bg="light" text="dark" className="me-1">
                                  {team}
                                </Badge>
                              ))
                            ) : (
                              <>
                                <Badge bg="light" text="dark" className="me-1">
                                  {station.teams[0]}
                                </Badge>
                                <Badge bg="light" text="dark" className="me-1">
                                  {station.teams[1]}
                                </Badge>
                                <OverlayTrigger
                                  placement="right"
                                  overlay={
                                    <Tooltip>
                                      <div className="text-start">
                                        {station.teams.slice(2).map((team, idx) => (
                                          <div key={idx}>{team}</div>
                                        ))}
                                      </div>
                                    </Tooltip>
                                  }
                                >
                                  <Badge bg="primary" className="me-1" style={{ cursor: 'pointer' }}>
                                    +{station.teams.length - 2}
                                  </Badge>
                                </OverlayTrigger>
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          {station.contentType === 'text' && (
                            <Badge bg="info" className="me-1">{t('content_text_label')}</Badge>
                          )}
                          {station.contentType === 'image' && (
                            <Badge bg="success" className="me-1">{t('content_image_label')}</Badge>
                          )}
                          {station.contentType === 'both' && (
                            <>
                              <Badge bg="info" className="me-1">{t('content_text_label')}</Badge>
                              <Badge bg="success" className="me-1">{t('content_image_label')}</Badge>
                            </>
                          )}
                          <div className="mt-1">
                            <small className="text-muted">
                              <i className="bi bi-repeat me-1"></i>
                              {station.maxAttempts} {t('attempts')}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center" style={{ gap: '8px' }}>
                            <Button 
                              variant="info" 
                              size="sm" 
                              onClick={() => showQRCode(station)}
                              title={t('view_qr_code')}
                            >
                              <i className="bi bi-qr-code"></i>
                            </Button>
                            <Button 
                              as={Link} 
                              to={`/admin/stations/edit/${station._id}`} 
                              variant="warning" 
                              size="sm"
                              title={t('edit_category')}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleDelete(station._id)}
                              title={t('delete_category')}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* QR Code Modal */}
      <Modal 
        show={showQRModal} 
        onHide={() => setShowQRModal(false)}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-qr-code me-2 text-primary"></i>
            <TermReplacer>{t('view_qr')}</TermReplacer>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="d-flex flex-column align-items-center">
            <div 
              ref={qrCodeRef} 
              className="mb-3 p-4 bg-white rounded shadow-sm"
              style={{ 
                maxWidth: '350px',
                width: '100%',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div className="mb-3">
                <h5 className="fw-bold mb-1">Trạm {filteredStations.findIndex(s => s._id === selectedStation?._id) + 1}: {selectedStation?.name}</h5>
                <div className="d-flex flex-column align-items-center gap-2 mt-2">
                  <Badge bg="primary" className="w-100 py-2">
                    <i className="bi bi-repeat me-1"></i>
                    {t('max_attempts_label')}: {selectedStation?.maxAttempts}
                  </Badge>
                  <Badge bg="secondary" className="w-100 py-2">
                    <i className="bi bi-key me-1"></i>
                    ID: {selectedStation?._id && selectedStation._id}
                  </Badge>
                </div>
              </div>
              
              {selectedStation && (
                <div style={{ position: 'relative' }}>
                  <QRCodeSVG 
                    value={`${window.location.origin}/station/${selectedStation._id}`}
                    size={280}
                    level="H"
                    includeMargin={true}
                  />
                  <img 
                    src={`${window.location.origin}/logo192.png`}
                    alt="Logo" 
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '60px',
                      height: '60px',
                      background: 'white',
                      padding: '5px',
                      borderRadius: '5px'
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="d-flex flex-column gap-2 mb-3">
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-primary" 
                  onClick={copyLink}
                  className="d-flex align-items-center justify-content-center"
                >
                  <i className="bi bi-link-45deg me-2"></i>
                  {copied ? t('copied') : t('copy_link')}
                </Button>
                
                <Button 
                  variant="outline-success" 
                  onClick={handlePrintQR}
                  className="d-flex align-items-center justify-content-center"
                >
                  <i className="bi bi-printer me-2"></i>
                  {t('print')}
                </Button>
              </div>
              
              <Button 
                variant="outline-primary" 
                onClick={handleSaveQRImage}
                disabled={isDownloading}
                className="d-flex align-items-center justify-content-center"
              >
                <i className="bi bi-download me-2"></i>
                {isDownloading ? t('downloading') : t('download_image')}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default StationList; 