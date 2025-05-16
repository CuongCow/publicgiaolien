import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal, Nav, Spinner, Alert } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import QuestionEditor from './QuestionEditor';
import QuestionTypes, { createNewQuestion } from './QuestionTypes';
import FormPreview from './FormPreview';
import FormSettings from './FormSettings';
import { formApi } from '../../services/api';
import { toast } from 'react-toastify';

const FormBuilder = ({ formId = null, onSaved = null }) => {
  const [loading, setLoading] = useState(formId ? true : false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([]);
  const [settings, setSettings] = useState({
    collectEmail: false,
    allowAnonymous: true,
    confirmationMessage: 'Cảm ơn bạn đã gửi phản hồi!',
    showProgressBar: true,
    notifyEmail: false,
    customTheme: {
      primaryColor: '#0d6efd',
      backgroundColor: '#ffffff',
      fontFamily: 'Roboto, sans-serif'
    }
  });
  const [published, setPublished] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEdited, setIsEdited] = useState(false);

  // Tải thông tin form nếu có formId
  useEffect(() => {
    if (formId) {
      loadForm();
    }
  }, [formId]);

  // Đánh dấu là đã chỉnh sửa khi có thay đổi
  useEffect(() => {
    if (loading) return;
    setIsEdited(true);
  }, [formTitle, formDescription, questions, sections, settings, published]);

  const loadForm = async () => {
    try {
      setLoading(true);
      
      // Kiểm tra formId hợp lệ
      if (!formId || formId === 'undefined' || formId === 'null') {
        console.warn('Form ID không hợp lệ:', formId);
        setLoading(false);
        return;
      }
      
      const response = await formApi.getFormById(formId);
      
      if (response.data && response.data.success) {
        const form = response.data.data;
        setFormTitle(form.title);
        setFormDescription(form.description || '');
        setFormSlug(form.slug);
        setQuestions(form.questions || []);
        setSections(form.sections || []);
        setSettings(form.settings || settings);
        setPublished(form.published || false);
        setIsEdited(false);
      }
    } catch (error) {
      console.error('Lỗi khi tải biểu mẫu:', error);
      setError('Không thể tải biểu mẫu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Lưu form
  const saveForm = async () => {
    if (!formTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề biểu mẫu');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const formData = {
        title: formTitle,
        description: formDescription,
        slug: formSlug, // Nếu bỏ trống, server sẽ tự tạo slug
        questions,
        sections,
        settings,
        published
      };

      let response;
      if (formId) {
        // Cập nhật form
        response = await formApi.updateForm(formId, formData);
      } else {
        // Tạo form mới
        response = await formApi.createForm(formData);
      }

      if (response.data && response.data.success) {
        toast.success(formId ? 'Biểu mẫu đã được cập nhật' : 'Biểu mẫu đã được tạo');
        setIsEdited(false);
        
        if (onSaved && typeof onSaved === 'function') {
          onSaved(response.data.data);
        }
      }
    } catch (error) {
      console.error('Lỗi khi lưu biểu mẫu:', error);
      setError('Không thể lưu biểu mẫu. Vui lòng thử lại sau.');
    } finally {
      setSaving(false);
    }
  };

  // Xử lý thêm câu hỏi mới
  const handleAddQuestion = (type) => {
    const newQuestion = createNewQuestion(type, questions.length);
    setQuestions([...questions, newQuestion]);
    setShowAddQuestionModal(false);
  };

  // Xử lý xóa câu hỏi
  const handleDeleteQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    
    // Cập nhật lại order
    const updatedQuestions = newQuestions.map((q, idx) => ({
      ...q,
      order: idx
    }));
    
    setQuestions(updatedQuestions);
  };

  // Cập nhật câu hỏi
  const handleUpdateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  // Xử lý kéo thả
  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    const newQuestions = [...questions];
    const [removed] = newQuestions.splice(sourceIndex, 1);
    newQuestions.splice(destinationIndex, 0, removed);
    
    // Cập nhật lại order cho tất cả câu hỏi
    const updatedQuestions = newQuestions.map((q, idx) => ({
      ...q,
      order: idx
    }));
    
    setQuestions(updatedQuestions);
  }, [questions]);

  // Cập nhật settings
  const handleSettingsChange = (newSettings) => {
    setSettings({ ...settings, ...newSettings });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải biểu mẫu...</p>
      </div>
    );
  }

  return (
    <div className="form-builder">
      <div className="form-builder-header mb-3">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center py-2">
            <h4 className="mb-0">{formId ? 'Chỉnh sửa biểu mẫu' : 'Tạo biểu mẫu mới'}</h4>
            <div>
              <Button 
                variant="outline-primary" 
                className="me-2"
                disabled={saving}
                onClick={() => setActiveTab(activeTab === 'preview' ? 'editor' : 'preview')}
              >
                <i className={`bi ${activeTab === 'preview' ? 'bi-pencil' : 'bi-eye'} me-1`}></i>
                {activeTab === 'preview' ? 'Quay lại chỉnh sửa' : 'Xem trước'}
              </Button>
              <Button
                variant="primary"
                onClick={saveForm}
                disabled={saving || !isEdited}
              >
                {saving ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-1"
                    />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-1"></i>
                    Lưu biểu mẫu
                  </>
                )}
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container fluid>
        {error && <Alert variant="danger">{error}</Alert>}

        <Nav
          variant="tabs"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Nav.Item>
            <Nav.Link eventKey="editor">
              <i className="bi bi-pencil-square me-1"></i>
              Chỉnh sửa
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="settings">
              <i className="bi bi-gear me-1"></i>
              Cài đặt
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="preview">
              <i className="bi bi-eye me-1"></i>
              Xem trước
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {activeTab === 'editor' && (
          <div className="form-editor">
            <Row>
              <Col>
                <Card className="mb-4">
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Tiêu đề biểu mẫu<span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Nhập tiêu đề biểu mẫu"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Mô tả (tùy chọn)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Nhập mô tả biểu mẫu"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Slug URL (tùy chọn)</Form.Label>
                      <Form.Control
                        type="text"
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        placeholder="Để trống sẽ tự động tạo từ tiêu đề"
                      />
                      <Form.Text className="text-muted">
                        Slug sẽ được sử dụng trong URL công khai của biểu mẫu.
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Check
                      type="switch"
                      id="publish-switch"
                      label="Công khai biểu mẫu"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="mb-0"
                    />
                  </Card.Body>
                </Card>

                <h5 className="mb-3">Câu hỏi</h5>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="questions">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="questions-container"
                      >
                        {questions.length === 0 ? (
                          <div className="text-center py-5 bg-light rounded mb-3">
                            <i className="bi bi-list-check fs-1 text-muted"></i>
                            <p className="mt-3 mb-1">Chưa có câu hỏi nào</p>
                            <p className="text-muted">Bấm nút "Thêm câu hỏi" để bắt đầu</p>
                          </div>
                        ) : (
                          questions.map((question, index) => (
                            <Draggable
                              key={index}
                              draggableId={`question-${index}`}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <QuestionEditor
                                    question={question}
                                    onChange={(updatedQuestion) => handleUpdateQuestion(index, updatedQuestion)}
                                    onDelete={() => handleDeleteQuestion(index)}
                                    index={index}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <div className="d-grid mb-4">
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowAddQuestionModal(true)}
                  >
                    <i className="bi bi-plus-circle me-1"></i> Thêm câu hỏi
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {activeTab === 'settings' && (
          <FormSettings
            settings={settings}
            onChange={handleSettingsChange}
          />
        )}

        {activeTab === 'preview' && (
          <FormPreview
            formTitle={formTitle}
            formDescription={formDescription}
            questions={questions}
            sections={sections}
            settings={settings}
          />
        )}
      </Container>

      {/* Modal thêm câu hỏi */}
      <Modal
        show={showAddQuestionModal}
        onHide={() => setShowAddQuestionModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm câu hỏi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <QuestionTypes onSelectType={handleAddQuestion} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default FormBuilder; 