import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Image,
  Spinner,
  Row,
  Col,
  Badge,
  Modal,
} from "react-bootstrap";
import { stationApi, teamApi, submissionApi } from "../../services/api";
import { replaceStationTerm } from "../../utils/helpers";
import TermReplacer from "../../utils/TermReplacer";
import { useSystemSettings } from "../../context/SystemSettingsContext";
import { useLanguage } from "../../context/LanguageContext";
import "./UserStation.css";

const TeamWaitingPage = () => {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const { getAdminSettings } = useSystemSettings();
  const { t } = useLanguage();

  const [activeStation, setActiveStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [answer, setAnswer] = useState("");
  const [submissionResult, setSubmissionResult] = useState(null);
  const [loggedInTeam, setLoggedInTeam] = useState(null);
  const [statusCheckerInterval, setStatusCheckerInterval] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [nextAttemptTime, setNextAttemptTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [alreadyLoggedInError, setAlreadyLoggedInError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [forceLogoutMessage, setForceLogoutMessage] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('inactive');
  const checkSessionIntervalRef = useRef(null);
  
  // Thêm biến refs để theo dõi hoạt động người dùng
  const lastActivityTimeRef = useRef(Date.now());
  const inactivityTimerRef = useRef(null);

  // Hàm lưu thông tin lần thử vào localStorage
  const saveAttemptInfoToLocalStorage = (submissionResult, nextAttemptTime) => {
    if (!loggedInTeam || !activeStation) return;

    const attemptInfo = {
      submissionResult,
      nextAttemptTime,
      stationId: activeStation._id,
      teamId: loggedInTeam.teamId,
    };

    localStorage.setItem(
      `attempt_info_${adminId}_${activeStation._id}`,
      JSON.stringify(attemptInfo),
    );
  };

  // Hàm bắt đầu kiểm tra phiên đăng nhập định kỳ
  const startSessionCheck = (teamId, sessionId) => {
    // Xóa interval cũ nếu có
    if (checkSessionIntervalRef.current) {
      clearInterval(checkSessionIntervalRef.current);
    }

    // Kiểm tra ngay lập tức một lần khi bắt đầu
    teamApi.getById(teamId).then(response => {
      if (!response || !response.data) {
        console.warn("Không nhận được dữ liệu hợp lệ từ server khi khởi tạo kiểm tra phiên");
        return;
      }
      
      const team = response.data;
      
      // Kiểm tra xem phiên đăng nhập còn hợp lệ không
      if (!team.sessionId || team.sessionId !== sessionId) {
        // Hiển thị thông báo đã bị đăng xuất
        setForceLogoutMessage("Tài khoản của bạn đã được đăng xuất bởi quản trị viên");
        
        // Xóa thông tin đội khỏi localStorage
        localStorage.removeItem("team_waiting_" + adminId);
        
        // Đặt lại trạng thái sau 3 giây
        setTimeout(() => {
          resetForm();
          setForceLogoutMessage(null);
        }, 3000);
        return; // Dừng không cần tạo interval
      }
    }).catch(err => {
      console.error("Lỗi khi kiểm tra phiên đăng nhập:", err);
    });

    // Tạo một interval mới để kiểm tra định kỳ
    checkSessionIntervalRef.current = setInterval(async () => {
      try {
        // Gọi API kiểm tra thông tin đội chơi
        const response = await teamApi.getById(teamId);
        if (!response || !response.data) {
          console.warn("Không nhận được dữ liệu hợp lệ từ server khi kiểm tra phiên");
          return;
        }
        
        const team = response.data;

        // Kiểm tra xem phiên đăng nhập còn hợp lệ không
        if (!team.sessionId || team.sessionId !== sessionId) {
          // Hiển thị thông báo đã bị đăng xuất
          setForceLogoutMessage("Tài khoản của bạn đã được đăng xuất bởi quản trị viên");

          // Xóa thông tin đội khỏi localStorage
          localStorage.removeItem("team_waiting_" + adminId);

          // Dừng interval kiểm tra phiên
          clearInterval(checkSessionIntervalRef.current);
          checkSessionIntervalRef.current = null;

          // Đặt lại trạng thái sau 3 giây
          setTimeout(() => {
            resetForm();
            setForceLogoutMessage(null);
          }, 3000);
        } else {
          // Cập nhật trạng thái thành active nếu đang ở tab này
          if (!document.hidden) {
            teamApi.updateStatus(teamId, { 
              status: 'active',
              sessionId: sessionId
            }).catch(err => 
              console.error('Error updating active status in interval:', err)
            );
          }
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra phiên đăng nhập:", err);
      }
    }, 5000); // Kiểm tra mỗi 5 giây thay vì 3 giây
  };

  // Hàm đọc thông tin lần thử từ localStorage
  const loadAttemptInfoFromLocalStorage = () => {
    if (!loggedInTeam || !activeStation) return null;

    try {
      const attemptInfoStr = localStorage.getItem(
        `attempt_info_${adminId}_${activeStation._id}`,
      );
      if (!attemptInfoStr) return null;

      const attemptInfo = JSON.parse(attemptInfoStr);
      return attemptInfo;
    } catch (err) {
      console.error("Lỗi khi đọc thông tin lần thử từ localStorage:", err);
      return null;
    }
  };

  // Hiệu ứng khởi tạo
  useEffect(() => {
    // Biến để theo dõi lỗi kết nối
    let connectionErrorTimer = null;
    let connectionErrors = 0;
    
    // Bắt các lỗi không xử lý
    const handleGlobalError = (event) => {
      if (event.message && event.message.includes('Could not establish connection')) {
        console.warn('Phát hiện lỗi kết nối extension:', event.message);
        
        // Đếm số lỗi kết nối liên tiếp
        connectionErrors++;
        
        // Nếu đã có hẹn giờ, xóa đi để tạo mới
        if (connectionErrorTimer) {
          clearTimeout(connectionErrorTimer);
        }
        
        // Hẹn giờ để reset sau 5 giây nếu không có lỗi mới
        connectionErrorTimer = setTimeout(() => {
          connectionErrors = 0;
          connectionErrorTimer = null;
        }, 5000);
        
        // Ngăn lỗi hiển thị trong console
        event.preventDefault();
        
        return true; // Đã xử lý lỗi
      }
    };
    
    // Đăng ký bắt lỗi toàn cục
    window.addEventListener('error', handleGlobalError);
    
    // Khôi phục thông tin đội đã đăng nhập từ localStorage
    const savedTeamData = localStorage.getItem("team_waiting_" + adminId);
    if (savedTeamData) {
      try {
        const teamData = JSON.parse(savedTeamData);
        setLoggedInTeam(teamData);
        
        // Kiểm tra xem có đầy đủ thông tin không
        if (teamData.teamId && teamData.sessionId) {
          // Bắt đầu kiểm tra trạng thái phiên đăng nhập
          startSessionCheck(teamData.teamId, teamData.sessionId);
          
          // Bắt đầu theo dõi hoạt động người dùng để phát hiện trạng thái không hoạt động
          startInactivityTracking(teamData.teamId, teamData.sessionId);
        } else {
          console.warn("Thông tin đội trong localStorage không đầy đủ:", teamData);
          // Xóa thông tin không hợp lệ
          localStorage.removeItem("team_waiting_" + adminId);
        }
      } catch (err) {
        console.error("Lỗi khi phân tích dữ liệu đội đã lưu:", err);
        // Xóa thông tin không hợp lệ
        localStorage.removeItem("team_waiting_" + adminId);
      }
    }
    
    // Khôi phục thông tin trạm đang hoạt động nếu có
    checkActiveStation();
    
    // Thiết lập bộ kiểm tra trạng thái để cập nhật thông tin trạm
    const interval = setInterval(() => {
      checkActiveStation();
    }, 5000); // Kiểm tra mỗi 5 giây thay vì 15 giây
    
    setStatusCheckerInterval(interval);
    
    // Theo dõi sự kiện sao chép, ẩn tab và thoát
    const copyHandler = (e) => {
      console.debug('Sự kiện copy được kích hoạt');
      handleCopy(e);
    };
    
    document.addEventListener('copy', copyHandler);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Đảm bảo sự kiện copy được bắt mạnh mẽ hơn
    document.onselectionchange = () => {
      if (window.getSelection().toString().length > 0) {
        console.debug('Văn bản được chọn:', window.getSelection().toString().substring(0, 20) + '...');
        
        // Thêm event listener tạm thời cho Ctrl+C và Cmd+C
        const handleKeyDown = (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            console.debug('Phát hiện tổ hợp phím Ctrl+C/Cmd+C');
            copyHandler(e);
            
            // Xóa listener sau khi đã xử lý
            document.removeEventListener('keydown', handleKeyDown);
          }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        
        // Xóa listener sau 5 giây nếu không được kích hoạt
        setTimeout(() => {
          document.removeEventListener('keydown', handleKeyDown);
        }, 5000);
      }
    };
    
    // Thêm một context menu custom để bắt sự kiện copy bằng chuột phải
    document.addEventListener('contextmenu', (e) => {
      const selection = window.getSelection().toString();
      if (selection && selection.length > 0) {
        console.debug('Phát hiện contextmenu trên văn bản đã chọn');
        // Không cần ngăn chặn menu ngữ cảnh mặc định, chỉ theo dõi
      }
    });
    
    // Xóa interval khi component bị hủy
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      
      // Xóa interval kiểm tra phiên
      if (checkSessionIntervalRef.current) {
        clearInterval(checkSessionIntervalRef.current);
      }
      
      // Dừng theo dõi hoạt động người dùng
      stopInactivityTracking();
      
      // Xóa các event listener khi component unmount
      document.removeEventListener('copy', copyHandler);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('error', handleGlobalError);
      document.onselectionchange = null;
      
      // Cập nhật trạng thái khi thoát trang
      if (loggedInTeam && loggedInTeam.teamId) {
        teamApi.updateStatus(loggedInTeam.teamId, { 
          status: "exited",
          sessionId: loggedInTeam.sessionId 
        }).catch((err) => 
          console.error("Error updating team status:", err)
        );
      }
      
      // Xóa timer xử lý lỗi kết nối nếu có
      if (connectionErrorTimer) {
        clearTimeout(connectionErrorTimer);
      }
    };
  }, [adminId]);

  // Hiệu ứng khi activeStation hoặc loggedInTeam thay đổi
  useEffect(() => {
    // Nếu đã có trạm đang hoạt động và đã đăng nhập, kiểm tra thông tin lần thử từ localStorage
    if (activeStation && loggedInTeam) {
      // Đọc thông tin lần thử từ localStorage
      const attemptInfo = loadAttemptInfoFromLocalStorage();
      if (attemptInfo) {
        console.log(
          "Đã tìm thấy thông tin lần thử từ localStorage:",
          attemptInfo,
        );

        // Khôi phục thông tin số lần thử
        if (attemptInfo.submissionResult) {
          setSubmissionResult(attemptInfo.submissionResult);
        }

        // Khôi phục thông tin thời gian đợi nếu còn hợp lệ
        if (attemptInfo.nextAttemptTime) {
          const nextAttemptTime = new Date(attemptInfo.nextAttemptTime);
          const now = new Date();

          if (nextAttemptTime > now) {
            // Thời gian đợi còn hợp lệ, khôi phục
            setNextAttemptTime(attemptInfo.nextAttemptTime);
            console.log(
              "Khôi phục thời gian đợi:",
              attemptInfo.nextAttemptTime,
            );
          } else {
            // Đã hết thời gian đợi, reset
            if (activeStation) {
              console.log("Đã hết thời gian đợi, reset số lần thử");
              const resetResult = {
                isCorrect: false,
                remainingAttempts: activeStation.maxAttempts,
                attemptCount: 0,
              };
              setSubmissionResult(resetResult);
              setNextAttemptTime(null);

              // Cập nhật localStorage
              saveAttemptInfoToLocalStorage(resetResult, null);
            }
          }
        }
      }
    }
  }, [activeStation, loggedInTeam, adminId]);

  // Kiểm tra xem có trạm nào đang hoạt động không
  const checkActiveStation = async () => {
    if (isCheckingStatus) return; // Tránh gọi nhiều lần cùng lúc

    try {
      setIsCheckingStatus(true);

      // Kiểm tra trạm đang hoạt động từ localStorage đầu tiên (để hiển thị nhanh)
      const activeStationId = localStorage.getItem("admin_active_station");

      // Ưu tiên gọi API để kiểm tra trạng thái thực tế từ server
      try {
        // Cố gắng gọi API để lấy trạm hoạt động của admin này
        const response = await stationApi.getActiveStationByAdmin(adminId);
        if (response && response.data) {
          setActiveStation(response.data);
          setError(null);

          // Cập nhật localStorage để đồng bộ với server
          localStorage.setItem("admin_active_station", response.data._id);
          localStorage.setItem(
            "admin_active_station_data",
            JSON.stringify(response.data),
          );
          return;
        } else if (response && response.data === null) {
          // Server trả về null, tức là không có trạm nào đang hoạt động
          setActiveStation(null);
          localStorage.removeItem("admin_active_station");
          localStorage.removeItem("admin_active_station_data");
          return;
        }
      } catch (apiErr) {
        console.warn(
          "Không thể kết nối đến API, chuyển sang sử dụng dữ liệu localStorage:",
          apiErr,
        );
        // Nếu API lỗi, sử dụng dữ liệu từ localStorage
      }

      // Nếu API không thành công, dùng dữ liệu từ localStorage
      if (activeStationId) {
        const savedStationData = localStorage.getItem(
          "admin_active_station_data",
        );

        if (savedStationData) {
          try {
            const stationData = JSON.parse(savedStationData);
            setActiveStation(stationData);
            setError(null);
          } catch (parseErr) {
            console.error("Lỗi khi phân tích dữ liệu trạm đã lưu:", parseErr);
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
              localStorage.setItem(
                "admin_active_station_data",
                JSON.stringify(response.data),
              );
              setError(null);
            } else {
              setActiveStation(null);
              localStorage.removeItem("admin_active_station");
            }
          } catch (apiErr) {
            console.error("Lỗi khi lấy thông tin trạm từ API:", apiErr);
            setActiveStation(null);
          }
        }
      } else {
        // Không có trạm nào đang hoạt động
        setActiveStation(null);
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra trạm hoạt động:", err);
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsCheckingStatus(false);
      setLoading(false);
    }
  };

  // Xử lý đăng nhập đội
  const handleTeamLogin = async (e) => {
    e.preventDefault();

    if (!teamName || !password) {
      setError("Vui lòng nhập tên đội và mật khẩu");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setAlreadyLoggedInError(null);

      const response = await teamApi.verifyPassword({
        teamName,
        password,
      });

      if (response.data.success) {
        const teamData = {
          teamName,
          teamId: response.data.teamId,
          sessionId: response.data.sessionId,
        };

        // Lưu thông tin đội vào localStorage
        localStorage.setItem(
          "team_waiting_" + adminId,
          JSON.stringify(teamData),
        );

        // Đăng ký đội này với trạm chờ của admin
        try {
          // Thông báo cho admin rằng đội này đã đăng nhập
          const existingTeams = localStorage.getItem("admin_logged_in_teams");
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
          const existingTeamIndex = teamsArray.findIndex(
            (team) => team.teamId === teamData.teamId,
          );
          if (existingTeamIndex === -1) {
            // Thêm đội mới vào danh sách
            teamsArray.push(teamData);
          } else {
            // Cập nhật thông tin đội đã tồn tại
            teamsArray[existingTeamIndex] = teamData;
          }

          // Lưu danh sách đội đã cập nhật
          localStorage.setItem(
            "admin_logged_in_teams",
            JSON.stringify(teamsArray),
          );
        } catch (err) {
          console.error("Lỗi khi đăng ký đội với trang chờ admin:", err);
        }

        // Cập nhật trạng thái
        setLoggedInTeam(teamData);

        // Reset form
        setTeamName("");
        setPassword("");
        setError(null);

        // Kiểm tra ngay trạng thái trạm
        checkActiveStation();
        
        // Cập nhật trạng thái team thành active
        setCurrentStatus('active');
        
        try {
          await teamApi.updateStatus(response.data.teamId, { 
            status: 'active',
            sessionId: response.data.sessionId 
          });
          console.debug('Đã cập nhật trạng thái active sau khi đăng nhập');
        } catch (err) {
          console.error('Lỗi khi cập nhật trạng thái active sau đăng nhập:', err);
        }

        // Bắt đầu kiểm tra phiên đăng nhập
        startSessionCheck(response.data.teamId, response.data.sessionId);
        
        // Bắt đầu theo dõi hoạt động người dùng để phát hiện trạng thái không hoạt động
        startInactivityTracking(response.data.teamId, response.data.sessionId);
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.alreadyLoggedIn) {
        setAlreadyLoggedInError({
          message: err.response.data.message,
          deviceInfo: err.response.data.deviceInfo,
        });
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm reset form và trạng thái
  const resetForm = () => {
    setTeamName("");
    setPassword("");
    setLoggedInTeam(null);
    setSubmissionResult(null);
    setNextAttemptTime(null);
    setTimeLeft(null);

    // Dừng interval kiểm tra phiên
    if (checkSessionIntervalRef.current) {
      clearInterval(checkSessionIntervalRef.current);
      checkSessionIntervalRef.current = null;
    }
    
    // Dừng theo dõi hoạt động người dùng
    stopInactivityTracking();
  };

  // Hiển thị modal xác nhận đăng xuất
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      // Cập nhật trạng thái hiện tại 
      setCurrentStatus('exited');
      
      // Gọi API đăng xuất nếu có teamId và sessionId
      if (loggedInTeam && loggedInTeam.teamId && loggedInTeam.sessionId) {
        await teamApi.logout({
          teamId: loggedInTeam.teamId,
          sessionId: loggedInTeam.sessionId,
        });
        
        // Cập nhật trạng thái để đảm bảo server biết đội đã đăng xuất
        try {
          await teamApi.updateStatus(loggedInTeam.teamId, { 
            status: 'exited',
            sessionId: loggedInTeam.sessionId 
          });
          console.debug('Đã cập nhật trạng thái exited khi đăng xuất');
        } catch (statusErr) {
          console.error('Lỗi khi cập nhật trạng thái exited khi đăng xuất:', statusErr);
        }
      }

      // Xóa thông tin đội khỏi localStorage
      localStorage.removeItem("team_waiting_" + adminId);

      // Xóa đội khỏi danh sách đội đã đăng nhập
      try {
        const existingTeams = localStorage.getItem("admin_logged_in_teams");
        if (existingTeams) {
          try {
            let teamsArray = JSON.parse(existingTeams);
            if (Array.isArray(teamsArray) && loggedInTeam) {
              // Lọc bỏ đội hiện tại
              teamsArray = teamsArray.filter(
                (team) => team.teamId !== loggedInTeam.teamId,
              );
              localStorage.setItem(
                "admin_logged_in_teams",
                JSON.stringify(teamsArray),
              );
            }
          } catch (err) {
            console.error("Lỗi khi cập nhật danh sách đội đã đăng nhập:", err);
          }
        }
      } catch (err) {
        console.error("Lỗi khi hủy đăng ký đội với trang chờ admin:", err);
      }

      // Dừng interval kiểm tra phiên đăng nhập
      if (checkSessionIntervalRef.current) {
        clearInterval(checkSessionIntervalRef.current);
        checkSessionIntervalRef.current = null;
      }
      
      // Dừng theo dõi hoạt động người dùng
      stopInactivityTracking();

      // Reset trạng thái
      resetForm();
      setShowLogoutModal(false);
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);

      // Vẫn xóa thông tin cục bộ ngay cả khi API bị lỗi
      localStorage.removeItem("team_waiting_" + adminId);
      
      // Dừng interval kiểm tra phiên đăng nhập
      if (checkSessionIntervalRef.current) {
        clearInterval(checkSessionIntervalRef.current);
        checkSessionIntervalRef.current = null;
      }
      
      // Dừng theo dõi hoạt động người dùng
      stopInactivityTracking();
      
      resetForm();
      setShowLogoutModal(false);
    }
  };

  // Hủy đăng xuất
  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Hàm lấy nội dung mật thư dựa trên đội được chọn
  const getTeamSpecificContent = () => {
    if (!activeStation) return null;

    // Nếu là mật thư riêng và đã đăng nhập với tên đội
    if (activeStation.messageType === "individual" && loggedInTeam?.teamName) {
      const teamContent = activeStation.teamSpecificContents?.find(
        (content) => content.team === loggedInTeam.teamName,
      );

      if (teamContent) {
        console.log(
          "Đã tìm thấy nội dung riêng cho đội:",
          loggedInTeam.teamName,
          teamContent,
        );

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
          showText:
            teamContent.showText !== undefined ? teamContent.showText : true,
          showImage:
            teamContent.showImage !== undefined ? teamContent.showImage : false,
          showOTT:
            teamContent.showOTT !== undefined ? teamContent.showOTT : true,
          showNW: teamContent.showNW !== undefined ? teamContent.showNW : true,
          ottContent: teamContent.ottContent || "",
          nwContent: teamContent.nwContent || "",
          fontSize: teamContent.fontSize || activeStation.fontSize || "1.05rem",
          fontWeight:
            teamContent.fontWeight || activeStation.fontWeight || "500",
          lineHeight:
            teamContent.lineHeight || activeStation.lineHeight || "1.5",
          paragraphSpacing:
            teamContent.paragraphSpacing ||
            activeStation.paragraphSpacing ||
            "0.8rem",
          correctAnswer: correctAnswerArray,
          // Chuyển đổi content thành image nếu cần thiết
          image: teamContent.content,
        };
      } else {
        console.log(
          "Không tìm thấy nội dung riêng cho đội:",
          loggedInTeam.teamName,
        );
      }
    }

    // Sử dụng nội dung mặc định của trạm nếu không có nội dung riêng hoặc không phải mật thư riêng
    return {
      content: activeStation.content,
      contentType: activeStation.contentType,
      showText:
        activeStation.showText !== undefined ? activeStation.showText : true,
      showImage:
        activeStation.showImage !== undefined ? activeStation.showImage : false,
      showOTT:
        activeStation.showOTT !== undefined ? activeStation.showOTT : true,
      showNW: activeStation.showNW !== undefined ? activeStation.showNW : true,
      ottContent: activeStation.ottContent || "",
      nwContent: activeStation.nwContent || "",
      fontSize: activeStation.fontSize || "1.05rem",
      fontWeight: activeStation.fontWeight || "500",
      lineHeight: activeStation.lineHeight || "1.5",
      paragraphSpacing: activeStation.paragraphSpacing || "0.8rem",
      correctAnswer: activeStation.correctAnswer || [],
      image: activeStation.content, // Chuyển đổi content thành image
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
        ? Array.isArray(teamSpecificContent.correctAnswer)
          ? teamSpecificContent.correctAnswer
          : [teamSpecificContent.correctAnswer].filter(Boolean)
        : Array.isArray(activeStation.correctAnswer)
          ? activeStation.correctAnswer
          : [activeStation.correctAnswer].filter(Boolean);

      // Chuẩn hóa đáp án
      const normalizedAnswer = answer.trim().toLowerCase().replace(/\s+/g, " ");
      const normalizedCorrectAnswers = correctAnswers
        .map((ans) => ans?.trim().toLowerCase().replace(/\s+/g, " "))
        .filter(Boolean);

      const isCorrect = normalizedCorrectAnswers.includes(normalizedAnswer);

      // Gửi đáp án
      const response = await submissionApi.create({
        stationId: activeStation._id,
        teamName: loggedInTeam.teamName,
        answer: normalizedAnswer,
      });

      // Đặt kết quả
      if (response.data.isCorrect) {
        const successResult = {
          isCorrect: true,
          submission: response.data,
        };
        setSubmissionResult(successResult);

        // Lưu kết quả vào localStorage
        saveAttemptInfoToLocalStorage(successResult, null);

        // Reset trường đáp án
        setAnswer("");
      } else {
        const remainingAttempts = response.data.remainingAttempts;
        const attemptCount = response.data.attemptCount;

        // Đặt kết quả submission
        const failResult = {
          isCorrect: false,
          remainingAttempts,
          attemptCount,
        };
        setSubmissionResult(failResult);

        // Nếu còn 0 lần thử, đặt thời gian chờ
        let newNextAttemptTime = null;
        if (remainingAttempts <= 0 && activeStation.lockTime > 0) {
          if (response.data.nextAttemptAllowed) {
            newNextAttemptTime = response.data.nextAttemptAllowed;
            setNextAttemptTime(newNextAttemptTime);
          } else {
            // Tạo một thời gian chờ mới nếu chưa có
            const lockTimeMillis = activeStation.lockTime * 60 * 1000;
            newNextAttemptTime = new Date(
              Date.now() + lockTimeMillis,
            ).toISOString();
            setNextAttemptTime(newNextAttemptTime);
          }
        }

        // Lưu kết quả và thời gian chờ vào localStorage
        saveAttemptInfoToLocalStorage(failResult, newNextAttemptTime);
      }
    } catch (err) {
      console.error("Lỗi khi gửi đáp án:", err);
      setError("Có lỗi xảy ra khi kiểm tra đáp án. Vui lòng thử lại.");
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
            attemptCount: 0,
          };

          setSubmissionResult(newSubmissionResult);

          // Lưu thông tin vào localStorage
          saveAttemptInfoToLocalStorage(newSubmissionResult, null);
        }
      } else {
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        setTimeLeft(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextAttemptTime, activeStation]);

  // Xử lý khi tab bị ẩn hoặc hiện
  const handleVisibilityChange = () => {
    // Kiểm tra kỹ xem đã đăng nhập và có đầy đủ thông tin cần thiết chưa
    if (!loggedInTeam || !loggedInTeam.teamId || !loggedInTeam.sessionId) {
      console.debug("Không thể cập nhật trạng thái: thiếu teamId hoặc sessionId");
      return;
    }
    
    // Log rõ ràng về trạng thái hiện tại của document.hidden và thời gian
    console.debug(`VisibilityChange triggered at ${new Date().toISOString()}, document.hidden: ${document.hidden}`);
    
    if (document.hidden) {
      // Trạng thái "Ẩn tab" khi người dùng chuyển sang tab khác
      console.debug("Tab bị ẩn, cập nhật trạng thái hidden cho đội:", loggedInTeam.teamId);
      
      // Cập nhật trạng thái hiện tại 
      setCurrentStatus('hidden');
      
      // Xác định nguyên nhân tab bị ẩn (nếu có thể)
      let hiddenReason = 'unknown';
      try {
        // Cố gắng xác định nguyên nhân dựa trên URL hiện tại
        const currentURL = window.location.href;
        if (currentURL.includes('/home') || currentURL.includes('/dashboard')) {
          hiddenReason = 'navigated_to_home';
        }
      } catch (err) {
        console.error('Không thể xác định nguyên nhân ẩn tab:', err);
      }
      
      // Quay trở lại sử dụng teamApi để đảm bảo nhất quán với các trạng thái khác
      teamApi.updateStatus(loggedInTeam.teamId, { 
        status: 'hidden',
        sessionId: loggedInTeam.sessionId,
        reason: hiddenReason,
        timestamp: new Date().toISOString()
      }).then(() => {
        console.debug('Đã cập nhật trạng thái hidden thành công');
      }).catch(err => {
        console.error('Error updating hidden status:', err);
        
        // Vẫn sử dụng phương pháp dự phòng nếu API gọi thất bại
        try {
          const apiBase = process.env.NODE_ENV === 'production' 
            ? (process.env.REACT_APP_API_URL || 'https://giaolien-backend-c7ca8074e9c5.herokuapp.com')
            : (process.env.REACT_APP_API_URL || 'http://localhost:5000');
            
          const endpoint = `${apiBase}/api/teams/${loggedInTeam.teamId}/status`;
          
          const blob = new Blob([JSON.stringify({
            status: 'hidden',
            sessionId: loggedInTeam.sessionId,
            reason: hiddenReason,
            timestamp: new Date().toISOString(),
            retry: true
          })], { type: 'application/json' });
          
          navigator.sendBeacon(endpoint, blob);
          console.debug('Đã gửi beacon để cập nhật trạng thái hidden');
        } catch (beaconErr) {
          console.error('Lỗi khi gửi beacon cho trạng thái hidden:', beaconErr);
        }
      });
    } else {
      // Trạng thái "Đang hoạt động" khi người dùng quay lại tab
      console.debug("Tab được hiện, cập nhật trạng thái active cho đội:", loggedInTeam.teamId);
      
      // Cập nhật trạng thái hiện tại 
      setCurrentStatus('active');
      
      // Quay trở lại sử dụng teamApi để đảm bảo nhất quán với các trạng thái khác
      teamApi.updateStatus(loggedInTeam.teamId, { 
        status: 'active',
        sessionId: loggedInTeam.sessionId,
        timestamp: new Date().toISOString(),
        returnedFrom: 'hidden'
      }).then(() => {
        console.debug('Đã cập nhật trạng thái active thành công');
        // Cập nhật lại thời gian hoạt động cuối cùng
        lastActivityTimeRef.current = Date.now();
      }).catch(err => {
        console.error('Error updating active status:', err);
        
        // Vẫn sử dụng phương pháp dự phòng nếu API gọi thất bại
        try {
          const apiBase = process.env.NODE_ENV === 'production' 
            ? (process.env.REACT_APP_API_URL || 'https://giaolien-backend-c7ca8074e9c5.herokuapp.com')
            : (process.env.REACT_APP_API_URL || 'http://localhost:5000');
            
          const endpoint = `${apiBase}/api/teams/${loggedInTeam.teamId}/status`;
          
          const blob = new Blob([JSON.stringify({
            status: 'active',
            sessionId: loggedInTeam.sessionId,
            timestamp: new Date().toISOString(),
            returnedFrom: 'hidden',
            retry: true
          })], { type: 'application/json' });
          
          navigator.sendBeacon(endpoint, blob);
          console.debug('Đã gửi beacon để cập nhật trạng thái active');
        } catch (beaconErr) {
          console.error('Lỗi khi gửi beacon cho trạng thái active:', beaconErr);
        }
      });
    }
  };

  // Xử lý khi người dùng sao chép nội dung
  const handleCopy = (e) => {
    if (!loggedInTeam || !loggedInTeam.teamId || !loggedInTeam.sessionId) {
      console.debug("Không thể cập nhật trạng thái sao chép: thiếu teamId hoặc sessionId");
      return;
    }
    
    const selectedText = window.getSelection().toString();
    if (selectedText && selectedText.length > 0) {
      // Kiểm tra xem phần tử đang được sao chép có phải là trường nhập đáp án không
      const answerTextarea = document.querySelector('textarea[placeholder="Nhập đáp án của bạn"]');
      const activeElement = document.activeElement;
      const isCopyingFromAnswer = answerTextarea && (activeElement === answerTextarea || 
                                  answerTextarea.contains(document.getSelection().anchorNode));
      
      console.debug('Đang cập nhật trạng thái sao chép cho đội:', loggedInTeam.teamId, 
                   'Nội dung:', selectedText.substring(0, 50),
                   'Từ trường đáp án:', isCopyingFromAnswer);
      
      // Cập nhật trạng thái hiện tại 
      setCurrentStatus('copied');
      
      // Quay trở lại sử dụng teamApi để đảm bảo nhất quán với các trạng thái khác
      teamApi.updateStatus(loggedInTeam.teamId, { 
        status: 'copied', 
        content: selectedText,
        sessionId: loggedInTeam.sessionId,
        fromAnswerField: isCopyingFromAnswer,
        timestamp: new Date().toISOString()
      }).then(() => {
        console.debug('Đã cập nhật trạng thái sao chép thành công');
        
        // Đặt hẹn giờ để chuyển về trạng thái active sau 3 giây
        setTimeout(() => {
          if (document.hidden) return; // Nếu tab đang ẩn, không cập nhật
          
          // Cập nhật trạng thái UI
          setCurrentStatus('active');
          
          // Cập nhật trạng thái lên server
          teamApi.updateStatus(loggedInTeam.teamId, {
            status: 'active',
            sessionId: loggedInTeam.sessionId,
            timestamp: new Date().toISOString(),
            returnedFrom: 'copied'
          }).catch(err => console.error('Lỗi khi cập nhật lại trạng thái sau sao chép:', err));
        }, 3000);
      }).catch(err => {
        console.error('Error updating copy status:', err);
        
        // Vẫn sử dụng phương pháp dự phòng nếu API gọi thất bại
        try {
          const apiBase = process.env.NODE_ENV === 'production' 
            ? (process.env.REACT_APP_API_URL || 'https://giaolien-backend-c7ca8074e9c5.herokuapp.com')
            : (process.env.REACT_APP_API_URL || 'http://localhost:5000');
          
          const endpoint = `${apiBase}/api/teams/${loggedInTeam.teamId}/status`;
          
          const blob = new Blob([JSON.stringify({
            status: 'copied',
            content: selectedText.substring(0, 500), // Giới hạn kích thước để đảm bảo Beacon hoạt động
            sessionId: loggedInTeam.sessionId,
            fromAnswerField: isCopyingFromAnswer,
            timestamp: new Date().toISOString(),
            retry: true
          })], { type: 'application/json' });
          
          navigator.sendBeacon(endpoint, blob);
          console.debug('Đã gửi beacon để cập nhật trạng thái sao chép');
          
          // Đặt hẹn giờ để chuyển về trạng thái active sau 3 giây
          setTimeout(() => {
            if (document.hidden) return; // Nếu tab đang ẩn, không cập nhật
            setCurrentStatus('active');
          }, 3000);
        } catch (beaconErr) {
          console.error('Lỗi khi gửi beacon cho trạng thái copy:', beaconErr);
        }
      });
    }
  };

  // Xử lý khi người dùng thoát trang
  const handleBeforeUnload = (e) => {
    if (loggedInTeam && loggedInTeam.teamId && loggedInTeam.sessionId) {
      // Cập nhật trạng thái hiện tại 
      setCurrentStatus('exited');
      
      // Ghi log ở phía client
      console.debug('Người dùng thoát trang, cập nhật trạng thái exited cho đội:', loggedInTeam.teamId);
      
      // Ghi nhận thời điểm thoát
      const exitTime = new Date().toISOString();
      
      // Gọi API teamApi trước để đảm bảo tính nhất quán
      try {
        // Gọi teamApi đồng bộ để đảm bảo xử lý nhất quán
        const apiBase = process.env.NODE_ENV === 'production' 
          ? (process.env.REACT_APP_API_URL || 'https://giaolien-backend-c7ca8074e9c5.herokuapp.com')
          : (process.env.REACT_APP_API_URL || 'http://localhost:5000');
          
        const endpoint = `${apiBase}/api/teams/${loggedInTeam.teamId}/status`;
        
        // Sử dụng Blob để gửi dữ liệu JSON với đúng Content-Type
        const blob = new Blob([JSON.stringify({
          status: 'exited',
          sessionId: loggedInTeam.sessionId,
          timestamp: exitTime,
          reason: 'page_closed',
          beaconBackup: true
        })], { type: 'application/json' });
        
        // Gửi beacon để cập nhật trạng thái - phương pháp tốt nhất cho beforeunload
        navigator.sendBeacon(endpoint, blob);
        console.debug('Beacon đã được gửi cho trạng thái exited');
      } catch (err) {
        console.error('Lỗi khi cố gắng gửi trạng thái exited:', err);
      }
    }
  };
  
  // Kiểm tra sessionId hiện tại
  const checkSessionId = () => {
    if (!loggedInTeam || !loggedInTeam.teamId) {
      console.debug("Không thể kiểm tra sessionId: thiếu thông tin đội");
      return;
    }
    
    console.debug("Kiểm tra sessionId cho teamId:", loggedInTeam.teamId);
    teamApi.getById(loggedInTeam.teamId).then(response => {
      if (!response || !response.data) {
        console.warn("Không nhận được dữ liệu hợp lệ từ server khi kiểm tra sessionId");
        return;
      }
      
      const serverSessionId = response.data.sessionId;
      console.debug("Server sessionId:", serverSessionId);
      console.debug("Client sessionId:", loggedInTeam.sessionId);
      
      if (!serverSessionId || serverSessionId !== loggedInTeam.sessionId) {
        console.warn("SessionId không khớp! Server:", serverSessionId, "Client:", loggedInTeam.sessionId);
        
        // Hiển thị thông báo đã bị đăng xuất
        setForceLogoutMessage('Tài khoản của bạn đã được đăng xuất bởi quản trị viên');
        
        // Xóa thông tin đội khỏi localStorage
        localStorage.removeItem("team_waiting_" + adminId);
        
        // Dừng interval kiểm tra phiên
        if (checkSessionIntervalRef.current) {
          clearInterval(checkSessionIntervalRef.current);
          checkSessionIntervalRef.current = null;
        }
        
        // Đặt lại trạng thái sau 3 giây
        setTimeout(() => {
          resetForm();
          setForceLogoutMessage(null);
        }, 3000);
      } else {
        console.debug("SessionId hợp lệ!");
      }
    }).catch(err => {
      console.error("Lỗi khi kiểm tra sessionId:", err);
    });
  };

  // Thêm kiểm tra sessionId khi component mount
  useEffect(() => {
    // Kiểm tra sessionId sau khi đã load được đội
    if (loggedInTeam && loggedInTeam.teamId) {
      setTimeout(checkSessionId, 2000);
    }
  }, [loggedInTeam]);

  // Hàm theo dõi hoạt động người dùng để phát hiện trạng thái "Không hoạt động"
  const startInactivityTracking = (teamId, sessionId) => {
    console.debug('Bắt đầu theo dõi hoạt động người dùng cho teamId:', teamId);
    
    // Đặt thời gian hoạt động ban đầu
    lastActivityTimeRef.current = Date.now();
    
    // Biến để theo dõi trạng thái gửi yêu cầu cập nhật
    let isUpdating = false;
    let pendingUpdate = false;
    
    // Xóa bộ hẹn giờ hiện tại nếu có
    if (inactivityTimerRef.current) {
      clearInterval(inactivityTimerRef.current);
    }
    
    // Hàm xử lý khi có hoạt động người dùng
    const updateLastActivity = () => {
      const now = Date.now();
      const lastActivity = lastActivityTimeRef.current;
      const timeSinceLastActivity = now - lastActivity;
      
      // Cập nhật thời gian hoạt động cuối cùng
      lastActivityTimeRef.current = now;
      
      // Nếu tab không bị ẩn và đã inactivity hơn 2 phút, cập nhật trạng thái ngay lập tức
      if (!document.hidden && timeSinceLastActivity > 120000) {
        updateStatusToActive();
        return;
      }
      
      // Chỉ cập nhật trạng thái nếu thời gian chênh lệch > 10 giây
      // và không có yêu cầu cập nhật đang chờ xử lý - giảm tải cho server
      if (!document.hidden && !isUpdating && timeSinceLastActivity > 10000) {
        updateStatusToActive();
      }
    };
    
    // Hàm cập nhật trạng thái thành active để tránh lặp code
    const updateStatusToActive = () => {
      if (isUpdating) {
        pendingUpdate = true;
        return;
      }
      
      isUpdating = true;
      
      console.debug('Phát hiện hoạt động người dùng, cập nhật trạng thái active');
      
      // Cập nhật trạng thái hiện tại
      setCurrentStatus('active');
      
      teamApi.updateStatus(teamId, { 
        status: 'active',
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
        activitySource: 'user_interaction'
      }).then(() => {
        console.debug('Đã cập nhật trạng thái active thành công');
        isUpdating = false;
        
        // Kiểm tra xem có yêu cầu cập nhật đang chờ xử lý không
        if (pendingUpdate) {
          pendingUpdate = false;
          // Đợi một khoảng thời gian ngắn trước khi thử lại
          setTimeout(updateStatusToActive, 1000);
        }
      }).catch(err => {
        console.error('Error updating active status on user activity:', err);
        isUpdating = false;
        
        // Vẫn kiểm tra yêu cầu đang chờ, mặc dù có lỗi
        if (pendingUpdate) {
          pendingUpdate = false;
          setTimeout(updateStatusToActive, 2000); // Đợi lâu hơn nếu có lỗi
        }
      });
    };
    
    // Thiết lập để theo dõi các sự kiện tương tác người dùng
    const updateLastActivityThrottled = () => {
      // Chỉ cập nhật nếu đã qua 1 giây kể từ lần hoạt động cuối cùng
      const now = Date.now();
      if (now - lastActivityTimeRef.current >= 1000) {
        lastActivityTimeRef.current = now;
      }
    };
    
    // Đăng ký các trình xử lý sự kiện với passive: true để cải thiện hiệu suất
    document.addEventListener('mousemove', updateLastActivityThrottled, { passive: true });
    document.addEventListener('mousedown', updateLastActivity, { passive: true });
    document.addEventListener('keypress', updateLastActivity, { passive: true });
    document.addEventListener('scroll', updateLastActivityThrottled, { passive: true });
    document.addEventListener('touchstart', updateLastActivity, { passive: true });
    document.addEventListener('click', updateLastActivity, { passive: true });
    
    // Đối với sự kiện focus, cập nhật trạng thái ngay lập tức nếu tab được focus lại
    window.addEventListener('focus', () => {
      if (!document.hidden) {
        // Nếu đang ở trạng thái không hoạt động, cập nhật ngay lập tức
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityTimeRef.current;
        
        if (timeSinceLastActivity > 10000) {
          updateStatusToActive();
        }
        
        lastActivityTimeRef.current = now;
      }
    }, { passive: true });
    
    // Tạo bộ hẹn giờ kiểm tra không hoạt động mỗi 30 giây
    inactivityTimerRef.current = setInterval(() => {
      const currentTime = Date.now();
      const inactiveTime = currentTime - lastActivityTimeRef.current;
      
      // Nếu không hoạt động trong hơn 2 phút (120000ms) và tab không bị ẩn
      if (inactiveTime > 120000 && !document.hidden) {
        console.debug('Phát hiện không hoạt động trong', Math.floor(inactiveTime/1000), 'giây');
        
        // Cập nhật trạng thái thành inactive
        setCurrentStatus('inactive');
        
        // Cập nhật trạng thái thành "Không hoạt động"
        teamApi.updateStatus(teamId, { 
          status: 'inactive',
          sessionId: sessionId,
          inactiveTime: Math.floor(inactiveTime/1000),
          timestamp: new Date().toISOString()
        }).then(() => {
          console.debug('Đã cập nhật trạng thái inactive thành công');
        }).catch(err => 
          console.error('Error updating inactive status:', err)
        );
      }
    }, 30000); // Kiểm tra mỗi 30 giây
    
    return () => {
      // Hàm dọn dẹp - được gọi bởi stopInactivityTracking
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      
      // Xóa các event listener
      document.removeEventListener('mousemove', updateLastActivityThrottled);
      document.removeEventListener('mousedown', updateLastActivity);
      document.removeEventListener('keypress', updateLastActivity);
      document.removeEventListener('scroll', updateLastActivityThrottled);
      document.removeEventListener('touchstart', updateLastActivity);
      document.removeEventListener('click', updateLastActivity);
      window.removeEventListener('focus', updateLastActivity);
    };
  };

  // Hàm dừng theo dõi hoạt động người dùng
  const stopInactivityTracking = () => {
    console.debug('Dừng theo dõi hoạt động người dùng');
    
    // Xóa bộ hẹn giờ kiểm tra không hoạt động
    if (inactivityTimerRef.current) {
      clearInterval(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    
    // Xóa các trình xử lý sự kiện - xử lý này sẽ được thực hiện bởi hàm return từ startInactivityTracking
  };

  // Render trang chờ
  const renderWaitingPage = () => {
    // Lấy nội dung dành riêng cho đội (nếu có)
    const teamSpecificContent = getTeamSpecificContent();

    return (
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h4 className="mb-0">Chờ {replaceStationTerm("trạm")} bắt đầu</h4>
              <p className="mb-0 mt-1 opacity-75">
                Đội: {loggedInTeam.teamName}
                {currentStatus && (
                  <span className="ms-2">
                    <Badge bg={
                      currentStatus === 'active' ? 'success' :
                      currentStatus === 'hidden' ? 'warning' :
                      currentStatus === 'copied' ? 'danger' :
                      currentStatus === 'inactive' ? 'light' :
                      currentStatus === 'exited' ? 'secondary' : 'light'
                    } 
                    text={currentStatus === 'inactive' || currentStatus === 'light' ? 'dark' : 'white'}>
                      {currentStatus === 'active' ? 'Đang hoạt động' :
                       currentStatus === 'hidden' ? 'Đã ẩn tab' :
                       currentStatus === 'copied' ? 'Đã sao chép' :
                       currentStatus === 'inactive' ? 'Không hoạt động' :
                       currentStatus === 'exited' ? 'Đã thoát' : 'Không hoạt động'}
                    </Badge>
                  </span>
                )}
              </p>
            </div>
            <Button variant="light" size="sm" onClick={handleLogoutClick}>
              <i className="bi bi-box-arrow-right me-1"></i>
              Đăng xuất
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-4 text-center">
          {/* Hiển thị thông báo buộc đăng xuất nếu có */}
          {forceLogoutMessage && (
            <Alert variant="danger" className="mb-4 text-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {forceLogoutMessage}
            </Alert>
          )}

          {activeStation ? (
            <div className="animate__animated animate__fadeIn">
              <div className="mb-4">
                <i
                  className="bi bi-check-circle-fill text-success"
                  style={{ fontSize: "3rem" }}
                ></i>
                <h3 className="mt-3 mb-2">
                  <TermReplacer>{t("station_term")}</TermReplacer> đã bắt đầu!
                </h3>
                <p className="text-muted">
                  Bạn đang tham gia{" "}
                  <TermReplacer>{t("station_term")}</TermReplacer>{" "}
                  <strong>{activeStation.name}</strong>
                </p>
              </div>

              <hr className="my-4" />

              {/* Hiển thị nội dung trạm */}
              <div className="station-content-wrapper mb-4 text-start">
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-file-text me-2 text-primary"></i>
                  Mật thư:
                </h5>

                {/* Hiển thị nội dung văn bản */}
                {teamSpecificContent &&
                  (teamSpecificContent.showText ||
                    teamSpecificContent.contentType === "text" ||
                    teamSpecificContent.contentType === "both") && (
                    <Card className="station-content mb-3 mx-0">
                      <Card.Body className="p-0">
                        <div className="content-text w-100 px-1">
                          {teamSpecificContent.ottContent &&
                            teamSpecificContent.showOTT && (
                              <div className="mb-2">
                                <h6 className="fw-bold d-inline-block bg-primary text-white px-3 py-1 rounded-0 mb-0 ms-0 mt-1">
                                  OTT:
                                </h6>
                                <div className="content-text w-100 px-1">
                                  <p
                                    className="content-line paragraph-spacing-medium"
                                    style={{
                                      fontSize:
                                        teamSpecificContent.fontSize ||
                                        "1.05rem",
                                      fontWeight:
                                        teamSpecificContent.fontWeight || "500",
                                      lineHeight:
                                        teamSpecificContent.lineHeight || "1.5",
                                    }}
                                  >
                                    {teamSpecificContent.ottContent}
                                  </p>
                                </div>
                              </div>
                            )}
                          {teamSpecificContent.nwContent &&
                            teamSpecificContent.showNW && (
                              <div>
                                <h6 className="fw-bold d-inline-block bg-primary text-white px-3 py-1 rounded-0 mb-0 ms-0">
                                  NW:
                                </h6>
                                <div className="content-text w-100 px-1">
                                  {teamSpecificContent.nwContent
                                    .split("\n")
                                    .map((line, idx) => (
                                      <p
                                        key={idx}
                                        className="content-line paragraph-spacing-medium"
                                        style={{
                                          fontSize:
                                            teamSpecificContent.fontSize ||
                                            "1.05rem",
                                          fontWeight:
                                            teamSpecificContent.fontWeight ||
                                            "500",
                                          lineHeight:
                                            teamSpecificContent.lineHeight ||
                                            "1.5",
                                        }}
                                      >
                                        {line || " "}
                                        {idx ===
                                          teamSpecificContent.nwContent.split(
                                            "\n",
                                          ).length -
                                            1 && (
                                          <span className="fw-bold">/AR</span>
                                        )}
                                      </p>
                                    ))}
                                </div>
                              </div>
                            )}
                          {!teamSpecificContent.ottContent &&
                            !teamSpecificContent.nwContent &&
                            teamSpecificContent.content &&
                            teamSpecificContent.content
                              .split("\n")
                              .map((line, idx) => (
                                <p
                                  key={idx}
                                  className="content-line paragraph-spacing-medium"
                                  style={{
                                    fontSize:
                                      teamSpecificContent.fontSize || "1.05rem",
                                    fontWeight:
                                      teamSpecificContent.fontWeight || "500",
                                    lineHeight:
                                      teamSpecificContent.lineHeight || "1.5",
                                  }}
                                >
                                  {line || " "}
                                </p>
                              ))}
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                {/* Hiển thị hình ảnh nếu cần */}
                {teamSpecificContent &&
                  (teamSpecificContent.showImage ||
                    teamSpecificContent.contentType === "image" ||
                    teamSpecificContent.contentType === "both") &&
                  teamSpecificContent.image && (
                    <div className="text-center mb-3">
                      <img
                        src={
                          teamSpecificContent.image
                            ? // Ưu tiên sử dụng URL API từ server
                              teamSpecificContent.image.startsWith("/api/")
                              ? `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${teamSpecificContent.image}`
                              : teamSpecificContent.image.startsWith("http")
                                ? teamSpecificContent.image
                                : teamSpecificContent.image
                            : ""
                        }
                        alt="Mật thư"
                        className="station-image img-fluid"
                        style={{
                          width: "100%",
                          maxHeight: "600px",
                          objectFit: "contain",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                        onError={(e) => {
                          console.error("Lỗi tải hình ảnh:", e.target.src);
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/400x300?text=Không+thể+hiển+thị+hình+ảnh";
                        }}
                      />
                    </div>
                  )}

                {/* Hiển thị ghi chú của trạm nếu có */}
                {activeStation.gameNote && (
                  <Alert
                    variant="info"
                    className="d-flex align-items-start mb-4"
                  >
                    <i
                      className="bi bi-info-circle-fill me-2 mt-1"
                      style={{ fontSize: "1.2rem" }}
                    ></i>
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
                    disabled={
                      nextAttemptTime !== null || submitting || !answer.trim()
                    }
                  >
                    {submitting ? <>Đang xử lý...</> : "Gửi đáp án"}
                  </Button>
                </div>
              </Form>

              {/* Kết quả gửi đáp án */}
              {submissionResult && (
                <div className="mt-4 text-start">
                  {submissionResult.isCorrect ? (
                    <Alert
                      variant="success"
                      className="d-flex align-items-center"
                    >
                      <i
                        className="bi bi-check-circle-fill me-2"
                        style={{ fontSize: "1.5rem" }}
                      ></i>
                      <div>
                        <strong>Chính xác!</strong> Chúc mừng, bạn đã hoàn thành{" "}
                        <TermReplacer>{t("station_term")}</TermReplacer> này.
                      </div>
                    </Alert>
                  ) : nextAttemptTime ? (
                    <Alert
                      variant="warning"
                      className="d-flex align-items-start"
                    >
                      <i
                        className="bi bi-hourglass-split me-2 mt-1"
                        style={{ fontSize: "1.5rem" }}
                      ></i>
                      <div>
                        <div className="mb-1">
                          <strong>Đã hết lần thử!</strong>
                        </div>
                        <div>
                          <span className="me-3 badge bg-warning text-dark px-2 py-1 mb-1">
                            <i className="bi bi-clock-history me-1"></i>
                            Khi hết thời gian chờ, bạn sẽ có{" "}
                            {activeStation.maxAttempts} lần thử mới.
                          </span>
                        </div>
                      </div>
                    </Alert>
                  ) : submissionResult.remainingAttempts <= 0 ? (
                    <Alert
                      variant="danger"
                      className="d-flex align-items-start"
                    >
                      <i
                        className="bi bi-x-circle-fill me-2 mt-1"
                        style={{ fontSize: "1.5rem" }}
                      ></i>
                      <div>
                        <div className="mb-1">
                          <strong>Đáp án không chính xác!</strong>
                        </div>
                        <div className="d-flex align-items-center flex-wrap">
                          <span className="text-danger mb-1">
                            <i className="bi bi-exclamation-circle-fill me-1"></i>
                            Đã hết lần thử! Đang chuẩn bị khóa trong{" "}
                            {activeStation.lockTime} phút.
                          </span>
                        </div>
                      </div>
                    </Alert>
                  ) : submissionResult.attemptCount > 0 ? (
                    <Alert
                      variant="danger"
                      className="d-flex align-items-start"
                    >
                      <i
                        className="bi bi-x-circle-fill me-2 mt-1"
                        style={{ fontSize: "1.5rem" }}
                      ></i>
                      <div>
                        <div className="mb-1">
                          <strong>Đáp án không chính xác!</strong>
                        </div>
                        <div className="d-flex align-items-center flex-wrap">
                          <span className="me-3 mb-1">
                            <i className="bi bi-arrow-counterclockwise me-1"></i>
                            Bạn còn{" "}
                            <strong className="badge bg-info">
                              {submissionResult.remainingAttempts}
                            </strong>{" "}
                            lần thử
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
                    <Alert
                      variant="danger"
                      className="d-flex align-items-start"
                    >
                      <i
                        className="bi bi-x-circle-fill me-2 mt-1"
                        style={{ fontSize: "1.5rem" }}
                      ></i>
                      <div>
                        <div className="mb-1">
                          <strong>Đáp án không chính xác!</strong>
                        </div>
                        <div>
                          <span className="me-3">
                            <i className="bi bi-arrow-counterclockwise me-1"></i>
                            Bạn còn{" "}
                            <strong className="badge bg-info">
                              {submissionResult.remainingAttempts}
                            </strong>{" "}
                            lần thử
                          </span>
                        </div>
                      </div>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div
              className="waiting-box"
              style={{
                padding: "1rem 2rem",
                borderRadius: "8px",
                border: "2px solid #0d6efd",
                boxShadow: "0 0 10px rgba(13, 110, 253, 0.4)",
                animation: "pulse-border 1s infinite",
                position: "relative",
              }}
            >
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
                <i
                  className="bi bi-hourglass-split text-primary"
                  style={{ fontSize: "3rem" }}
                ></i>
                <h3 className="mt-3 mb-2">
                  Đang chờ <TermReplacer>{t("station_term")}</TermReplacer> bắt
                  đầu...
                </h3>
                <p className="text-muted mb-3">
                  Admin sẽ bắt đầu{" "}
                  <TermReplacer>{t("station_term")}</TermReplacer> trong thời
                  gian tới.
                </p>
              </div>

              <div className="mt-4 d-flex justify-content-center"></div>
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
              <i
                className="bi bi-people-fill text-primary"
                style={{ fontSize: "3rem" }}
              ></i>
            </div>
            <h3>Đăng nhập</h3>
            <p className="text-muted">
              Vui lòng đăng nhập và chờ quản trị viên bắt đầu trạm
            </p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {alreadyLoggedInError && (
            <Alert variant="warning">
              <Alert.Heading>{t("already_logged_in")}</Alert.Heading>
              <p>{alreadyLoggedInError.message}</p>
              <hr />
              <p className="mb-0">
                <strong>Thiết bị đã đăng nhập:</strong>{" "}
                {alreadyLoggedInError.deviceInfo || "Thiết bị không xác định"}
              </p>
            </Alert>
          )}

          <Form onSubmit={handleTeamLogin} className="text-start">
            <Form.Group className="mb-3">
              <Form.Label>{t("team")}</Form.Label>
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
              <Form.Label>{t("password_label")}</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("enter_password")}
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
                {submitting ? <>{t("processing")}</> : t("confirm")}
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
          <p className="mt-3">
            <TermReplacer>{t("loading_station_info")}</TermReplacer>
          </p>
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

      {/* Modal xác nhận đăng xuất */}
      <Modal show={showLogoutModal} onHide={cancelLogout} centered size="sm">
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

export default TeamWaitingPage;
