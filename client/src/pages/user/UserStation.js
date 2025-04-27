import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Image, Spinner, Modal, Row, Col } from 'react-bootstrap';
import { stationApi, submissionApi, teamApi } from '../../services/api';
import { replaceStationTerm } from '../../utils/helpers';
import TermReplacer from '../../utils/TermReplacer';
import { updateSystemSettings } from '../../utils/helpers';
import { useSystemSettings } from '../../context/SystemSettingsContext';

const UserStation = () => {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const { getAdminSettings } = useSystemSettings();

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
  const answerInputRef = useRef(null);

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
      } catch (err) {
        console.error('Lỗi khi đọc dữ liệu đội đã lưu:', err);
      }
    }
    
    // Theo dõi sự kiện sao chép, ẩn tab và thoát
    document.addEventListener('copy', handleCopy);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Khi component unmount, xóa event listeners
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
    };
  }, [stationId, teamId]);

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
          <p className="mt-3"><TermReplacer>Đang tải thông tin trạm...</TermReplacer></p>
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
            <h2 className="mb-3"><TermReplacer>Không thể tải trạm</TermReplacer></h2>
            <p className="mb-4">{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Thử lại
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
        <h3>Chọn đội tham gia</h3>
        <p className="text-muted">Vui lòng chọn đội của bạn và nhập mật khẩu</p>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {alreadyLoggedInError && (
        <Alert variant="warning">
          <Alert.Heading>Đội đã đăng nhập ở thiết bị khác</Alert.Heading>
          <p>{alreadyLoggedInError.message}</p>
          <hr />
          <p className="mb-0">
            <strong>Thiết bị đang đăng nhập:</strong> {alreadyLoggedInError.deviceInfo || 'Không xác định'}
          </p>
        </Alert>
      )}
      
      <Form onSubmit={handleTeamSubmit} className="text-start">
        <Form.Group className="mb-3">
          <Form.Label>Đội</Form.Label>
          <Form.Select 
            value={selectedTeam} 
            onChange={handleTeamSelect}
            className="form-select-lg"
            required
          >
            <option value="">-- Chọn đội --</option>
            {station.teams.map((team, index) => (
              <option key={index} value={team}>{team}</option>
            ))}
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-4">
          <Form.Label>Mật khẩu</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Nhập mật khẩu"
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
                Đang xử lý...
              </>
            ) : 'Xác nhận'}
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
                  <h2 className="mb-0"><TermReplacer>Trạm</TermReplacer> {station.name}</h2>
                  {station.gameName && <p className="mb-0 mt-1 opacity-75">{station.gameName}</p>}
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {showTeamSelection ? (
                renderTeamSelectionForm()
              ) : (
                <>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                      <h4 className="mb-1">
                        <i className="bi bi-people-fill me-2 text-primary"></i>
                        Đội: {teamName}
                      </h4>
                      <p className="text-muted mb-0">
                        <small>
                          <i className="bi bi-clock me-1"></i>
                          Số lần thử còn lại: {submissionResult?.remainingAttempts !== undefined ? 
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
                      Đăng xuất
                    </Button>
                  </div>

                  {station.gameNote && (
                    <Alert variant="info" className="d-flex align-items-start mb-4">
                      <i className="bi bi-info-circle-fill me-2 mt-1" style={{ fontSize: '1.2rem' }}></i>
                      <div>{station.gameNote}</div>
                    </Alert>
                  )}

                  <div className="station-content-wrapper mb-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-file-text me-2 text-primary"></i>
                      Mật thư:
                    </h5>
                    
                    {/* Nội dung văn bản */}
                    {station.contentType === 'text' || (station.showText && station.contentType === 'both') ? (
                      <Card className="station-content mb-3">
                        <Card.Body>
                          {(station.ottContent || station.nwContent) && (station.showOTT || station.showNW) ? (
                            <>
                              {station.ottContent && station.showOTT && (
                                <div className="mb-4">
                                  <h6 className="fw-bold d-inline-block bg-primary text-white px-3 py-1 rounded mb-3">OTT:</h6>
                                  <div className="content-text">
                                    {station.ottContent}
                                  </div>
                                </div>
                              )}
                              {station.nwContent && station.showNW && (
                                <div>
                                  <h6 className="fw-bold d-inline-block bg-primary text-white px-3 py-1 rounded mb-3">NW:</h6>
                                  <div className="content-text">
                                    {station.nwContent}
                                    <span className="fw-bold">/AR</span>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="content-text">
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
                  
                  {error && <Alert variant="danger">{error}</Alert>}
                  
                  {submissionResult && submissionResult.isCorrect ? (
                    <Alert variant="success" className="text-center p-4 success-animation">
                      <div className="mb-3">
                        <i className="bi bi-check-circle" style={{ fontSize: '3rem' }}></i>
                      </div>
                      <h4>Chúc mừng!</h4>
                      <p className="mb-0"><TermReplacer>Bạn đã hoàn thành trạm này với {submissionResult.score} điểm.</TermReplacer></p>
                    </Alert>
                  ) : nextAttemptTime ? (
                    <Alert variant="warning" className="text-center p-4">
                      <div className="mb-3">
                        <i className="bi bi-hourglass-split" style={{ fontSize: '3rem' }}></i>
                      </div>
                      <h4>Vui lòng đợi!</h4>
                      <p className="mb-3">Bạn cần đợi trước khi thử lại.</p>
                      <div className="d-inline-block bg-light px-4 py-2 rounded">
                        <span className="fw-bold" style={{ fontSize: '1.5rem' }}>{timeLeft}</span>
                      </div>
                    </Alert>
                  ) : (
                    <Form onSubmit={handleSubmitAnswer}>
                      <Form.Group className="mb-3">
                        <Form.Control
                          as="textarea"
                          rows={4}
                          type="text"
                          value={answer}
                          onChange={handleAnswerChange}
                          placeholder="Nhập đáp án"
                          disabled={!!timeLeft}
                          ref={answerInputRef}
                        />
                      </Form.Group>
                      
                      <div className="d-grid gap-2">
                        <Button 
                          variant="primary" 
                          type="submit" 
                          size="lg"
                          disabled={submitting || !answer.trim() || Boolean(nextAttemptTime)}
                        >
                          {submitting ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-send me-2"></i>
                              Gửi đáp án
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
          
          <div className="text-center text-muted">
            <small>
              <i className="bi bi-shield-lock me-1"></i>
              Hệ thống trò chơi mật thư
            </small>
          </div>
        </Col>
      </Row>
      
      {/* Modal hiển thị khi hoàn thành */}
      <Modal 
        show={showSuccessModal} 
        onHide={() => setShowSuccessModal(false)}
        centered
        size="md"
        className="success-modal"
      >
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <i className="bi bi-trophy me-2"></i>
            Chúc mừng!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-5">
          <div className="animate__animated animate__bounceIn mb-4">
            <div className="success-icon-circle mb-3">
              <i className="bi bi-check-lg" style={{ fontSize: '4rem', color: '#27ae60' }}></i>
            </div>
            <h3 className="mb-3">Xin chúc mừng!</h3>
            <p className="mb-4 lead">
              Đội <strong>{teamName}</strong> đã giải được mật thư và nhận được <span className="badge bg-success">{submissionResult?.score} điểm</span>
            </p>
          </div>
          <div className="d-grid gap-2">
            <Button onClick={() => setShowSuccessModal(false)} variant="success" size="lg">
              <i className="bi bi-check2 me-2"></i>
              Đóng
            </Button>
          </div>
        </Modal.Body>
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