import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, InputGroup, Badge, ListGroup, Accordion, Table, Spinner, Tabs, Tab } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/Navbar';
import { stationApi, teamApi } from '../../services/api';
import { formatDateTime, replaceStationTerm } from '../../utils/helpers';
import TermReplacer from '../../utils/TermReplacer';
import { useLanguage } from '../../context/LanguageContext';
import './StationFormPreview.css'; // Import CSS mới cho tính năng xem trước

const StationForm = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Danh sách trạm khi tạo nhiều trạm
  const [stations, setStations] = useState([]);
  const [commonTeams, setCommonTeams] = useState([]);
  const [gameName, setGameName] = useState('');
  const [gameNote, setGameNote] = useState('');
  const [loadingGameData, setLoadingGameData] = useState(false);
  // Thêm state để lưu trữ danh sách đội từ cơ sở dữ liệu
  const [availableTeams, setAvailableTeams] = useState([]);
  // Thêm state để theo dõi loại mật thư (chung/riêng)
  const [messageType, setMessageType] = useState('common'); // 'common' hoặc 'individual'
  
  const [formData, setFormData] = useState({
    name: '',
    teams: [],
    content: '',
    contentType: 'text',
    correctAnswer: [],
    maxAttempts: 5,
    lockTime: 0,
    fontSize: '1.05rem',
    fontWeight: '500'
  });

  const [teamsInput, setTeamsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);
  const multipleFileInputRefs = useRef({});

  // Thêm state để quản lý input đáp án riêng cho từng trạm
  const [answersInputMap, setAnswersInputMap] = useState({});
  // State để lưu nội dung riêng cho từng đội
  const [teamContents, setTeamContents] = useState({});
  const [teamAnswersInputMap, setTeamAnswersInputMap] = useState({});

  // State cho phần xem trước
  const [previewStation, setPreviewStation] = useState(null);
  const [previewTeam, setPreviewTeam] = useState('');
  const [previewContent, setPreviewContent] = useState(null);
  const [previewExpanded, setPreviewExpanded] = useState(true);
  
  // Thêm state theo dõi trạm đang chọn
  const [selectedStationIndex, setSelectedStationIndex] = useState(0);
  
  useEffect(() => {
    if (isEditMode) {
      fetchStationData();
    } else {
      // Khởi tạo mặc định một trạm khi mới vào trang
      addNewStation();
      
      // Truy vấn thông tin của trạm đã có để lấy tên mật thư, ghi chú và danh sách đội
      fetchExistingGameInfo();
    }
  }, [isEditMode, id]);
  
  // Hàm mới để truy vấn thông tin trò chơi đã có
  const fetchExistingGameInfo = async () => {
    try {
      setLoadingGameData(true);
      
      // Truy vấn danh sách đội
      const teamsResponse = await teamApi.getAll();
      if (teamsResponse.data && teamsResponse.data.length > 0) {
        // Lưu danh sách đội vào state availableTeams thay vì thêm trực tiếp vào commonTeams
        const teamNames = teamsResponse.data.map(team => team.name);
        setAvailableTeams(teamNames);
      }
      
      // Truy vấn thông tin từ một trạm đã có (lấy trạm đầu tiên)
      const stationsResponse = await stationApi.getAll();
      if (stationsResponse.data && stationsResponse.data.length > 0) {
        // Lấy thông tin từ trạm đầu tiên
        const firstStation = stationsResponse.data[0];
        
        // Cập nhật tên mật thư nếu có
        if (firstStation.gameName) {
          setGameName(firstStation.gameName);
        }
        
        // Cập nhật ghi chú nếu có
        if (firstStation.gameNote) {
          setGameNote(firstStation.gameNote);
        }
      }
    } catch (error) {
      console.error('Error fetching existing game info:', error);
      // Không hiển thị lỗi này cho người dùng vì đây là tính năng bổ sung
    } finally {
      setLoadingGameData(false);
    }
  };

  const fetchStationData = async () => {
    try {
      setLoading(true);
      const response = await stationApi.getById(id);
      const station = response.data;
      
      // Truy vấn danh sách đội từ cơ sở dữ liệu
      // để hiển thị tất cả các đội có sẵn khi chỉnh sửa
      const teamsResponse = await teamApi.getAll();
      if (teamsResponse.data && teamsResponse.data.length > 0) {
        const teamNames = teamsResponse.data.map(team => team.name);
        setAvailableTeams(teamNames);
      }
      
      // Trích xuất OTT và NW từ content nếu là dạng văn bản
      let ottContent = '';
      let nwContent = '';
      let showOTT = station.showOTT !== undefined ? station.showOTT : true;
      let showNW = station.showNW !== undefined ? station.showNW : true;
      
      if (station.ottContent !== undefined && station.nwContent !== undefined) {
        // Sử dụng các trường đã có
        ottContent = station.ottContent;
        nwContent = station.nwContent;
      } else if (station.contentType === 'text' || station.contentType === 'both') {
        // Trích xuất từ nội dung cũ (tương thích ngược)
        const content = station.content || '';
        
        // Tìm OTT
        const ottMatch = content.match(/OTT:\s*\n([\s\S]*?)\n\s*NW:/);
        if (ottMatch && ottMatch[1]) {
          ottContent = ottMatch[1].trim();
          showOTT = true;
        } else {
          // Kiểm tra xem có OTT không có NW không
          const ottOnlyMatch = content.match(/OTT:\s*\n([\s\S]*?)$/);
          if (ottOnlyMatch && ottOnlyMatch[1]) {
            ottContent = ottOnlyMatch[1].trim();
            showOTT = true;
            showNW = false;
          }
        }
        
        // Tìm NW
        const nwMatch = content.match(/NW:\s*\n([\s\S]*?)(?:\/AR)?$/);
        if (nwMatch && nwMatch[1]) {
          nwContent = nwMatch[1].trim();
          showNW = true;
        }
      }
      
      // Xác định loại hiển thị
      const showText = station.showText !== undefined 
        ? station.showText 
        : (station.contentType === 'text' || station.contentType === 'both');
        
      const showImage = station.showImage !== undefined
        ? station.showImage
        : (station.contentType === 'image' || station.contentType === 'both');
      
      // Xử lý hình ảnh nếu có
      if ((station.contentType === 'image' || station.contentType === 'both') && station.content) {
        if (station.content.startsWith('/api/')) {
          setImagePreview(`http://localhost:5000${station.content}`);
        } else if (station.content.startsWith('http')) {
          setImagePreview(station.content);
        }
      }
      
      // Đảm bảo correctAnswer là mảng
      let correctAnswerArray = station.correctAnswer;
      if (!Array.isArray(correctAnswerArray)) {
        correctAnswerArray = station.correctAnswer ? [station.correctAnswer] : [];
      }
      
      // Thiết lập loại mật thư
      if (station.messageType) {
        setMessageType(station.messageType);
        console.log("Loaded messageType:", station.messageType);
      }
      
      // Nếu có nội dung riêng cho từng đội, khởi tạo teamContents
      if (station.messageType === 'individual' && station.teamSpecificContents && station.teamSpecificContents.length > 0) {
        console.log("Loaded teamSpecificContents:", station.teamSpecificContents.length);
        
        const initialTeamContents = {};
        station.teamSpecificContents.forEach((teamContent, index) => {
          const key = `0_${teamContent.team}`;
          
          // Đảm bảo correctAnswer là mảng
          let teamCorrectAnswers = [];
          if (teamContent.correctAnswer) {
            if (Array.isArray(teamContent.correctAnswer)) {
              teamCorrectAnswers = [...teamContent.correctAnswer];
            } else {
              teamCorrectAnswers = [teamContent.correctAnswer];
            }
          }
          
          // Xác định loại hiển thị dựa trên contentType của đội
          const teamShowText = teamContent.showText !== undefined 
            ? teamContent.showText 
            : (teamContent.contentType === 'text' || teamContent.contentType === 'both');
            
          const teamShowImage = teamContent.showImage !== undefined
            ? teamContent.showImage
            : (teamContent.contentType === 'image' || teamContent.contentType === 'both');
          
          // Xác định loại hiển thị OTT/NW
          let teamShowOTT = teamContent.showOTT !== undefined ? teamContent.showOTT : true;
          let teamShowNW = teamContent.showNW !== undefined ? teamContent.showNW : true;
          
          // Tìm nội dung OTT/NW từ content nếu cần
          let teamOttContent = teamContent.ottContent || '';
          let teamNwContent = teamContent.nwContent || '';
          
          if (!teamOttContent && !teamNwContent && teamContent.contentType === 'text' && teamContent.content) {
            // Trích xuất OTT/NW từ nội dung cũ nếu có
            const content = teamContent.content;
            
            // Tìm OTT
            const ottMatch = content.match(/OTT:\s*\n([\s\S]*?)\n\s*NW:/);
            if (ottMatch && ottMatch[1]) {
              teamOttContent = ottMatch[1].trim();
            } else {
              // Kiểm tra OTT không có NW
              const ottOnlyMatch = content.match(/OTT:\s*\n([\s\S]*?)$/);
              if (ottOnlyMatch && ottOnlyMatch[1]) {
                teamOttContent = ottOnlyMatch[1].trim();
              }
            }
            
            // Tìm NW
            const nwMatch = content.match(/NW:\s*\n([\s\S]*?)(?:\/AR)?$/);
            if (nwMatch && nwMatch[1]) {
              teamNwContent = nwMatch[1].trim();
            }
          }
          
          initialTeamContents[key] = {
            contentType: teamContent.contentType || 'text',
            content: teamContent.content || '',
            correctAnswer: teamCorrectAnswers,
            showText: teamShowText,
            showImage: teamShowImage,
            showOTT: teamShowOTT,
            showNW: teamShowNW,
            ottContent: teamOttContent,
            nwContent: teamNwContent,
            imageUrl: teamContent.imageUrl || (teamContent.content || ''),
            fontSize: teamContent.fontSize || '1.05rem',
            fontWeight: teamContent.fontWeight || '500',
            lineHeight: teamContent.lineHeight || '1.5',
            paragraphSpacing: teamContent.paragraphSpacing || '0.8rem'
          };
          
          console.log(`Loaded content for team ${teamContent.team}:`, {
            contentType: initialTeamContents[key].contentType,
            showText: initialTeamContents[key].showText,
            showImage: initialTeamContents[key].showImage
          });
        });
        
        setTeamContents(initialTeamContents);
        console.log("teamContents initialized:", Object.keys(initialTeamContents).length);
      }
      
      setFormData({
        name: station.name,
        teams: station.teams || [],
        content: station.content,
        contentType: station.contentType,
        ottContent: ottContent,
        nwContent: nwContent,
        showText: showText,
        showImage: showImage,
        showOTT: showOTT,
        showNW: showNW,
        correctAnswer: correctAnswerArray,
        maxAttempts: station.maxAttempts,
        lockTime: station.lockTime,
        fontSize: station.fontSize || '1.05rem',
        fontWeight: station.fontWeight || '500',
        lineHeight: station.lineHeight || '1.5'
      });
      
      // Thiết lập các giá trị bổ sung cho trường hợp chỉnh sửa
      if (station.teams && station.teams.length > 0) {
        setCommonTeams(station.teams);
      }
      
      // Nếu có dữ liệu tên mật thư và ghi chú từ trạm
      if (station.gameName) {
        setGameName(station.gameName);
      }
      
      if (station.gameNote) {
        setGameNote(station.gameNote);
      }
      
      // Thêm trạm hiện tại vào danh sách trạm để render form
      if (isEditMode) {
        const stationToEdit = {
          ...station,
          ottContent: ottContent,
          nwContent: nwContent,
          showText: showText,
          showImage: showImage,
          showOTT: showOTT,
          showNW: showNW,
          correctAnswer: correctAnswerArray,
          fontSize: station.fontSize || '1.05rem',
          fontWeight: station.fontWeight || '500',
          lineHeight: station.lineHeight || '1.5'
        };
        setStations([stationToEdit]);
      }
    } catch (err) {
      setError(t('load_station_error'));
      console.error('Error fetching station data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Cập nhật handleStationChange để xử lý mảng đáp án
  const handleStationChange = (index, field, value) => {
    setStations(prev => {
      const updatedStations = [...prev];
      
      // Cập nhật trường được chỉ định
      updatedStations[index] = {
        ...updatedStations[index],
        [field]: value
      };
      
      // Đảm bảo giữ nguyên trạng thái các checkbox khi nhập nội dung
      if (field === 'ottContent' || field === 'nwContent') {
        // Đảm bảo hiển thị văn bản và giữ nguyên trạng thái hiển thị OTT/NW
        updatedStations[index].showText = true;
        
        if (field === 'ottContent') {
          updatedStations[index].showOTT = true;
        }
        
        if (field === 'nwContent') {
          updatedStations[index].showNW = true;
        }
      }
      
      return updatedStations;
    });
  };

  const handleTeamsInputChange = (e) => {
    setTeamsInput(e.target.value);
  };

  const handleTeamKeyPress = (e) => {
    // Nhấn Enter để thêm đội
    if (e.key === 'Enter') {
      e.preventDefault();
      addTeam();
    }
  };

  const addTeam = () => {
    if (teamsInput.trim()) {
      // Thêm đội vào danh sách chung cho tất cả trạm
      setCommonTeams(prev => [...new Set([...prev, teamsInput.trim()])]);
      // Xóa nội dung input
      setTeamsInput('');
    }
  };

  const removeTeam = (index) => {
    setCommonTeams(prev => prev.filter((_, i) => i !== index));
  };

  const addMultipleTeams = () => {
    if (teamsInput.trim()) {
      // Phân tách các đội bằng dấu phẩy
      const newTeams = teamsInput
        .split(',')
        .map(team => team.trim())
        .filter(team => team.length > 0);
      
      // Thêm các đội mới vào danh sách chung
      setCommonTeams(prev => [...new Set([...prev, ...newTeams])]);
      
      // Xóa nội dung input
      setTeamsInput('');
    }
  };

  // Cập nhật hàm xử lý thay đổi input đáp án để sử dụng cho từng trạm riêng biệt
  const handleAnswersInputChange = (e, stationIndex) => {
    const { value } = e.target;
    setAnswersInputMap(prev => ({
      ...prev,
      [stationIndex]: value
    }));
  };

  // Thêm đáp án vào danh sách đáp án của trạm
  const handleAddAnswer = (index) => {
    const inputValue = answersInputMap[index] || '';
    if (!inputValue.trim()) return;
    
    setStations(prev => {
      const updated = [...prev];
      // Đảm bảo correctAnswer là mảng
      if (!updated[index].correctAnswer) {
        updated[index].correctAnswer = [];
      } else if (!Array.isArray(updated[index].correctAnswer)) {
        updated[index].correctAnswer = [updated[index].correctAnswer];
      }
      
      const newAnswer = inputValue.trim();
      // Chỉ thêm nếu đáp án chưa tồn tại
      if (!updated[index].correctAnswer.includes(newAnswer)) {
        updated[index].correctAnswer = [...updated[index].correctAnswer, newAnswer];
      }
      
      return updated;
    });
    
    // Xóa input sau khi thêm
    setAnswersInputMap(prev => ({
      ...prev,
      [index]: ''
    }));
  };

  // Cập nhật hàm xử lý phím Enter để thêm đáp án
  const handleAnswerKeyPress = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAnswer(index);
    }
  };

  // Cập nhật hàm xử lý thêm nhiều đáp án
  const addMultipleAnswers = (index) => {
    const inputValue = answersInputMap[index] || '';
    if (inputValue.trim()) {
      const newAnswers = inputValue
        .split(',')
        .map(answer => answer.trim())
        .filter(answer => answer.length > 0);
      
      setStations(prev => {
        const updatedStations = [...prev];
        // Khởi tạo correctAnswer là mảng nếu chưa phải
        if (!updatedStations[index].correctAnswer) {
          updatedStations[index].correctAnswer = [];
        } else if (!Array.isArray(updatedStations[index].correctAnswer)) {
          updatedStations[index].correctAnswer = [updatedStations[index].correctAnswer];
        }
        
        // Thêm tất cả đáp án mới vào mảng, tránh trùng lặp
        newAnswers.forEach(answer => {
          if (!updatedStations[index].correctAnswer.includes(answer)) {
            updatedStations[index].correctAnswer.push(answer);
          }
        });
        
        return updatedStations;
      });
      
      // Xóa nội dung input chỉ cho trạm hiện tại
      setAnswersInputMap(prev => ({
        ...prev,
        [index]: ''
      }));
    }
  };

  // Thêm hàm xóa đáp án
  const removeAnswer = (stationIndex, answerIndex) => {
    setStations(prev => {
      const updatedStations = [...prev];
      if (Array.isArray(updatedStations[stationIndex].correctAnswer)) {
        updatedStations[stationIndex].correctAnswer = updatedStations[stationIndex].correctAnswer.filter((_, i) => i !== answerIndex);
      }
      return updatedStations;
    });
  };

  // Thêm một trạm mới vào danh sách (cập nhật với mảng correctAnswer)
  const addNewStation = () => {
    setStations(prevStations => {
      const updatedStations = [
        ...prevStations,
        {
          name: `${replaceStationTerm('Trạm')} ${prevStations.length + 1}`,
          teams: commonTeams,
          content: '',
          contentType: 'text',
          correctAnswer: [],
          maxAttempts: 5,
          lockTime: 0,
          showText: true,
          showImage: false,
          showOTT: true,
          showNW: true,
          ottContent: '',
          nwContent: '',
          imagePreview: null,
          gameName: gameName, // Tự động sử dụng tên mật thư
          gameNote: gameNote, // Tự động sử dụng ghi chú
          fontSize: '1.05rem', // Giá trị mặc định cho kích thước chữ
          fontWeight: '500',    // Giá trị mặc định cho độ đậm chữ
          lineHeight: '1.5',    // Giá trị mặc định cho khoảng cách dòng
          paragraphSpacing: '0.8rem' // Giá trị mặc định cho khoảng cách đoạn
        }
      ];
      
      // Cập nhật trạm được chọn là trạm mới
      setTimeout(() => {
        setSelectedStationIndex(updatedStations.length - 1);
        updatePreview();
      }, 0);
      
      return updatedStations;
    });
  };

  // Xóa một trạm khỏi danh sách
  const removeStation = (index) => {
    setStations(prev => {
      const updated = prev.filter((_, i) => i !== index);
      
      // Nếu xóa trạm đang được chọn hoặc trạm có index nhỏ hơn trạm đang chọn
      if (index === selectedStationIndex) {
        // Chọn trạm trước đó hoặc tiếp theo (nếu có)
        const newSelectedIndex = Math.max(0, Math.min(selectedStationIndex - 1, updated.length - 1));
        
        // Cập nhật trạm đang chọn
        setTimeout(() => {
          setSelectedStationIndex(newSelectedIndex);
          updatePreview();
        }, 0);
      } else if (index < selectedStationIndex) {
        // Nếu xóa trạm phía trước trạm đang chọn, cập nhật index
        setTimeout(() => {
          setSelectedStationIndex(prev => prev - 1);
          updatePreview();
        }, 0);
      }
      
      return updated;
    });
  };

  // Sửa lại hàm xử lý tải lên hình ảnh
  const handleImageUpload = async (e, stationIndex = null) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      setError(t('invalid_image'));
      return;
    }
    
    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('image_size_limit'));
      return;
    }
    
    try {
      setUploadLoading(true);
      setError(null);
      
      // Hiển thị preview trực tiếp thông qua URL.createObjectURL
      const previewUrl = URL.createObjectURL(file);
      
      if (stationIndex !== null) {
        // Trường hợp nhiều trạm - cập nhật imagePreview cho trạm đang chọn
        setStations(prev => {
          const updatedStations = [...prev];
          updatedStations[stationIndex] = {
            ...updatedStations[stationIndex],
            imagePreview: previewUrl
          };
          return updatedStations;
        });
      } else {
        // Trường hợp một trạm hoặc chỉnh sửa
        setImagePreview(previewUrl);
      }
      
      // Tải lên server
      const response = await stationApi.uploadImage(file);
      
      // Cập nhật URL vào form
      if (isEditMode && stationIndex === null) {
        // Cập nhật cho trạm đang chỉnh sửa
        setStations(prev => {
          const updatedStations = [...prev];
          if (updatedStations[0]) {
            updatedStations[0] = {
              ...updatedStations[0],
              content: response.data.imageUrl
            };
          }
          return updatedStations;
        });
      } else if (stationIndex !== null) {
        // Cập nhật cho chế độ nhiều trạm
        handleStationChange(stationIndex, 'content', response.data.imageUrl);
      } else {
        // Cập nhật cho chế độ một trạm
        setFormData(prev => ({
          ...prev,
          content: response.data.imageUrl
        }));
      }
    } catch (err) {
      setError(t('image_upload_error'));
      console.error('Error uploading image:', err);
    } finally {
      setUploadLoading(false);
      
      // Reset input file để có thể tải lại cùng một file
      if (stationIndex !== null && multipleFileInputRefs.current[`station_${stationIndex}`]) {
        multipleFileInputRefs.current[`station_${stationIndex}`].value = '';
      } else if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Xử lý xem trước hình ảnh từ URL
  useEffect(() => {
    // Xử lý khi content hoặc contentType thay đổi
    if (formData.contentType === 'image' && formData.content) {
      if (formData.content.startsWith('/api/')) {
        setImagePreview(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${formData.content}`);
      } else if (formData.content.startsWith('http')) {
        setImagePreview(formData.content);
      }
    } else if (formData.contentType !== 'image' && !isEditMode) {
      setImagePreview(null);
    }
  }, [formData.contentType, formData.content, isEditMode]);

  // Xử lý imagePreview trong chế độ chỉnh sửa khi stations thay đổi
  useEffect(() => {
    if (isEditMode && stations.length > 0) {
      const station = stations[0];
      if ((station.contentType === 'image' || station.contentType === 'both') && station.content) {
        if (station.content.startsWith('/api/')) {
          const previewUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${station.content}`;
          station.imagePreview = previewUrl;
          setImagePreview(previewUrl);
        } else if (station.content.startsWith('http')) {
          station.imagePreview = station.content;
          setImagePreview(station.content);
        }
      }
    }
  }, [isEditMode, stations]);

  // Cập nhật multipleFileInputRefs khi stations thay đổi
  useEffect(() => {
    // Reset multipleFileInputRefs nếu cần
    multipleFileInputRefs.current = {};
  }, [stations.length, commonTeams.length]);

  // Render component tải lên hình ảnh
  const renderImageUpload = () => (
    <div className="mb-3">
      <div className="d-flex align-items-center mb-2">
        <input
          type="file"
          className="d-none"
          ref={fileInputRef}
          accept="image/*"
          onChange={(e) => handleImageUpload(e)}
        />
        <Button
          variant="outline-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadLoading}
          className="me-2"
        >
          {uploadLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-1" />
              {t('uploading')}
            </>
          ) : (
            t('choose_image')
          )}
        </Button>
        <span className="text-muted">{t('or')}</span>
      </div>
      
      <Form.Control
        type="text"
        name="content"
        value={formData.content}
        onChange={handleChange}
        placeholder={t('image_url_placeholder')}
      />
      <Form.Text className="text-muted">
        {t('image_upload_help')}
      </Form.Text>

      {imagePreview && (
        <div className="mt-3 border rounded p-2 text-center">
          <p className="mb-2">{t('preview')}</p>
          <img 
            src={imagePreview} 
            alt="Preview" 
            style={{ maxWidth: '100%', maxHeight: '200px' }} 
            className="img-thumbnail" 
          />
        </div>
      )}
    </div>
  );

  // Cập nhật phần form nhiều trạm
  const renderStationImageUpload = (index, station) => {
    // Hiển thị xem trước cho trạm hiện tại
    let stationImagePreview = null;
    if (station.content) {
      if (station.content.startsWith('/api/')) {
        stationImagePreview = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${station.content}`;
      } else if (station.content.startsWith('http')) {
        stationImagePreview = station.content;
      }
    }
    
    return (
      <div className="mb-3">
        <div className="d-flex align-items-center mb-2">
          <input
            type="file"
            className="d-none"
            ref={el => multipleFileInputRefs.current[`station_${index}`] = el}
            accept="image/*"
            onChange={(e) => handleImageUpload(e, index)}
          />
          <Button
            variant="outline-primary"
            onClick={() => multipleFileInputRefs.current[`station_${index}`]?.click()}
            disabled={uploadLoading}
            className="me-2"
          >
            {uploadLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Đang tải...
              </>
            ) : (
              t('choose_image')
            )}
          </Button>
          <span className="text-muted">hoặc</span>
        </div>
        
        <Form.Control
          type="text"
          value={station.content || ''}
          onChange={(e) => handleStationChange(index, 'content', e.target.value)}
          placeholder={t('image_url_placeholder')}
          className="mt-2"
        />
        <Form.Text className="text-muted">
          {t('image_upload_help')}
        </Form.Text>
        
        {stationImagePreview && (
          <div className="mt-3 border rounded p-2 text-center">
            <p className="mb-2">Xem trước:</p>
            <img 
              src={stationImagePreview} 
              alt="Preview" 
              style={{ maxWidth: '100%', maxHeight: '200px' }} 
              className="img-thumbnail" 
            />
          </div>
        )}
      </div>
    );
  };

  // Thêm hàm xử lý chọn/bỏ chọn đội
  const toggleTeamSelection = (teamName) => {
    if (commonTeams.includes(teamName)) {
      // Nếu đội đã có trong danh sách chọn, loại bỏ
      setCommonTeams(prev => prev.filter(team => team !== teamName));
    } else {
      // Nếu đội chưa có trong danh sách chọn, thêm vào
      setCommonTeams(prev => [...prev, teamName]);
    }
  };

  // Hàm quản lý thay đổi loại mật thư (chung/riêng)
  const handleMessageTypeChange = (type) => {
    setMessageType(type);
    
    // Khởi tạo dữ liệu team contents nếu chuyển sang mật thư riêng
    if (type === 'individual' && Object.keys(teamContents).length === 0) {
      const initialTeamContents = {};
      stations.forEach((station, stationIndex) => {
        commonTeams.forEach(team => {
          const key = `${stationIndex}_${team}`;
          initialTeamContents[key] = {
            contentType: 'text',
            content: '',
            correctAnswer: [],
            showText: true,
            showImage: false,
            showOTT: true,
            showNW: true,
            ottContent: '',
            nwContent: '',
            imageUrl: '',
            fontSize: '1.05rem',
            fontWeight: '500',
            lineHeight: '1.5',
            paragraphSpacing: '0.8rem'
          };
        });
      });
      setTeamContents(initialTeamContents);
    }
  };

  // Hàm cập nhật nội dung cho một đội cụ thể
  const handleTeamContentChange = (stationIndex, team, field, value) => {
    const key = `${stationIndex}_${team}`;
    setTeamContents(prev => {
      // Tạo bản sao của đối tượng nội dung đội hiện tại
      const updatedTeamContent = {
        ...prev[key],
        [field]: value
      };
      
      // Đảm bảo giữ nguyên trạng thái các checkbox khi nhập nội dung
      if (field === 'ottContent' || field === 'nwContent') {
        // Đảm bảo hiển thị văn bản và giữ nguyên trạng thái hiển thị OTT/NW
        updatedTeamContent.showText = true;
        
        if (field === 'ottContent') {
          updatedTeamContent.showOTT = true;
        }
        
        if (field === 'nwContent') {
          updatedTeamContent.showNW = true;
        }
      }
      
      return {
        ...prev,
        [key]: updatedTeamContent
      };
    });
  };

  // Hàm tải lên hình ảnh cho một đội cụ thể
  const handleTeamImageUpload = async (e, stationIndex, team) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      setError(t('invalid_image'));
      return;
    }
    
    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('image_size_limit'));
      return;
    }
    
    try {
      setUploadLoading(true);
      setError(null);
      
      // Hiển thị preview trực tiếp thông qua URL.createObjectURL
      const previewUrl = URL.createObjectURL(file);
      
      // Tạo key cho teamContents
      const key = `${stationIndex}_${team}`;
      
      // Cập nhật preview URL trước khi upload
      setTeamContents(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          imagePreview: previewUrl
        }
      }));
      
      // Tải lên server
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await stationApi.uploadImage(file);
      const imageUrl = response.data.imageUrl;
      
      // Cập nhật URL hình ảnh cho đội cụ thể sau khi upload thành công
      setTeamContents(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          imageUrl: imageUrl,
          imagePreview: previewUrl
        }
      }));
      
    } catch (error) {
      console.error('Image upload error:', error);
      setError(t('image_upload_error'));
    } finally {
      setUploadLoading(false);
      
      // Reset input file để có thể tải lại cùng một file
      const inputRef = multipleFileInputRefs.current[`team_${stationIndex}_${team}`];
      if (inputRef) {
        inputRef.value = '';
      }
    }
  };

  // Thêm đội vào danh sách
  const handleAddTeam = () => {
    if (!teamsInput.trim()) return;
    
    if (!commonTeams.includes(teamsInput.trim())) {
      setCommonTeams(prev => [...prev, teamsInput.trim()]);
      setTeamsInput('');
    }
  };

  // Thêm nhiều đội từ danh sách phân cách bằng dấu phẩy
  const handleAddMultipleTeams = () => {
    if (!teamsInput.trim()) return;
    
    const teams = teamsInput.split(',').map(team => team.trim()).filter(team => team);
    const uniqueTeams = teams.filter(team => !commonTeams.includes(team));
    
    if (uniqueTeams.length > 0) {
      setCommonTeams(prev => [...prev, ...uniqueTeams]);
      setTeamsInput('');
    }
  };

  // Thêm đội có sẵn từ danh sách gợi ý
  const handleAddExistingTeam = (team) => {
    if (!commonTeams.includes(team)) {
      setCommonTeams(prev => [...prev, team]);
    }
  };

  // Xóa đội khỏi danh sách
  const handleRemoveTeam = (index) => {
    setCommonTeams(prev => prev.filter((_, i) => i !== index));
  };

  // Xử lý thay đổi input đáp án
  const handleAnswerInputChange = (index, value) => {
    setAnswersInputMap(prev => ({
      ...prev,
      [index]: value
    }));
  };

  // Thêm hàm xử lý thay đổi input đáp án cho từng đội
  const handleTeamAnswerInputChange = (stationIndex, team, value) => {
    const key = `${stationIndex}_${team}`;
    setTeamAnswersInputMap(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Thêm đáp án vào danh sách đáp án của đội
  const handleAddTeamAnswer = (stationIndex, team) => {
    const key = `${stationIndex}_${team}`;
    const inputValue = teamAnswersInputMap[key] || '';
    if (!inputValue.trim()) return;
    
    const teamKey = `${stationIndex}_${team}`;
    const teamData = teamContents[teamKey] || {};
    
    // Đảm bảo correctAnswer là mảng
    let correctAnswers = [];
    if (!teamData.correctAnswer) {
      correctAnswers = [];
    } else if (Array.isArray(teamData.correctAnswer)) {
      correctAnswers = [...teamData.correctAnswer];
    } else {
      correctAnswers = [teamData.correctAnswer];
    }
    
    const newAnswer = inputValue.trim();
    // Chỉ thêm nếu đáp án chưa tồn tại
    if (!correctAnswers.includes(newAnswer)) {
      correctAnswers.push(newAnswer);
    }
    
    // Cập nhật lại state
    handleTeamContentChange(stationIndex, team, 'correctAnswer', correctAnswers);
    
    // Xóa input sau khi thêm
    setTeamAnswersInputMap(prev => ({
      ...prev,
      [key]: ''
    }));
  };

  // Xóa đáp án khỏi danh sách đáp án của đội
  const removeTeamAnswer = (stationIndex, team, answerIndex) => {
    const teamKey = `${stationIndex}_${team}`;
    const teamData = teamContents[teamKey] || {};
    
    if (!teamData.correctAnswer || !Array.isArray(teamData.correctAnswer)) return;
    
    const updatedAnswers = [...teamData.correctAnswer];
    updatedAnswers.splice(answerIndex, 1);
    
    handleTeamContentChange(stationIndex, team, 'correctAnswer', updatedAnswers);
  };

  // Thêm nhiều đáp án cho đội từ danh sách phân cách bằng dấu phẩy
  const addMultipleTeamAnswers = (stationIndex, team) => {
    const key = `${stationIndex}_${team}`;
    const inputValue = teamAnswersInputMap[key] || '';
    if (!inputValue.trim()) return;
    
    const teamKey = `${stationIndex}_${team}`;
    const teamData = teamContents[teamKey] || {};
    
    // Đảm bảo correctAnswer là mảng
    let correctAnswers = [];
    if (!teamData.correctAnswer) {
      correctAnswers = [];
    } else if (Array.isArray(teamData.correctAnswer)) {
      correctAnswers = [...teamData.correctAnswer];
    } else {
      correctAnswers = [teamData.correctAnswer];
    }
    
    // Phân tách đáp án bằng dấu phẩy
    const newAnswers = inputValue
      .split(',')
      .map(answer => answer.trim())
      .filter(answer => answer.length > 0);
    
    // Thêm các đáp án mới vào danh sách
    newAnswers.forEach(answer => {
      if (!correctAnswers.includes(answer)) {
        correctAnswers.push(answer);
      }
    });
    
    // Cập nhật lại state
    handleTeamContentChange(stationIndex, team, 'correctAnswer', correctAnswers);
    
    // Xóa input sau khi thêm
    setTeamAnswersInputMap(prev => ({
      ...prev,
      [key]: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (stations.length === 0) {
      setError(t('at_least_one_station_error'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (isEditMode) {
        // Cập nhật trạm hiện tại
        const station = stations[0]; // Trong chế độ edit chỉ có 1 trạm
        
        // Log thông tin trước khi lưu
        console.log('Editing station with type:', messageType);
        if (messageType === 'individual') {
          console.log('Team contents to save:', {
            count: Object.keys(teamContents).length,
            teams: Object.keys(teamContents).map(key => key.split('_')[1])
          });
          
          // Log chi tiết về nội dung đáp án
          const teamContentsSample = Object.entries(teamContents).slice(0, 2);
          teamContentsSample.forEach(([key, content]) => {
            console.log(`Team content for ${key}:`, {
              correctAnswer: content.correctAnswer,
              type: Array.isArray(content.correctAnswer) ? 'array' : typeof content.correctAnswer
            });
          });
        }
        
        // Xây dựng nội dung dựa vào loại
        let finalContent = '';
        let finalContentType = '';
        
        if (station.showImage && !station.showText) {
          // Chỉ ảnh
          finalContent = station.imagePreview || station.content;
          finalContentType = 'image';
        } else if (station.showText && !station.showImage) {
          // Chỉ văn bản
          finalContentType = 'text';
          
          if (station.showOTT && station.showNW) {
            finalContent = `OTT:\n${station.ottContent || ''}\n\nNW:\n${station.nwContent || ''}\n/AR`;
          } else if (station.showOTT) {
            finalContent = `OTT:\n${station.ottContent || ''}`;
          } else if (station.showNW) {
            finalContent = `NW:\n${station.nwContent || ''}\n/AR`;
          }
        } else if (station.showImage && station.showText) {
          // Cả hai
          finalContentType = 'both';
          finalContent = station.imagePreview || station.content;
        } else {
          // Không có nội dung
          finalContent = '';
          finalContentType = 'text';
        }
        
        // Chuẩn bị dữ liệu teamSpecificContents nếu là mật thư riêng
        let teamSpecificContentsData = [];
        if (messageType === 'individual') {
          // Lấy danh sách đội
          const teams = commonTeams.length > 0 ? commonTeams : station.teams;
          
          teamSpecificContentsData = teams.map(team => {
            const key = `0_${team}`;
            const teamContent = teamContents[key] || {
              contentType: 'text',
              content: '',
              correctAnswer: [],
              showText: true,
              showImage: false,
              showOTT: true,
              showNW: true,
              ottContent: '',
              nwContent: '',
              imageUrl: '',
              fontSize: '1.05rem',
              fontWeight: '500',
              lineHeight: '1.5',
              paragraphSpacing: '0.8rem'
            };
            
            // Đảm bảo correctAnswer luôn là mảng
            let correctAnswerArray = [];
            if (teamContent.correctAnswer) {
              if (Array.isArray(teamContent.correctAnswer)) {
                correctAnswerArray = [...teamContent.correctAnswer];
              } else {
                correctAnswerArray = [teamContent.correctAnswer];
              }
            }
            
            // Xác định nội dung cuối cùng dựa trên loại nội dung của đội
            let finalTeamContent = '';
            let finalTeamContentType = '';
            
            if (teamContent.showImage && !teamContent.showText) {
              // Chỉ ảnh
              finalTeamContent = teamContent.imageUrl || '';
              finalTeamContentType = 'image';
            } else if (teamContent.showText && !teamContent.showImage) {
              // Chỉ văn bản
              finalTeamContentType = 'text';
              
              if (teamContent.showOTT && teamContent.showNW) {
                finalTeamContent = `OTT:\n${teamContent.ottContent || ''}\n\nNW:\n${teamContent.nwContent || ''}\n/AR`;
              } else if (teamContent.showOTT) {
                finalTeamContent = `OTT:\n${teamContent.ottContent || ''}`;
              } else if (teamContent.showNW) {
                finalTeamContent = `NW:\n${teamContent.nwContent || ''}\n/AR`;
              }
            } else if (teamContent.showImage && teamContent.showText) {
              // Cả hai
              finalTeamContentType = 'both';
              
              if (teamContent.imageUrl) {
                finalTeamContent = teamContent.imageUrl;
              }
            } else {
              // Không có nội dung
              finalTeamContent = '';
              finalTeamContentType = 'text';
            }
            
            return {
              team: team,
              content: finalTeamContent,
              contentType: finalTeamContentType,
              correctAnswer: correctAnswerArray,
              // Thêm các thuộc tính hiển thị
              showText: teamContent.showText !== undefined ? teamContent.showText : true,
              showImage: teamContent.showImage !== undefined ? teamContent.showImage : false,
              showOTT: teamContent.showOTT !== undefined ? teamContent.showOTT : true,
              showNW: teamContent.showNW !== undefined ? teamContent.showNW : true,
              ottContent: teamContent.ottContent || '',
              nwContent: teamContent.nwContent || '',
              // Thông tin font
              fontSize: teamContent.fontSize || '1.05rem',
              fontWeight: teamContent.fontWeight || '500',
              lineHeight: teamContent.lineHeight || '1.5',
              paragraphSpacing: teamContent.paragraphSpacing || '0.8rem'
            };
          });
          
          console.log('Created teamSpecificContents for update:', {
            count: teamSpecificContentsData.length,
            firstTeam: teamSpecificContentsData[0]?.team,
            firstAnswers: teamSpecificContentsData[0]?.correctAnswer
          });
        }
        
        // Cập nhật dữ liệu để cập nhật
        const stationData = {
          name: station.name,
          teams: commonTeams.length > 0 ? commonTeams : station.teams,
          content: finalContent,
          contentType: finalContentType,
          correctAnswer: station.correctAnswer,
          maxAttempts: station.maxAttempts,
          lockTime: station.lockTime,
          showText: station.showText,
          showImage: station.showImage,
          showOTT: station.showOTT,
          showNW: station.showNW,
          ottContent: station.ottContent,
          nwContent: station.nwContent,
          gameName: gameName, 
          gameNote: gameNote,
          fontSize: station.fontSize || '1.05rem',
          fontWeight: station.fontWeight || '500',
          lineHeight: station.lineHeight || '1.5',
          paragraphSpacing: station.paragraphSpacing || '0.8rem',
          // Thêm trường loại mật thư
          messageType: messageType
        };
        
        // Thêm teamSpecificContents nếu là mật thư riêng
        if (messageType === 'individual') {
          stationData.teamSpecificContents = teamSpecificContentsData;

          // Log chi tiết về teamSpecificContents trước khi gửi lên server
          console.log('Final teamSpecificContents to send:', {
            count: teamSpecificContentsData.length,
            teamsIncluded: teamSpecificContentsData.map(t => t.team),
            firstTeamDetails: teamSpecificContentsData.length > 0 ? {
              team: teamSpecificContentsData[0].team,
              contentType: teamSpecificContentsData[0].contentType,
              showText: teamSpecificContentsData[0].showText,
              showImage: teamSpecificContentsData[0].showImage,
              correctAnswerLength: teamSpecificContentsData[0].correctAnswer.length
            } : 'No teams'
          });
        }
        
        // Debug log để kiểm tra dữ liệu trước khi gửi
        console.debug('Sending station data to server:', {
          fontSize: stationData.fontSize,
          fontWeight: stationData.fontWeight,
          lineHeight: stationData.lineHeight,
          paragraphSpacing: stationData.paragraphSpacing
        });
        
        // Gọi API cập nhật
        await stationApi.update(id, stationData);
        setSuccess(t('update_station_success'));
        
        // Chuyển hướng sau 1.5 giây
        setTimeout(() => {
          navigate('/admin/stations');
        }, 1500);
      } else {
        // Tạo mới nhiều trạm
        const stationsToCreate = [];
        
        for (let i = 0; i < stations.length; i++) {
          const station = stations[i];
          
          if (messageType === 'common') {
            // Xử lý mật thư chung cho các đội (giữ logic cũ)
            // Xây dựng nội dung dựa vào loại
            let finalContent = '';
            let finalContentType = '';
            
            if (station.showImage && !station.showText) {
              // Chỉ ảnh
              finalContent = station.imagePreview || '';
              finalContentType = 'image';
            } else if (station.showText && !station.showImage) {
              // Chỉ văn bản
              finalContentType = 'text';
              
              if (station.showOTT && station.showNW) {
                finalContent = `OTT:\n${station.ottContent || ''}\n\nNW:\n${station.nwContent || ''}\n/AR`;
              } else if (station.showOTT) {
                finalContent = `OTT:\n${station.ottContent || ''}`;
              } else if (station.showNW) {
                finalContent = `NW:\n${station.nwContent || ''}\n/AR`;
              }
            } else if (station.showImage && station.showText) {
              // Cả hai
              finalContentType = 'both';
              
              if (station.imagePreview) {
                finalContent = station.imagePreview;
              }
            } else {
              // Không có nội dung
              finalContent = '';
              finalContentType = 'text';
            }
            
            // Thêm vào mảng các trạm để tạo
            stationsToCreate.push({
              ...station,
              content: finalContent,
              contentType: finalContentType,
              teams: commonTeams, // Sử dụng danh sách đội chung
              gameName: gameName, // Sử dụng tên mật thư chung
              gameNote: gameNote, // Sử dụng ghi chú chung
              messageType: 'common', // Thêm trường cho biết loại mật thư
              fontSize: station.fontSize || '1.05rem',
              fontWeight: station.fontWeight || '500',
              lineHeight: station.lineHeight || '1.5'
            });
          } else {
            // Xử lý mật thư riêng cho từng đội
            // Tạo mảng nội dung riêng cho từng đội
            const teamSpecificContents = commonTeams.map(team => {
              const key = `${i}_${team}`;
              const teamContent = teamContents[key] || {
                contentType: 'text',
                content: '',
                correctAnswer: [],
                showText: true,
                showImage: false,
                showOTT: true,
                showNW: true,
                ottContent: '',
                nwContent: '',
                imageUrl: '',
                fontSize: '1.05rem',
                fontWeight: '500',
                lineHeight: '1.5',
                paragraphSpacing: '0.8rem'
              };
              
              // Đảm bảo correctAnswer luôn là mảng
              let correctAnswerArray = [];
              if (teamContent.correctAnswer) {
                if (Array.isArray(teamContent.correctAnswer)) {
                  correctAnswerArray = [...teamContent.correctAnswer];
                } else {
                  correctAnswerArray = [teamContent.correctAnswer];
                }
              }
              
              // Xác định nội dung cuối cùng dựa trên loại nội dung của đội
              let finalContent = '';
              let finalContentType = '';
              
              if (teamContent.showImage && !teamContent.showText) {
                // Chỉ ảnh
                finalContent = teamContent.imageUrl || '';
                finalContentType = 'image';
              } else if (teamContent.showText && !teamContent.showImage) {
                // Chỉ văn bản
                finalContentType = 'text';
                
                if (teamContent.showOTT && teamContent.showNW) {
                  finalContent = `OTT:\n${teamContent.ottContent || ''}\n\nNW:\n${teamContent.nwContent || ''}\n/AR`;
                } else if (teamContent.showOTT) {
                  finalContent = `OTT:\n${teamContent.ottContent || ''}`;
                } else if (teamContent.showNW) {
                  finalContent = `NW:\n${teamContent.nwContent || ''}\n/AR`;
                }
              } else if (teamContent.showImage && teamContent.showText) {
                // Cả hai
                finalContentType = 'both';
                
                if (teamContent.imageUrl) {
                  finalContent = teamContent.imageUrl;
                }
              } else {
                // Không có nội dung
                finalContent = '';
                finalContentType = 'text';
              }
              
              return {
                team: team,
                content: finalContent,
                contentType: finalContentType,
                correctAnswer: correctAnswerArray,
                // Thêm các thuộc tính hiển thị
                showText: teamContent.showText !== undefined ? teamContent.showText : true,
                showImage: teamContent.showImage !== undefined ? teamContent.showImage : false,
                showOTT: teamContent.showOTT !== undefined ? teamContent.showOTT : true,
                showNW: teamContent.showNW !== undefined ? teamContent.showNW : true,
                ottContent: teamContent.ottContent || '',
                nwContent: teamContent.nwContent || '',
                // Thông tin font
                fontSize: teamContent.fontSize || '1.05rem',
                fontWeight: teamContent.fontWeight || '500',
                lineHeight: teamContent.lineHeight || '1.5',
                paragraphSpacing: teamContent.paragraphSpacing || '0.8rem'
              };
            });
            
            // Xây dựng nội dung chung cho trạm (không phụ thuộc vào nội dung riêng của từng đội)
            // Cần có nội dung chung vì content là required trong schema
            let stationFinalContent = '';
            let stationFinalContentType = 'text';
            
            // Sử dụng nội dung chung từ trạm nếu có hoặc từ đội đầu tiên nếu không có
            if (station.content || station.ottContent || station.nwContent) {
              if (station.showImage && !station.showText) {
                // Chỉ ảnh
                stationFinalContent = station.content || station.imagePreview || '';
                stationFinalContentType = 'image';
              } else if (station.showText && !station.showImage) {
                // Chỉ văn bản
                stationFinalContentType = 'text';
                
                if (station.showOTT && station.showNW) {
                  stationFinalContent = `OTT:\n${station.ottContent || ''}\n\nNW:\n${station.nwContent || ''}\n/AR`;
                } else if (station.showOTT) {
                  stationFinalContent = `OTT:\n${station.ottContent || ''}`;
                } else if (station.showNW) {
                  stationFinalContent = `NW:\n${station.nwContent || ''}\n/AR`;
                }
              } else if (station.showImage && station.showText) {
                // Cả hai
                stationFinalContentType = 'both';
                stationFinalContent = station.content || station.imagePreview || '';
              }
            } else if (teamSpecificContents.length > 0) {
              // Nếu không có nội dung chung, sử dụng nội dung của đội đầu tiên làm nội dung chung
              stationFinalContent = teamSpecificContents[0].content || "Nội dung chung";
              stationFinalContentType = teamSpecificContents[0].contentType || 'text';
            } else {
              // Nếu không có gì, sử dụng nội dung mặc định
              stationFinalContent = "Mật thư riêng cho từng đội";
              stationFinalContentType = 'text';
            }
            
            // Thêm vào mảng các trạm để tạo
            stationsToCreate.push({
              ...station,
              content: stationFinalContent, // Thêm nội dung chung thỏa mãn yêu cầu required
              contentType: stationFinalContentType, // Thêm loại nội dung chung
              teamSpecificContents: teamSpecificContents, // Thêm nội dung riêng cho từng đội
              teams: commonTeams, // Sử dụng danh sách đội chung
              gameName: gameName, // Sử dụng tên mật thư chung
              gameNote: gameNote, // Sử dụng ghi chú chung
              messageType: 'individual', // Thêm trường cho biết loại mật thư
              fontSize: station.fontSize || '1.05rem',
              fontWeight: station.fontWeight || '500',
              lineHeight: station.lineHeight || '1.5'
            });
          }
        }

        if (stationsToCreate.length > 0) {
          await stationApi.createMultiple(stationsToCreate);
          setSuccess(t('create_stations_success').replace('{count}', stations.length));
          
          // Reset form sau khi tạo mới
          setStations([{
            name: '',
            teams: commonTeams,
            content: '',
            contentType: 'text',
            correctAnswer: [],
            maxAttempts: 5,
            lockTime: 0,
            showText: true,
            showImage: false,
            showOTT: true,
            showNW: true,
            ottContent: '',
            nwContent: '',
            gameName: gameName,
            gameNote: gameNote,
            fontSize: '1.05rem',
            fontWeight: '500',
            lineHeight: '1.5'
          }]);
          setTeamContents({});
        }
      }
    } catch (err) {
      console.error('Error submitting station(s):', err);
      setError(t('submit_station_error'));
    } finally {
      setLoading(false);
    }
  };

  // Render form tạo nhiều trạm
  const renderMultipleStationsForm = () => {
    return (
      <Form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <Card.Header>
            <h4>{t('game_settings')}</h4>
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-4">
              <Form.Label>{t('game_name')}</Form.Label>
              <Form.Control
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder={t('game_name_placeholder')}
              />
              <Form.Text className="text-muted">
                {t('game_name_note')}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>{t('game_note')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={gameNote}
                onChange={(e) => setGameNote(e.target.value)}
                placeholder={t('game_note_placeholder')}
              />
              <Form.Text className="text-muted">
                {t('game_note_note')}
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Loại mật thư</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  label="Mật thư chung cho các đội"
                  name="messageType"
                  id="common-message"
                  checked={messageType === 'common'}
                  onChange={() => handleMessageTypeChange('common')}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  label="Mật thư riêng cho từng đội"
                  name="messageType"
                  id="individual-message"
                  checked={messageType === 'individual'}
                  onChange={() => handleMessageTypeChange('individual')}
                />
              </div>
              <Form.Text className="text-muted">
                {messageType === 'common' ? 
                  'Tất cả các đội sẽ thấy cùng một nội dung mật thư' : 
                  'Mỗi đội sẽ thấy nội dung mật thư khác nhau'}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>{t('teams_label')}</Form.Label>
              <InputGroup className="mb-2">
                <Form.Control
                  type="text"
                  value={teamsInput}
                  onChange={(e) => setTeamsInput(e.target.value)}
                  onKeyPress={handleTeamKeyPress}
                  placeholder="Nhập tên đội"
                />
                <Button 
                  variant="primary" 
                  onClick={handleAddTeam}
                  disabled={!teamsInput}
                >
                  {t('add_team')}
                </Button>
                <Button 
                  variant="outline-primary" 
                  onClick={handleAddMultipleTeams}
                  disabled={!teamsInput}
                >
                  {t('add_multiple_teams')}
                </Button>
              </InputGroup>
              <Form.Text className="text-muted">
                {t('teams_input_note')}
              </Form.Text>

              {/* Hiển thị danh sách đội có sẵn nếu có */}
              {availableTeams.length > 0 && (
                <Row className="mb-3">
                  <Col>
                    <h6>{t('available_teams')} ({availableTeams.length} {t('team_count')})</h6>
                      <div className="d-flex flex-wrap">
                        {availableTeams.map((team, index) => (
                          <div key={index} className="me-2 mb-2">
                            <Badge 
                              bg={commonTeams.includes(team) ? "primary" : "secondary"} 
                              className="d-flex align-items-center"
                              style={{ fontSize: '14px', padding: '8px', cursor: 'pointer' }}
                              onClick={() => toggleTeamSelection(team)}
                            >
                              {team}
                              {commonTeams.includes(team) && (
                                <i className="bi bi-check-lg ms-1"></i>
                              )}
                            </Badge>
                          </div>
                        ))}
                      </div>
                  </Col>
                </Row>
              )}

              {/* Hiển thị danh sách đội đã chọn */}
              {commonTeams.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2">{t('selected_teams')}:</p>
                  <div className="d-flex flex-wrap gap-2">
                    {commonTeams.map((team, i) => (
                      <Badge 
                        key={i} 
                        bg="primary" 
                        className="selected-team-badge"
                        style={{ fontSize: '14px', padding: '8px', cursor: 'pointer' }}
                      >
                        {team} 
                        <i 
                          className="bi bi-x-circle-fill ms-2" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleRemoveTeam(i)}
                        ></i>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h4>{t('stations_list')}</h4>
              <Button 
                variant="success" 
                size="sm" 
                onClick={addNewStation}
              >
                <i className="bi bi-plus-circle me-1"></i>
                {t('add_new_station')}
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            {stations.length === 0 ? (
              <p className="text-center py-3">{t('no_stations')}</p>
            ) : (
              <Accordion 
                defaultActiveKey={['0']} 
                alwaysOpen
                onSelect={handleAccordionSelect}
                activeKey={selectedStationIndex.toString()}
              >
                {stations.map((station, index) => (
                  <Accordion.Item eventKey={index.toString()} key={index}>
                    <Accordion.Header>
                      <div className="d-flex justify-content-between align-items-center w-100 me-3">
                        <span>
                         Trạm #{index + 1}: {station.name || t('station_name_placeholder')}
                        </span>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStation(index);
                          }}
                        >
                          <i className="bi bi-trash"></i> {t('remove_station')}
                        </Button>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className="d-flex justify-content-end mb-3">
                      </div>
                        
                      <Row className="mb-3">
                        <Col>
                          <Form.Group>
                            <Form.Label>{t('station_name_label')}</Form.Label>
                            <Form.Control
                              type="text"
                              value={station.name}
                              onChange={(e) => handleStationChange(index, 'name', e.target.value)}
                              placeholder={t('station_name_placeholder')}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      {messageType === 'common' ? (
                        // Nội dung chung cho tất cả đội
                        <>
                          <Row className="mb-3">
                            <Col md={12}>
                              <Form.Group>
                                <Form.Label>{t('content_type_label')}</Form.Label>
                                <div className="d-flex">
                                  <Form.Check 
                                    type="checkbox"
                                    id={`showText-${index}`}
                                    label={t('content_text_label')}
                                    className="me-3"
                                    checked={station.showText}
                                    onChange={(e) => handleStationChange(index, 'showText', e.target.checked)}
                                  />
                                  <Form.Check 
                                    type="checkbox"
                                    id={`showImage-${index}`}
                                    label={t('content_image_label')}
                                    checked={station.showImage}
                                    onChange={(e) => handleStationChange(index, 'showImage', e.target.checked)}
                                  />
                                </div>
                              </Form.Group>
                            </Col>
                          </Row>

                          {station.showText && (
                            <>
                              <Row className="mb-2">
                                <Col md={12}>
                                  <Form.Group>
                                    <Form.Label>{t('text_format_label')}</Form.Label>
                                    <div className="d-flex">
                                      <Form.Check 
                                        type="checkbox"
                                        id={`showOTT-${index}`}
                                        label={t('ott_content_label')}
                                        className="me-4"
                                        checked={station.showOTT}
                                        onChange={(e) => handleStationChange(index, 'showOTT', e.target.checked)}
                                      />
                                      <Form.Check 
                                        type="checkbox"
                                        id={`showNW-${index}`}
                                        label={t('nw_content_label')}
                                        checked={station.showNW}
                                        onChange={(e) => handleStationChange(index, 'showNW', e.target.checked)}
                                      />
                                    </div>
                                  </Form.Group>
                                </Col>
                              </Row>

                              {/* Thêm chọn kích thước chữ */}
                              <Form.Group className="mb-3">
                                <Form.Label>{t('font_settings')}</Form.Label>
                                <Row className="g-2">
                                  <Col md={3}>
                                    <Form.Label className="small mb-1">Kích thước chữ:</Form.Label>
                                    <Form.Select 
                                      value={station.fontSize || '1.05rem'} 
                                      onChange={(e) => handleStationChange(index, 'fontSize', e.target.value)}
                                      className="form-select-sm"
                                    >
                                      <option value="0.8rem">Nhỏ (0.8rem)</option>
                                      <option value="1.05rem">Trung bình (1.05rem)</option>
                                      <option value="1.3rem">Lớn (1.3rem)</option>
                                      <option value="1.5rem">Rất lớn (1.5rem)</option>
                                    </Form.Select>
                                  </Col>
                                  <Col md={3}>
                                    <Form.Label className="small mb-1">Độ đậm chữ:</Form.Label>
                                    <Form.Select 
                                      value={station.fontWeight || '500'} 
                                      onChange={(e) => handleStationChange(index, 'fontWeight', e.target.value)}
                                      className="form-select-sm"
                                    >
                                      <option value="200">Bình thường (200)</option>
                                      <option value="500">Vừa phải (500)</option>
                                      <option value="700">Đậm (700)</option>
                                      <option value="900">Rất đậm (900)</option>
                                    </Form.Select>
                                  </Col>
                                  <Col md={3}>
                                    <Form.Label className="small mb-1">Khoảng cách dòng:</Form.Label>
                                    <Form.Select 
                                      value={station.lineHeight || '1.5'} 
                                      onChange={(e) => handleStationChange(index, 'lineHeight', e.target.value)}
                                      className="form-select-sm"
                                    >
                                      <option value="1">Hẹp (1)</option>
                                      <option value="1.5">Trung bình (1.5)</option>
                                      <option value="2">Rộng (2)</option>
                                      <option value="2.5">Rất rộng (2.5)</option>
                                    </Form.Select>
                                  </Col>
                                  <Col md={3}>
                                    <Form.Label className="small mb-1">Khoảng cách đoạn:</Form.Label>
                                    <Form.Select 
                                      value={station.paragraphSpacing || '0.8rem'} 
                                      onChange={(e) => handleStationChange(index, 'paragraphSpacing', e.target.value)}
                                      className="form-select-sm"
                                    >
                                      <option value="0">Không cách (0)</option>
                                      <option value="0.5rem">Hẹp (0.5rem)</option>
                                      <option value="0.8rem">Trung bình (0.8rem)</option>
                                      <option value="1.2rem">Rộng (1.2rem)</option>
                                      <option value="1.8rem">Rất rộng (1.8rem)</option>
                                    </Form.Select>
                                  </Col>
                                </Row>
                              </Form.Group>

                              {station.showOTT && (
                                <Row className="mb-3">
                                  <Col>
                                    <Form.Group>
                                      <Form.Label>{t('ott_content_label')}</Form.Label>
                                      <Form.Control
                                        as="textarea"
                                        rows={7}
                                        value={station.ottContent || ''}
                                        onChange={(e) => handleStationChange(index, 'ottContent', e.target.value)}
                                        placeholder="Nhập nội dung OTT"
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>
                              )}

                              {station.showNW && (
                                <Row className="mb-3">
                                  <Col>
                                    <Form.Group>
                                      <Form.Label>{t('nw_content_label')}</Form.Label>
                                      <InputGroup>
                                        <Form.Control
                                          as="textarea"
                                          rows={7}
                                          value={station.nwContent || ''}
                                          onChange={(e) => handleStationChange(index, 'nwContent', e.target.value)}
                                          placeholder="Nhập nội dung NW"
                                        />
                                        <InputGroup.Text className="fw-bold">/AR</InputGroup.Text>
                                      </InputGroup>
                                    </Form.Group>
                                  </Col>
                                </Row>
                              )}
                            </>
                          )}

                          {station.showImage && (
                            <Row className="mb-3">
                              <Col>
                                <Form.Group>
                                  <Form.Label>{t('content_image_label')}</Form.Label>
                                  <div className="d-flex align-items-center mb-2">
                                    <input
                                      type="file"
                                      className="d-none"
                                      ref={el => multipleFileInputRefs.current[`station_${index}`] = el}
                                      accept="image/*"
                                      onChange={(e) => handleImageUpload(e, index)}
                                    />
                                    <Button
                                      variant="outline-primary"
                                      onClick={() => multipleFileInputRefs.current[`station_${index}`]?.click()}
                                      disabled={uploadLoading}
                                      className="me-2"
                                    >
                                      {uploadLoading ? (
                                        <>
                                          <Spinner animation="border" size="sm" className="me-1" />
                                          {t('uploading')}
                                        </>
                                      ) : (
                                        t('choose_image')
                                      )}
                                    </Button>
                                    <span className="text-muted">{t('or')}</span>
                                  </div>
                                  
                                  <Form.Control
                                    type="text"
                                    value={station.content || ''}
                                    onChange={(e) => handleStationChange(index, 'content', e.target.value)}
                                    placeholder={t('image_url_placeholder')}
                                    className="mt-2"
                                  />
                                  <Form.Text className="text-muted">
                                    {t('image_upload_help')}
                                  </Form.Text>
                                  
                                  {station.imagePreview && (
                                    <div className="mt-3 border rounded p-2 text-center">
                                      <p className="mb-2">{t('preview')}</p>
                                      <img 
                                        src={station.imagePreview} 
                                        alt="Preview" 
                                        style={{ maxWidth: '100%', maxHeight: '200px' }}
                                      />
                                    </div>
                                  )}
                                </Form.Group>
                              </Col>
                            </Row>
                          )}

                          <Row className="mb-3">
                            <Col>
                              <Form.Group>
                                <Form.Label>{t('correct_answer_label')}</Form.Label>
                                <InputGroup>
                                  <Form.Control
                                    as="textarea"
                                    rows={2}
                                    type="text"
                                    value={answersInputMap[index] || ''}
                                    onChange={(e) => handleAnswerInputChange(index, e.target.value)}
                                    placeholder="Nhập đáp án"
                                  />
                                  <Button 
                                    variant="outline-primary" 
                                    onClick={() => handleAddAnswer(index)}
                                    disabled={!answersInputMap[index]}
                                  >
                                    <i className="bi bi-plus"></i> Thêm
                                  </Button>
                                </InputGroup>
                                <Form.Text className="text-muted">
                                  Mỗi đáp án sẽ được thêm vào danh sách các đáp án chấp nhận được.
                                </Form.Text>
                                
                                {station.correctAnswer && station.correctAnswer.length > 0 && (
                                  <div className="mt-2">
                                    <p className="mb-2">Các đáp án chấp nhận:</p>
                                    <div className="d-flex flex-wrap gap-2">
                                      {station.correctAnswer.map((answer, i) => (
                                        <Badge 
                                          key={i} 
                                          bg="success" 
                                          className="p-2"
                                        >
                                          {answer} 
                                          <i 
                                            className="bi bi-x-circle-fill ms-1" 
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => removeAnswer(index, i)}
                                          ></i>
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </Form.Group>
                            </Col>
                          </Row>
                        </>
                      ) : (
                        // Nội dung riêng cho từng đội
                        <>
                          {commonTeams.length > 0 ? (
                            <Tabs defaultActiveKey={commonTeams[0]} className="mb-3">
                              {commonTeams.map(team => {
                                const teamContent = getTeamContent(index, team);
                                return (
                                  <Tab key={team} eventKey={team} title={team}>
                                    <Row className="mb-3">
                                      <Col md={12}>
                                        <Form.Group>
                                          <Form.Label>{t('content_type_label')}</Form.Label>
                                          <div className="d-flex">
                                            <Form.Check 
                                              type="checkbox"
                                              id={`team-${index}-${team}-showText`}
                                              label={t('content_text_label')}
                                              className="me-3"
                                              checked={teamContent.showText}
                                              onChange={(e) => handleTeamContentChange(index, team, 'showText', e.target.checked)}
                                            />
                                            <Form.Check 
                                              type="checkbox"
                                              id={`team-${index}-${team}-showImage`}
                                              label={t('content_image_label')}
                                              checked={teamContent.showImage}
                                              onChange={(e) => handleTeamContentChange(index, team, 'showImage', e.target.checked)}
                                            />
                                          </div>
                                        </Form.Group>
                                      </Col>
                                    </Row>

                                    {teamContent.showText && (
                                      <>
                                        <Row className="mb-2">
                                          <Col md={12}>
                                            <Form.Group>
                                              <Form.Label>{t('text_format_label')}</Form.Label>
                                              <div className="d-flex">
                                                <Form.Check 
                                                  type="checkbox"
                                                  id={`team-${index}-${team}-showOTT`}
                                                  label={t('ott_content_label')}
                                                  className="me-4"
                                                  checked={teamContent.showOTT}
                                                  onChange={(e) => handleTeamContentChange(index, team, 'showOTT', e.target.checked)}
                                                />
                                                <Form.Check 
                                                  type="checkbox"
                                                  id={`team-${index}-${team}-showNW`}
                                                  label={t('nw_content_label')}
                                                  checked={teamContent.showNW}
                                                  onChange={(e) => handleTeamContentChange(index, team, 'showNW', e.target.checked)}
                                                />
                                              </div>
                                            </Form.Group>
                                          </Col>
                                        </Row>

                                        {/* Thêm chọn kích thước chữ cho từng đội */}
                                        <Form.Group className="mb-3">
                                          <Form.Label>Font hiển thị cho đội</Form.Label>
                                          <Row className="g-2">
                                            <Col md={3}>
                                              <Form.Label className="small mb-1">Kích thước chữ:</Form.Label>
                                              <Form.Select 
                                                value={teamContent.fontSize || '1.05rem'} 
                                                onChange={(e) => handleTeamContentChange(index, team, 'fontSize', e.target.value)}
                                                className="form-select-sm"
                                              >
                                                <option value="0.8rem">Nhỏ (0.8rem)</option>
                                                <option value="1.05rem">Trung bình (1.05rem)</option>
                                                <option value="1.3rem">Lớn (1.3rem)</option>
                                                <option value="1.5rem">Rất lớn (1.5rem)</option>
                                              </Form.Select>
                                            </Col>
                                            <Col md={3}>
                                              <Form.Label className="small mb-1">Độ đậm chữ:</Form.Label>
                                              <Form.Select 
                                                value={teamContent.fontWeight || '500'} 
                                                onChange={(e) => handleTeamContentChange(index, team, 'fontWeight', e.target.value)}
                                                className="form-select-sm"
                                              >
                                                <option value="200">Bình thường (200)</option>
                                                <option value="500">Vừa phải (500)</option>
                                                <option value="700">Đậm (700)</option>
                                                <option value="900">Rất đậm (900)</option>
                                              </Form.Select>
                                            </Col>
                                            <Col md={3}>
                                              <Form.Label className="small mb-1">Khoảng cách dòng:</Form.Label>
                                              <Form.Select 
                                                value={teamContent.lineHeight || '1.5'} 
                                                onChange={(e) => handleTeamContentChange(index, team, 'lineHeight', e.target.value)}
                                                className="form-select-sm"
                                              >
                                                <option value="1">Hẹp (1)</option>
                                                <option value="1.5">Trung bình (1.5)</option>
                                                <option value="2">Rộng (2)</option>
                                                <option value="2.5">Rất rộng (2.5)</option>
                                              </Form.Select>
                                            </Col>
                                            <Col md={3}>
                                              <Form.Label className="small mb-1">Khoảng cách đoạn:</Form.Label>
                                              <Form.Select 
                                                value={teamContent.paragraphSpacing || '0.8rem'} 
                                                onChange={(e) => handleTeamContentChange(index, team, 'paragraphSpacing', e.target.value)}
                                                className="form-select-sm"
                                              >
                                                <option value="0">Không cách (0)</option>
                                                <option value="0.5rem">Hẹp (0.5rem)</option>
                                                <option value="0.8rem">Trung bình (0.8rem)</option>
                                                <option value="1.2rem">Rộng (1.2rem)</option>
                                                <option value="1.8rem">Rất rộng (1.8rem)</option>
                                              </Form.Select>
                                            </Col>
                                          </Row>
                                        </Form.Group>

                                        {teamContent.showOTT && (
                                          <Row className="mb-3">
                                            <Col>
                                              <Form.Group>
                                                <Form.Label>{t('ott_content_label')}</Form.Label>
                                                <Form.Control
                                                  as="textarea"
                                                  rows={3}
                                                  value={teamContent.ottContent || ''}
                                                  onChange={(e) => handleTeamContentChange(index, team, 'ottContent', e.target.value)}
                                                  placeholder="Nhập nội dung OTT cho đội này"
                                                />
                                              </Form.Group>
                                            </Col>
                                          </Row>
                                        )}

                                        {teamContent.showNW && (
                                          <Row className="mb-3">
                                            <Col>
                                              <Form.Group>
                                                <Form.Label>{t('nw_content_label')}</Form.Label>
                                                <InputGroup>
                                                  <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    value={teamContent.nwContent || ''}
                                                    onChange={(e) => handleTeamContentChange(index, team, 'nwContent', e.target.value)}
                                                    placeholder="Nhập nội dung NW cho đội này"
                                                  />
                                                  <InputGroup.Text className="fw-bold">/AR</InputGroup.Text>
                                                </InputGroup>
                                              </Form.Group>
                                            </Col>
                                          </Row>
                                        )}
                                      </>
                                    )}

                                    {teamContent.showImage && (
                                      <Row className="mb-3">
                                        <Col>
                                          <Form.Group>
                                            <Form.Label>{t('content_image_label')}</Form.Label>
                                            <div className="d-flex align-items-center mb-2">
                                              <input
                                                type="file"
                                                className="d-none"
                                                ref={el => { 
                                                  if (!multipleFileInputRefs.current[`team_${index}_${team}`]) {
                                                    multipleFileInputRefs.current[`team_${index}_${team}`] = el;
                                                  }
                                                }}
                                                accept="image/*"
                                                onChange={(e) => handleTeamImageUpload(e, index, team)}
                                              />
                                              <Button
                                                variant="outline-primary"
                                                onClick={() => multipleFileInputRefs.current[`team_${index}_${team}`]?.click()}
                                                disabled={uploadLoading}
                                                className="me-2"
                                              >
                                                {uploadLoading ? (
                                                  <>
                                                    <Spinner animation="border" size="sm" className="me-1" />
                                                    {t('uploading')}
                                                  </>
                                                ) : (
                                                  t('choose_image')
                                                )}
                                              </Button>
                                              <span className="text-muted">{t('or')}</span>
                                            </div>
                                            
                                            <Form.Control
                                              type="text"
                                              value={teamContent.imageUrl || ''}
                                              onChange={(e) => handleTeamContentChange(index, team, 'imageUrl', e.target.value)}
                                              placeholder={t('image_url_placeholder')}
                                              className="mt-2"
                                            />
                                            <Form.Text className="text-muted">
                                              {t('image_upload_help')}
                                            </Form.Text>
                                            
                                            {teamContent.imageUrl && (
                                              <div className="mt-3 border rounded p-2 text-center">
                                                <p className="mb-2">{t('preview')}</p>
                                                <img 
                                                  src={teamContent.imagePreview || 
                                                      (teamContent.imageUrl.startsWith('/api/')
                                                      ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${teamContent.imageUrl}`
                                                      : teamContent.imageUrl)} 
                                                  alt="Preview" 
                                                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                                                  className="img-thumbnail"
                                                  onError={(e) => {
                                                    console.error('Lỗi tải hình ảnh xem trước:', e);
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/400x300?text=Không+thể+hiển+thị+hình+ảnh';
                                                  }}
                                                />
                                              </div>
                                            )}
                                          </Form.Group>
                                        </Col>
                                      </Row>
                                    )}

                                    <Row className="mb-3">
                                      <Col>
                                        <Form.Group>
                                          <Form.Label>{t('correct_answer_label')}</Form.Label>
                                          <InputGroup>
                                            <Form.Control
                                              as="textarea"
                                              rows={2}
                                              type="text"
                                              value={teamAnswersInputMap[`${index}_${team}`] || ''}
                                              onChange={(e) => handleTeamAnswerInputChange(index, team, e.target.value)}
                                              placeholder="Nhập đáp án cho đội này"
                                            />
                                            <Button 
                                              variant="outline-primary" 
                                              onClick={() => handleAddTeamAnswer(index, team)}
                                              disabled={!teamAnswersInputMap[`${index}_${team}`]}
                                            >
                                              <i className="bi bi-plus"></i> Thêm
                                            </Button>
                                          </InputGroup>
                                          <Form.Text className="text-muted">
                                            {t('answers_input_note')}
                                          </Form.Text>
                                          
                                          {teamContent.correctAnswer && 
                                          (Array.isArray(teamContent.correctAnswer) 
                                          ? teamContent.correctAnswer.length > 0 
                                          : teamContent.correctAnswer) && (
                                            <div className="mt-2">
                                              <p className="mb-2">{t('answers_list')}: {Array.isArray(teamContent.correctAnswer) 
                                              ? teamContent.correctAnswer.length 
                                              : 1} {t('answers')}</p>
                                              <div className="d-flex flex-wrap gap-2">
                                                {Array.isArray(teamContent.correctAnswer) 
                                                ? teamContent.correctAnswer.map((answer, i) => (
                                                  <Badge 
                                                    key={i} 
                                                    bg="success" 
                                                    className="p-2"
                                                  >
                                                    {answer} 
                                                    <i 
                                                      className="bi bi-x-circle-fill ms-1" 
                                                      style={{ cursor: 'pointer' }}
                                                      onClick={() => removeTeamAnswer(index, team, i)}
                                                    ></i>
                                                  </Badge>
                                                ))
                                                : (
                                                  <Badge 
                                                    bg="success" 
                                                    className="p-2"
                                                  >
                                                    {teamContent.correctAnswer} 
                                                    <i 
                                                      className="bi bi-x-circle-fill ms-1" 
                                                      style={{ cursor: 'pointer' }}
                                                      onClick={() => handleTeamContentChange(index, team, 'correctAnswer', [])}
                                                    ></i>
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </Form.Group>
                                      </Col>
                                    </Row>
                                  </Tab>
                                );
                              })}
                            </Tabs>
                          ) : (
                            <Alert variant="warning">
                              Vui lòng thêm ít nhất một đội để thiết lập nội dung riêng.
                            </Alert>
                          )}
                        </>
                      )}

                      <Row className="mb-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>{t('max_attempts_label')}</Form.Label>
                            <Form.Control
                              type="number"
                              min="1"
                              value={station.maxAttempts}
                              onChange={(e) => handleStationChange(index, 'maxAttempts', parseInt(e.target.value))}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>{t('lock_time_label')}</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              value={station.lockTime}
                              onChange={(e) => handleStationChange(index, 'lockTime', parseInt(e.target.value))}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </Card.Body>
        </Card>

        <div className="text-center">
          <Button 
            variant="primary" 
            type="submit" 
            size="lg" 
            className="px-5"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                {isEditMode ? t('updating') : t('creating')}
              </>
            ) : (
              isEditMode ? t('state_update') : t('state_create')
            )}
          </Button>
        </div>
      </Form>
    );
  };

  // Thêm hàm helper để xử lý nội dung cho từng đội
  const getTeamContent = (index, team) => {
    const key = `${index}_${team}`;
    return teamContents[key] || {
      contentType: 'text',
      content: '',
      correctAnswer: [],
      showText: true,
      showImage: false,
      showOTT: true,
      showNW: true,
      ottContent: '',
      nwContent: '',
      imageUrl: '',
      fontSize: '1.05rem',
      fontWeight: '500',
      lineHeight: '1.5',
      paragraphSpacing: '0.8rem'
    };
  };

  // Cập nhật xem trước khi trạm hoặc đội được chọn thay đổi
  useEffect(() => {
    updatePreview();
  }, [stations, teamContents, commonTeams, messageType, previewTeam]);
  
  // Hàm cập nhật nội dung xem trước
  const updatePreview = () => {
    if (stations.length === 0) return;
    
    // Lấy trạm đang chọn (sử dụng selectedStationIndex thay vì luôn lấy trạm đầu tiên)
    const currentStation = stations[selectedStationIndex] || stations[0];
    
    // Nếu không có đội nào được chọn, sử dụng đội đầu tiên
    const selectedTeam = previewTeam || (commonTeams.length > 0 ? commonTeams[0] : '');
    
    // Cập nhật đội đang xem trước nếu cần
    if (selectedTeam && !previewTeam) {
      setPreviewTeam(selectedTeam);
    }
    
    // Xác định nội dung xem trước dựa trên loại mật thư
    let previewContentData = null;
    
    if (messageType === 'individual' && selectedTeam) {
      // Nếu là mật thư riêng, lấy nội dung cho đội đã chọn
      const key = `${selectedStationIndex}_${selectedTeam}`;
      const teamContent = teamContents[key];
      
      if (teamContent) {
        previewContentData = {
          ...teamContent,
          // Đảm bảo các thuộc tính hiển thị
          showText: teamContent.showText !== undefined ? teamContent.showText : true,
          showImage: teamContent.showImage !== undefined ? teamContent.showImage : false,
          showOTT: teamContent.showOTT !== undefined ? teamContent.showOTT : true,
          showNW: teamContent.showNW !== undefined ? teamContent.showNW : true
        };
      } else {
        // Nếu không tìm thấy nội dung cho đội đã chọn, sử dụng nội dung chung làm dự phòng
        previewContentData = {
          contentType: currentStation.contentType || 'text',
          content: currentStation.content || '',
          ottContent: currentStation.ottContent || '',
          nwContent: currentStation.nwContent || '',
          showText: currentStation.showText !== undefined ? currentStation.showText : true,
          showImage: currentStation.showImage !== undefined ? currentStation.showImage : false,
          showOTT: currentStation.showOTT !== undefined ? currentStation.showOTT : true,
          showNW: currentStation.showNW !== undefined ? currentStation.showNW : true,
          fontSize: currentStation.fontSize || '1.05rem',
          fontWeight: currentStation.fontWeight || '500',
          lineHeight: currentStation.lineHeight || '1.5',
          paragraphSpacing: currentStation.paragraphSpacing || '0.8rem',
          imageUrl: currentStation.imagePreview || currentStation.content || ''
        };
      }
    } else {
      // Nếu là mật thư chung, sử dụng nội dung của trạm
      previewContentData = {
        contentType: currentStation.contentType || 'text',
        content: currentStation.content || '',
        ottContent: currentStation.ottContent || '',
        nwContent: currentStation.nwContent || '',
        showText: currentStation.showText !== undefined ? currentStation.showText : true,
        showImage: currentStation.showImage !== undefined ? currentStation.showImage : false,
        showOTT: currentStation.showOTT !== undefined ? currentStation.showOTT : true,
        showNW: currentStation.showNW !== undefined ? currentStation.showNW : true,
        fontSize: currentStation.fontSize || '1.05rem',
        fontWeight: currentStation.fontWeight || '500',
        lineHeight: currentStation.lineHeight || '1.5',
        paragraphSpacing: currentStation.paragraphSpacing || '0.8rem',
        imageUrl: currentStation.imagePreview || currentStation.content || ''
      };
    }
    
    // Cập nhật trạm xem trước
    const previewStationData = {
      ...currentStation,
      teams: commonTeams,
      gameName: gameName,
      gameNote: gameNote
    };
    
    setPreviewStation(previewStationData);
    setPreviewContent(previewContentData);
  };
  
  // Hàm thay đổi đội được xem trước
  const handlePreviewTeamChange = (team) => {
    setPreviewTeam(team);
  };
  
  // Hàm helper để lấy class CSS cho khoảng cách đoạn (phục vụ xem trước)
  const getParagraphSpacingClass = (spacing) => {
    if (!spacing || spacing === '0') return 'paragraph-spacing-none';
    if (spacing === '0.5rem') return 'paragraph-spacing-small';
    if (spacing === '0.8rem') return 'paragraph-spacing-medium';
    if (spacing === '1.2rem') return 'paragraph-spacing-large';
    if (spacing === '1.8rem') return 'paragraph-spacing-xlarge';
    
    // Fallback to medium spacing if unknown value
    return 'paragraph-spacing-medium';
  };
  
  // Hàm tạo các style cho nội dung xem trước
  const getContentStyle = (content) => {
    if (!content) return {};
    
    return {
      fontSize: content.fontSize || '1.05rem',
      fontWeight: content.fontWeight || '500',
      lineHeight: content.lineHeight || '1.5',
      letterSpacing: '0.01em'
    };
  };
  
  // Render thành phần xem trước
  const renderPreview = () => {
    if (!previewStation || !previewContent) return null;
    
    return (
      <div 
        className={`preview-container ${previewExpanded ? 'expanded' : 'collapsed'}`}
        onClick={previewExpanded ? undefined : () => setPreviewExpanded(true)}
      >
        {previewExpanded ? (
          <>
            <div className="preview-header">
              <h4>Xem trước</h4>
              <div className="preview-controls">
                <Button variant="light" size="sm" onClick={() => setPreviewExpanded(false)}>
                  <i className="bi bi-x-lg"></i>
                </Button>
              </div>
            </div>
            
            <div className="preview-content-container">
              {/* Chọn đội để xem trước */}
              {commonTeams.length > 0 && (
                <div className="preview-team-selector">
                  <Form.Select 
                    value={previewTeam} 
                    onChange={(e) => handlePreviewTeamChange(e.target.value)}
                    size="sm"
                  >
                    {commonTeams.map((team, idx) => (
                      <option key={idx} value={team}>{team}</option>
                    ))}
                  </Form.Select>
                </div>
              )}
              
              <Card className="preview-station-card">
                <Card.Header className="bg-primary text-white py-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-geo-alt-fill me-2" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <h5 className="mb-0"><TermReplacer>{t('station_term')}</TermReplacer> {previewStation.name}</h5>
                      {gameName && <p className="mb-0 mt-1 opacity-75 small">{gameName}</p>}
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="px-2 py-3">
                  {/* Thông tin đội */}
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                      <h6 className="mb-1">
                        <i className="bi bi-people-fill me-2 text-primary"></i>
                        Đội: {previewTeam || 'Chưa chọn đội'}
                      </h6>
                      <p className="text-muted mb-0">
                        <small>
                          <i className="bi bi-clock me-1"></i>
                          Số lần thử còn lại: {previewStation.maxAttempts || 5}
                        </small>
                      </p>
                    </div>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      disabled
                    >
                      <i className="bi bi-box-arrow-right me-1"></i>
                      Đăng xuất
                    </Button>
                  </div>
                  
                  {/* Hiển thị ghi chú trò chơi nếu có */}
                  {gameNote && (
                    <Alert variant="info" className="d-flex align-items-start mb-4">
                      <i className="bi bi-info-circle-fill me-2 mt-1" style={{ fontSize: '1.2rem' }}></i>
                      <div>{gameNote}</div>
                    </Alert>
                  )}
                  
                  {/* Hiển thị nội dung trạm */}
                  <div className="station-content-wrapper mb-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-file-text me-2 text-primary"></i>
                      Mật thư:
                    </h5>
                    
                    {/* Nội dung văn bản */}
                    {previewContent && (previewContent.showText || previewContent.contentType === 'text' || previewContent.contentType === 'both') ? (
                      <Card className="station-content mb-3 mx-0" style={{ 
                        borderWidth: '1px',
                        borderRadius: '4px',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.08)',
                        padding: 0,
                        width: '100%'
                      }}>
                        <Card.Body className="p-0">
                          {(previewContent.ottContent || previewContent.nwContent) && (previewContent.showOTT || previewContent.showNW) ? (
                            <>
                              {previewContent.ottContent && previewContent.showOTT && (
                                <div className="mb-2">
                                  <h6 className="fw-bold d-inline-block bg-primary text-white px-3 py-1 rounded-0 mb-0 ms-0 mt-1">OTT:</h6>
                                  <div className="content-text w-100 px-1">
                                    {previewContent.ottContent.split('\n').map((line, idx) => (
                                      <p 
                                        key={idx} 
                                        className={`content-line ${idx !== previewContent.ottContent.split('\n').length - 1 ? getParagraphSpacingClass(previewContent.paragraphSpacing) : ''}`}
                                        style={{ 
                                          ...getContentStyle(previewContent),
                                          marginTop: idx === 0 ? '0' : null
                                        }}
                                      >
                                        {line || ' '}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {previewContent.nwContent && previewContent.showNW && (
                                <div>
                                  <h6 className="fw-bold d-inline-block bg-primary text-white px-3 py-1 rounded-0 mb-0 ms-0">NW:</h6>
                                  <div className="content-text w-100 px-1">
                                    {previewContent.nwContent.split('\n').map((line, idx) => (
                                      <p 
                                        key={idx} 
                                        className={`content-line ${idx !== previewContent.nwContent.split('\n').length - 1 ? getParagraphSpacingClass(previewContent.paragraphSpacing) : ''}`}
                                        style={{ 
                                          ...getContentStyle(previewContent),
                                          marginTop: idx === 0 ? '0' : null
                                        }}
                                      >
                                        {line || ' '}
                                        {idx === previewContent.nwContent.split('\n').length - 1 && <span className="fw-bold">/AR</span>}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : previewContent.showText ? (
                            <div className="content-text w-100 px-1">
                              <p className="text-muted text-center py-3 small">
                                Nội dung văn bản sẽ xuất hiện ở đây
                              </p>
                            </div>
                          ) : null}
                        </Card.Body>
                      </Card>
                    ) : null}
                    
                    {/* Nội dung hình ảnh */}
                    {previewContent && (previewContent.showImage || previewContent.contentType === 'image' || previewContent.contentType === 'both') ? (
                      <div className="text-center mb-3">
                        {previewContent.imagePreview || previewContent.content || previewContent.imageUrl ? (
                          <img 
                            src={previewContent.imagePreview || previewContent.imageUrl || previewContent.content || ''} 
                            alt="Mật thư" 
                            className="station-image img-fluid"
                            style={{ 
                              width: '100%', 
                              maxHeight: '300px', 
                              objectFit: 'contain',
                              border: '1px solid #ddd', 
                              borderRadius: '4px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/400x300?text=Không+thể+hiển+thị+hình+ảnh';
                            }}
                          />
                        ) : (
                          <div className="text-muted text-center py-3 border rounded">
                            <i className="bi bi-image me-2"></i>
                            Hình ảnh sẽ xuất hiện ở đây
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                  
                  {/* Form nhập đáp án tượng trưng */}
                  <Form className="preview-form">
                    <Form.Group className="mb-4">
                      <Form.Label>Đáp án của bạn</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Nhập đáp án của bạn"
                        disabled
                        className="form-control-lg"
                      />
                    </Form.Group>
                    
                    <div className="d-grid">
                      <Button 
                        variant="primary" 
                        disabled
                        size="lg"
                      >
                        Gửi đáp án
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
              
              <div className="text-center text-muted mt-2">
                <small>
                  <i className="bi bi-shield-lock me-1"></i>
                  Hệ thống quản lý <TermReplacer>{t('station_term')}</TermReplacer> của Giao Liên
                </small>
              </div>
            </div>
          </>
        ) : (
          <span className="preview-toggle-icon">
            <i className="bi bi-eye-fill"></i>
          </span>
        )}
      </div>
    );
  };

  // Cập nhật hàm khi mở accordion item
  const handleAccordionSelect = (eventKey) => {
    const stationIndex = parseInt(eventKey);
    if (!isNaN(stationIndex)) {
      setSelectedStationIndex(stationIndex);
      // Cập nhật ngay khi chuyển trạm
      setTimeout(() => updatePreview(), 0);
    }
  };

  return (
    <>
      <AdminNavbar />
      <Container fluid className="py-4 pt-3 mt-2">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1><TermReplacer>{isEditMode ? t('edit_station') : t('create_station')}</TermReplacer></h1>
          <div>
            <Button variant="secondary" onClick={() => navigate('/admin/stations')}>
              {t('go_back')}
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <div className="station-form-container">
          <div className="station-form-main">
            <Card className="shadow-sm">
              <Card.Body>
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">{t('loading_text')}</p>
                  </div>
                ) : (
                  renderMultipleStationsForm()
                )}
              </Card.Body>
            </Card>
          </div>
          
          {/* Hiển thị xem trước */}
          {renderPreview()}
        </div>
      </Container>
    </>
  );
};

export default StationForm; 