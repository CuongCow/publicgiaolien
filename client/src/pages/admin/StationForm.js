import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, InputGroup, Badge, ListGroup, Accordion, Table, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/Navbar';
import { stationApi, teamApi } from '../../services/api';
import { formatDateTime, replaceStationTerm } from '../../utils/helpers';
import TermReplacer from '../../utils/TermReplacer';

const StationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Danh sách trạm khi tạo nhiều trạm
  const [stations, setStations] = useState([]);
  const [commonTeams, setCommonTeams] = useState([]);
  const [gameName, setGameName] = useState('');
  const [gameNote, setGameNote] = useState('Trung thành với bản mã');
  
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
    }
  }, [isEditMode, id]);

  const fetchStationData = async () => {
    try {
      setLoading(true);
      const response = await stationApi.getById(id);
      const station = response.data;
      
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
      setError('Không thể tải thông tin danh mục. Vui lòng thử lại sau.');
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
    const newStation = {
      name: '',
      content: '',
      contentType: 'text',
      ottContent: '',
      nwContent: '',
      showText: true,
      showImage: false,
      showOTT: true,
      showNW: true,
      correctAnswer: [],
      maxAttempts: 5,
      lockTime: 0
    };
    setStations(prev => [...prev, newStation]);
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
      setError('Chỉ cho phép tải lên hình ảnh');
      return;
    }
    
    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước hình ảnh không được vượt quá 5MB');
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
      setError('Không thể tải lên hình ảnh. Vui lòng thử lại.');
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
        name="content"
        value={formData.content}
        onChange={handleChange}
        placeholder="Nhập URL hình ảnh"
      />
      <Form.Text className="text-muted">
        Bạn có thể tải lên hình ảnh hoặc nhập URL hình ảnh có sẵn
      </Form.Text>

      {imagePreview && (
        <div className="mt-3 border rounded p-2 text-center">
          <p className="mb-2">Xem trước:</p>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      if (isEditMode) {
        // Xử lý nội dung dựa trên loại hiển thị
        // Phần mã xử lý nội dung...
        
        // Đảm bảo correctAnswer là mảng và không trống
        let correctAnswerArray = formData.correctAnswer;
        if (!Array.isArray(correctAnswerArray)) {
          correctAnswerArray = formData.correctAnswer ? [formData.correctAnswer] : [];
        }
        if (correctAnswerArray.length === 0) {
          setError('Vui lòng nhập ít nhất một đáp án chính xác.');
          setLoading(false);
          return;
        }
        
        // Cập nhật trạm
        const updatedStation = {
          name: formData.name,
          teams: commonTeams,
          content: formData.content,
          contentType: formData.contentType,
          ottContent: formData.ottContent,
          nwContent: formData.nwContent,
          showText: formData.showText,
          showImage: formData.showImage,
          showOTT: formData.showOTT,
          showNW: formData.showNW,
          correctAnswer: correctAnswerArray,
          maxAttempts: formData.maxAttempts,
          lockTime: formData.lockTime,
          gameName: gameName,
          gameNote: gameNote
        };
        
        await stationApi.update(id, updatedStation);
        setSuccess(<TermReplacer>Cập nhật trạm thành công!</TermReplacer>);
      } else {
        // Kiểm tra đáp án trước khi tạo trạm
        for (let i = 0; i < stations.length; i++) {
          const station = stations[i];
          let correctAnswerArray = station.correctAnswer;
          if (!Array.isArray(correctAnswerArray)) {
            correctAnswerArray = station.correctAnswer ? [station.correctAnswer] : [];
          }
          if (correctAnswerArray.length === 0) {
            setError(`Danh mục "${station.name || `Danh mục ${i+1}`}" chưa có đáp án. Vui lòng thêm ít nhất một đáp án.`);
            setLoading(false);
            return;
          }
        }
        
        // Tạo nhiều trạm
        const stationsToCreate = stations.map(station => {
          // Xác định contentType dựa trên checkbox
          let contentType = 'text';
          if (station.showText && station.showImage) {
            contentType = 'both';
          } else if (station.showImage) {
            contentType = 'image';
          }
          
          // Tổng hợp nội dung text nếu có
          let content = '';
          if (station.showText) {
            // Kết hợp OTT và NW vào content để tương thích ngược
            let ottPart = '';
            let nwPart = '';
            
            if (station.showOTT && station.ottContent) {
              ottPart = `OTT:\n${station.ottContent || ''}`;
            }
            
            if (station.showNW && station.nwContent) {
              nwPart = `NW:\n${station.nwContent || ''}/AR`;
            }
            
            if (ottPart && nwPart) {
              content = `${ottPart}\n\n${nwPart}`;
            } else if (ottPart) {
              content = ottPart;
            } else if (nwPart) {
              content = nwPart;
            }
          } else if (station.showImage) {
            content = station.content;
          }
          
          // Đảm bảo correctAnswer là mảng và không trống
          let correctAnswerArray = station.correctAnswer;
          if (!Array.isArray(correctAnswerArray)) {
            correctAnswerArray = station.correctAnswer ? [station.correctAnswer] : [];
          }
          
          return {
            ...station,
            contentType,
            content,
            correctAnswer: correctAnswerArray,
            teams: commonTeams,
            gameName: gameName,
            gameNote: gameNote
          };
        });

        if (stationsToCreate.length > 0) {
          await stationApi.createMultiple(stationsToCreate);
          setSuccess(`Đã tạo ${stations.length} danh mục thành công!`);
          
          // Reset form sau khi tạo mới
          setStations([]);
          setCommonTeams([]);
          setGameName('');
          setGameNote('Trung thành với bản mã');
          
          // Khởi tạo một trạm mới
          setTimeout(() => {
            addNewStation();
          }, 100);
        } else {
          setError('Vui lòng thêm ít nhất một danh mục để tạo.');
          setLoading(false);
          return;
        }
      }
      
      // Chuyển hướng sau 2 giây
      setTimeout(() => {
        navigate('/admin/stations');
      }, 2000);
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
      console.error('Error submitting station form:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render form tạo nhiều trạm
  const renderMultipleStationsForm = () => (
    <Form onSubmit={handleSubmit}>
      {/* Thông tin chung cho trò chơi */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Thông tin chung</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tên mật thư hội trại</Form.Label>
                <Form.Control
                  type="text"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="Nhập tên của mật thư hội trại"
                />
                <Form.Text className="text-muted">
                  Tên này sẽ được hiển thị trong các màn hình người dùng, báo cáo và bảng xếp hạng
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ghi chú cho các đội chơi</Form.Label>
                <Form.Control
                  type="text"
                  value={gameNote}
                  onChange={(e) => setGameNote(e.target.value)}
                  placeholder="Nhập ghi chú cho các đội chơi"
                />
                <Form.Text className="text-muted">
                  Ghi chú chung sẽ hiển thị cho tất cả đội chơi khi tham gia
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Label>Tên các đội chơi</Form.Label>
              <InputGroup className="mb-3">
                <Form.Control
                  type="text"
                  value={teamsInput}
                  onChange={handleTeamsInputChange}
                  onKeyPress={handleTeamKeyPress}
                  placeholder="Nhập tên đội"
                />
                <Button variant="outline-secondary" onClick={addTeam}>
                  Thêm
                </Button>
                <Button variant="outline-primary" onClick={addMultipleTeams}>
                  Thêm nhiều đội
                </Button>
              </InputGroup>
              <Form.Text className="text-muted mb-2">
                Nhập tên đội và nhấn "Thêm" hoặc nhập danh sách đội cách nhau bởi dấu phẩy
              </Form.Text>
            </Col>
          </Row>

          {/* Hiển thị danh sách đội chung */}
          {commonTeams.length > 0 && (
            <Row>
              <Col>
                <h6>Danh sách đội ({commonTeams.length} đội)</h6>
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
        </Card.Body>
      </Card>

      {/* Danh sách các trạm để tạo */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5><TermReplacer>Danh sách trạm</TermReplacer> ({stations.length})</h5>
        <Button 
          variant="success" 
          size="sm"
          onClick={addNewStation}
        >
          <i className="bi bi-plus-circle me-2"></i>
          <TermReplacer>+ Thêm trạm mới</TermReplacer>
        </Button>
      </div>

      {stations.map((station, index) => (
        <Accordion key={index} defaultActiveKey="0" className="mb-3">
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <div className="d-flex justify-content-between w-100 align-items-center pe-4">
                <span><TermReplacer>Trạm</TermReplacer> {index + 1}: {station.name || 'Chưa đặt tên'}</span>
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
                  <TermReplacer>Xóa trạm</TermReplacer>
                </Button>
              </div>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label><TermReplacer>Tên trạm</TermReplacer></Form.Label>
                    <Form.Control
                      type="text"
                      value={station.name}
                      onChange={(e) => handleStationChange(index, 'name', e.target.value)}
                      placeholder={replaceStationTerm("Nhập tên trạm")}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Loại nội dung</Form.Label>
                    <div className="d-flex flex-wrap">
                      <Form.Check 
                        type="checkbox"
                        id={`showText-${index}`}
                        label="Văn bản"
                        className="me-3"
                        checked={station.showText}
                        onChange={(e) => handleStationChange(index, 'showText', e.target.checked)}
                      />
                      <Form.Check 
                        type="checkbox"
                        id={`showImage-${index}`}
                        label="Hình ảnh"
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
                        <Form.Label>Định dạng văn bản</Form.Label>
                        <div className="d-flex">
                          <Form.Check 
                            type="checkbox"
                            id={`showOTT-${index}`}
                            label="OTT"
                            className="me-4"
                            checked={station.showOTT}
                            onChange={(e) => handleStationChange(index, 'showOTT', e.target.checked)}
                          />
                          <Form.Check 
                            type="checkbox"
                            id={`showNW-${index}`}
                            label="NW"
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
                          <Form.Label>Nội dung OTT</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            value={station.ottContent}
                            onChange={(e) => handleStationChange(index, 'ottContent', e.target.value)}
                            placeholder="Nhập nội dung OTT"
                          />
                        </Form.Group>
                      </Col>
                    )}
                    
                    {station.showNW && (
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nội dung NW</Form.Label>
                          <InputGroup>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              value={station.nwContent}
                              onChange={(e) => handleStationChange(index, 'nwContent', e.target.value)}
                              placeholder="Nhập nội dung NW"
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
                      <Form.Label>Hình ảnh mật thư</Form.Label>
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
                    <Form.Label>Đáp án chính xác</Form.Label>
                    <InputGroup className="mb-3">
                      <Form.Control
                        type="text"
                        value={answersInputMap[index] || ''}
                        onChange={(e) => handleAnswersInputChange(e, index)}
                        onKeyPress={(e) => handleAnswerKeyPress(e, index)}
                        placeholder="Nhập đáp án"
                      />
                      <Button variant="outline-secondary" onClick={() => addAnswer(index)}>
                        Thêm
                      </Button>
                      <Button variant="outline-primary" onClick={() => addMultipleAnswers(index)}>
                        Thêm nhiều đáp án
                      </Button>
                    </InputGroup>
                    <Form.Text className="text-muted mb-2">
                      Nhập đáp án và nhấn "Thêm" hoặc nhập danh sách đáp án cách nhau bởi dấu phẩy
                    </Form.Text>
                    
                    {/* Hiển thị danh sách đáp án */}
                    {Array.isArray(station.correctAnswer) && station.correctAnswer.length > 0 && (
                      <div>
                        <h6>Danh sách đáp án ({station.correctAnswer.length} đáp án)</h6>
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
                    <Form.Label>Số lần thử tối đa</Form.Label>
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
                    <Form.Label>Thời gian khóa (phút)</Form.Label>
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
          <TermReplacer>+ Thêm trạm mới</TermReplacer>
        </Button>
        <Button 
          variant="primary" 
          type="submit" 
          disabled={loading || stations.length === 0}
        >
          {loading ? 'Đang xử lý...' : isEditMode ? <TermReplacer>Cập nhật trạm</TermReplacer> : <TermReplacer>Tạo tất cả trạm</TermReplacer>}
        </Button>
      </div>
    </Form>
  );

  return (
    <>
      <AdminNavbar />
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1><TermReplacer>{isEditMode ? 'Chỉnh sửa trạm' : 'Tạo trạm'}</TermReplacer></h1>
          <div>
            <Button variant="secondary" onClick={() => navigate('/admin/stations')}>
              Quay lại
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
                <p className="mt-2">Đang tải...</p>
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