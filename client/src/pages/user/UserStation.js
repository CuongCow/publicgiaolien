import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Image, Spinner, Modal, Row, Col } from 'react-bootstrap';
import { stationApi, submissionApi, teamApi } from '../../services/api';
import { replaceStationTerm } from '../../utils/helpers';
import TermReplacer from '../../utils/TermReplacer';
import { updateSystemSettings } from '../../utils/helpers';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import { useLanguage } from '../../context/LanguageContext';

const UserStation = () => {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const { getAdminSettings } = useSystemSettings();
  const { t } = useLanguage();

  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [password, setPassword] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [showTeamSelection, setShowTeamSelection] = useState(true);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [nextAttemptTime, setNextAttemptTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [alreadyLoggedInError, setAlreadyLoggedInError] = useState(null);
  const [forceLogoutMessage, setForceLogoutMessage] = useState(null);
  const answerInputRef = useRef(null);
  const checkSessionIntervalRef = useRef(null);

  useEffect(() => {
    fetchStationData();
    
    // Kiểm tra thông tin đội đã lưu
    const savedTeamData = localStorage.getItem('current_team');
    if (savedTeamData) {
      try {
        const { teamName, teamId, sessionId } = JSON.parse(savedTeamData);
        setTeamName(teamName);
        setTeamId(teamId);
        setSessionId(sessionId);
        setShowTeamSelection(false);
        
        // Bắt đầu kiểm tra trạng thái phiên đăng nhập
        startSessionCheck(teamId, sessionId);
      } catch (err) {
        console.error('Lỗi khi đọc dữ liệu đội đã lưu:', err);
      }
    }
    
    // Theo dõi sự kiện sao chép, ẩn tab và thoát
    document.addEventListener('copy', handleCopy);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Khi component unmount, xóa event listeners và interval
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Cập nhật trạng thái khi thoát trang
      if (teamId) {
        teamApi.updateStatus(teamId, { status: 'exited' }).catch(err => 
          console.error('Error updating team status:', err)
        );
      }
      
      // Xóa interval kiểm tra phiên
      if (checkSessionIntervalRef.current) {
        clearInterval(checkSessionIntervalRef.current);
      }
    };
  }, [stationId, teamId]);

  // Hàm bắt đầu kiểm tra phiên đăng nhập định kỳ
  const startSessionCheck = (teamId, sessionId) => {
    // Xóa interval cũ nếu có
    if (checkSessionIntervalRef.current) {
      clearInterval(checkSessionIntervalRef.current);
    }
    
    // Tạo một interval mới để kiểm tra mỗi 3 giây
    checkSessionIntervalRef.current = setInterval(async () => {
      try {
        // Gọi API kiểm tra thông tin đội chơi
        const response = await teamApi.getById(teamId);
        const team = response.data;
        
        // Kiểm tra xem phiên đăng nhập còn hợp lệ không
        if (!team.sessionId || team.sessionId !== sessionId) {
          // Hiển thị thông báo đã bị đăng xuất
          setForceLogoutMessage('Tài khoản của bạn đã được đăng xuất bởi quản trị viên');
          
          // Xóa thông tin đội khỏi localStorage
          localStorage.removeItem('current_team');
          
          // Dừng interval kiểm tra phiên
          clearInterval(checkSessionIntervalRef.current);
          
          // Đặt lại trạng thái sau 3 giây
          setTimeout(() => {
            resetForm();
            setForceLogoutMessage(null);
          }, 3000);
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra phiên đăng nhập:', err);
      }
    }, 3000);
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
      } else {
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextAttemptTime]);

  const handleVisibilityChange = () => {
    if (!teamId) return;
    
    if (document.hidden) {
      teamApi.updateStatus(teamId, { status: 'hidden' }).catch(err => 
        console.error('Error updating team status:', err)
      );
    } else {
      teamApi.updateStatus(teamId, { status: 'active' }).catch(err => 
        console.error('Error updating team status:', err)
      );
    }
  };

  const handleCopy = (e) => {
    if (!teamId) return;
    
    const selectedText = window.getSelection().toString();
    if (selectedText && selectedText.length > 0) {
      teamApi.updateStatus(teamId, { 
        status: 'copied', 
        content: selectedText 
      }).catch(err => console.error('Error updating copy status:', err));
    }
  };

  const handleBeforeUnload = () => {
    if (teamId) {
      // Sử dụng Beacon API để đảm bảo request được gửi trước khi trang đóng
      const data = JSON.stringify({ status: 'exited' });
      navigator.sendBeacon(`/api/teams/${teamId}/status`, data);
    }
  };

  const fetchStationData = async () => {
    try {
      setLoading(true);
      const response = await stationApi.getById(stationId);
      setStation(response.data);
      
      // Nếu người dùng đã đăng nhập (là admin), ưu tiên sử dụng cài đặt của admin đó
      const adminData = localStorage.getItem('admin');
      if (adminData) {
        try {
          const admin = JSON.parse(adminData);
          if (admin && admin.id) {
            await getAdminSettings(admin.id);
          }
        } catch (parseErr) {
          console.error('Lỗi khi phân tích dữ liệu admin:', parseErr);
        }
      } 
      // Nếu không phải admin đăng nhập, sử dụng cài đặt của admin tạo ra trạm
      else if (response.data && response.data.adminId) {
        await getAdminSettings(response.data.adminId);
      }
      
      setError(null);
    } catch (err) {
      setError(`Không thể tải thông tin ${replaceStationTerm('trạm')}. Vui lòng thử lại sau.`);
      console.error('Error fetching station data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelect = (e) => {
    setSelectedTeam(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTeam || !password) {
      setError('Vui lòng chọn đội và nhập mật khẩu');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      setAlreadyLoggedInError(null);
      
      const response = await teamApi.verifyPassword({
        teamName: selectedTeam,
        password
      });
      
      if (response.data.success) {
        const teamData = {
          teamName: selectedTeam,
          teamId: response.data.teamId,
          sessionId: response.data.sessionId
        };
        
        // Lưu thông tin đội vào localStorage với khóa toàn cục
        localStorage.setItem('current_team', JSON.stringify(teamData));
        
        setTeamName(selectedTeam);
        setTeamId(response.data.teamId);
        setSessionId(response.data.sessionId);
        setShowTeamSelection(false);
        setError(null);
        
        // Bắt đầu kiểm tra phiên đăng nhập
        startSessionCheck(response.data.teamId, response.data.sessionId);
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.alreadyLoggedIn) {
        setAlreadyLoggedInError({
          message: err.response.data.message,
          deviceInfo: err.response.data.deviceInfo
        });
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerChange = (e) => {
    setAnswer(e.target.value);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!answer.trim()) {
      setError('Vui lòng nhập đáp án');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await submissionApi.create({
        stationId,
        teamName,
        answer: answer.trim()
      });
      
      setSubmissionResult(response.data);
      
      if (response.data.isCorrect) {
        setShowSuccessModal(true);
      } else if (response.data.submission.nextAttemptAllowed) {
        setNextAttemptTime(response.data.submission.nextAttemptAllowed);
      } else {
        // Hiển thị thông báo khi trả lời sai
        setError(`Đáp án không chính xác! Còn ${response.data.remainingAttempts || 0} lần thử.`);
      }
      
      setAnswer('');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
        
        if (err.response.data.nextAttemptAllowed) {
          setNextAttemptTime(err.response.data.nextAttemptAllowed);
        }
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
      }
      console.error('Error submitting answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTeamName('');
    setTeamId('');
    setSessionId('');
    setSelectedTeam('');
    setPassword('');
    setShowTeamSelection(true);
    setSubmissionResult(null);
    setShowSuccessModal(false);
    
    // Dừng interval kiểm tra phiên
    if (checkSessionIntervalRef.current) {
      clearInterval(checkSessionIntervalRef.current);
      checkSessionIntervalRef.current = null;
    }
  };
  
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };
  
  const handleLogout = async () => {
    try {
      // Gọi API đăng xuất
      if (teamId && sessionId) {
        await teamApi.logout({
          teamId,
          sessionId
        });
      }
      
      // Xóa thông tin đội khỏi localStorage
      localStorage.removeItem('current_team');
      
      // Reset form và trạng thái
      resetForm();
      setShowLogoutModal(false);
      setSessionId('');
      
      // Dừng interval kiểm tra phiên
      if (checkSessionIntervalRef.current) {
        clearInterval(checkSessionIntervalRef.current);
        checkSessionIntervalRef.current = null;
      }
    } catch (err) {
      console.error('Lỗi khi đăng xuất:', err);
      
      // Vẫn xóa thông tin cục bộ ngay cả khi API bị lỗi
      localStorage.removeItem('current_team');
      resetForm();
      setShowLogoutModal(false);
      setSessionId('');
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center spinner-container">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3"><TermReplacer>{t('loading_station_info')}</TermReplacer></p>
          </div>
      </Container>
    );
  }

  if (error && !station) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Card className="text-center shadow w-100 animate__animated animate__fadeIn" style={{ maxWidth: '500px' }}>
          <Card.Body className="p-5">
            <div className="mb-4 text-danger">
              <i className="bi bi-exclamation-circle" style={{ fontSize: '3rem' }}></i>
            </div>
            <h2 className="mb-3"><TermReplacer>{t('error_loading_station')}</TermReplacer></h2>
            <p className="mb-4">{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              {t('retry')}
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Thêm vào phần chọn đội của form
  const renderTeamSelectionForm = () => (
    <div className="text-center py-3">
      <div className="mb-4">
        <div className="d-inline-block bg-light p-4 rounded-circle mb-3">
          <i className="bi bi-people-fill text-primary" style={{ fontSize: '3rem' }}></i>
        </div>
        <h3>{t('select_team')}</h3>
        <p className="text-muted">{t('select_team_description')}</p>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {alreadyLoggedInError && (
        <Alert variant="warning">
          <Alert.Heading>{t('already_logged_in')}</Alert.Heading>
          <p>{alreadyLoggedInError.message}</p>
          <hr />
          <p className="mb-0">
            <strong>{t('device_logged_in')}</strong> {alreadyLoggedInError.deviceInfo || t('unknown_device')}
          </p>
        </Alert>
      )}
      
      <Form onSubmit={handleTeamSubmit} className="text-start">
        <Form.Group className="mb-3">
          <Form.Label>{t('team')}</Form.Label>
          <Form.Select 
            value={selectedTeam} 
            onChange={handleTeamSelect}
            className="form-select-lg"
            required
          >
            <option value="">{t('select_team_option')}</option>
            {station.teams.map((team, index) => (
              <option key={index} value={team}>{team}</option>
            ))}
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-4">
          <Form.Label>{t('password_label')}</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={handlePasswordChange}
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
                <Spinner animation="border" size="sm" className="me-2" />
                {t('processing')}
              </>
            ) : t('confirm')}
          </Button>
        </div>
      </Form>
    </div>
  );

  return (
    <Container className="py-5 animate__animated animate__fadeIn">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white py-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-geo-alt-fill me-2" style={{ fontSize: '1.5rem' }}></i>
                <div>
                  <h2 className="mb-0"><TermReplacer>{t('station_term')}</TermReplacer> {station.name}</h2>
                  {station.gameName && <p className="mb-0 mt-1 opacity-75">{station.gameName}</p>}
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Hiển thị thông báo buộc đăng xuất nếu có */}
              {forceLogoutMessage && (
                <Alert variant="danger" className="mb-4 text-center">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {forceLogoutMessage}
                </Alert>
              )}
              
              {station && station.image && (
                <div className="text-center mb-4">
                  <Image 
                    src={station.image} 
                    alt={station.name}
                    fluid
                    className="station-image rounded" 
                    style={{ maxHeight: '400px', objectFit: 'contain' }}
                  />
                </div>
              )}

              {showTeamSelection ? (
                renderTeamSelectionForm()
              ) : (
                <>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                      <h4 className="mb-1">
                        <i className="bi bi-people-fill me-2 text-primary"></i>
                        {t('team')}: {teamName}
                      </h4>
                      <p className="text-muted mb-0">
                        <small>
                          <i className="bi bi-clock me-1"></i>
                          {t('remaining_attempts')} {submissionResult?.remainingAttempts !== undefined ? 
                            submissionResult.remainingAttempts : 
                            (station.maxAttempts - (submissionResult?.attemptCount || 0))}
                        </small>
                      </p>
                    </div>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={handleLogoutClick}
                    >
                      <i className="bi bi-box-arrow-right me-1"></i>
                      {t('logout')}
                    </Button>
                  </div>

                  {station.gameNote && (
                    <Alert variant="info" className="d-flex align-items-start mb-4">
                      <i className="bi bi-info-circle-fill me-2 mt-1" style={{ fontSize: '1.2rem' }}></i>
                      <div>{station.gameNote}</div>
                    </Alert>
                  )}

                  {/* Hiển thị nội dung trạm */}
                  <div className="station-content-wrapper mb-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-file-text me-2 text-primary"></i>
                      Mật thư:
                    </h5>
                    
                    {/* Nội dung văn bản */}
                    {(station.contentType === 'text' || (station.showText && station.contentType === 'both')) ? (
                      <Card className="station-content mb-3">
                        <Card.Body>
                          {(station.ottContent || station.nwContent) && (station.showOTT || station.showNW) ? (
                            <>
                              {station.ottContent && station.showOTT && (
                                <div className="mb-4">
                                  <h6 className="fw-bold d-inline-block bg-primary text-white px-3 py-1 rounded mb-3">OTT:</h6>
                                  <div className="content-text" style={{ whiteSpace: 'pre-wrap' }}>
                                    {station.ottContent}
                                  </div>
                                </div>
                              )}
                              {station.nwContent && station.showNW && (
                                <div>
                                  <h6 className="fw-bold d-inline-block bg-primary text-white px-3 py-1 rounded mb-3">NW:</h6>
                                  <div className="content-text" style={{ whiteSpace: 'pre-wrap' }}>
                                    {station.nwContent}
                                    <span className="fw-bold">/AR</span>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="content-text" style={{ whiteSpace: 'pre-wrap' }}>
                              {station.content}
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    ) : null}
                    
                    {/* Nội dung hình ảnh */}
                    {(station.contentType === 'image' || station.contentType === 'both' || station.showImage) && station.content ? (
                      <div className="text-center mb-3">
                        <img 
                          src={station.imageUrl || (station.content && station.content.startsWith('/api/') 
                            ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${station.content}`
                            : station.content)
                          }
                          alt="Mật thư" 
                          className="station-image img-fluid"
                          style={{ maxWidth: '100%', maxHeight: '500px', border: '1px solid #ddd', borderRadius: '4px' }}
                          onError={(e) => {
                            console.error('Lỗi tải hình ảnh:', e);
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/400x300?text=Không+thể+hiển+thị+hình+ảnh';
                          }}
                        />
                      </div>
                    ) : null}
                  </div>

                  <Form onSubmit={handleSubmitAnswer}>
                    <Form.Group className="mb-4">
                      <Form.Label>Đáp án của bạn</Form.Label>
                      <Form.Control
                        type="text"
                        value={answer}
                        onChange={handleAnswerChange}
                        placeholder="Nhập đáp án của bạn"
                        disabled={nextAttemptTime !== null || submitting}
                        ref={answerInputRef}
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
                            <Spinner animation="border" size="sm" className="me-2" />
                            Đang xử lý...
                          </>
                        ) : 'Gửi đáp án'}
                      </Button>
                    </div>
                  </Form>
                  
                  {submissionResult && (
                    <div className="mt-4">
                      {submissionResult.isCorrect ? (
                        <Alert variant="success" className="d-flex align-items-center">
                          <i className="bi bi-check-circle-fill me-2" style={{ fontSize: '1.5rem' }}></i>
                          <div>
                            <strong>Chính xác!</strong> Chúc mừng, bạn đã hoàn thành <TermReplacer>{t('station_term')}</TermReplacer> này.
                          </div>
                        </Alert>
                      ) : (
                        <Alert variant="danger" className="d-flex align-items-center">
                          <i className="bi bi-x-circle-fill me-2" style={{ fontSize: '1.5rem' }}></i>
                          <div>
                            <strong>Không chính xác!</strong> Hãy thử lại với một đáp án khác.
                          </div>
                        </Alert>
                      )}
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
          
          <div className="text-center text-muted">
            <small>
              <i className="bi bi-shield-lock me-1"></i>
              Hệ thống quản lý <TermReplacer>{t('station_term')}</TermReplacer> của Giao Liên
            </small>
          </div>
        </Col>
      </Row>
      
      {/* Modal hiển thị khi hoàn thành */}
      <Modal 
        show={showSuccessModal} 
        onHide={() => setShowSuccessModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <i className="bi bi-trophy me-2"></i>
            Chúc mừng!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-3">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h4 className="mb-3">Bạn đã hoàn thành <TermReplacer>{t('station_term')}</TermReplacer> này!</h4>
          <p>Đối với <TermReplacer>{t('station_term')}</TermReplacer> này, đội của bạn nhận được <strong className="text-success">{submissionResult?.submission?.score || 0} điểm</strong>.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSuccessModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal xác nhận đăng xuất */}
      <Modal 
        show={showLogoutModal} 
        onHide={cancelLogout}
        centered
        size="sm"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <i className="bi bi-question-circle me-2"></i>
            Xác nhận
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <p className="mb-4">Bạn có chắc chắn muốn đăng xuất?</p>
          <div className="d-flex justify-content-center gap-3">
            <Button variant="secondary" onClick={cancelLogout}>
              <i className="bi bi-x-lg me-1"></i>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>
              Đăng xuất
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default UserStation; 