import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Image, Spinner, Modal, Row, Col } from 'react-bootstrap';
import { stationApi, submissionApi, teamApi } from '../../services/api';
import { replaceStationTerm } from '../../utils/helpers';
import TermReplacer from '../../utils/TermReplacer';
import { updateSystemSettings } from '../../utils/helpers';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import './UserStation.css';

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [alreadyLoggedInError, setAlreadyLoggedInError] = useState(null);
  const [forceLogoutMessage, setForceLogoutMessage] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const answerInputRef = useRef(null);
  const checkSessionIntervalRef = useRef(null);
  const [nextAttemptTime, setNextAttemptTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // Hàm helper để lưu thông tin vào localStorage
  const saveAttemptInfoToLocalStorage = (submissionResult, nextAttemptTime) => {
    if (!teamId || !stationId) return;
    
    const attemptInfo = {
      submissionResult,
      nextAttemptTime,
      stationId,
      teamId
    };
    
    localStorage.setItem('attempt_info', JSON.stringify(attemptInfo));
  };
  
  // Effect để lưu thông tin khi chúng thay đổi
  useEffect(() => {
    if (teamId && stationId) {
      saveAttemptInfoToLocalStorage(submissionResult, nextAttemptTime);
    }
  }, [submissionResult, nextAttemptTime, teamId, stationId]);

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
        
        // Phục hồi thông tin về thời gian chờ và số lần thử từ localStorage
        const savedAttemptInfo = localStorage.getItem('attempt_info');
        if (savedAttemptInfo) {
          try {
            const attemptInfo = JSON.parse(savedAttemptInfo);
            if (attemptInfo.stationId === stationId && attemptInfo.teamId === teamId) {
              // Kiểm tra xem thời gian chờ còn hợp lệ không
              if (attemptInfo.nextAttemptTime) {
                const savedNextAttemptTime = new Date(attemptInfo.nextAttemptTime);
                const now = new Date();
                if (savedNextAttemptTime > now) {
                  // Thời gian chờ vẫn còn hợp lệ, khôi phục
                  setNextAttemptTime(attemptInfo.nextAttemptTime);
                }
              }
              
              if (attemptInfo.submissionResult) {
                // Kiểm tra nếu remainingAttempts là 0, nhưng không có thời gian chờ
                if (attemptInfo.submissionResult.remainingAttempts === 0 && !attemptInfo.nextAttemptTime) {
                  console.debug('Phát hiện remainingAttempts = 0 mà không có nextAttemptTime, tạo thời gian chờ mới');
                  
                  // Tạo thời gian chờ mới
                  const lockTimeMillis = (station?.lockTime || 1) * 60 * 1000;
                  const newNextAttemptTime = new Date(Date.now() + lockTimeMillis).toISOString();
                  setNextAttemptTime(newNextAttemptTime);
                  
                  // Cập nhật localStorage
                  saveAttemptInfoToLocalStorage(attemptInfo.submissionResult, newNextAttemptTime);
                } else {
                  setSubmissionResult(attemptInfo.submissionResult);
                }
              }
            }
          } catch (err) {
            console.error('Lỗi khi phục hồi thông tin thời gian chờ:', err);
          }
        }
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

  // Thêm useEffect mới để gọi fetchTeamSubmissions khi station đã load xong
  useEffect(() => {
    const savedTeamData = localStorage.getItem('current_team');
    if (savedTeamData && station) {
      try {
        const { teamName, teamId } = JSON.parse(savedTeamData);
        if (teamId && teamName) {
          // Kiểm tra xem đội có thuộc trạm hay không
          if (station.teams && !station.teams.includes(teamName)) {
            // Đội không thuộc trạm
            console.debug('Đội không thuộc trạm:', teamName);
            setAccessDenied(true);
          } else {
            // Đội thuộc trạm, lấy thông tin lần thử
            setAccessDenied(false);
            fetchTeamSubmissions(teamId, teamName);
          }
        }
      } catch (err) {
        console.error('Lỗi khi đọc dữ liệu đội sau khi load station:', err);
      }
    }
  }, [station]); // Chỉ gọi khi station thay đổi

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
        
        // Khi thời gian khóa kết thúc, reset số lần thử về ban đầu
        if (station) {
          // Cập nhật số lần thử mới
          const newSubmissionResult = {
            isCorrect: false,
            remainingAttempts: station.maxAttempts,
            attemptCount: 0
          };
          
          setSubmissionResult(newSubmissionResult);
          
          // Cập nhật localStorage để lưu thay đổi
          if (teamId && stationId) {
            saveAttemptInfoToLocalStorage(newSubmissionResult, null);
          }
          
          // Làm mới dữ liệu từ server
          if (teamId && teamName) {
            fetchTeamSubmissions(teamId, teamName);
          }
          
          console.debug('Đã reset số lần thử sau khi hết thời gian chờ');
        }
      } else {
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextAttemptTime, station, teamId, teamName, stationId]);

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
      const stationData = response.data;
      
      // Đảm bảo các thuộc tính font có giá trị mặc định
      if (!stationData.fontSize) stationData.fontSize = '1.05rem';
      if (!stationData.fontWeight) stationData.fontWeight = '500';
      if (!stationData.lineHeight) stationData.lineHeight = '1.5';
      if (!stationData.paragraphSpacing && stationData.paragraphSpacing !== 0) stationData.paragraphSpacing = '0.8rem';
      
      // Thêm log để debug font size
      console.debug('Font settings from server:', {
        fontSize: stationData.fontSize,
        fontWeight: stationData.fontWeight,
        lineHeight: stationData.lineHeight,
        paragraphSpacing: stationData.paragraphSpacing,
        messageType: stationData.messageType
      });
      
      // Thêm log chi tiết để kiểm tra paragraphSpacing
      console.debug('Raw station data received:', {
        paragraphSpacing: stationData.paragraphSpacing,
        hasProperty: Object.prototype.hasOwnProperty.call(stationData, 'paragraphSpacing')
      });
      
      // Xóa log thông tin station để bảo mật
      // console.log('Trạm data:', stationData);
      // console.log('Teams trong trạm:', stationData.teams);
      // console.log('Correct answers:', stationData.correctAnswer);
      
      setStation(stationData);
      
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
      else if (stationData && stationData.adminId) {
        await getAdminSettings(stationData.adminId);
      }
      
      // Lấy định dạng font riêng cho đội nếu đây là mật thư riêng
      if (stationData.messageType === 'individual' && teamName) {
        const teamSpecificContent = stationData.teamSpecificContents?.find(content => 
          content.team === teamName
        );
        
        if (teamSpecificContent) {
          // Cập nhật stationData với font riêng cho đội này
          stationData.fontSize = teamSpecificContent.fontSize || stationData.fontSize || '1.05rem';
          stationData.fontWeight = teamSpecificContent.fontWeight || stationData.fontWeight || '500';
          stationData.lineHeight = teamSpecificContent.lineHeight || stationData.lineHeight || '1.5';
          stationData.paragraphSpacing = teamSpecificContent.paragraphSpacing || stationData.paragraphSpacing || '0.8rem';
          
          // Debug thêm về dữ liệu font đặc thù theo đội
          console.debug('Team specific font settings:', {
            team: teamName,
            fontSize: teamSpecificContent.fontSize,
            fontWeight: teamSpecificContent.fontWeight,
            lineHeight: teamSpecificContent.lineHeight,
            paragraphSpacing: teamSpecificContent.paragraphSpacing,
            appliedParagraphSpacing: stationData.paragraphSpacing
          });
        }
      }
      
      // Sau khi có thông tin trạm, kiểm tra lại thông tin đội và lần thử nếu cần
      const savedTeamData = localStorage.getItem('current_team');
      if (savedTeamData) {
        try {
          const { teamName, teamId } = JSON.parse(savedTeamData);
          if (teamId && teamName && stationData) {
            fetchTeamSubmissions(teamId, teamName);
          }
        } catch (err) {
          console.error('Lỗi khi đọc dữ liệu đội sau khi tải trạm:', err);
        }
      }
      
      setError(null);
    } catch (err) {
      setError(`Không thể tải thông tin ${replaceStationTerm('trạm')}. Vui lòng thử lại sau.`);
      console.error('Error fetching station data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm để kiểm tra thông tin lần thử và trạng thái hoàn thành
  const fetchTeamSubmissions = async (teamId, teamName) => {
    try {
      if (!stationId || !teamId || !teamName || !station) {
        console.debug('Thiếu dữ liệu cần thiết để lấy thông tin lần thử:', { stationId, teamId, teamName, hasStation: !!station });
        return;
      }
      
      // Lấy thông tin đội để kiểm tra trạm đã hoàn thành
      const teamResponse = await teamApi.getById(teamId);
      const team = teamResponse.data;
      
      // Kiểm tra xem đội đã hoàn thành trạm này chưa
      const completedStation = team.completedStations?.find(
        station => station.stationId === stationId
      );
      
      if (completedStation) {
        // Đã hoàn thành trạm
        const result = {
          isCorrect: true,
          submission: { score: completedStation.score }
        };
        setSubmissionResult(result);
        
        // Lưu vào localStorage
        saveAttemptInfoToLocalStorage(result, nextAttemptTime);
        return;
      }
      
      // Lấy thông tin về lần thử gần nhất
      const response = await submissionApi.getByTeam(teamName);
      const allSubmissions = response.data.filter(sub => sub.stationId === stationId);
      
      if (allSubmissions.length > 0) {
        // Lấy lần thử gần nhất
        const latestSubmission = allSubmissions.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        )[0];
        
        if (latestSubmission.isCorrect) {
          // Đã trả lời đúng trước đó
          const result = {
            isCorrect: true,
            submission: { score: latestSubmission.score || 10 }
          };
          setSubmissionResult(result);
          
          // Lưu vào localStorage
          saveAttemptInfoToLocalStorage(result, null);
          return;
        } else {
          // Chưa trả lời đúng và có thể còn thời gian chờ
          
          // Tìm chu kỳ thử hiện tại bằng cách tìm lần reset gần nhất
          // (nghĩa là tìm lần submission cuối cùng có nextAttemptAllowed đã qua)
          let submissions = [...allSubmissions];
          submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          // Tìm lần nextAttemptAllowed gần nhất đã qua để xác định chu kỳ hiện tại
          let currentCycleStartIndex = -1;
          for (let i = 0; i < submissions.length; i++) {
            if (submissions[i].nextAttemptAllowed) {
              const cooldownTime = new Date(submissions[i].nextAttemptAllowed);
              const now = new Date();
              
              if (cooldownTime <= now) {
                // Đây là điểm bắt đầu của chu kỳ hiện tại
                currentCycleStartIndex = i;
                break;
              }
            }
          }
          
          // Lọc submissions trong chu kỳ hiện tại
          let currentCycleSubmissions;
          if (currentCycleStartIndex !== -1) {
            // Lấy các submission sau lần reset gần nhất (không bao gồm lần reset đó)
            currentCycleSubmissions = submissions.slice(0, currentCycleStartIndex);
          } else {
            // Nếu không tìm thấy điểm reset nào đã qua, tất cả submissions đều thuộc chu kỳ hiện tại
            currentCycleSubmissions = submissions;
          }
          
          // Kiểm tra thời gian chờ từ lần thử gần nhất
          if (latestSubmission.nextAttemptAllowed) {
            const nextAttemptTime = new Date(latestSubmission.nextAttemptAllowed);
            const now = new Date();
            
            console.debug('Kiểm tra thời gian chờ:', {
              nextAttemptTime: nextAttemptTime.toISOString(),
              now: now.toISOString(),
              isStillWaiting: nextAttemptTime > now
            });
            
            if (nextAttemptTime > now) {
              // Vẫn còn thời gian chờ, đặt thời gian và hiển thị
              const nextAttemptTimeISO = nextAttemptTime.toISOString();
              setNextAttemptTime(nextAttemptTimeISO);
              
              // Cập nhật là hết lần thử trong thời gian chờ
              const waitingResult = {
                isCorrect: false,
                remainingAttempts: 0,
                attemptCount: station.maxAttempts // Đã dùng hết số lần thử
              };
              setSubmissionResult(waitingResult);
              
              console.debug('Đang trong thời gian chờ, đã đặt remainingAttempts = 0');
              
              // Lưu vào localStorage
              saveAttemptInfoToLocalStorage(waitingResult, nextAttemptTimeISO);
              return; // Trả về ngay vì đang trong thời gian chờ
            } else {
              console.debug('Đã hết thời gian chờ, reset lại số lần thử');
              
              // Đã hết thời gian chờ, reset lại số lần thử
              const resetResult = {
                isCorrect: false,
                remainingAttempts: station.maxAttempts,
                attemptCount: 0
              };
              
              setSubmissionResult(resetResult);
              saveAttemptInfoToLocalStorage(resetResult, null);
              return;
            }
          }
          
          // Đếm số lần thử không đúng trong chu kỳ hiện tại
          const attemptCount = currentCycleSubmissions.filter(sub => !sub.isCorrect).length;
          
          console.debug('Số lần thử đã sử dụng trong chu kỳ hiện tại:', attemptCount, 'từ tổng số', currentCycleSubmissions.length, 'lần nộp trong chu kỳ');
          
          // Không có thời gian chờ, tính số lần thử còn lại
          const remainingAttempts = Math.max(0, station.maxAttempts - attemptCount);
          
          console.debug('Tính toán số lần thử còn lại:', remainingAttempts, 'từ', station.maxAttempts, '-', attemptCount);
          
          // Nếu đã hết lần thử, đặt thời gian chờ
          if (remainingAttempts <= 0) {
            console.debug('Đã hết lần thử, tạo thời gian chờ mới');
            
            // Tạo thời gian khóa mới
            const lockTimeMillis = (station.lockTime || 1) * 60 * 1000; 
            const nextAttemptTimeISO = new Date(Date.now() + lockTimeMillis).toISOString();
            setNextAttemptTime(nextAttemptTimeISO);
            
            // Đặt số lần thử còn lại là 0
            const noAttemptsResult = {
              isCorrect: false,
              remainingAttempts: 0,
              attemptCount
            };
            
            setSubmissionResult(noAttemptsResult);
            saveAttemptInfoToLocalStorage(noAttemptsResult, nextAttemptTimeISO);
            
            console.debug('Đã tạo thời gian khóa mới:', nextAttemptTimeISO);
          } else {
            // Còn lần thử, cập nhật thông tin bình thường
            const normalResult = {
              isCorrect: false,
              remainingAttempts,
              attemptCount
            };
            
            setSubmissionResult(normalResult);
            saveAttemptInfoToLocalStorage(normalResult, null);
            
            console.debug('Cập nhật số lần thử còn lại:', remainingAttempts);
          }
        }
      } else if (station) {
        // Chưa có lần thử nào, đặt số lần thử còn lại là max
        const result = {
          isCorrect: false,
          remainingAttempts: station.maxAttempts,
          attemptCount: 0
        };
        setSubmissionResult(result);
        
        // Lưu vào localStorage
        saveAttemptInfoToLocalStorage(result, nextAttemptTime);
      }
    } catch (err) {
      console.error('Lỗi khi lấy thông tin lần thử:', err);
    }
  };

  const handleTeamSelect = (e) => {
    setSelectedTeam(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Hàm mới để lấy nội dung mật thư dựa trên đội được chọn
  const getTeamSpecificContent = () => {
    if (!station) return null;
    
    // Nếu là mật thư chung hoặc không có loại mật thư (tương thích ngược)
    if (!station.messageType || station.messageType === 'common') {
      return {
        content: station.content,
        contentType: station.contentType,
        showText: station.showText !== undefined ? station.showText : (station.contentType === 'text' || station.contentType === 'both'),
        showImage: station.showImage !== undefined ? station.showImage : (station.contentType === 'image' || station.contentType === 'both'),
        showOTT: station.showOTT !== undefined ? station.showOTT : true,
        showNW: station.showNW !== undefined ? station.showNW : true,
        ottContent: station.ottContent || '',
        nwContent: station.nwContent || '',
        fontSize: station.fontSize || '1.05rem',
        fontWeight: station.fontWeight || '500',
        lineHeight: station.lineHeight || '1.5',
        paragraphSpacing: station.paragraphSpacing || '0.8rem',
        correctAnswer: station.correctAnswer || []
      };
    }
    
    // Nếu là mật thư riêng, tìm nội dung tương ứng với đội được chọn
    if (station.messageType === 'individual' && teamName) {
      const teamContent = station.teamSpecificContents?.find(content => 
        content.team === teamName
      );
      
      if (teamContent) {
        console.log('Đã tìm thấy nội dung riêng cho đội:', teamName, teamContent);
        
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
          showText: teamContent.showText !== undefined ? teamContent.showText : (teamContent.contentType === 'text' || teamContent.contentType === 'both'),
          showImage: teamContent.showImage !== undefined ? teamContent.showImage : (teamContent.contentType === 'image' || teamContent.contentType === 'both'),
          showOTT: teamContent.showOTT !== undefined ? teamContent.showOTT : true,
          showNW: teamContent.showNW !== undefined ? teamContent.showNW : true,
          ottContent: teamContent.ottContent || '',
          nwContent: teamContent.nwContent || '',
          fontSize: teamContent.fontSize || station.fontSize || '1.05rem',
          fontWeight: teamContent.fontWeight || station.fontWeight || '500',
          lineHeight: teamContent.lineHeight || station.lineHeight || '1.5',
          paragraphSpacing: teamContent.paragraphSpacing || station.paragraphSpacing || '0.8rem',
          correctAnswer: correctAnswerArray
        };
      } else {
        console.log('Không tìm thấy nội dung riêng cho đội:', teamName, 'trong', station.teamSpecificContents?.length || 0, 'nội dung');
      }
    }
    
    // Mặc định trả về nội dung chung nếu không tìm thấy nội dung riêng
    return {
      content: station.content,
      contentType: station.contentType,
      showText: station.showText !== undefined ? station.showText : (station.contentType === 'text' || station.contentType === 'both'),
      showImage: station.showImage !== undefined ? station.showImage : (station.contentType === 'image' || station.contentType === 'both'),
      showOTT: station.showOTT !== undefined ? station.showOTT : true,
      showNW: station.showNW !== undefined ? station.showNW : true,
      ottContent: station.ottContent || '',
      nwContent: station.nwContent || '',
      fontSize: station.fontSize || '1.05rem',
      fontWeight: station.fontWeight || '500',
      lineHeight: station.lineHeight || '1.5',
      paragraphSpacing: station.paragraphSpacing || '0.8rem',
      correctAnswer: station.correctAnswer || []
    };
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
    
    if (!answer.trim()) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Lấy thông tin đội và nội dung cụ thể (bao gồm cả đáp án)
      const specificContent = getTeamSpecificContent();
      console.log('Kiểm tra đáp án với nội dung đội:', teamName, specificContent);
      
      // Lấy danh sách đáp án đúng từ nội dung cụ thể
      const correctAnswers = Array.isArray(specificContent.correctAnswer) 
        ? specificContent.correctAnswer
        : [specificContent.correctAnswer].filter(Boolean);
      
      console.log('Đáp án chính xác:', correctAnswers);
      
      // Chuẩn hóa câu trả lời
      const normalizedAnswer = answer.trim().toLowerCase().replace(/\s+/g, ' ');
      const normalizedCorrectAnswers = correctAnswers.map(ans => 
        ans?.trim().toLowerCase().replace(/\s+/g, ' ')
      ).filter(Boolean);
      
      const isCorrect = normalizedCorrectAnswers.includes(normalizedAnswer);
      
      // Gọi API check đáp án
      const response = await submissionApi.create({
        stationId,
        teamName,
        answer: normalizedAnswer,
        isCorrect
      });
      
      if (response.data.isCorrect) {
        // Đáp án đúng
        setSubmissionResult({
          isCorrect: true,
          submission: response.data
        });
        
        // Reset form đáp án
        setAnswer('');
        
        // Hiển thị modal chúc mừng
        setShowSuccessModal(true);
      } else {
        // Đáp án sai
        const remainingAttempts = response.data.remainingAttempts;
        const attemptCount = response.data.attemptCount;
        
        console.debug('Server trả về remainingAttempts:', remainingAttempts, 'attemptCount:', attemptCount);
        
        // Đặt kết quả submission
        setSubmissionResult({
          isCorrect: false,
          remainingAttempts,
          attemptCount
        });
        
        // Nếu còn 0 lần thử, đặt thời gian chờ
        if (remainingAttempts <= 0 && station.lockTime > 0) {
          if (response.data.nextAttemptAllowed) {
            setNextAttemptTime(response.data.nextAttemptAllowed);
            console.debug('Đã nhận thời gian khóa từ server:', response.data.nextAttemptAllowed);
          } else {
            // Tạo một thời gian chờ mới nếu chưa có
            const lockTimeMillis = station.lockTime * 60 * 1000;
            const newNextAttemptTime = new Date(Date.now() + lockTimeMillis).toISOString();
            setNextAttemptTime(newNextAttemptTime);
            console.debug('Đã tạo thời gian khóa mới:', newNextAttemptTime);
          }
        } else if (remainingAttempts === 0) {
          // Nếu server trả về 0 lần thử nhưng không có lockTime, vẫn tạo thời gian khóa
          const lockTimeMillis = (station.lockTime || 1) * 60 * 1000;
          const newNextAttemptTime = new Date(Date.now() + lockTimeMillis).toISOString();
          setNextAttemptTime(newNextAttemptTime);
          console.debug('Đặt thời gian khóa mặc định vì remainingAttempts = 0');
        }
        
        // Làm mới danh sách lần thử sau khi gửi đáp án
        if (teamId && teamName) {
          setTimeout(() => {
            fetchTeamSubmissions(teamId, teamName);
          }, 500);
        }
      }
    } catch (err) {
      console.error('Lỗi khi kiểm tra đáp án:', err);
      setError('Có lỗi xảy ra khi kiểm tra đáp án. Vui lòng thử lại.');
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
    setNextAttemptTime(null);
    setTimeLeft(null);
    
    // Xóa thông tin thời gian chờ khỏi localStorage
    localStorage.removeItem('attempt_info');
    
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

  // Cập nhật style của nội dung dựa trên định dạng từ server
  const getContentStyle = (isLastLine = false) => {
    const baseStyle = {
      fontSize: station?.fontSize || '1.05rem', 
      fontWeight: station?.fontWeight || '500',
      lineHeight: station?.lineHeight || '1.5',
      letterSpacing: '0.01em',
    };
    
    return baseStyle;
  };
  
  // Hàm helper để lấy class CSS cho khoảng cách đoạn
  const getParagraphSpacingClass = () => {
    const spacing = station?.paragraphSpacing;
    
    if (!spacing || spacing === '0') return 'paragraph-spacing-none';
    if (spacing === '0.5rem') return 'paragraph-spacing-small';
    if (spacing === '0.8rem') return 'paragraph-spacing-medium';
    if (spacing === '1.2rem') return 'paragraph-spacing-large';
    if (spacing === '1.8rem') return 'paragraph-spacing-xlarge';
    
    // Fallback to medium spacing if unknown value
    return 'paragraph-spacing-medium';
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

  // Hiển thị trang từ chối truy cập nếu đội không thuộc trạm
  if (accessDenied) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Card className="text-center shadow w-100 animate__animated animate__fadeIn" style={{ maxWidth: '500px' }}>
          <Card.Header className="bg-danger text-white">
            <i className="bi bi-shield-exclamation me-2"></i>
            Truy cập bị từ chối
          </Card.Header>
          <Card.Body className="p-5">
            <div className="mb-4 text-danger">
              <i className="bi bi-slash-circle" style={{ fontSize: '3rem' }}></i>
            </div>
            <h2 className="mb-3">Không có quyền truy cập</h2>
            <p className="mb-4">Đội của bạn không thuộc <TermReplacer>{t('station_term')}</TermReplacer> này. Vui lòng liên hệ Ban tổ chức để được hỗ trợ.</p>
            <div className="d-grid gap-2">
              <Button variant="primary" onClick={() => {
                localStorage.removeItem('current_team');
                window.location.reload();
              }}>
                <i className="bi bi-box-arrow-left me-2"></i>
                Đăng xuất
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate('/')}>
                <i className="bi bi-house-door me-2"></i>
                Về trang chủ
              </Button>
            </div>
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

  // Trước khi render nội dung trạm, lấy nội dung cụ thể cho đội
  const teamSpecificContent = getTeamSpecificContent();

  return (
    <Container className="py-3 animate__animated animate__fadeIn" fluid style={{ padding: '0 8px' }}>
      <Row className="justify-content-center mx-0">
        <Col xs={12} md={12} lg={11} xl={10} className="px-0">
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
            <Card.Body className="px-2 py-3">
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
                    {teamSpecificContent && (teamSpecificContent.showText || teamSpecificContent.contentType === 'text' || teamSpecificContent.contentType === 'both') ? (
                      <Card className="station-content mb-3 mx-0" style={{ 
                        borderWidth: '1px',
                        borderRadius: '4px',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.08)',
                        padding: 0,
                        width: '100%'
                      }}>
                        <Card.Body className="p-0">
                          {(teamSpecificContent.ottContent || teamSpecificContent.nwContent) && (teamSpecificContent.showOTT || teamSpecificContent.showNW) ? (
                            <>
                              {teamSpecificContent.ottContent && teamSpecificContent.showOTT && (
                                <div className="mb-2">
                                  <h6 className="fw-bold d-inline-block bg-primary text-white px-3 py-1 rounded-0 mb-0 ms-0 mt-1">OTT:</h6>
                                  <div className="content-text w-100 px-1">
                                    {teamSpecificContent.ottContent.split('\n').map((line, idx) => (
                                      <p 
                                        key={idx} 
                                        className={`content-line ${idx !== teamSpecificContent.ottContent.split('\n').length - 1 ? getParagraphSpacingClass() : ''}`}
                                        style={{ 
                                          ...getContentStyle(),
                                          fontSize: teamSpecificContent.fontSize,
                                          fontWeight: teamSpecificContent.fontWeight,
                                          lineHeight: teamSpecificContent.lineHeight,
                                          marginTop: idx === 0 ? '0' : null
                                        }}
                                      >
                                        {line || ' '}
                                      </p>
                                    ))}
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
                                        className={`content-line ${idx !== teamSpecificContent.nwContent.split('\n').length - 1 ? getParagraphSpacingClass() : ''}`}
                                        style={{ 
                                          ...getContentStyle(),
                                          fontSize: teamSpecificContent.fontSize,
                                          fontWeight: teamSpecificContent.fontWeight,
                                          lineHeight: teamSpecificContent.lineHeight,
                                          marginTop: idx === 0 ? '0' : null
                                        }}
                                      >
                                        {line || ' '}
                                        {idx === teamSpecificContent.nwContent.split('\n').length - 1 && <span className="fw-bold">/AR</span>}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="content-text w-100 px-1">
                              {teamSpecificContent.content && teamSpecificContent.content.split('\n').map((line, idx) => {
                                // Kiểm tra nếu dòng bắt đầu bằng "OTT:" hoặc "NW:"
                                if (line.trim().startsWith('OTT:')) {
                                  return (
                                    <React.Fragment key={idx}>
                                      <h6 className="fw-bold d-inline-block bg-primary text-white px-3 py-1 rounded-0 mb-0 ms-0 mt-1">OTT:</h6>
                                      <p 
                                        className={`content-line ${getParagraphSpacingClass()}`}
                                        style={{ 
                                          ...getContentStyle(),
                                          fontSize: teamSpecificContent.fontSize,
                                          fontWeight: teamSpecificContent.fontWeight,
                                          lineHeight: teamSpecificContent.lineHeight,
                                          marginTop: '0'
                                        }}
                                      >
                                        {line.replace('OTT:', '').trim() || ' '}
                                      </p>
                                    </React.Fragment>
                                  );
                                } else if (line.trim().startsWith('NW:')) {
                                  return (
                                    <React.Fragment key={idx}>
                                      <h6 className="fw-bold d-inline-block bg-primary text-white px-3 py-1 rounded-0 mb-0 ms-0">NW:</h6>
                                      <p 
                                        className={`content-line ${getParagraphSpacingClass()}`}
                                        style={{ 
                                          ...getContentStyle(),
                                          fontSize: teamSpecificContent.fontSize,
                                          fontWeight: teamSpecificContent.fontWeight,
                                          lineHeight: teamSpecificContent.lineHeight,
                                          marginTop: '0'
                                        }}
                                      >
                                        {line.replace('NW:', '').trim() || ' '}
                                      </p>
                                    </React.Fragment>
                                  );
                                } else if (line.includes('/AR')) {
                                  return (
                                    <p 
                                      key={idx} 
                                      className="content-line"
                                      style={{ 
                                        ...getContentStyle(),
                                        fontSize: teamSpecificContent.fontSize,
                                        fontWeight: teamSpecificContent.fontWeight,
                                        lineHeight: teamSpecificContent.lineHeight
                                      }}
                                      >
                                        {line || ' '}
                                        {idx === teamSpecificContent.nwContent.split('\n').length - 1 && <span className="fw-bold">/AR</span>}
                                      </p>
                                  );
                                } else {
                                  return (
                                    <p 
                                      key={idx} 
                                      className={`content-line ${idx !== teamSpecificContent.content.split('\n').length - 1 ? getParagraphSpacingClass() : ''}`}
                                      style={{ 
                                        ...getContentStyle(),
                                        fontSize: teamSpecificContent.fontSize,
                                        fontWeight: teamSpecificContent.fontWeight,
                                        lineHeight: teamSpecificContent.lineHeight
                                      }}
                                    >
                                      {line || ' '}
                                    </p>
                                  );
                                }
                              })}
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    ) : null}
                    
                    {/* Nội dung hình ảnh */}
                    {teamSpecificContent && (teamSpecificContent.showImage || teamSpecificContent.contentType === 'image' || teamSpecificContent.contentType === 'both') && (teamSpecificContent.content || teamSpecificContent.imageUrl) ? (
                      <div className="text-center mb-3">
                        <img 
                          src={teamSpecificContent.imageUrl || (teamSpecificContent.content && teamSpecificContent.content.startsWith('/api/') 
                            ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${teamSpecificContent.content}`
                            : teamSpecificContent.content)
                          }
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
                        as="textarea"
                        rows={4}
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
                      ) : nextAttemptTime ? (
                        <Alert variant="warning" className="d-flex align-items-start">
                          <i className="bi bi-hourglass-split me-2 mt-1" style={{ fontSize: '1.5rem' }}></i>
                          <div>
                            <div className="mb-1"><strong>Đã hết lần thử!</strong></div>
                            <div>
                              <span className="me-3 badge bg-warning text-dark px-2 py-1 mb-1">
                                <i className="bi bi-clock-history me-1"></i>
                                Khi hết thời gian chờ, bạn sẽ có {station.maxAttempts} lần thử mới.
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
                                Đã hết lần thử! Đang chuẩn bị khóa trong {station.lockTime} phút.
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
                        <Alert variant="info" className="d-flex align-items-center">
                          <i className="bi bi-info-circle-fill me-2" style={{ fontSize: '1.5rem' }}></i>
                          <div>
                            <strong>Nhập đáp án của bạn</strong> - Bạn có <strong className="badge bg-info">{submissionResult.remainingAttempts}</strong> lần thử
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
        backdrop="static"
        keyboard={false}
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