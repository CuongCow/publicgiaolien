import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Spinner, Row, Col, Table, Badge } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import { stationApi } from '../../services/api';
import { replaceStationTerm } from '../../utils/helpers';
import TermReplacer from '../../utils/TermReplacer';
import AdminNavbar from '../../components/Navbar';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import { useConfig } from '../../context/ConfigContext';
import '../user/UserStation.css';

const AdminStationView = () => {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const { getAdminSettings } = useSystemSettings();
  const { t } = useLanguage();
  const { baseUrl } = useConfig();

  const [stations, setStations] = useState([]);
  const [activeStation, setActiveStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInTeams, setLoggedInTeams] = useState([]);

  // Effect to fetch stations for this admin
  useEffect(() => {
    fetchStations();
    
    // Restore logged in teams list
    const savedTeamsList = localStorage.getItem('admin_logged_in_teams');
    if (savedTeamsList) {
      try {
        const teamsData = JSON.parse(savedTeamsList);
        setLoggedInTeams(teamsData);
      } catch (err) {
        console.error('Error parsing saved teams list:', err);
      }
    }
  }, [adminId]);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await stationApi.getAll();
      
      // Filter stations for this admin if adminId is provided
      let filteredStations = response.data;
      if (adminId) {
        filteredStations = response.data.filter(station => station.adminId === adminId);
      }
      
      setStations(filteredStations);
      
      // Check if there's an active station in localStorage
      const activeStationId = localStorage.getItem('admin_active_station');
      if (activeStationId) {
        const activeStation = filteredStations.find(s => s._id === activeStationId);
        if (activeStation) {
          setActiveStation(activeStation);
        }
      }
      
      setError(null);
    } catch (err) {
      setError(`Không thể tải thông tin ${replaceStationTerm('trạm')}. Vui lòng thử lại sau.`);
      console.error('Error fetching stations:', err);
    } finally {
      setLoading(false);
    }
  };

  const startStation = (station) => {
    setActiveStation(station);
    
    // Lưu thông tin trạm đang hoạt động vào localStorage
    localStorage.setItem('admin_active_station', station._id);
    
    // Cập nhật trạng thái kích hoạt trong database
    stationApi.setStationActive(station._id)
      .then(response => {
        console.log('Trạm đã được kích hoạt:', response.data);
      })
      .catch(err => {
        console.error('Lỗi khi kích hoạt trạm:', err);
      });
    
    // Thêm thông tin trạm để trang TeamWaitingPage có thể sử dụng
    try {
      // Chỉ lưu những thông tin cần thiết để tối ưu dung lượng localStorage
      const essentialStationData = {
        _id: station._id,
        name: station.name,
        content: station.content,
        contentType: station.contentType,
        image: station.image,
        maxAttempts: station.maxAttempts,
        gameNote: station.gameNote,
        correctAnswer: station.correctAnswer,
        fontSize: station.fontSize,
        fontWeight: station.fontWeight,
        lineHeight: station.lineHeight,
        showText: station.showText,
        showImage: station.showImage
      };
      
      localStorage.setItem('admin_active_station_data', JSON.stringify(essentialStationData));
    } catch (err) {
      console.error('Lỗi khi lưu thông tin trạm vào localStorage:', err);
    }
  };

  const stopStation = () => {
    // Xác định trạm đã dừng
    const stationToDeactivate = activeStation?._id;
    
    // Cập nhật UI trước
    setActiveStation(null);
    localStorage.removeItem('admin_active_station');
    localStorage.removeItem('admin_active_station_data');
    
    // Sau đó cập nhật database
    if (stationToDeactivate) {
      stationApi.setStationInactive(stationToDeactivate)
        .then(response => {
          console.log('Trạm đã bị vô hiệu hóa:', response.data);
        })
        .catch(err => {
          console.error('Lỗi khi vô hiệu hóa trạm:', err);
        });
    }
  };

  const openTeamWaitingPage = () => {
    // Mở trang chờ của đội trong tab mới
    window.open(`/station/team/${adminId}`, '_blank');
  };

  // Render admin control panel
  const renderAdminPanel = () => (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-dark text-white py-3">
        <h4 className="mb-0">Bảng điều khiển quản trị viên</h4>
      </Card.Header>
      <Card.Body className="p-4">
        <h5 className="mb-3">Các trạm có sẵn</h5>
        
        <Table hover bordered striped responsive className="align-middle mb-4">
          <thead className="bg-light">
            <tr>
              <th width="50" className="text-center">#</th>
              <th>Tên trạm</th>
              <th>Loại nội dung</th>
              <th>Số lần thử</th>
              <th width="150">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((station, index) => (
              <tr key={station._id} className={activeStation?._id === station._id ? 'table-success' : ''}>
                <td className="text-center">{index + 1}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-geo-alt me-2 text-primary"></i>
                    <div>
                      <strong>{station.name}</strong>
                      {station.gameNote && <div><small className="text-muted">{station.gameNote}</small></div>}
                    </div>
                  </div>
                </td>
                <td>
                  {station.contentType === 'text' && <Badge bg="info">Văn bản</Badge>}
                  {station.contentType === 'image' && <Badge bg="success">Hình ảnh</Badge>}
                  {station.contentType === 'both' && (
                    <>
                      <Badge bg="info" className="me-1">Văn bản</Badge>
                      <Badge bg="success">Hình ảnh</Badge>
                    </>
                  )}
                </td>
                <td>{station.maxAttempts} lần</td>
                <td>
                  {activeStation?._id === station._id ? (
                    <Button variant="danger" size="sm" onClick={stopStation}>
                      <i className="bi bi-stop-fill me-1"></i>
                      Dừng
                    </Button>
                  ) : (
                    <Button 
                      variant="success" 
                      size="sm" 
                      onClick={() => startStation(station)}
                      disabled={activeStation !== null}
                    >
                      <i className="bi bi-play-fill me-1"></i>
                      Bắt đầu
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {stations.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-3">
                  Không có trạm nào được tìm thấy.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        
        <h5 className="mb-3">Đội đã đăng nhập ({loggedInTeams.length})</h5>
        
        <Table hover bordered responsive className="align-middle">
          <thead className="bg-light">
            <tr>
              <th width="50" className="text-center">#</th>
              <th>Tên đội</th>
              <th width="100">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loggedInTeams.map((team, index) => (
              <tr key={team.teamId}>
                <td className="text-center">{index + 1}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-people me-2 text-primary"></i>
                    <strong>{team.teamName}</strong>
                  </div>
                </td>
                <td>
                  <Badge bg="secondary">Đã đăng nhập</Badge>
                </td>
              </tr>
            ))}
            {loggedInTeams.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-3">
                  Chưa có đội nào đăng nhập.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <Container className="py-4">
          <div className="text-center spinner-container">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3"><TermReplacer>{t('loading_station_info')}</TermReplacer></p>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <Container className="py-4 animate__animated animate__fadeIn">
        <Row className="mb-4 align-items-center">
          <Col>
            <h1 className="mb-0 d-flex align-items-center">
              <i className="bi bi-geo-alt-fill me-3 text-primary" style={{ fontSize: '2rem' }}></i>
              <TermReplacer>Quản lý trạm trực tiếp</TermReplacer>
            </h1>
            <p className="text-muted mb-0 mt-2">
              Khởi động trạm và cho phép đội tham gia mà không cần quét mã QR
            </p>
          </Col>
          <Col xs="auto">
            <Button variant="outline-primary" onClick={openTeamWaitingPage}>
              <i className="bi bi-box-arrow-up-right me-2"></i>
              Mở trang chờ của đội
            </Button>
          </Col>
        </Row>

        {error && !stations && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Admin control panel */}
        {renderAdminPanel()}
        
        {/* QR Code cho trang chờ của đội */}
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-info text-white py-3">
            <h4 className="mb-0">QR Code trang chờ đội</h4>
          </Card.Header>
          <Card.Body className="p-4 text-center">
            <Row>
              <Col md={6} className="mb-4 mb-md-0 d-flex flex-column justify-content-center">
                <h5 className="mb-3">Hướng dẫn</h5>
                <p className="mb-3">
                  Chia sẻ QR code này hoặc link cho các đội để họ có thể đăng nhập và chờ bạn bắt đầu trạm.
                </p>
                <div className="d-flex flex-column align-items-center">
                  <div className="input-group mb-3">
                    <input 
                      type="text" 
                      className="form-control" 
                      value={`${baseUrl}/station/team/${adminId}`} 
                      readOnly
                    />
                    <Button 
                      variant="outline-primary" 
                      onClick={() => {
                        navigator.clipboard.writeText(`${baseUrl}/station/team/${adminId}`);
                        alert('Đã sao chép liên kết vào clipboard!');
                      }}
                    >
                      <i className="bi bi-clipboard"></i> Sao chép
                    </Button>
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={openTeamWaitingPage}
                    className="mt-2"
                  >
                    <i className="bi bi-box-arrow-up-right me-2"></i>
                    Mở trang chờ
                  </Button>
                </div>
              </Col>
              <Col md={6} className="text-center">
                <div className="bg-white rounded p-4 d-inline-block shadow-sm">
                  <QRCodeSVG 
                    value={`${baseUrl}/station/team/${adminId}`}
                    size={200}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: "/logo192.png",
                      height: 40,
                      width: 40,
                      excavate: true
                    }}
                  />
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default AdminStationView; 