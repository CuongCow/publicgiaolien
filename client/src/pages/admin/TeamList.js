import React, { useState, useEffect, useRef } from 'react';
import { Container, Table, Button, Card, Modal, Spinner, Row, Col, Badge, Form, Alert, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AdminNavbar from '../../components/Navbar';
import { teamApi } from '../../services/api';
import { formatDateTime, replaceStationTerm } from '../../utils/helpers';
import TermReplacer from '../../utils/TermReplacer';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Khóa cho localStorage, đặt ở mức global để tránh xung đột
const LOGS_STORAGE_KEY = 'tcl_team_status_logs_v1';

// Hàm tiện ích để lưu vào localStorage
const saveLogsToStorage = (logs) => {
  try {
    // Chuẩn hóa dữ liệu trước khi lưu
    const normalizedLogs = logs.map(log => ({
      ...log,
      timestamp: typeof log.timestamp === 'object' ? log.timestamp.toISOString() : log.timestamp
    }));
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(normalizedLogs));
    console.log('Đã lưu nhật ký vào localStorage, số lượng:', logs.length);
    return true;
  } catch (e) {
    console.error("Không thể lưu nhật ký vào localStorage:", e);
    return false;
  }
};

// Hàm tiện ích để lấy từ localStorage
const getLogsFromStorage = () => {
  try {
    const savedLogs = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!savedLogs) return [];
    
    const parsedLogs = JSON.parse(savedLogs);
    console.log('Đã tải nhật ký từ localStorage:', parsedLogs.length);
    return parsedLogs;
  } catch (e) {
    console.error("Không thể tải nhật ký từ localStorage:", e);
    return [];
  }
};

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    password: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [statusLogs, setStatusLogs] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [exportLoading, setExportLoading] = useState(false);
  
  // Sử dụng useRef để theo dõi trạng thái trước đó của teams
  const prevTeamsRef = useRef({});
  const isFirstRender = useRef(true);
  const manualTeamUpdate = useRef(false);
  const logsInitialized = useRef(false);

  // Load logs from localStorage when component mounts
  useEffect(() => {
    if (!logsInitialized.current) {
      const savedLogs = getLogsFromStorage();
      setStatusLogs(savedLogs);
      logsInitialized.current = true;
    }
  }, []);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    if (logsInitialized.current && statusLogs.length > 0) {
      saveLogsToStorage(statusLogs);
    }
  }, [statusLogs]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchTeams();
      
      // Đảm bảo logs được tải khi component mount
      if (!logsInitialized.current) {
        const savedLogs = getLogsFromStorage();
        setStatusLogs(savedLogs);
        logsInitialized.current = true;
      }
    };
    
    fetchInitialData();

    // Tự động cập nhật trạng thái mỗi 3 giây
    const interval = setInterval(() => {
      if (!manualTeamUpdate.current) {
        fetchTeamsBackground();
      }
    }, 1000);
    
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  // Fetch teams trong nền mà không bật loading state
  const fetchTeamsBackground = async () => {
    try {
      const response = await teamApi.getAll();
      
      // Cập nhật state teams chỉ khi có thay đổi thực sự
      if (JSON.stringify(response.data) !== JSON.stringify(teams)) {
        setTeams(response.data);
      }
    } catch (err) {
      console.error('Error fetching teams in background:', err);
      // Không hiển thị lỗi trong UI để không làm gián đoạn trải nghiệm
    }
  };

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamApi.getAll();
      
      setTeams(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách đội. Vui lòng thử lại sau.');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra thay đổi trạng thái mỗi khi teams được cập nhật
  useEffect(() => {
    // Bỏ qua lần render đầu tiên
    if (isFirstRender.current) {
      isFirstRender.current = false;
      
      // Khởi tạo prevTeamsRef với teams hiện tại
      const teamsMap = {};
      teams.forEach(team => {
        teamsMap[team._id] = {...team};
      });
      prevTeamsRef.current = teamsMap;
      return;
    }
    
    checkStatusChanges();
    
    // Reset cờ cập nhật thủ công
    manualTeamUpdate.current = false;
  }, [teams]);

  // Kiểm tra thay đổi trạng thái
  const checkStatusChanges = () => {
    const prevTeams = prevTeamsRef.current;
    const currentTeamsMap = {};
    let hasChanges = false;
    
    // Tìm thay đổi trạng thái
    for (const team of teams) {
      currentTeamsMap[team._id] = {...team};
      
      const prevTeam = prevTeams[team._id];
      if (prevTeam && prevTeam.status !== team.status) {
        console.log(`Thay đổi trạng thái: ${team.name}, từ ${prevTeam.status || 'không có'} thành ${team.status || 'không có'}`);
        
        // Thêm log
        addStatusLog(
          team._id,
          team.name,
          prevTeam.status,
          team.status
        );
        
        hasChanges = true;
      }
    }
    
    // Cập nhật tham chiếu trạng thái trước đó
    prevTeamsRef.current = currentTeamsMap;
    
    return hasChanges;
  };

  const addStatusLog = (teamId, teamName, oldStatus, newStatus) => {
    // Chỉ thêm log nếu trạng thái thực sự thay đổi và có giá trị
    if (oldStatus !== newStatus && (oldStatus || newStatus)) {
      const newLog = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        teamId,
        teamName,
        oldStatus: oldStatus || 'inactive',
        newStatus: newStatus || 'inactive',
        timestamp: new Date().toISOString() // Lưu trữ dưới dạng ISO string để đảm bảo tính nhất quán
      };
      
      console.log('Thêm log mới:', newLog);
      
      setStatusLogs(prevLogs => {
        const updatedLogs = [newLog, ...prevLogs].slice(0, 100); // Giữ tối đa 100 log
        // Lưu ngay lập tức vào localStorage
        setTimeout(() => saveLogsToStorage(updatedLogs), 0);
        return updatedLogs;
      });
      
      // Hiển thị thông báo tạm thời về thay đổi trạng thái
      setSuccess(`Trạng thái của đội "${teamName}" đã thay đổi từ "${getStatusName(oldStatus)}" thành "${getStatusName(newStatus)}"`);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Thêm log thủ công cho mục đích kiểm tra
  const addManualTestLog = () => {
    const testTeam = teams[0];
    if (testTeam) {
      addStatusLog(
        testTeam._id,
        testTeam.name,
        'inactive',
        'active'
      );
    } else {
      // Nếu không có đội nào, tạo log thử nghiệm với dữ liệu giả
      const fakeLog = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        teamId: 'test-' + Date.now(),
        teamName: 'Đội thử nghiệm',
        oldStatus: 'inactive',
        newStatus: 'active',
        timestamp: new Date().toISOString()
      };
      
      setStatusLogs(prevLogs => {
        const updatedLogs = [fakeLog, ...prevLogs].slice(0, 100);
        // Lưu ngay lập tức vào localStorage
        setTimeout(() => saveLogsToStorage(updatedLogs), 0);
        return updatedLogs;
      });
      
      setSuccess('Đã thêm bản ghi thử nghiệm vào nhật ký');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      manualTeamUpdate.current = true;
      const newTeam = await teamApi.create(formData);
      setTeams(prevTeams => [...prevTeams, newTeam.data]);
      setShowCreateModal(false);
      setFormData({ name: '', password: '' });
      setSuccess('Đã tạo đội thành công');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Không thể tạo đội. Vui lòng thử lại.');
      console.error('Error creating team:', err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      manualTeamUpdate.current = true;
      await teamApi.update(selectedTeam._id, formData);
      const updatedTeams = teams.map(team => 
        team._id === selectedTeam._id ? { ...team, ...formData } : team
      );
      setTeams(updatedTeams);
      setShowEditModal(false);
      setSuccess('Đã cập nhật đội thành công');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Không thể cập nhật đội. Vui lòng thử lại.');
      console.error('Error updating team:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đội này?')) {
      try {
        manualTeamUpdate.current = true;
        await teamApi.delete(id);
        const updatedTeams = teams.filter(team => team._id !== id);
        setTeams(updatedTeams);
        setSuccess('Đã xóa đội thành công');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError('Không thể xóa đội. Vui lòng thử lại.');
        console.error('Error deleting team:', err);
      }
    }
  };

  const showEdit = (team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      password: team.password || ''
    });
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    setFormData({ name: '', password: '' });
    setShowCreateModal(true);
  };
  
  const showTeamDetail = (team) => {
    setSelectedTeam(team);
    setShowDetailModal(true);
  };

  // Nút xóa nhật ký
  const clearLogs = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả nhật ký thay đổi trạng thái?')) {
      setStatusLogs([]);
      localStorage.removeItem(LOGS_STORAGE_KEY);
      setSuccess('Đã xóa tất cả nhật ký thay đổi trạng thái');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Tải lại nhật ký từ localStorage
  const reloadLogsFromStorage = () => {
    const savedLogs = getLogsFromStorage();
    if (savedLogs.length > 0) {
      setStatusLogs(savedLogs);
      setSuccess(`Đã tải ${savedLogs.length} bản ghi nhật ký từ bộ nhớ cục bộ`);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError('Không tìm thấy nhật ký trong bộ nhớ cục bộ');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Lọc danh sách đội theo từ khóa tìm kiếm
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hiển thị trạng thái đội
  const renderStatus = (status) => {
    switch(status) {
      case 'active':
        return <Badge bg="success">Đang hoạt động</Badge>;
      case 'hidden':
        return <Badge bg="warning">Ẩn tab</Badge>;
      case 'copied':
        return <Badge bg="danger">Đã sao chép</Badge>;
      case 'exited':
        return <Badge bg="secondary">Đã thoát</Badge>;
      default:
        return <Badge bg="light" text="dark">Không hoạt động</Badge>;
    }
  };
  
  // Hiển thị tên trạng thái
  const getStatusName = (status) => {
    switch(status) {
      case 'active': return 'Đang hoạt động';
      case 'hidden': return 'Ẩn tab';
      case 'copied': return 'Đã sao chép'; 
      case 'exited': return 'Đã thoát';
      case 'inactive': return 'Không hoạt động';
      default: return 'Không hoạt động';
    }
  };

  // Hàm hiển thị/ẩn mật khẩu
  const togglePasswordVisibility = (teamId, e) => {
    e.stopPropagation();
    setShowPasswords(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  // Hàm sao chép thông tin đội vào clipboard
  const copyTeamInfo = (team, e) => {
    e.stopPropagation();
    
    try {
      // Đảm bảo các giá trị đều hợp lệ
      const teamName = team.name || 'Không có tên';
      const teamPassword = team.password || 'Không có mật khẩu';
      
      // Nội dung được sao chép mới
      const teamInfo = 
`THÔNG TIN ĐĂNG NHẬP ${replaceStationTerm('TRẠM')}
------------------------------------------
Tên đội: ${teamName}
Mật khẩu: ${teamPassword}
------------------------------------------
HƯỚNG DẪN ĐĂNG NHẬP:
1. Quét QR của ban tổ chức cung cấp để vào ${replaceStationTerm('trạm')}
2. Nhập thông tin đăng nhập:
   - Chọn đội: ${teamName}
   - Mật khẩu: ${teamPassword}
3. Nhấn nút "XÁC NHẬN"
4. Giải mật thư và nhập đáp án vào ô trả lời

LƯU Ý:
- Giữ kín Mật khẩu, không chia sẻ cho đội khác
- Chỉ đăng nhập trên một thiết bị tại một thời điểm
- Ban tổ chức có thể giới hạn số lần trả lời sai cho mỗi đội
- Trả lời sai quá số lần sẽ bị khóa tùy vào thời gian của ban tổ chức chọn
- Nếu gặp lỗi, hãy:
  + Kiểm tra kết nối mạng
  + Đảm bảo chọn đúng đội và nhập đúng mật khẩu
  + Liên hệ ban tổ chức để được hỗ trợ`;
      
      // Phương pháp 1: Sử dụng Clipboard API (hiện đại hơn)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(teamInfo)
          .then(() => {
            setSuccess(`Đã sao chép thông tin đăng nhập của đội ${teamName}`);
            setTimeout(() => setSuccess(null), 3000);
          })
          .catch(err => {
            // Nếu phương pháp 1 thất bại, thử phương pháp 2
            copyToClipboardFallback(teamInfo, teamName);
          });
      } else {
        // Sử dụng phương pháp thay thế
        copyToClipboardFallback(teamInfo, teamName);
      }
    } catch (err) {
      setError('Không thể sao chép thông tin. Vui lòng thử lại.');
      console.error('Error copying team info:', err);
    }
  };
  
  // Phương pháp sao chép thay thế sử dụng document.execCommand
  const copyToClipboardFallback = (text, teamName) => {
    try {
      // Tạo phần tử textarea tạm thời
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Đảm bảo textarea không hiển thị
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      // Chọn và sao chép văn bản
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setSuccess(`Đã sao chép thông tin của đội ${teamName} vào clipboard`);
      } else {
        setError('Không thể sao chép. Vui lòng thử lại hoặc sao chép thủ công.');
      }
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    } catch (err) {
      setError('Không thể sao chép thông tin. Vui lòng thử lại.');
      console.error('Error in copy fallback:', err);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Hàm xuất nhật ký thay đổi trạng thái ra Excel
  const exportLogsToExcel = async () => {
    try {
      setExportLoading(true);
      
      // Tạo workbook mới
      const workbook = new ExcelJS.Workbook();
      
      // Tạo worksheet
      const worksheet = workbook.addWorksheet('Nhật ký trạng thái');
      
      // Đặt tiêu đề cho các cột
      worksheet.columns = [
        { header: 'Thời gian', key: 'timestamp', width: 20 },
        { header: 'Tên đội', key: 'teamName', width: 30 },
        { header: 'ID đội', key: 'teamId', width: 25 },
        { header: 'Trạng thái cũ', key: 'oldStatus', width: 15 },
        { header: 'Trạng thái mới', key: 'newStatus', width: 15 },
      ];
      
      // Làm đậm header
      worksheet.getRow(1).font = { bold: true };
      
      // Thêm dữ liệu
      statusLogs.forEach(log => {
        worksheet.addRow({
          timestamp: formatDateTime(log.timestamp),
          teamName: log.teamName,
          teamId: log.teamId,
          oldStatus: getStatusName(log.oldStatus),
          newStatus: getStatusName(log.newStatus) || ''
        });
      });
      
      // Định dạng ô
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Bỏ qua header
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        }
      });
      
      // Xuất file
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `Nhật_ký_trạng_thái_đội_${new Date().toLocaleDateString('vi-VN')}.xlsx`;
      
      saveAs(new Blob([buffer]), fileName);
      
      setSuccess('Xuất Excel thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Không thể xuất file Excel. Vui lòng thử lại sau.');
      console.error('Error exporting logs to Excel:', err);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <Container className="py-4">
        <Row className="mb-4 align-items-center">
          <Col>
            <h1 className="mb-0 d-flex align-items-center">
              <i className="bi bi-people-fill me-3 text-primary" style={{ fontSize: '2rem' }}></i>
              Quản lý đội chơi
            </h1>
            <p className="text-muted mb-0 mt-2">Quản lý tất cả các đội chơi trong hệ thống.</p>
          </Col>
          <Col xs="auto">
            <div className="d-flex gap-2">
              <Button variant="primary" className="d-flex align-items-center" onClick={openCreateModal}>
                <i className="bi bi-plus-circle me-2"></i>
                Tạo đội mới
              </Button>
            </div>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4">
            <i className="bi bi-check-circle me-2"></i>
            {success}
          </Alert>
        )}

        <Card className="shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Form.Group className="mb-0" style={{ width: '300px' }}>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm đội..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </InputGroup>
              </Form.Group>
              <Button variant="outline-primary" onClick={fetchTeamsBackground}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Làm mới
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tải dữ liệu...</p>
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
                <p className="mt-2 text-muted">Chưa có đội nào trong hệ thống</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Tên đội</th>
                      <th>Mật khẩu</th>
                      <th>Trạng thái</th>
                      <th>Hoạt động gần nhất</th>
                      <th>Điểm</th>
                      <th>
                        <TermReplacer>Trạm</TermReplacer>
                      </th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.map((team) => (
                      <tr 
                        key={team._id} 
                        onClick={() => showTeamDetail(team)}
                        style={{ cursor: 'pointer' }}
                        className="team-row"
                      >
                        <td>{team.name}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            {showPasswords[team._id] ? team.password : '••••••'}
                            <span
                              onClick={(e) => togglePasswordVisibility(team._id, e)}
                              style={{ 
                                cursor: 'pointer', 
                                color: '#0d6efd',
                                marginLeft: '10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {showPasswords[team._id] ? (
                                <i className="bi bi-eye-slash-fill" style={{ fontSize: '1.5rem' }}></i>
                              ) : (
                                <i className="bi bi-eye-fill" style={{ fontSize: '1.5rem' }}></i>
                              )}
                            </span>
                          </div>
                        </td>
                        <td>{renderStatus(team.status)}</td>
                        <td>{formatDateTime(team.lastActivity)}</td>
                        <td>{team.totalScore}</td>
                        <td>{team.completedStations?.length || 0}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="d-flex gap-2">
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Sao chép thông tin đội</Tooltip>}
                            >
                              <Button
                                variant="info"
                                size="sm"
                                onClick={(e) => copyTeamInfo(team, e)}
                                title="Sao chép thông tin đội"
                              >
                                <i className="bi bi-clipboard"></i>
                              </Button>
                            </OverlayTrigger>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => showEdit(team)}
                              title="Chỉnh sửa đội"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(team._id)}
                              title="Xóa đội"
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
        
        {/* Nhật ký thay đổi trạng thái */}
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-flex align-items-center">
              <i className="bi bi-journals me-2 text-primary"></i>
              Nhật ký thay đổi trạng thái
              <Badge bg="info" className="ms-2">{statusLogs.length}</Badge>
            </h5>
            <div className="d-flex gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={exportLogsToExcel}
                disabled={exportLoading || statusLogs.length === 0}
                title="Xuất nhật ký ra Excel"
              >
                {exportLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-1" />
                    <span className="d-none d-md-inline">Đang xuất...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-excel me-1"></i>
                    <span className="d-none d-md-inline">Xuất Excel</span>
                  </>
                )}
              </Button>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={reloadLogsFromStorage}
                title="Tải lại nhật ký từ bộ nhớ cục bộ"
              >
                <i className="bi bi-arrow-repeat me-1"></i>
                <span className="d-none d-md-inline">Tải lại</span>
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm" 
                onClick={clearLogs}
                title="Xóa tất cả nhật ký"
              >
                <i className="bi bi-trash me-1"></i>
                <span className="d-none d-md-inline">Xóa</span>
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            {statusLogs.length === 0 ? (
              <p className="text-center text-muted py-3">Chưa có thay đổi trạng thái nào được ghi nhận</p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Tên đội</th>
                      <th>Trạng thái cũ</th>
                      <th>Trạng thái mới</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusLogs.map(log => (
                      <tr key={log.id}>
                        <td>{formatDateTime(log.timestamp)}</td>
                        <td>{log.teamName}</td>
                        <td>
                          <Badge bg={log.oldStatus === 'active' ? 'success' : 
                            log.oldStatus === 'hidden' ? 'warning' : 
                            log.oldStatus === 'copied' ? 'danger' : 
                            log.oldStatus === 'exited' ? 'secondary' : 'light'} 
                            text={log.oldStatus === 'active' || log.oldStatus === 'hidden' || log.oldStatus === 'copied' || log.oldStatus === 'exited' ? 'white' : 'dark'}>
                            {getStatusName(log.oldStatus)}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={log.newStatus === 'active' ? 'success' : 
                            log.newStatus === 'hidden' ? 'warning' : 
                            log.newStatus === 'copied' ? 'danger' : 
                            log.newStatus === 'exited' ? 'secondary' : 'light'} 
                            text={log.newStatus === 'active' || log.newStatus === 'hidden' || log.newStatus === 'copied' || log.newStatus === 'exited' ? 'white' : 'dark'}>
                            {getStatusName(log.newStatus)}
                          </Badge>
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

      {/* Modal tạo đội mới */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tạo đội mới</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên đội</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Nhập tên đội"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Để trống để tạo mật khẩu tự động"
              />
              <Form.Text className="text-muted">
                Mật khẩu sẽ được tạo tự động nếu bạn để trống
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Tạo đội
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa đội */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa đội</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên đội</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Nhập tên đội"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPasswords.editForm ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Nhập mật khẩu"
                />
                <Button 
                  variant="outline-secondary"
                  onClick={() => setShowPasswords(prev => ({...prev, editForm: !prev.editForm}))}
                >
                  <i className={`bi ${showPasswords.editForm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </Button>
              </InputGroup>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Lưu thay đổi
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Modal xem chi tiết đội */}
      <Modal 
        show={showDetailModal} 
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-info-circle me-2 text-primary"></i>
            Chi tiết đội: {selectedTeam?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTeam && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <h5 className="mb-3">Thông tin cơ bản</h5>
                  <Table bordered size="sm">
                    <tbody>
                      <tr>
                        <td style={{width: '40%'}}><strong>ID đội</strong></td>
                        <td>{selectedTeam._id}</td>
                      </tr>
                      <tr>
                        <td><strong>Tên đội</strong></td>
                        <td>{selectedTeam.name}</td>
                      </tr>
                      <tr>
                        <td><strong>Mật khẩu</strong></td>
                        <td>{selectedTeam.password}</td>
                      </tr>
                      <tr>
                        <td><strong>Trạng thái hiện tại</strong></td>
                        <td>{renderStatus(selectedTeam.status)}</td>
                      </tr>
                      <tr>
                        <td><strong>Hoạt động gần nhất</strong></td>
                        <td>{formatDateTime(selectedTeam.lastActivity)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5 className="mb-3">Thông tin trò chơi</h5>
                  <Table bordered size="sm">
                    <tbody>
                      <tr>
                        <td style={{width: '40%'}}><strong>Tổng điểm</strong></td>
                        <td>{selectedTeam.totalScore || 0}</td>
                      </tr>
                      <tr>
                        <td><strong><TermReplacer>Trạm đã hoàn thành</TermReplacer></strong></td>
                        <td>{selectedTeam.completedStations?.length || 0}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
              
              <h5 className="mb-3"><TermReplacer>Lịch sử hoàn thành trạm</TermReplacer></h5>
              <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                <Table bordered size="sm">
                  <thead>
                    <tr className="table-light">
                      <th>Thời gian</th>
                      <th>Trạng thái cũ</th>
                      <th>Trạng thái mới</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusLogs
                      .filter(log => log.teamId === selectedTeam._id)
                      .map(log => (
                        <tr key={log.id}>
                          <td>{formatDateTime(log.timestamp)}</td>
                          <td>
                            <Badge bg={log.oldStatus === 'active' ? 'success' : 
                              log.oldStatus === 'hidden' ? 'warning' : 
                              log.oldStatus === 'copied' ? 'danger' : 
                              log.oldStatus === 'exited' ? 'secondary' : 'light'} 
                              text={log.oldStatus === 'active' || log.oldStatus === 'hidden' || log.oldStatus === 'copied' || log.oldStatus === 'exited' ? 'white' : 'dark'}>
                              {getStatusName(log.oldStatus)}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={log.newStatus === 'active' ? 'success' : 
                              log.newStatus === 'hidden' ? 'warning' : 
                              log.newStatus === 'copied' ? 'danger' : 
                              log.newStatus === 'exited' ? 'secondary' : 'light'} 
                              text={log.newStatus === 'active' || log.newStatus === 'hidden' || log.newStatus === 'copied' || log.newStatus === 'exited' ? 'white' : 'dark'}>
                              {getStatusName(log.newStatus)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    {statusLogs.filter(log => log.teamId === selectedTeam._id).length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center text-muted py-3">Chưa có thay đổi trạng thái nào được ghi nhận</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TeamList; 