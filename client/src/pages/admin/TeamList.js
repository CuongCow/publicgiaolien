import React, { useState, useEffect, useRef } from 'react';
import { Container, Table, Button, Card, Modal, Spinner, Row, Col, Badge, Form, Alert, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AdminNavbar from '../../components/Navbar';
import { teamApi } from '../../services/api';
import { formatDateTime, replaceStationTerm } from '../../utils/helpers';
import TermReplacer from '../../utils/TermReplacer';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import ErrorHandler from '../../components/ErrorHandler';
import LoadingSpinner from '../../components/LoadingSpinner';
import { handleApiError } from '../../utils/helpers';
import { useLanguage } from '../../context/LanguageContext';

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
  const [teamSpecificLogs, setTeamSpecificLogs] = useState([]);
  const [loadingTeamLogs, setLoadingTeamLogs] = useState(false);
  
  // Sử dụng useRef để theo dõi trạng thái trước đó của teams
  const prevTeamsRef = useRef({});
  const isFirstRender = useRef(true);
  const manualTeamUpdate = useRef(false);
  const logsInitialized = useRef(false);

  const { t } = useLanguage();

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
      
      // Kiểm tra dữ liệu đã nhận
      if (response.data && Array.isArray(response.data)) {
        // Kiểm tra xem có cần cập nhật lại teams hay không
        let hasUpdate = false;
        let teamsChanged = false;
        
        // So sánh dữ liệu mới với dữ liệu hiện có
        if (teams.length !== response.data.length) {
          teamsChanged = true;
        } else {
          // Kiểm tra và ghi nhận các thay đổi trạng thái
          for (let i = 0; i < response.data.length; i++) {
            const existingTeam = teams.find(t => t._id === response.data[i]._id);
            if (!existingTeam || existingTeam.status !== response.data[i].status) {
              hasUpdate = true;
              break;
            }
          }
        }
        
        // Cập nhật state teams chỉ khi có thay đổi thực sự
        if (teamsChanged || hasUpdate) {
          setTeams(response.data);
        }
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
      setError(handleApiError(err, 'Không thể tải danh sách đội. Vui lòng thử lại sau.'));
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
      // So sánh với === null để xem xét cả trường hợp undefined và null
      if (prevTeam && (prevTeam.status !== team.status || 
                       (prevTeam.status === null && team.status !== null) ||
                       (prevTeam.status !== null && team.status === null))) {
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
      setSuccess(t('status_change_success').replace('{teamName}', teamName).replace('{oldStatus}', getStatusName(oldStatus)).replace('{newStatus}', getStatusName(newStatus)));
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
      
      setSuccess(t('add_manual_log_success') || 'Đã thêm bản ghi thử nghiệm vào nhật ký');
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
      // Tạo bản sao của formData để không thay đổi state trực tiếp
      const dataToSubmit = { ...formData };
      
      // Đảm bảo password có giá trị, nếu trống thì tạo mật khẩu ngẫu nhiên
      if (!dataToSubmit.password || dataToSubmit.password.trim() === '') {
        // Tạo mật khẩu ngẫu nhiên gồm 6 ký tự
        const randomPassword = Math.random().toString(36).substring(2, 8);
        dataToSubmit.password = randomPassword;
      }
      
      const newTeam = await teamApi.create(dataToSubmit);
      setTeams(prevTeams => [...prevTeams, newTeam.data]);
      setShowCreateModal(false);
      setFormData({ name: '', password: '' });
      setSuccess(t('create_team_success'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(t('create_team_error'));
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
      setSuccess(t('update_team_success'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(t('update_team_error'));
      console.error('Error updating team:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('confirm_delete_team'))) {
      try {
        manualTeamUpdate.current = true;
        await teamApi.delete(id);
        const updatedTeams = teams.filter(team => team._id !== id);
        setTeams(updatedTeams);
        setSuccess(t('delete_team_success'));
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(t('delete_team_error'));
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
    
    // Nếu team đang ở trạng thái copied, kiểm tra xem trạng thái có chính xác không
    if (team.status === 'copied') {
      verifyTeamCopiedStatus(team._id);
    }
    
    // Tải nhật ký thay đổi trạng thái của đội cụ thể
    setLoadingTeamLogs(true);
    
    // Lọc log cho đội được chọn từ danh sách log hiện có
    const filteredLogs = statusLogs.filter(log => log.teamId === team._id);
    setTeamSpecificLogs(filteredLogs);
    setLoadingTeamLogs(false);
  };

  // Nút xóa nhật ký
  const clearLogs = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả nhật ký thay đổi trạng thái?')) {
      setStatusLogs([]);
      localStorage.removeItem(LOGS_STORAGE_KEY);
      setSuccess(t('logs_deleted'));
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Tải lại nhật ký từ localStorage
  const reloadLogsFromStorage = () => {
    const savedLogs = getLogsFromStorage();
    if (savedLogs.length > 0) {
      setStatusLogs(savedLogs);
      setSuccess(t('logs_load_success').replace('{count}', savedLogs.length));
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(t('logs_load_error'));
      setTimeout(() => setError(null), 3000);
    }
  };

  // Lọc danh sách đội theo từ khóa tìm kiếm
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hiển thị trạng thái đội
  const renderStatus = (status) => {
    // Làm rõ logic xử lý với status null/undefined
    const statusValue = status || 'inactive';
    
    switch(statusValue) {
      case 'active':
        return <Badge bg="success">{t('team_status_active')}</Badge>;
      case 'hidden':
        return <Badge bg="warning">{t('team_status_hidden')}</Badge>;
      case 'copied':
        return <Badge bg="danger">{t('team_status_copied')}</Badge>;
      case 'exited':
        return <Badge bg="secondary">{t('team_status_exited')}</Badge>;
      default:
        return <Badge bg="light" text="dark">{t('team_status_inactive')}</Badge>;
    }
  };
  
  // Hiển thị tên trạng thái
  const getStatusName = (status) => {
    switch(status) {
      case 'active': return t('team_status_active');
      case 'hidden': return t('team_status_hidden');
      case 'copied': return t('team_status_copied'); 
      case 'exited': return t('team_status_exited');
      case 'inactive': return t('team_status_inactive');
      default: return t('team_status_inactive');
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

  // Sao chép thông tin đội vào clipboard
  const copyTeamInfo = (team, e) => {
    e.stopPropagation();
    
    // Hiển thị menu với hai tùy chọn
    const targetEl = e.currentTarget;
    
    // Tạo menu popup
    const popupMenu = document.createElement('div');
    popupMenu.className = 'copy-menu-popup';
    popupMenu.style.position = 'absolute';
    popupMenu.style.zIndex = '1000';
    popupMenu.style.backgroundColor = 'white';
    popupMenu.style.border = '1px solid #ddd';
    popupMenu.style.borderRadius = '4px';
    popupMenu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    popupMenu.style.padding = '8px 0';
    popupMenu.style.minWidth = '200px';
    
    // Tùy chọn 1: Tập trung tại trạm
    const option1 = document.createElement('div');
    option1.className = 'copy-menu-item';
    option1.style.padding = '8px 16px';
    option1.style.cursor = 'pointer';
    option1.style.transition = 'background-color 0.2s';
    option1.innerHTML = `<i class="bi bi-people-fill me-2"></i>${t('station_race_copy_option')}`;
    option1.addEventListener('mouseover', () => {
      option1.style.backgroundColor = '#f0f0f0';
    });
    option1.addEventListener('mouseout', () => {
      option1.style.backgroundColor = 'transparent';
    });
    option1.addEventListener('click', () => {
      copyStationCenteredInfo(team);
      // Kiểm tra popupMenu còn tồn tại trong DOM trước khi xóa
      if (document.body.contains(popupMenu)) {
        document.body.removeChild(popupMenu);
      }
    });
    
    // Tùy chọn 2: Chạy đua theo trạm
    const option2 = document.createElement('div');
    option2.className = 'copy-menu-item';
    option2.style.padding = '8px 16px';
    option2.style.cursor = 'pointer';
    option2.style.transition = 'background-color 0.2s';
    option2.innerHTML = `<i class="bi bi-stopwatch-fill me-2"></i>${t('station_centered_copy_option')}`;
    option2.addEventListener('mouseover', () => {
      option2.style.backgroundColor = '#f0f0f0';
    });
    option2.addEventListener('mouseout', () => {
      option2.style.backgroundColor = 'transparent';
    });
    option2.addEventListener('click', () => {
      copyStationRaceInfo(team);
      // Kiểm tra popupMenu còn tồn tại trong DOM trước khi xóa
      if (document.body.contains(popupMenu)) {
        document.body.removeChild(popupMenu);
      }
    });
    
    // Thêm các tùy chọn vào menu
    popupMenu.appendChild(option1);
    popupMenu.appendChild(option2);
    
    // Thêm menu vào body và định vị
    document.body.appendChild(popupMenu);
    const rect = targetEl.getBoundingClientRect();
    popupMenu.style.left = `${rect.left}px`;
    popupMenu.style.top = `${rect.bottom + window.scrollY}px`;
    
    // Xử lý đóng menu khi click ra ngoài
    const handleClickOutside = (event) => {
      if (!popupMenu.contains(event.target) && event.target !== targetEl) {
        try {
          // Kiểm tra nếu popupMenu vẫn còn trong DOM trước khi xóa
          if (document.body.contains(popupMenu)) {
            document.body.removeChild(popupMenu);
          }
        } catch (e) {
          console.error('Error removing popup menu:', e);
        }
      }
    };
    
    // Đợi một tick để tránh sự kiện click hiện tại
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside, { once: true });
    }, 0);
  };
  
  // Tải cài đặt hệ thống từ localStorage
  const loadSystemSettings = () => {
    try {
      const settingsJson = localStorage.getItem('systemSettings');
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
    } catch (e) {
      console.error('Error parsing system settings:', e);
    }
    return {
      termType: 'default',
      customTerm: '',
      customCopyTemplates: {
        stationCentered: '',
        stationRace: ''
      }
    };
  };
  
  // Sao chép thông tin "Tập trung tại trạm"
  const copyStationCenteredInfo = (team) => {
    try {
      // Đảm bảo các giá trị đều hợp lệ
      const teamName = team.name || 'Không có tên';
      const teamPassword = team.password || 'Không có mật khẩu';
      
      // Lấy mẫu từ hệ thống hoặc sử dụng mẫu mặc định
      let templateText = '';
      
      // Tải cài đặt từ localStorage
      const settings = loadSystemSettings();
      templateText = settings.customCopyTemplates?.stationCentered || '';
      
      // Nếu không có mẫu trong cài đặt, sử dụng mẫu mặc định
      if (!templateText) {
        templateText = `THÔNG TIN ĐĂNG NHẬP TRẠM
------------------------------------------
Tên đội: {teamName}
Mật khẩu: {teamPassword}
------------------------------------------
HƯỚNG DẪN ĐĂNG NHẬP:
1. Quét QR của ban tổ chức cung cấp để vào trạm
2. Nhập thông tin đăng nhập:
   - Chọn đội tham gia: {teamName}
   - Mật khẩu: {teamPassword}
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
      }
      
      // Thay thế các placeholder
      const teamInfo = templateText
        .replace(/{teamName}/g, teamName)
        .replace(/{teamPassword}/g, teamPassword);
      
      copyToClipboard(teamInfo, teamName);
    } catch (err) {
      setError(t('copy_error'));
      console.error('Error copying team info:', err);
    }
  };
  
  // Sao chép thông tin "Chạy đua theo trạm"
  const copyStationRaceInfo = (team) => {
    try {
      // Đảm bảo các giá trị đều hợp lệ
      const teamName = team.name || 'Không có tên';
      const teamPassword = team.password || 'Không có mật khẩu';
      
      // Lấy adminId từ localStorage
      let adminId = '';
      try {
        const adminData = localStorage.getItem('admin');
        if (adminData) {
          const admin = JSON.parse(adminData);
          adminId = admin.id || admin._id || '';
        }
      } catch (e) {
        console.error('Error parsing admin data from localStorage:', e);
      }
      
      // Lấy mẫu từ hệ thống hoặc sử dụng mẫu mặc định
      let templateText = '';
      
      // Tải cài đặt từ localStorage
      const settings = loadSystemSettings();
      templateText = settings.customCopyTemplates?.stationRace || '';
      
      // Nếu không có mẫu trong cài đặt, sử dụng mẫu mặc định
      if (!templateText) {
        templateText = `THÔNG TIN ĐĂNG NHẬP TRẠM
------------------------------------------
Tên đội: {teamName}
Mật khẩu: {teamPassword}
------------------------------------------
HƯỚNG DẪN ĐĂNG NHẬP:
1. Truy cập đường dẫn website: {websiteUrl}/station/team/{adminId}
2. Nhập thông tin đăng nhập:
   - Nhập tên đội: {teamName}
   - Mật khẩu: {teamPassword}
3. Nhấn nút "XÁC NHẬN"
4. Chờ tất cả các đội đều đăng nhập vào Ban tổ chức sẽ bắt đầu trạm
5. Giải mật thư và nhập đáp án vào ô trả lời

LƯU Ý:
- Giữ kín Mật khẩu, không chia sẻ cho đội khác
- Chỉ đăng nhập trên một thiết bị tại một thời điểm
- Ban tổ chức có thể giới hạn số lần trả lời sai cho mỗi đội
- Trả lời sai quá số lần sẽ bị khóa tùy vào thời gian của ban tổ chức chọn
- Nếu gặp lỗi, hãy:
  + Kiểm tra kết nối mạng
  + Đảm bảo chọn đúng đội và nhập đúng mật khẩu
  + Liên hệ ban tổ chức để được hỗ trợ`;
      }

      // Xác định đường dẫn website chính xác
      const websiteUrl = window.location.origin;
      
      // Thay thế các placeholder
      const teamInfo = templateText
        .replace(/{teamName}/g, teamName)
        .replace(/{teamPassword}/g, teamPassword)
        .replace(/{adminId}/g, adminId)
        .replace(/{websiteUrl}/g, websiteUrl);
      
      copyToClipboard(teamInfo, teamName);
    } catch (err) {
      setError(t('copy_error'));
      console.error('Error copying team info:', err);
    }
  };
  
  // Hàm chung để sao chép văn bản vào clipboard
  const copyToClipboard = (text, teamName) => {
    // Phương pháp 1: Sử dụng Clipboard API (hiện đại hơn)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setSuccess(t('copy_team_info_success').replace('{teamName}', teamName));
          setTimeout(() => setSuccess(null), 3000);
        })
        .catch(err => {
          // Nếu phương pháp 1 thất bại, thử phương pháp 2
          copyToClipboardFallback(text, teamName);
        });
    } else {
      // Sử dụng phương pháp thay thế
      copyToClipboardFallback(text, teamName);
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
        setSuccess(t('copy_team_info_success').replace('{teamName}', teamName));
      } else {
        setError(t('copy_fallback_error'));
      }
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    } catch (err) {
      setError(t('copy_error'));
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
      const worksheet = workbook.addWorksheet(t('status_history'));
      
      // Đặt tiêu đề cho các cột
      worksheet.columns = [
        { header: t('export_log_time'), key: 'timestamp', width: 20 },
        { header: t('export_log_team_name'), key: 'teamName', width: 30 },
        { header: t('export_log_team_id'), key: 'teamId', width: 25 },
        { header: t('export_log_old_status'), key: 'oldStatus', width: 15 },
        { header: t('export_log_new_status'), key: 'newStatus', width: 15 },
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
      const fileName = `${t('status_log_export_filename')}_${new Date().toLocaleDateString()}.xlsx`;
      
      saveAs(new Blob([buffer]), fileName);
      
      setSuccess(t('logs_export_excel_success') || 'Xuất nhật ký thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Không thể xuất file Excel. Vui lòng thử lại sau.');
      console.error('Error exporting logs to Excel:', err);
    } finally {
      setExportLoading(false);
    }
  };

  // Buộc đăng xuất đội chơi
  const handleForceLogout = async (teamId) => {
    if (window.confirm('Bạn có chắc chắn muốn buộc đăng xuất đội này khỏi thiết bị của họ?')) {
      try {
        manualTeamUpdate.current = true;
        const response = await teamApi.forceLogout(teamId);
        if (response.data.success) {
          // Cập nhật danh sách đội
          const updatedTeams = teams.map(team => 
            team._id === teamId 
              ? { ...team, status: 'inactive', ip: null, device: null, loginTime: null, sessionId: null } 
              : team
          );
          setTeams(updatedTeams);
          
          // Cập nhật đội đang được xem chi tiết
          if (selectedTeam && selectedTeam._id === teamId) {
            setSelectedTeam({
              ...selectedTeam,
              status: 'inactive',
              ip: null,
              device: null, 
              loginTime: null,
              sessionId: null,
              lastActivity: new Date()
            });
          }
          
          setSuccess(t('logout_device_success'));
          setTimeout(() => setSuccess(null), 3000);
        }
      } catch (err) {
        setError(t('logout_device_error'));
        console.error('Error forcing team logout:', err);
      }
    }
  };

  // Thêm hàm kiểm tra đặc biệt cho trạng thái "copied"
  const verifyTeamCopiedStatus = (teamId) => {
    if (!teamId) return;
    
    // Tìm team trong danh sách
    const team = teams.find(t => t._id === teamId);
    if (!team) return;
    
    // Nếu team có trạng thái copied, kiểm tra với server
    if (team.status === 'copied') {
      teamApi.getById(teamId).then(response => {
        if (response.data && response.data.status !== 'copied') {
          console.warn('Phát hiện trạng thái copied không đồng bộ:', 
            'Local:', team.status, 'Server:', response.data.status);
          
          // Cập nhật lại trạng thái local từ server
          setTeams(prevTeams => prevTeams.map(t =>
            t._id === teamId ? {...t, status: response.data.status} : t
          ));
          
          // Thêm log
          addStatusLog(
            teamId,
            team.name,
            'copied',
            response.data.status
          );
        }
      }).catch(err => console.error('Không thể kiểm tra trạng thái của team:', err));
    }
  };

  return (
    <>
      <AdminNavbar />
      <Container className="py-4 pt-3 mt-2">
        <Row className="mb-4 align-items-center">
          <Col>
            <h1 className="mb-0 d-flex align-items-center">
              <i className="bi bi-people-fill me-3 text-primary" style={{ fontSize: '2rem' }}></i>
              {t('team_list_heading')}
            </h1>
            <p className="text-muted mb-0 mt-2">{t('manage_all_teams_note')}</p>
          </Col>
          <Col xs="auto">
            <div className="d-flex gap-2">
              <Button variant="primary" className="d-flex align-items-center" onClick={openCreateModal}>
                <i className="bi bi-plus-circle me-2"></i>
                {t('create_team')}
              </Button>
            </div>
          </Col>
        </Row>

        {error && <ErrorHandler error={error} onClose={() => setError(null)} className="mb-4" />}

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
                    placeholder={t('search_teams_placeholder')}
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </InputGroup>
              </Form.Group>
              <Button variant="outline-primary" onClick={fetchTeamsBackground}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                {t('refresh')}
              </Button>
            </div>

            {loading ? (
              <LoadingSpinner text={t('loading_teams')} />
            ) : filteredTeams.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
                <p className="mt-2 text-muted">{t('no_teams')}</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>{t('table_team_name')}</th>
                      <th>{t('table_password')}</th>
                      <th>{t('table_status')}</th>
                      <th>{t('table_last_activity')}</th>
                      <th>{t('table_score')}</th>
                      <th><TermReplacer>{t('table_completed_stations')}</TermReplacer></th>
                      <th>{t('table_actions')}</th>
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
                              <Button
                                variant="info"
                                size="sm"
                                onClick={(e) => copyTeamInfo(team, e)}
                                title={t('copy_team_info_tooltip')}
                              >
                                <i className="bi bi-clipboard"></i>
                              </Button>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => showEdit(team)}
                              title={t('edit_team')}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(team._id)}
                              title={t('delete_team')}
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
              {t('status_history')}
              <Badge bg="info" className="ms-2">{statusLogs.length}</Badge>
            </h5>
            <div className="d-flex gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={exportLogsToExcel}
                disabled={exportLoading || statusLogs.length === 0}
                title={t('export_logs')}
              >
                {exportLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-1" />
                    {t('logs_exporting')}
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-excel me-1"></i>
                    {t('logs_export_excel')}
                  </>
                )}
              </Button>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={reloadLogsFromStorage}
                title={t('reload_logs_from_storage')}
              >
                <i className="bi bi-arrow-repeat me-1"></i>
                <span className="d-none d-md-inline">{t('reload')}</span>
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm" 
                onClick={clearLogs}
                title={t('delete_all_logs')}
              >
                <i className="bi bi-trash me-1"></i>
                <span className="d-none d-md-inline">{t('delete')}</span>
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            {statusLogs.length === 0 ? (
              <p className="text-center text-muted py-3">{t('no_status_changes_recorded')}</p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>{t('time')}</th>
                      <th>{t('team_name')}</th>
                      <th>{t('old_status')}</th>
                      <th>{t('new_status')}</th>
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
          <Modal.Title>{t('create_team')}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>{t('team_name')}</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t('enter_team_name')}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('password')}</Form.Label>
              <Form.Control
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('leave_empty_for_auto_password')}
              />
              <Form.Text className="text-muted">
                {t('password_auto_generated')}
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('create_team_button')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa đội */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('edit_team_title')}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>{t('team_name')}</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t('enter_team_name')}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('password_label')}</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPasswords.editForm ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder={t('enter_password')}
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
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('save_changes')}
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
            {t('team_detail')}: {selectedTeam?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTeam && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <h5 className="mb-3">{t('basic_info')}</h5>
                  <Table bordered size="sm">
                    <tbody>
                      <tr>
                        <td style={{width: '40%'}}><strong>{t('team_id')}</strong></td>
                        <td>{selectedTeam._id}</td>
                      </tr>
                      <tr>
                        <td><strong>{t('team_name')}</strong></td>
                        <td>{selectedTeam.name}</td>
                      </tr>
                      <tr>
                        <td><strong>{t('password_label')}</strong></td>
                        <td>{selectedTeam.password}</td>
                      </tr>
                      <tr>
                        <td><strong>{t('current_status')}</strong></td>
                        <td>{renderStatus(selectedTeam.status)}</td>
                      </tr>
                      <tr>
                        <td><strong>{t('last_activity')}</strong></td>
                        <td>{formatDateTime(selectedTeam.lastActivity)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5 className="mb-3">{t('device_session_info')}</h5>
                  <Table bordered size="sm">
                    <tbody>
                      <tr>
                        <td style={{width: '40%'}}><strong>{t('device_info')}</strong></td>
                        <td>
                          {selectedTeam.device ? (
                            <>
                              {selectedTeam.device.browser} / {selectedTeam.device.os}
                              <div className="text-muted small">{selectedTeam.device.userAgent}</div>
                            </>
                          ) : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>IP</strong></td>
                        <td>{selectedTeam.ip || '-'}</td>
                      </tr>
                      <tr>
                        <td><strong>{t('login_session')}</strong></td>
                        <td>
                          {selectedTeam.loginTime ? formatDateTime(selectedTeam.loginTime) : '-'}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
          {selectedTeam && selectedTeam.status === 'active' && (
            <Button 
              variant="danger" 
              onClick={() => {
                handleForceLogout(selectedTeam._id);
                setShowDetailModal(false);
              }}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              {t('logout')}
            </Button>
          )}
                </Col>
              </Row>
              
              <Row className="mb-4">
                <Col md={12}>
                  <h5 className="mb-3">{t('game_info')}</h5>
                  <Table bordered size="sm">
                    <tbody>
                      <tr>
                        <td style={{width: '30%'}}><strong>{t('total_score')}</strong></td>
                        <td>{selectedTeam.totalScore || 0}</td>
                      </tr>
                      <tr>
                        <td><strong><TermReplacer>{t('completed_stations')}</TermReplacer></strong></td>
                        <td>{selectedTeam.completedStations?.length || 0}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>

              <div className="mt-4 mb-2">
                <h5>{t('status_history')}</h5>
                {loadingTeamLogs ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2">{t('loading')}</span>
                  </div>
                ) : teamSpecificLogs.length === 0 ? (
                  <p className="text-center text-muted">{t('no_status_changes_recorded')}</p>
                ) : (
                  <Table bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>{t('time')}</th>
                        <th>{t('old_status')}</th>
                        <th>{t('new_status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamSpecificLogs.map(log => (
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
                    </tbody>
                  </Table>
                )}
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