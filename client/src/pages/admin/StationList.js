import React, { useState, useEffect, useRef } from 'react';
import { Container, Table, Button, Card, Modal, Spinner, Row, Col, Badge, InputGroup, Form, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
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
      const stationName = selectedStation?.name || <TermReplacer>{t('station_label')}</TermReplacer>;
      const maxAttempts = selectedStation?.maxAttempts || '';
      
      printWindow.document.write(`
        <html>
          <head>
            <title>${t('qr_print_title')} - ${stationName}</title>
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
              <div class="station-name">${stationName}</div>
              <div class="station-info">
                <span>${t('max_attempts')}: ${maxAttempts}</span>
              </div>
              <img class="qr-image" src="${imageDataUrl}" />
            </div>
            <div class="no-print mt-4">
              <button onclick="window.print();" class="btn btn-primary">
                <i class="bi bi-printer"></i> ${t('print_qr')}
              </button>
              <button onclick="window.close();" class="btn btn-secondary">
                <i class="bi bi-x"></i> ${t('close')}
              </button>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
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
      // Tạo canvas từ phần tử DOM chứa mã QR và thông tin
      const canvas = await html2canvas(qrCodeRef.current);
      
      // Chuyển canvas thành blob
      canvas.toBlob((blob) => {
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
          setIsDownloading(false);
        }, 100);
      }, 'image/png', 1.0);
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
          <Col xs="auto">
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
                      <th width="200" className="text-center">{t('actions')}</th>
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
            <TermReplacer>{t('view_qr')}</TermReplacer>: {selectedStation?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="d-flex flex-column align-items-center">
            <div 
              ref={qrCodeRef} 
              className="mb-3 p-3 bg-white rounded shadow-sm"
              style={{ 
                maxWidth: '300px',
                width: '100%',
                aspectRatio: '1/1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {selectedStation && (
                <QRCodeSVG 
                  value={`${window.location.origin}/station/${selectedStation._id}`}
                  size={256}
                  level="H"
                  includeMargin={true}
                  renderAs="svg"
                />
              )}
            </div>
            
            <div className="text-center">
              <h5 className="mb-2">{selectedStation?.name}</h5>
              <p className="text-muted mb-0">
                <small>ID: {selectedStation?._id}</small>
              </p>
              <p className="text-muted mt-2">
                <i className="bi bi-repeat me-1"></i>
                {t('max_attempts_label')}: {selectedStation?.maxAttempts}
              </p>
              <p className="mt-4 text-muted">
                <i className="bi bi-info-circle me-1"></i>
                <TermReplacer>{t('qr_print_instruction')}</TermReplacer>
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="d-flex flex-wrap justify-content-center gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowQRModal(false)}
            className="flex-grow-1 flex-md-grow-0"
          >
            <i className="bi bi-x me-1"></i>
            {t('close')}
          </Button>
          <Button 
            variant="info" 
            onClick={copyLink}
            className="flex-grow-1 flex-md-grow-0"
          >
            <i className="bi bi-link-45deg me-1"></i>
            {copied ? t('copied') : t('copy_link')}
          </Button>
          <Button 
            variant="primary" 
            onClick={handlePrintQR}
            className="flex-grow-1 flex-md-grow-0"
          >
            <i className="bi bi-printer me-1"></i>
            {t('print')}
          </Button>
          <Button 
            variant="success" 
            onClick={handleSaveQRImage} 
            disabled={isDownloading}
            className="flex-grow-1 flex-md-grow-0"
          >
            {isDownloading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                {t('downloading')}
              </>
            ) : (
              <>
                <i className="bi bi-download me-1"></i>
                {t('download_image')}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default StationList; 