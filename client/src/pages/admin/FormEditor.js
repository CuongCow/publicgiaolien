import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import FormBuilder from '../../components/FormBuilder/FormBuilder';
import { formApi } from '../../services/api';
import { toast } from 'react-toastify';
import AdminNavbar from '../../components/Navbar';

const FormEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(null);
  
  // Kiểm tra xem đây là tạo mới hay chỉnh sửa
  const isNewForm = !id;
  
  // Tải form nếu đang chỉnh sửa
  useEffect(() => {
    if (id && id !== 'new' && id !== 'undefined') {
      fetchForm();
    } else if (id === 'undefined') {
      setError('ID biểu mẫu không hợp lệ.');
      setLoading(false);
    }
  }, [id]);
  
  const fetchForm = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Kiểm tra xem id có tồn tại và hợp lệ không
      if (!id || id === 'undefined') {
        setError('ID biểu mẫu không hợp lệ.');
        setLoading(false);
        return;
      }
      
      const response = await formApi.getFormById(id);
      
      if (response.data && response.data.success) {
        setForm(response.data.data);
      } else {
        setError('Không thể tải biểu mẫu. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Lỗi khi tải biểu mẫu:', error);
      
      if (error.response?.status === 404) {
        setError('Không tìm thấy biểu mẫu với ID đã chỉ định.');
      } else {
        setError('Đã xảy ra lỗi khi tải biểu mẫu. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý khi lưu form thành công
  const handleFormSaved = (savedForm) => {
    if (isNewForm) {
      // Nếu là tạo mới, điều hướng đến trang chi tiết phản hồi với tab Chia sẻ biểu mẫu
      toast.success('Đã tạo biểu mẫu thành công!');
      // Thêm tham số search params "tab=share" để kích hoạt tab Chia sẻ
      navigate(`/admin/forms/${savedForm._id}/responses?tab=share`, { replace: true });
    } else {
      // Nếu là chỉnh sửa, cập nhật state
      setForm(savedForm);
      toast.success('Đã lưu biểu mẫu thành công!');
    }
  };
  
  if (loading) {
    return (
      <>
        <AdminNavbar />
        <Container fluid className="mt-3 text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải biểu mẫu...</p>
        </Container>
      </>
    );
  }
  
  if (error && !isNewForm) {
    return (
      <>
        <AdminNavbar />
        <Container fluid className="mt-3">
          <Alert variant="danger" className="text-center py-4">
            <i className="bi bi-exclamation-triangle-fill fs-1 d-block mb-3"></i>
            <h4>{error}</h4>
            <div className="mt-4">
              <button 
                className="btn btn-outline-primary me-2" 
                onClick={() => navigate('/admin/forms')}
              >
                Quay lại danh sách
              </button>
              <button 
                className="btn btn-primary" 
                onClick={fetchForm}
              >
                Thử lại
              </button>
            </div>
          </Alert>
        </Container>
      </>
    );
  }
  
  return (
    <>
      <AdminNavbar />
      <Container fluid className="mt-3 mb-5 pb-5">
        <FormBuilder 
          formId={isNewForm ? null : id} 
          onSaved={handleFormSaved}
        />
      </Container>
    </>
  );
};

export default FormEditor; 