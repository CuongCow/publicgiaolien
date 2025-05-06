import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Image, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { stationApi, teamApi, submissionApi } from '../../services/api';
import { replaceStationTerm } from '../../utils/helpers';
import TermReplacer from '../../utils/TermReplacer';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import './UserStation.css';

const TeamWaitingPage = () => {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const { getAdminSettings } = useSystemSettings();
  const { t } = useLanguage();

  const [activeStation, setActiveStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [answer, setAnswer] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);
  const [loggedInTeam, setLoggedInTeam] = useState(null);
  const [statusCheckerInterval, setStatusCheckerInterval] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [nextAttemptTime, setNextAttemptTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // Hiệu ứng khởi tạo
  useEffect(() => {
    // Khôi phục thông tin đội đã đăng nhập từ localStorage
    const savedTeamData = localStorage.getItem('team_waiting_' + adminId);
    if (savedTeamData) {
      try {
        const teamData = JSON.parse(savedTeamData);
        setLoggedInTeam(teamData);
      } catch (err) {
        console.error('Lỗi khi phân tích dữ liệu đội đã lưu:', err);
      }
    }
    
    // Khôi phục thông tin trạm đang hoạt động nếu có
    checkActiveStation();
    
    // Thiết lập bộ kiểm tra trạng thái để cập nhật thông tin trạm
    const interval = setInterval(() => {
      checkActiveStation();
    }, 5000); // Kiểm tra mỗi 5 giây thay vì 15 giây
    
    setStatusCheckerInterval(interval);
    
    // Xóa interval khi component bị hủy
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [adminId]);

  // Kiểm tra xem có trạm nào đang hoạt động không
  const checkActiveStation = async () => {
    if (isCheckingStatus) return; // Tránh gọi nhiều lần cùng lúc
    
    try {
      setIsCheckingStatus(true);
      
      // Kiểm tra trạm đang hoạt động từ localStorage đầu tiên (để hiển thị nhanh)
      const activeStationId = localStorage.getItem('admin_active_station');

      // Ưu tiên gọi API để kiểm tra trạng thái thực tế từ server
      try {
        // Cố gắng gọi API để lấy trạm hoạt động của admin này
        const response = await stationApi.getActiveStationByAdmin(adminId);
        if (response && response.data) {
          setActiveStation(response.data);
          setError(null);
          
          // Cập nhật localStorage để đồng bộ với server
          localStorage.setItem('admin_active_station', response.data._id);
          localStorage.setItem('admin_active_station_data', JSON.stringify(response.data));
          return;
        } else if (response && response.data === null) {
          // Server trả về null, tức là không có trạm nào đang hoạt động
          setActiveStation(null);
          localStorage.removeItem('admin_active_station');
          localStorage.removeItem('admin_active_station_data');
          return;
        }
      } catch (apiErr) {
        console.warn('Không thể kết nối đến API, chuyển sang sử dụng dữ liệu localStorage:', apiErr);
        // Nếu API lỗi, sử dụng dữ liệu từ localStorage
      }
      
      // Nếu API không thành công, dùng dữ liệu từ localStorage
      if (activeStationId) {
        const savedStationData = localStorage.getItem('admin_active_station_data');
        
        if (savedStationData) {
          try {
            const stationData = JSON.parse(savedStationData);
            setActiveStation(stationData);
            setError(null);
          } catch (parseErr) {
            console.error('Lỗi khi phân tích dữ liệu trạm đã lưu:', parseErr);
            setActiveStation(null);
          }
        } else {
          // Không có dữ liệu chi tiết về trạm trong localStorage
          try {
            // Thử gọi API lấy thông tin chi tiết của trạm
            const response = await stationApi.getById(activeStationId);
            if (response && response.data) {
              setActiveStation(response.data);
              // Lưu lại để lần sau dùng
              localStorage.setItem('admin_active_station_data', JSON.stringify(response.data));
              setError(null);
            } else {
              setActiveStation(null);
              localStorage.removeItem('admin_active_station');
            }
          } catch (apiErr) {
            console.error('Lỗi khi lấy thông tin trạm từ API:', apiErr);
            setActiveStation(null);
          }
        }
      } else {
        // Không có trạm nào đang hoạt động
        setActiveStation(null);
      }
    } catch (err) {
      console.error('Lỗi khi kiểm tra trạm hoạt động:', err);
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsCheckingStatus(false);
      setLoading(false);
    }
  };

  // Xử lý đăng nhập đội
  const handleTeamLogin = async (e) => {
    e.preventDefault();
    
    if (!teamName || !password) {
      setError('Vui lòng nhập tên đội và mật khẩu');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await teamApi.verifyPassword({
        teamName,
        password
      });
      
      if (response.data.success) {
        const teamData = {
          teamName,
          teamId: response.data.teamId,
          sessionId: response.data.sessionId
        };
        
        // Lưu thông tin đội vào localStorage
        localStorage.setItem('team_waiting_' + adminId, JSON.stringify(teamData));
        
        // Đăng ký đội này với trạm chờ của admin
        try {
          // Thông báo cho admin rằng đội này đã đăng nhập
          const existingTeams = localStorage.getItem('admin_logged_in_teams');
          let teamsArray = [];
          
          if (existingTeams) {
            try {
              teamsArray = JSON.parse(existingTeams);
              if (!Array.isArray(teamsArray)) teamsArray = [];
            } catch (err) {
              teamsArray = [];
            }
          }
          
          // Kiểm tra xem đội này đã có trong danh sách chưa
          const existingTeamIndex = teamsArray.findIndex(team => team.teamId === teamData.teamId);
          if (existingTeamIndex === -1) {
            // Thêm đội mới vào danh sách
            teamsArray.push(teamData);
          } else {
            // Cập nhật thông tin đội đã tồn tại
            teamsArray[existingTeamIndex] = teamData;
          }
          
          // Lưu danh sách đội đã cập nhật
          localStorage.setItem('admin_logged_in_teams', JSON.stringify(teamsArray));
        } catch (err) {
          console.error('Lỗi khi đăng ký đội với trang chờ admin:', err);
        }
        
        // Cập nhật trạng thái
        setLoggedInTeam(teamData);
        
        // Reset form
        setTeamName('');
        setPassword('');
        setError(null);
        
        // Kiểm tra ngay trạng thái trạm
        checkActiveStation();
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    // Xóa thông tin đội khỏi localStorage
    localStorage.removeItem('team_waiting_' + adminId);
    
    // Xóa đội khỏi danh sách đội đã đăng nhập
    try {
      const existingTeams = localStorage.getItem('admin_logged_in_teams');
      if (existingTeams) {
        try {
          let teamsArray = JSON.parse(existingTeams);
          if (Array.isArray(teamsArray) && loggedInTeam) {
            // Lọc bỏ đội hiện tại
            teamsArray = teamsArray.filter(team => team.teamId !== loggedInTeam.teamId);
            localStorage.setItem('admin_logged_in_teams', JSON.stringify(teamsArray));
          }
        } catch (err) {
          console.error('Lỗi khi cập nhật danh sách đội đã đăng nhập:', err);
        }
      }
    } catch (err) {
      console.error('Lỗi khi hủy đăng ký đội với trang chờ admin:', err);
    }
    
    // Reset trạng thái
    setLoggedInTeam(null);
  };

  // Hàm lấy nội dung mật thư dựa trên đội được chọn
  const getTeamSpecificContent = () => {
    if (!activeStation) return null;
    
    // Nếu là mật thư riêng và đã đăng nhập với tên đội
    if (activeStation.messageType === 'individual' && loggedInTeam?.teamName) {
      const teamContent = activeStation.teamSpecificContents?.find(content => 
        content.team === loggedInTeam.teamName
      );
      
      if (teamContent) {
        console.log('Đã tìm thấy nội dung riêng cho đội:', loggedInTeam.teamName, teamContent);
        
        // Đảm bảo correctAnswer luôn là mảng
        let correctAnswerArray = [];
        if (teamContent.correctAnswer) {
          if (Array.isArray(teamContent.correctAnswer)) {
            correctAnswerArray = [...teamContent.correctAnswer];
          } else {
            correctAnswerArray = [teamContent.correctAnswer];
          }
        }
        
        return {
          content: teamContent.content,
          contentType: teamContent.contentType,
          showText: teamContent.showText !== undefined ? teamContent.showText : true,
          showImage: teamContent.showImage !== undefined ? teamContent.showImage : false,
          showOTT: teamContent.showOTT !== undefined ? teamContent.showOTT : true,
          showNW: teamContent.showNW !== undefined ? teamContent.showNW : true,
          ottContent: teamContent.ottContent || '',
          nwContent: teamContent.nwContent || '',
          fontSize: teamContent.fontSize || activeStation.fontSize || '1.05rem',
          fontWeight: teamContent.fontWeight || activeStation.fontWeight || '500',
          lineHeight: teamContent.lineHeight || activeStation.lineHeight || '1.5',
          paragraphSpacing: teamContent.paragraphSpacing || activeStation.paragraphSpacing || '0.8rem',
          correctAnswer: correctAnswerArray,
          // Chuyển đổi content thành image nếu cần thiết
          image: teamContent.content,
        };
      } else {
        console.log('Không tìm thấy nội dung riêng cho đội:', loggedInTeam.teamName);
      }
    }
    
    // Sử dụng nội dung mặc định của trạm nếu không có nội dung riêng hoặc không phải mật thư riêng
    return {
      content: activeStation.content,
      contentType: activeStation.contentType,
      showText: activeStation.showText !== undefined ? activeStation.showText : true,
      showImage: activeStation.showImage !== undefined ? activeStation.showImage : false,
      showOTT: activeStation.showOTT !== undefined ? activeStation.showOTT : true,
      showNW: activeStation.showNW !== undefined ? activeStation.showNW : true,
      ottContent: activeStation.ottContent || '',
      nwContent: activeStation.nwContent || '',
      fontSize: activeStation.fontSize || '1.05rem',
      fontWeight: activeStation.fontWeight || '500',
      lineHeight: activeStation.lineHeight || '1.5',
      paragraphSpacing: activeStation.paragraphSpacing || '0.8rem',
      correctAnswer: activeStation.correctAnswer || [],
      image: activeStation.content // Chuyển đổi content thành image
    };
  };

  // Xử lý thay đổi đáp án
  const handleAnswerChange = (e) => {
    setAnswer(e.target.value);
  };

  // Xử lý gửi đáp án
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!answer.trim() || !activeStation || !loggedInTeam) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Lấy nội dung dành riêng cho đội (nếu có)
      const teamSpecificContent = getTeamSpecificContent();
      
      // Lấy đáp án từ trạm đang hoạt động hoặc nội dung riêng cho đội
      const correctAnswers = teamSpecificContent 
        ? (Array.isArray(teamSpecificContent.correctAnswer) 
            ? teamSpecificContent.correctAnswer 
            : [teamSpecificContent.correctAnswer].filter(Boolean))
        : (Array.isArray(activeStation.correctAnswer)
            ? activeStation.correctAnswer
            : [activeStation.correctAnswer].filter(Boolean));
      
      // Chuẩn hóa đáp án
      const normalizedAnswer = answer.trim().toLowerCase().replace(/\s+/g, ' ');
      const normalizedCorrectAnswers = correctAnswers.map(ans => 
        ans?.trim().toLowerCase().replace(/\s+/g, ' ')
      ).filter(Boolean);
      
      const isCorrect = normalizedCorrectAnswers.includes(normalizedAnswer);
      
      // Gửi đáp án
      const response = await submissionApi.create({
        stationId: activeStation._id,
        teamName: loggedInTeam.teamName,
        answer: normalizedAnswer
      });
      
      // Đặt kết quả
      if (response.data.isCorrect) {
        setSubmissionResult({
          isCorrect: true,
          submission: response.data
        });
        
        // Reset trường đáp án
        setAnswer('');
      } else {
        const remainingAttempts = response.data.remainingAttempts;
        const attemptCount = response.data.attemptCount;
        
        // Đặt kết quả submission
        setSubmissionResult({
          isCorrect: false,
          remainingAttempts,
          attemptCount
        });
        
        // Nếu còn 0 lần thử, đặt thời gian chờ
        if (remainingAttempts <= 0 && activeStation.lockTime > 0) {
          if (response.data.nextAttemptAllowed) {
            setNextAttemptTime(response.data.nextAttemptAllowed);
          } else {
            // Tạo một thời gian chờ mới nếu chưa có
            const lockTimeMillis = activeStation.lockTime * 60 * 1000;
            const newNextAttemptTime = new Date(Date.now() + lockTimeMillis).toISOString();
            setNextAttemptTime(newNextAttemptTime);
          }
        }
      }
    } catch (err) {
      console.error('Lỗi khi gửi đáp án:', err);
      setError('Có lỗi xảy ra khi kiểm tra đáp án. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Cập nhật bộ đếm ngược
  useEffect(() => {
    if (!nextAttemptTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      const target = new Date(nextAttemptTime);
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      
      if (diff <= 0) {
        setNextAttemptTime(null);
        setTimeLeft(null);
        clearInterval(timer);
        
        // Khi thời gian khóa kết thúc, reset số lần thử về ban đầu
        if (activeStation) {
          // Cập nhật số lần thử mới
          const newSubmissionResult = {
            isCorrect: false,
            remainingAttempts: activeStation.maxAttempts,
            attemptCount: 0
          };
          
          setSubmissionResult(newSubmissionResult);
        }
      } else {
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextAttemptTime, activeStation]);

  // Render trang chờ
  const renderWaitingPage = () => {
    // Lấy nội dung dành riêng cho đội (nếu có)
    const teamSpecificContent = getTeamSpecificContent();
    
    return (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-primary text-white py-3">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="mb-0">Chờ {replaceStationTerm('trạm')} bắt đầu</h4>
            <p className="mb-0 mt-1 opacity-75">Đội: {loggedInTeam.teamName}</p>
          </div>
          <Button variant="light" size="sm" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1"></i>
            Đăng xuất
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="p-4 text-center">
        {activeStation ? (
          <div className="animate__animated animate__fadeIn">
            <div className="mb-4">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
              <h3 className="mt-3 mb-2"><TermReplacer>{t('station_term')}</TermReplacer> đã bắt đầu!</h3>
              <p className="text-muted">Bạn đang tham gia <TermReplacer>{t('station_term')}</TermReplacer> <strong>{activeStation.name}</strong></p>
            </div>
            
            <hr className="my-4" />
            
            {/* Hiển thị nội dung trạm */}
            <div className="station-content-wrapper mb-4 text-start">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-file-text me-2 text-primary"></i>
                Mật thư:
              </h5>
              
              {/* Hiển thị nội dung văn bản */}
              {teamSpecificContent && (teamSpecificContent.showText || teamSpecificContent.contentType === 'text' || teamSpecificContent.contentType === 'both') && (
                <Card className="station-content mb-3 mx-0">
                  <Card.Body className="p-0">
                    <div className="content-text w-100 px-1">
                      {teamSpecificContent.ottContent && teamSpecificContent.showOTT && (
                        <div className="mb-2">
                          <h6 className="fw-bold d-inline-block bg-primary text-white px-3 py-1 rounded-0 mb-0 ms-0 mt-1">OTT:</h6>
                          <div className="content-text w-100 px-1">
                            <p className="content-line paragraph-spacing-medium"
                              style={{ 
                                fontSize: teamSpecificContent.fontSize || '1.05rem',
                                fontWeight: teamSpecificContent.fontWeight || '500',
                                lineHeight: teamSpecificContent.lineHeight || '1.5'
                              }}>
                              {teamSpecificContent.ottContent}
                            </p>
                          </div>
                        </div>
                      )}
                      {teamSpecificContent.nwContent && teamSpecificContent.showNW && (
                        <div>
                          <h6 className="fw-bold d-inline-block bg-primary text-white px-3 py-1 rounded-0 mb-0 ms-0">NW:</h6>
                          <div className="content-text w-100 px-1">
                            {teamSpecificContent.nwContent.split('\n').map((line, idx) => (
                              <p 
                                key={idx} 
                                className="content-line paragraph-spacing-medium"
                                style={{ 
                                  fontSize: teamSpecificContent.fontSize || '1.05rem',
                                  fontWeight: teamSpecificContent.fontWeight || '500',
                                  lineHeight: teamSpecificContent.lineHeight || '1.5'
                                }}
                              >
                                {line || ' '}
                                {idx === teamSpecificContent.nwContent.split('\n').length - 1 && <span className="fw-bold">/AR</span>}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      {!teamSpecificContent.ottContent && !teamSpecificContent.nwContent && teamSpecificContent.content && teamSpecificContent.content.split('\n').map((line, idx) => (
                        <p 
                          key={idx} 
                          className="content-line paragraph-spacing-medium"
                          style={{ 
                            fontSize: teamSpecificContent.fontSize || '1.05rem',
                            fontWeight: teamSpecificContent.fontWeight || '500',
                            lineHeight: teamSpecificContent.lineHeight || '1.5'
                          }}
                        >
                          {line || ' '}
                        </p>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              )}
              
              {/* Hiển thị hình ảnh nếu cần */}
              {teamSpecificContent && (teamSpecificContent.showImage || teamSpecificContent.contentType === 'image' || teamSpecificContent.contentType === 'both') && teamSpecificContent.image && (
                <div className="text-center mb-3">
                  <img 
                    src={teamSpecificContent.image ? (
                      // Trường hợp 1: Đường dẫn đầy đủ bắt đầu bằng http hoặc https
                      teamSpecificContent.image.startsWith('http') ? 
                        teamSpecificContent.image : 
                      // Trường hợp 2: Đường dẫn API
                      teamSpecificContent.image.startsWith('/api/') ?
                        process.env.NODE_ENV === 'production' ?
                          `https://giaolien-git-master-cuongcows-projects.vercel.app${teamSpecificContent.image}` :
                          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${teamSpecificContent.image}` :
                      // Trường hợp 3: Các đường dẫn khác
                      teamSpecificContent.image
                    ) : ''}
                    alt="Mật thư" 
                    className="station-image img-fluid"
                    style={{ 
                      width: '100%', 
                      maxHeight: '600px', 
                      objectFit: 'contain',
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onError={(e) => {
                      console.error('Lỗi tải hình ảnh:', e);
                      console.log('URL hình ảnh:', teamSpecificContent.image);
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300?text=Không+thể+hiển+thị+hình+ảnh';
                    }}
                  />
                </div>
              )}

              {/* Hiển thị ghi chú của trạm nếu có */}
              {activeStation.gameNote && (
                <Alert variant="info" className="d-flex align-items-start mb-4">
                  <i className="bi bi-info-circle-fill me-2 mt-1" style={{ fontSize: '1.2rem' }}></i>
                  <div>{activeStation.gameNote}</div>
                </Alert>
              )}
            </div>
            
            {/* Form gửi đáp án */}
            <Form onSubmit={handleSubmitAnswer} className="text-start">
              <Form.Group className="mb-4">
                <Form.Label>
                  Đáp án của bạn
                  {activeStation && activeStation.maxAttempts > 0 && (
                    <Badge bg="info" className="ms-2">
                      Tối đa {activeStation.maxAttempts} lần thử
                    </Badge>
                  )}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={answer}
                  onChange={handleAnswerChange}
                  placeholder="Nhập đáp án của bạn"
                  disabled={nextAttemptTime !== null || submitting}
                  className="form-control-lg"
                />
                {nextAttemptTime && (
                  <div className="text-danger mt-2">
                    <i className="bi bi-hourglass-split me-1"></i>
                    Vui lòng đợi {timeLeft} để thử lại
                  </div>
                )}
              </Form.Group>
              
              <div className="d-grid">
                <Button 
                  variant="primary" 
                  type="submit" 
                  size="lg"
                  disabled={nextAttemptTime !== null || submitting || !answer.trim()}
                >
                  {submitting ? (
                    <>
                      Đang xử lý...
                    </>
                  ) : 'Gửi đáp án'}
                </Button>
              </div>
            </Form>
            
            {/* Kết quả gửi đáp án */}
            {submissionResult && (
              <div className="mt-4 text-start">
                {submissionResult.isCorrect ? (
                  <Alert variant="success" className="d-flex align-items-center">
                    <i className="bi bi-check-circle-fill me-2" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <strong>Chính xác!</strong> Chúc mừng, bạn đã hoàn thành <TermReplacer>{t('station_term')}</TermReplacer> này.
                    </div>
                  </Alert>
                ) : nextAttemptTime ? (
                  <Alert variant="warning" className="d-flex align-items-start">
                    <i className="bi bi-hourglass-split me-2 mt-1" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <div className="mb-1"><strong>Đã hết lần thử!</strong></div>
                      <div>
                        <span className="me-3 badge bg-warning text-dark px-2 py-1 mb-1">
                          <i className="bi bi-clock-history me-1"></i>
                          Khi hết thời gian chờ, bạn sẽ có {activeStation.maxAttempts} lần thử mới.
                        </span>
                      </div>
                    </div>
                  </Alert>
                ) : submissionResult.remainingAttempts <= 0 ? (
                  <Alert variant="danger" className="d-flex align-items-start">
                    <i className="bi bi-x-circle-fill me-2 mt-1" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <div className="mb-1"><strong>Đáp án không chính xác!</strong></div>
                      <div className="d-flex align-items-center flex-wrap">
                        <span className="text-danger mb-1">
                          <i className="bi bi-exclamation-circle-fill me-1"></i>
                          Đã hết lần thử! Đang chuẩn bị khóa trong {activeStation.lockTime} phút.
                        </span>
                      </div>
                    </div>
                  </Alert>
                ) : submissionResult.attemptCount > 0 ? (
                  <Alert variant="danger" className="d-flex align-items-start">
                    <i className="bi bi-x-circle-fill me-2 mt-1" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <div className="mb-1"><strong>Đáp án không chính xác!</strong></div>
                      <div className="d-flex align-items-center flex-wrap">
                        <span className="me-3 mb-1">
                          <i className="bi bi-arrow-counterclockwise me-1"></i>
                          Bạn còn <strong className="badge bg-info">{submissionResult.remainingAttempts}</strong> lần thử
                        </span>
                        
                        {submissionResult.remainingAttempts <= 2 && (
                          <span className="text-warning mb-1">
                            <i className="bi bi-exclamation-triangle-fill me-1"></i>
                            Hãy suy nghĩ kỹ!
                          </span>
                        )}
                      </div>
                    </div>
                  </Alert>
                ) : (
                  <Alert variant="danger" className="d-flex align-items-start">
                    <i className="bi bi-x-circle-fill me-2 mt-1" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <div className="mb-1"><strong>Đáp án không chính xác!</strong></div>
                      <div>
                        <span className="me-3">
                          <i className="bi bi-arrow-counterclockwise me-1"></i>
                          Bạn còn <strong className="badge bg-info">{submissionResult.remainingAttempts}</strong> lần thử
                        </span>
                      </div>
                    </div>
                  </Alert>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="waiting-box" style={{
            padding: '1rem 2rem',
            borderRadius: '8px',
            border: '2px solid #0d6efd',
            boxShadow: '0 0 10px rgba(13, 110, 253, 0.4)',
            animation: 'pulse-border 1s infinite',
            position: 'relative'
          }}>
            <style>
              {`
                @keyframes pulse-border {
                  0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7); }
                  70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
                  100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
                }
              `}
            </style>
            <div>
              <i className="bi bi-hourglass-split text-primary" style={{ fontSize: '3rem' }}></i>
              <h3 className="mt-3 mb-2">Đang chờ <TermReplacer>{t('station_term')}</TermReplacer> bắt đầu...</h3>
              <p className="text-muted mb-3">
                Admin sẽ bắt đầu <TermReplacer>{t('station_term')}</TermReplacer> trong thời gian tới.
              </p>
            </div>
            
            <div className="mt-4 d-flex justify-content-center">
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
    );
  };

  // Render form đăng nhập
  const renderLoginForm = () => (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-primary text-white py-3">
        <h4 className="mb-0">Trang chờ trạm</h4>
      </Card.Header>
      <Card.Body className="p-4">
        <div className="text-center py-3">
          <div className="mb-4">
            <div className="d-inline-block bg-light p-4 rounded-circle mb-3">
              <i className="bi bi-people-fill text-primary" style={{ fontSize: '3rem' }}></i>
            </div>
            <h3>Đăng nhập</h3>
            <p className="text-muted">Vui lòng đăng nhập và chờ quản trị viên bắt đầu trạm</p>
          </div>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleTeamLogin} className="text-start">
            <Form.Group className="mb-3">
              <Form.Label>{t('team')}</Form.Label>
              <Form.Control 
                type="text"
                value={teamName} 
                onChange={(e) => setTeamName(e.target.value)}
                className="form-control-lg"
                placeholder="Nhập tên đội"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>{t('password_label')}</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('enter_password')}
                required
              />
            </Form.Group>
            
            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit" 
                size="lg" 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    {t('processing')}
                  </>
                ) : t('confirm')}
              </Button>
            </div>
          </Form>
        </div>
      </Card.Body>
    </Card>
  );

  // Loading spinner
  if (loading && !loggedInTeam) {
    return (
      <Container className="py-4">
        <div className="text-center spinner-container">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3"><TermReplacer>{t('loading_station_info')}</TermReplacer></p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4 animate__animated animate__fadeIn">
      
      {/* Giao diện người dùng */}
      <Row>
        <Col md={12} lg={10} xl={8} className="mx-auto">
          {loggedInTeam ? renderWaitingPage() : renderLoginForm()}
        </Col>
      </Row>
    </Container>
  );
};

export default TeamWaitingPage; 