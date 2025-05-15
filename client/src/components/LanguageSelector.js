import React, { useState, useEffect } from 'react';
import { Dropdown, Button, Modal, Row, Col, Form } from 'react-bootstrap';
import countriesData from '../data/countries.json';

const LanguageSelector = ({ onSelectLanguage }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [filteredCountries, setFilteredCountries] = useState([]);
  
  // Khởi tạo từ localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selected_language');
    if (savedLanguage) {
      try {
        setSelectedLanguage(JSON.parse(savedLanguage));
      } catch (e) {
        console.error('Lỗi khi phân tích ngôn ngữ đã lưu:', e);
      }
    }
  }, []);
  
  // Lọc quốc gia khi tìm kiếm
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCountries(countriesData);
    } else {
      const filtered = countriesData.filter(country => 
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [searchTerm]);
  
  // Mở modal chọn ngôn ngữ
  const handleShowModal = () => {
    setFilteredCountries(countriesData);
    setShowModal(true);
  };
  
  // Đóng modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSearchTerm('');
  };
  
  // Khi chọn ngôn ngữ
  const handleSelectLanguage = (country) => {
    setSelectedLanguage(country);
    localStorage.setItem('selected_language', JSON.stringify(country));
    if (onSelectLanguage) {
      onSelectLanguage(country);
    }
    handleCloseModal();
  };
  
  // Nút hiển thị lá cờ hiện tại hoặc biểu tượng globe
  const CurrentFlag = () => {
    if (selectedLanguage) {
      return (
        <img 
          src={`https://flagcdn.com/w20/${selectedLanguage.code.toLowerCase()}.png`} 
          alt={selectedLanguage.name}
          width="20" 
          height="15"
          className="me-1"
        />
      );
    }
    return <i className="bi bi-globe me-1"></i>;
  };
  
  return (
    <>
      <Button 
        variant="light" 
        size="sm" 
        className="d-flex align-items-center border shadow-sm"
        onClick={handleShowModal}
        title="Chọn ngôn ngữ"
      >
        <CurrentFlag />
        <span className="d-none d-md-inline ms-1" data-translatable>
          {selectedLanguage ? selectedLanguage.name : 'Chọn ngôn ngữ'}
        </span>
      </Button>
      
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title data-translatable>Chọn quốc gia và ngôn ngữ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Tìm kiếm quốc gia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-translatable
            />
          </Form.Group>
          
          <div className="country-grid" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <Row>
              {filteredCountries.map((country) => (
                <Col key={country.code} xs={6} sm={4} md={3} lg={2} className="mb-3">
                  <Button
                    variant="light"
                    className="w-100 h-100 p-2 d-flex flex-column align-items-center justify-content-center"
                    onClick={() => handleSelectLanguage(country)}
                  >
                    <img 
                      src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`} 
                      alt={country.name}
                      width="40" 
                      className="mb-2"
                    />
                    <small className="text-center" style={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
                      {country.name}
                    </small>
                  </Button>
                </Col>
              ))}
            </Row>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default LanguageSelector; 