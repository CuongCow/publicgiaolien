import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner, Alert, Badge, Tabs, Tab, Dropdown } from 'react-bootstrap';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { formApi } from '../../services/api';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';
import AdminNavbar from '../../components/Navbar';

const FormResponseView = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('responses');
  const [exportLoading, setExportLoading] = useState(false);
  
  // Đọc tab từ URL query params (nếu có)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    
    if (tabParam && ['responses', 'summary', 'share'].includes(tabParam)) {
      setActiveTab(tabParam);
      
      // Xóa tham số tab khỏi URL sau khi đã đọc
      if (window.history && window.history.replaceState) {
        const newUrl = location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [location]);
  
  // Tải thông tin form và danh sách phản hồi
  useEffect(() => {
    fetchFormData();
  }, [formId]);
  
  // Tải chi tiết đầy đủ của phản hồi nếu không có responses
  const fetchFullResponseDetails = async (responses) => {
    try {
      // Kiểm tra xem responses có đầy đủ thông tin không
      const needsFullDetails = responses && responses.length > 0 && 
        (!responses[0].responses || responses[0].responses.length === 0);
      
      if (needsFullDetails) {
        // Tạo mảng mới để lưu phản hồi đầy đủ
        const fullResponses = [];
        
        // Tải chi tiết từng phản hồi
        for (const response of responses) {
          try {
            const detailResponse = await formApi.getFormResponseById(formId, response._id);
            if (detailResponse.data && detailResponse.data.success) {
              // Kiểm tra và đảm bảo responses đúng định dạng
              const responseData = detailResponse.data.data;
              
              if (!responseData.responses || responseData.responses.length === 0) {
                // Phản hồi không có dữ liệu responses hoặc rỗng
              }
              
              fullResponses.push(responseData);
            } else {
              // Giữ nguyên dữ liệu cũ nếu không lấy được chi tiết
              fullResponses.push(response);
            }
          } catch (error) {
            fullResponses.push(response);
          }
        }
        
        return fullResponses;
      }
      
      // Trả về danh sách gốc nếu đã có đủ thông tin
      return responses;
    } catch (error) {
      return responses;
    }
  };
  
  // Cập nhật số lượng phản hồi
  const updateResponseCount = async () => {
    try {
      const response = await formApi.updateFormResponseCount(formId);
      
      if (response.data && response.data.success) {
        const result = response.data.data;
        
        if (result.updated) {
          // Số lượng phản hồi đã được cập nhật
        } else {
          // Số lượng phản hồi đã chính xác, không cần cập nhật
        }
      }
    } catch (error) {
      // Lỗi khi cập nhật số lượng phản hồi
    }
  };
  
  const fetchFormData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Tải thông tin form
      const formResponse = await formApi.getFormById(formId);
      
      if (formResponse.data && formResponse.data.success) {
        setForm(formResponse.data.data);
        
        // Tải danh sách phản hồi
        const responsesResponse = await formApi.getFormResponses(formId);
        
        // Log chi tiết một phản hồi đầu tiên nếu có để hiểu cấu trúc
        if (responsesResponse.data && 
            responsesResponse.data.success && 
            responsesResponse.data.data && 
            responsesResponse.data.data.responses && 
            responsesResponse.data.data.responses.length > 0) {
          // Chi tiết phản hồi đầu tiên
        }
        
        if (responsesResponse.data && responsesResponse.data.success) {
          const initialResponses = responsesResponse.data.data.responses || [];
          
          // Tải thêm chi tiết nếu cần
          const fullResponses = await fetchFullResponseDetails(initialResponses);
          
          setResponses(fullResponses);
          
          // Cập nhật số lượng phản hồi để đồng bộ với trang quản lý
          await updateResponseCount();
        }
      }
    } catch (error) {
      
      if (error.response?.status === 404) {
        setError('Không tìm thấy biểu mẫu với ID đã chỉ định.');
      } else {
        setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý xuất dữ liệu
  const handleExport = async (format = 'csv') => {
    try {
      setExportLoading(true);
      
      const response = await formApi.exportFormResponses(formId, format);
      
      // Tạo URL để tải file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Đặt tên file
      const fileName = `form-responses-${formId}.${format}`;
      link.setAttribute('download', fileName);
      
      // Thêm vào DOM, click và xóa
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Đã xuất dữ liệu thành công dưới dạng ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Không thể xuất dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setExportLoading(false);
    }
  };
  
  // Định dạng thời gian
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'HH:mm dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return dateString;
    }
  };
  
  // Format thời gian tương đối
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
    } catch (error) {
      return dateString;
    }
  };
  
  // Render giá trị câu trả lời theo loại câu hỏi
  const renderAnswerValue = (answer, questionType) => {
    if (answer === null || answer === undefined) {
      return <span className="text-muted">Không có câu trả lời</span>;
    }
    
    try {
      switch (questionType) {
        case 'multiple_choice':
          if (Array.isArray(answer)) {
            return answer.join(', ');
          }
          return String(answer);
          
        case 'checkbox':
          if (Array.isArray(answer)) {
            return answer.map((item, index) => (
              <Badge bg="info" className="me-1 mb-1" key={index}>
                {String(item)}
              </Badge>
            ));
          }
          return String(answer);
          
        case 'short_answer':
        case 'dropdown':
          return String(answer);
          
        case 'paragraph':
          return <div style={{ whiteSpace: 'pre-wrap' }}>{String(answer)}</div>;
          
        default:
          if (typeof answer === 'object') {
            return JSON.stringify(answer);
          }
          return String(answer);
      }
    } catch (error) {
      return <span className="text-danger">Lỗi hiển thị: {error.message}</span>;
    }
  };
  
  // Khi server có thể trả về dữ liệu JSON hóa
  function cleanMongoId(id) {
    if (typeof id === 'string') {
      // Xử lý trường hợp ID được chuỗi hóa trong JSON
      if (id.includes('ObjectId(') || id.includes('$oid')) {
        try {
          // Cố gắng trích xuất _id từ chuỗi JSON
          if (id.includes('$oid')) {
            // MongoDB Extended JSON format
            const match = id.match(/"?\$oid"?\s*:\s*"([a-f0-9]+)"/i);
            return match ? match[1] : id;
          } else {
            // ObjectId format
            const match = id.match(/ObjectId\(['"](.*)['"]\)/i);
            return match ? match[1] : id;
          }
        } catch (e) {
          return id;
        }
      }
    }
    return id;
  }
  
  // Nếu đang tải dữ liệu
  if (loading) {
    return (
      <>
        <AdminNavbar />
        <Container fluid className="mt-3 text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải dữ liệu biểu mẫu...</p>
        </Container>
      </>
    );
  }
  
  // Nếu có lỗi
  if (error) {
    return (
      <>
        <AdminNavbar />
        <Container fluid className="mt-3">
          <Alert variant="danger" className="text-center py-4">
            <i className="bi bi-exclamation-triangle-fill fs-1 d-block mb-3"></i>
            <h4>{error}</h4>
            <div className="mt-4">
              <Button 
                variant="outline-primary" 
                onClick={() => navigate('/admin/forms')}
                className="me-2"
              >
                Quay lại danh sách
              </Button>
              <Button 
                variant="primary" 
                onClick={fetchFormData}
              >
                Thử lại
              </Button>
            </div>
          </Alert>
        </Container>
      </>
    );
  }
  
  // Nếu không có form
  if (!form) {
    return (
      <>
        <AdminNavbar />
        <Container fluid className="mt-3">
          <Alert variant="warning" className="text-center py-4">
            <i className="bi bi-question-circle-fill fs-1 d-block mb-3"></i>
            <h4>Không tìm thấy thông tin biểu mẫu</h4>
            <Button 
              variant="primary" 
              onClick={() => navigate('/admin/forms')}
              className="mt-3"
            >
              Quay lại danh sách
            </Button>
          </Alert>
        </Container>
      </>
    );
  }
  
  return (
    <>
      <AdminNavbar />
      <Container fluid className="mt-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3 className="mb-0">{form.title}</h3>
            {form.description && (
              <p className="text-muted mb-0 mt-1">{form.description}</p>
            )}
          </div>
          
          <div>
            <Button
              variant="outline-primary"
              className="me-2"
              as={Link}
              to={`/admin/forms/${formId}/edit`}
            >
              <i className="bi bi-pencil me-1"></i>
              Chỉnh sửa biểu mẫu
            </Button>
            
            <Dropdown className="d-inline-block">
              <Dropdown.Toggle variant="primary" id="dropdown-export" disabled={exportLoading || responses.length === 0}>
                {exportLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-1"
                    />
                    Đang xuất...
                  </>
                ) : (
                  <>
                    <i className="bi bi-download me-1"></i>
                    Xuất dữ liệu
                  </>
                )}
              </Dropdown.Toggle>
              
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleExport('csv')}>
                  <i className="bi bi-filetype-csv me-2"></i>
                  Xuất CSV
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleExport('excel')}>
                  <i className="bi bi-file-earmark-excel me-2"></i>
                  Xuất Excel
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleExport('json')}>
                  <i className="bi bi-filetype-json me-2"></i>
                  Xuất JSON
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
        
        <Row>
          <Col>
            <Card className="mb-4">
              <Card.Body>
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="mb-3"
                >
                  <Tab eventKey="responses" title="Phản hồi">
                    {responses.length === 0 ? (
                      <div className="text-center py-5">
                        <i className="bi bi-inbox fs-1 text-muted"></i>
                        <p className="mt-3 mb-1">Chưa có phản hồi nào</p>
                        <p className="text-muted mb-0">
                          Chia sẻ biểu mẫu của bạn để bắt đầu nhận phản hồi
                        </p>
                        {form.published ? (
                          <div className="mt-3">
                            <p className="mb-2">Link công khai:</p>
                            <div className="d-flex justify-content-center">
                              <div className="input-group" style={{ maxWidth: '500px' }}>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={`${window.location.origin}/forms/${form.slug}`}
                                  readOnly
                                />
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/forms/${form.slug}`);
                                    toast.success('Đã sao chép link!');
                                  }}
                                >
                                  <i className="bi bi-clipboard"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="primary"
                            className="mt-3"
                            as={Link}
                            to={`/admin/forms/${formId}/edit`}
                          >
                            Công khai biểu mẫu
                          </Button>
                        )}
                      </div>
                    ) : (
                      <>
                        <Table responsive hover>
                          <thead>
                            <tr>
                              <th style={{ width: '80px' }}>#</th>
                              <th>Người gửi</th>
                              <th style={{ width: '250px' }}>Thời gian</th>
                              <th style={{ width: '120px' }} className="text-end">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {responses.map((response, index) => (
                              <tr key={response._id}>
                                <td>{index + 1}</td>
                                <td>
                                  {response.email ? (
                                    <div>
                                      <div>{response.email}</div>
                                      {response.submittedBy && (
                                        <small className="text-muted">{response.submittedBy}</small>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-muted">Ẩn danh</span>
                                  )}
                                </td>
                                <td>
                                  <div>{formatTime(response.submittedAt || response.createdAt)}</div>
                                  <small className="text-muted">
                                    {formatRelativeTime(response.submittedAt || response.createdAt)}
                                  </small>
                                </td>
                                <td className="text-end">
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 me-2"
                                    onClick={async () => {
                                      try {
                                        // Lấy chi tiết phản hồi từ API
                                        const detailResponse = await formApi.getFormResponseById(formId, response._id);
                                        
                                        // Chuyển trang đến trang chi tiết
                                        navigate(`/admin/forms/${formId}/responses/${response._id}`);
                                      } catch (error) {
                                        toast.error('Không thể tải chi tiết phản hồi');
                                      }
                                    }}
                                  >
                                    Xem chi tiết
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </>
                    )}
                  </Tab>
                  
                  <Tab eventKey="summary" title="Tổng quan">
                    <div className="py-3">
                      <Row className="mb-4">
                        <Col md={4} className="mb-3 mb-md-0">
                          <Card className="text-center h-100">
                            <Card.Body>
                              <h1 className="display-4 fw-bold text-primary">
                                {responses.length}
                              </h1>
                              <p className="mb-0">Tổng số phản hồi</p>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={4} className="mb-3 mb-md-0">
                          <Card className="text-center h-100">
                            <Card.Body>
                              <h1 className="display-4 fw-bold text-success">
                                {responses.filter(r => r.email).length}
                              </h1>
                              <p className="mb-0">Phản hồi có email</p>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={4}>
                          <Card className="text-center h-100">
                            <Card.Body>
                              <h1 className="display-4 fw-bold text-info">
                                {form.published ? (
                                  <i className="bi bi-check-circle"></i>
                                ) : (
                                  <i className="bi bi-x-circle"></i>
                                )}
                              </h1>
                              <p className="mb-0">
                                {form.published ? 'Đang công khai' : 'Chưa công khai'}
                              </p>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                      
                      {/* Chi tiết câu hỏi và phản hồi */}
                      {form.questions && form.questions.length > 0 && (
                        <div className="mt-4">
                          <h5>Chi tiết câu hỏi và phản hồi</h5>
                          
                          {form.questions.map((question, qIndex) => (
                            <Card key={question._id || qIndex} className="mb-3">
                              <Card.Header className="bg-light">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <span className="fw-bold">Câu {qIndex + 1}: {question.title}</span>
                                    {question.required && (
                                      <Badge bg="danger" className="ms-2">Bắt buộc</Badge>
                                    )}
                                  </div>
                                  <Badge bg="info">
                                    {(() => {
                                      switch(question.type) {
                                        case 'multiple_choice': return 'Trắc nghiệm';
                                        case 'short_answer': return 'Câu trả lời ngắn';
                                        case 'paragraph': return 'Đoạn văn';
                                        case 'checkbox': return 'Hộp kiểm';
                                        case 'dropdown': return 'Danh sách thả xuống';
                                        default: return question.type;
                                      }
                                    })()}
                                  </Badge>
                                </div>
                                {question.description && (
                                  <div className="text-muted mt-1 small">{question.description}</div>
                                )}
                              </Card.Header>
                              <Card.Body>
                                {responses.length === 0 ? (
                                  <p className="text-muted mb-0">Chưa có phản hồi nào</p>
                                ) : (
                                  <Table responsive borderless className="mb-0">
                                    <thead>
                                      <tr>
                                        <th style={{ width: '200px' }}>Người gửi</th>
                                        <th>Câu trả lời</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {responses.map((response, rIndex) => {
                                        const questionIdStr = question._id ? question._id.toString() : '';
                                        
                                        // Tìm câu trả lời dùng nhiều phương pháp so sánh
                                        const questionResponse = response.responses && response.responses.find(
                                          a => {
                                            if (!a || !a.questionId) return false;
                                            
                                            const respIdStr = typeof a.questionId === 'string' 
                                              ? a.questionId 
                                              : a.questionId.toString();
                                              
                                            return respIdStr === questionIdStr || 
                                                   cleanMongoId(respIdStr) === questionIdStr;
                                          }
                                        );
                                        
                                        // Nếu không tìm thấy trong responses, có thể đang sử dụng cấu trúc API cũ với answers
                                        const alternativeResponse = !questionResponse && response.answers && response.answers.find(
                                          a => {
                                            if (!a || !a.questionId) return false;
                                            
                                            const respIdStr = typeof a.questionId === 'string' 
                                              ? a.questionId 
                                              : a.questionId.toString();
                                              
                                            return respIdStr === questionIdStr || 
                                                   cleanMongoId(respIdStr) === questionIdStr;
                                          }
                                        );
                                        
                                        const finalResponse = questionResponse || alternativeResponse;
                                        
                                        return (
                                          <tr key={`${response._id}-${qIndex}`}>
                                            <td>
                                              {response.email ? (
                                                <div className="small">
                                                  {response.email}
                                                  <div className="text-muted">
                                                    {formatRelativeTime(response.submittedAt || response.createdAt)}
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="small">
                                                  <div>Ẩn danh</div>
                                                  <div className="text-muted">
                                                    {formatRelativeTime(response.submittedAt || response.createdAt)}
                                                  </div>
                                                </div>
                                              )}
                                            </td>
                                            <td>
                                              {finalResponse ? (
                                                <>
                                                  {renderAnswerValue(
                                                    finalResponse.answer,
                                                    finalResponse.questionType
                                                  )}
                                                  <div className="mt-1 small text-muted">
                                                    {finalResponse.questionType && `Loại: ${finalResponse.questionType}`}
                                                  </div>
                                                </>
                                              ) : (
                                                <div>
                                                  <span className="text-muted">Không có câu trả lời</span>
                                                  {rIndex === 0 && (
                                                    <div className="mt-1 small text-danger">
                                                      (Debug: ID câu hỏi: {question._id ? question._id.toString() : 'không có'})
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </Table>
                                )}
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </Tab>
                  
                  <Tab eventKey="share" title="Chia sẻ">
                    <div className="py-4">
                      <Row className="justify-content-center">
                        <Col md={8} lg={6}>
                          <Card>
                            <Card.Body className="p-4">
                              <h5 className="mb-4 text-center">Chia sẻ biểu mẫu</h5>
                              
                              {!form.published ? (
                                <Alert variant="warning">
                                  <div className="d-flex align-items-center">
                                    <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                                    <div>
                                      <div className="fw-bold">Biểu mẫu chưa được công khai</div>
                                      <p className="mb-2">Bạn cần công khai biểu mẫu để chia sẻ với người khác.</p>
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        as={Link}
                                        to={`/admin/forms/${formId}/edit`}
                                      >
                                        Đến trang chỉnh sửa
                                      </Button>
                                    </div>
                                  </div>
                                </Alert>
                              ) : (
                                <>
                                  <div className="mb-4">
                                    <label className="form-label">Link biểu mẫu công khai:</label>
                                    <div className="input-group mb-1">
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={`${window.location.origin}/forms/${form.slug}`}
                                        readOnly
                                      />
                                      <button
                                        className="btn btn-outline-primary"
                                        onClick={() => {
                                          navigator.clipboard.writeText(`${window.location.origin}/forms/${form.slug}`);
                                          toast.success('Đã sao chép link!');
                                        }}
                                      >
                                        <i className="bi bi-clipboard"></i>
                                      </button>
                                    </div>
                                    <div className="form-text">
                                      Chia sẻ link này để người khác có thể truy cập và điền form
                                    </div>
                                  </div>
                                  
                                  <hr className="my-4" />
                                  
                                  <div className="text-center">
                                    <p className="mb-3">Chia sẻ qua mạng xã hội:</p>
                                    <div className="d-flex justify-content-center gap-3">
                                      <Button variant="outline-primary" className="rounded-circle p-2">
                                        <i className="bi bi-facebook fs-5"></i>
                                      </Button>
                                      <Button variant="outline-info" className="rounded-circle p-2">
                                        <i className="bi bi-twitter fs-5"></i>
                                      </Button>
                                      <Button variant="outline-danger" className="rounded-circle p-2">
                                        <i className="bi bi-envelope fs-5"></i>
                                      </Button>
                                      <Button variant="outline-success" className="rounded-circle p-2">
                                        <i className="bi bi-whatsapp fs-5"></i>
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-4 text-center">
                                    <Button
                                      variant="link"
                                      className="text-decoration-none"
                                      href={`/forms/${form.slug}`}
                                      target="_blank"
                                    >
                                      <i className="bi bi-box-arrow-up-right me-1"></i>
                                      Mở trong tab mới
                                    </Button>
                                  </div>
                                </>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default FormResponseView; 