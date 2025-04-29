import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, InputGroup, Badge, ListGroup, Accordion, Table, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/Navbar';
import { stationApi, teamApi } from '../../services/api';
import { formatDateTime, replaceStationTerm } from '../../utils/helpers';
import TermReplacer from '../../utils/TermReplacer';
import { useLanguage } from '../../context/LanguageContext';

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
  
  const [formData, setFormData] = useState({
    name: '',
    teams: [],
    content: '',
    contentType: 'text',
    correctAnswer: [],
    maxAttempts: 5,
    lockTime: 0
  });

  const [teamsInput, setTeamsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);
  const multipleFileInputRefs = useRef([]);

  // Thêm state để quản lý input đáp án riêng cho từng trạm
  const [answersInputMap, setAnswersInputMap] = useState({});

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
        lockTime: station.lockTime
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
          correctAnswer: correctAnswerArray
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
      updatedStations[index] = {
        ...updatedStations[index],
        [field]: value
      };
      return updatedStations;
    });
  };

  const handleTeamsInputChange = (e) => {
    setTeamsInput(e.target.value);
  };

  const addTeam = () => {
    if (teamsInput.trim()) {
      // Thêm đội vào danh sách chung cho tất cả trạm
      setCommonTeams(prev => [...new Set([...prev, teamsInput.trim()])]);
      // Xóa nội dung input
      setTeamsInput('');
    }
  };

  const handleTeamKeyPress = (e) => {
    // Nhấn Enter để thêm đội
    if (e.key === 'Enter') {
      e.preventDefault();
      addTeam();
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

  // Cập nhật hàm để thêm đáp án cho trạm cụ thể
  const addAnswer = (index) => {
    const inputValue = answersInputMap[index] || '';
    if (inputValue.trim()) {
      const newAnswer = inputValue.trim();
      setStations(prev => {
        const updatedStations = [...prev];
        // Khởi tạo correctAnswer là mảng nếu chưa phải
        if (!Array.isArray(updatedStations[index].correctAnswer)) {
          updatedStations[index].correctAnswer = updatedStations[index].correctAnswer 
            ? [updatedStations[index].correctAnswer] 
            : [];
        }
        updatedStations[index].correctAnswer = [...new Set([...updatedStations[index].correctAnswer, newAnswer])];
        return updatedStations;
      });
      // Xóa nội dung input chỉ cho trạm hiện tại
      setAnswersInputMap(prev => ({
        ...prev,
        [index]: ''
      }));
    }
  };

  // Cập nhật hàm xử lý phím Enter để thêm đáp án
  const handleAnswerKeyPress = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAnswer(index);
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
        if (!Array.isArray(updatedStations[index].correctAnswer)) {
          updatedStations[index].correctAnswer = updatedStations[index].correctAnswer 
            ? [updatedStations[index].correctAnswer] 
            : [];
        }
        updatedStations[index].correctAnswer = [...new Set([...updatedStations[index].correctAnswer, ...newAnswers])];
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
    // Thêm trạm mới vào danh sách
    setStations(prev => [
      ...prev,
      {
        name: '',
        teams: commonTeams, // Tự động sử dụng danh sách đội chung
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
        gameName: gameName, // Tự động sử dụng tên mật thư
        gameNote: gameNote, // Tự động sử dụng ghi chú
      }
    ]);
  };

  // Xóa một trạm khỏi danh sách
  const removeStation = (index) => {
    setStations(prev => prev.filter((_, i) => i !== index));
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
        // Trường hợp nhiều trạm - không cần thiết lập preview chung
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
      if (stationIndex !== null && multipleFileInputRefs.current[stationIndex]) {
        multipleFileInputRefs.current[stationIndex].value = '';
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

  // Cập nhật multipleFileInputRefs khi stations thay đổi
  useEffect(() => {
    multipleFileInputRefs.current = multipleFileInputRefs.current.slice(0, stations.length);
  }, [stations.length]);

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
            ref={el => multipleFileInputRefs.current[index] = el}
            accept="image/*"
            onChange={(e) => handleImageUpload(e, index)}
          />
          <Button
            variant="outline-primary"
            onClick={() => multipleFileInputRefs.current[index]?.click()}
            disabled={uploadLoading}
            className="me-2"
          >
            {uploadLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Đang tải...
              </>
            ) : (
              'Chọn hình ảnh'
            )}
          </Button>
          <span className="text-muted">hoặc</span>
        </div>
        
        <Form.Control
          type="text"
          value={station.content}
          onChange={(e) => handleStationChange(index, 'content', e.target.value)}
          placeholder="Nhập URL hình ảnh"
        />
        <Form.Text className="text-muted">
          Bạn có thể tải lên hình ảnh hoặc nhập URL hình ảnh có sẵn
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isEditMode) {
        // Cập nhật trạm
        const station = stations[0];
        
        // Xây dựng nội dung dựa vào loại
        let finalContent = '';
        let finalContentType = '';
        
        if (station.showImage && !station.showText) {
          // Chỉ ảnh
          finalContent = imagePreview;
          finalContentType = 'image';
        } else if (station.showText && !station.showImage) {
          // Chỉ văn bản
          finalContentType = 'text';
          
          if (station.showOTT && station.showNW) {
            finalContent = `OTT:\n${station.ottContent}\n\nNW:\n${station.nwContent}\n/AR`;
          } else if (station.showOTT) {
            finalContent = `OTT:\n${station.ottContent}`;
          } else if (station.showNW) {
            finalContent = `NW:\n${station.nwContent}\n/AR`;
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
        
        // Sử dụng API để cập nhật
        await stationApi.update(id, {
          ...station,
          content: finalContent,
          contentType: finalContentType,
          teams: commonTeams, // Sử dụng danh sách đội chung
          gameName: gameName, // Sử dụng tên mật thư chung
          gameNote: gameNote, // Sử dụng ghi chú chung
        });
        
        setSuccess(t('update_station_success'));
      } else {
        // Tạo mới nhiều trạm
        // Xây dựng mảng các trạm để tạo
        const stationsToCreate = [];
        
        for (let station of stations) {
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
          });
        }

        if (stationsToCreate.length > 0) {
          await stationApi.createMultiple(stationsToCreate);
          setSuccess(t('create_stations_success').replace('{count}', stations.length));
          
          // Reset form sau khi tạo mới
          setStations([]);
          setCommonTeams([]);
          setGameName('');
          setGameNote('');
          
          // Khởi tạo một trạm mới
          setTimeout(() => {
            addNewStation();
          }, 100);
        } else {
          setError(t('at_least_one_station_error'));
          setLoading(false);
          return;
        }
      }
      
      // Chuyển hướng sau 2 giây
      setTimeout(() => {
        navigate('/admin/stations');
      }, 2000);
    } catch (err) {
      setError(t('submit_station_error'));
      console.error('Error submitting station form:', err);
    } finally {
      setLoading(false);
      
      // Tự động xóa thông báo sau 3 giây
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  };

  // Render form tạo nhiều trạm
  const renderMultipleStationsForm = () => (
    <Form onSubmit={handleSubmit}>
      {/* Thông tin chung cho trò chơi */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{t('common_info')}</h5>
        </Card.Header>
        <Card.Body>
          {loadingGameData ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>{t('loading_data')}</span>
            </div>
          ) : (
            <>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('game_name')}</Form.Label>
                    <Form.Control
                      type="text"
                      value={gameName}
                      onChange={(e) => setGameName(e.target.value)}
                      placeholder={t('game_name_placeholder')}
                    />
                    <Form.Text className="text-muted">{t('game_name_note')}</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('game_note')}</Form.Label>
                    <Form.Control
                      type="text"
                      value={gameNote}
                      onChange={(e) => setGameNote(e.target.value)}
                      placeholder={t('game_note_placeholder')}
                    />
                    <Form.Text className="text-muted">{t('game_note_note')}</Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Form.Label>{t('teams_label')}</Form.Label>
                  <InputGroup className="mb-3">
                    <Form.Control
                      type="text"
                      value={teamsInput}
                      onChange={handleTeamsInputChange}
                      onKeyPress={handleTeamKeyPress}
                      placeholder={t('teams_label')}
                    />
                    <Button variant="outline-secondary" onClick={addTeam}>
                      {t('add_team')}
                    </Button>
                    <Button variant="outline-primary" onClick={addMultipleTeams}>
                      {t('add_multiple_teams')}
                    </Button>
                  </InputGroup>
                  <Form.Text className="text-muted mb-2">{t('teams_input_note')}</Form.Text>
                </Col>
              </Row>

              {/* Hiển thị danh sách đội từ cơ sở dữ liệu */}
              {availableTeams.length > 0 && (
                <Row className="mb-3">
                  <Col>
                    <h6>{t('available_teams')} ({availableTeams.length} {t('team_count')})</h6>
                    <div className="border rounded p-2 mb-3" style={{ maxHeight: '150px', overflowY: 'auto' }}>
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
                    </div>
                  </Col>
                </Row>
              )}

              {/* Hiển thị danh sách đội đã chọn */}
              {commonTeams.length > 0 && (
                <Row>
                  <Col>
                    <h6>{t('selected_teams')} ({commonTeams.length} {t('team_count')})</h6>
                    <div className="border rounded p-2 mb-3" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      <div className="d-flex flex-wrap">
                        {commonTeams.map((team, index) => (
                          <div key={index} className="me-2 mb-2">
                            <Badge 
                              bg="secondary" 
                              className="d-flex align-items-center"
                              style={{ fontSize: '14px', padding: '8px' }}
                            >
                              {team}
                              <Button 
                                variant="link" 
                                className="p-0 ms-1 text-light" 
                                size="sm"
                                onClick={() => removeTeam(index)}
                              >
                                ×
                              </Button>
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Danh sách các trạm để tạo */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5><TermReplacer>{t('stations_list')}</TermReplacer> ({stations.length})</h5>
        <Button 
          variant="success" 
          size="sm"
          onClick={addNewStation}
        >
          <i className="bi bi-plus-circle me-2"></i>
          {t('add_new_station')}
        </Button>
      </div>

      {stations.map((station, index) => (
        <Accordion key={index} defaultActiveKey="0" className="mb-3">
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <div className="d-flex justify-content-between w-100 align-items-center pe-4">
                <span><TermReplacer>{t('station_term')} {index + 1}: {station.name || t('station_name_placeholder')}</TermReplacer></span>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <div className="d-flex justify-content-end mb-3">
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => removeStation(index)}
                >
                  <i className="bi bi-trash me-1"></i>
                  {t('remove_station')}
                </Button>
              </div>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('station_name_label')}</Form.Label>
                    <Form.Control
                      type="text"
                      value={station.name}
                      onChange={(e) => handleStationChange(index, 'name', e.target.value)}
                      placeholder={t('station_name_placeholder')}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('content_type_label')}</Form.Label>
                    <div className="d-flex flex-wrap">
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

                  <Row>
                    {station.showOTT && (
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('ott_content_label')}</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            value={station.ottContent}
                            onChange={(e) => handleStationChange(index, 'ottContent', e.target.value)}
                            placeholder={t('enter_ott_content_placeholder')}
                          />
                        </Form.Group>
                      </Col>
                    )}
                    
                    {station.showNW && (
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('nw_content_label')}</Form.Label>
                          <InputGroup>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              value={station.nwContent}
                              onChange={(e) => handleStationChange(index, 'nwContent', e.target.value)}
                              placeholder={t('enter_nw_content_placeholder')}
                            />
                            <InputGroup.Text>/AR</InputGroup.Text>
                          </InputGroup>
                        </Form.Group>
                      </Col>
                    )}
                  </Row>
                </>
              )}

              {station.showImage && (
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('content_image_label')}</Form.Label>
                      {isEditMode && index === 0 ? (
                        <>
                          {renderImageUpload()}
                        </>
                      ) : (
                        <>
                          {renderStationImageUpload(index, station)}
                        </>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              )}

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('correct_answer_label')}</Form.Label>
                    <InputGroup className="mb-3">
                      <Form.Control
                        type="text"
                        value={answersInputMap[index] || ''}
                        onChange={(e) => handleAnswersInputChange(e, index)}
                        onKeyPress={(e) => handleAnswerKeyPress(e, index)}
                        placeholder={t('enter_answer_placeholder')}
                      />
                      <Button variant="outline-secondary" onClick={() => addAnswer(index)}>
                        {t('add_answer_button')}
                      </Button>
                      <Button variant="outline-primary" onClick={() => addMultipleAnswers(index)}>
                        {t('add_multiple_answers_button')}
                      </Button>
                    </InputGroup>
                    <Form.Text className="text-muted mb-2">
                      {t('answers_input_note')}
                    </Form.Text>
                    
                    {/* Hiển thị danh sách đáp án */}
                    {Array.isArray(station.correctAnswer) && station.correctAnswer.length > 0 && (
                      <div>
                        <h6>{t('answers_list')} ({station.correctAnswer.length} {t('answers')})</h6>
                        <div className="border rounded p-2 mb-3" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                          <div className="d-flex flex-wrap">
                            {station.correctAnswer.map((answer, answerIndex) => (
                              <div key={answerIndex} className="me-2 mb-2">
                                <Badge 
                                  bg="secondary" 
                                  className="d-flex align-items-center"
                                  style={{ fontSize: '14px', padding: '8px' }}
                                >
                                  {answer}
                                  <Button 
                                    variant="link" 
                                    className="p-0 ms-1 text-light" 
                                    size="sm"
                                    onClick={() => removeAnswer(index, answerIndex)}
                                  >
                                    ×
                                  </Button>
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('max_attempts_label')}</Form.Label>
                    <Form.Control
                      type="number"
                      value={station.maxAttempts}
                      onChange={(e) => handleStationChange(index, 'maxAttempts', e.target.value)}
                      min="1"
                      max="10"
                      required
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('lock_time_label')}</Form.Label>
                    <Form.Control
                      type="number"
                      value={station.lockTime}
                      onChange={(e) => handleStationChange(index, 'lockTime', e.target.value)}
                      min="0"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      ))}

      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <Button 
          variant="success" 
          size="sm"
          onClick={addNewStation}
        >
          <i className="bi bi-plus-circle me-2"></i>
          {t('add_new_station')}
        </Button>
        <Button 
          variant="primary" 
          type="submit" 
          disabled={loading || stations.length === 0}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {isEditMode ? t('updating') : t('creating')}
            </>
          ) : (
            isEditMode ? t('state_update') : t('state_create')
          )}
        </Button>
      </div>
    </Form>
  );

  return (
    <>
      <AdminNavbar />
      <Container className="py-4 pt-3 mt-2">
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
      </Container>
    </>
  );
};

export default StationForm; 