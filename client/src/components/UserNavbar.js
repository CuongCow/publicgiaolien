import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const UserNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await authApi.getMe();
          setAdmin(res.data);
        }
      } catch (error) {
        // Xử lý lỗi im lặng
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAdmin(null);
    navigate('/');
  };
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  return (
    <Navbar expand="lg" className="navbar py-3 mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img src="/logo192.png" alt="Logo" style={{ height: '2rem', marginRight: '0.5rem' }} />
          <span className="fw-bold">Giao Liên</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className={isActive('/')}>
              <i className="bi bi-house-door me-1"></i> {t('home')}
            </Nav.Link>
            <Nav.Link as={Link} to="/about" className={isActive('/about')}>
              <i className="bi bi-info-circle me-1"></i> {t('about')}
            </Nav.Link>
          </Nav>
          
          <div className="d-flex align-items-center">
            {admin ? (
              <>
                <Button as={Link} to="/admin" variant="outline-primary" className="me-2">
                  <i className="bi bi-speedometer2 me-1"></i> {t('admin_panel')}
                </Button>
                <Dropdown align="end">
                  <Dropdown.Toggle variant="light" id="dropdown-basic" className="d-flex align-items-center border-0">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" 
                           style={{ width: '36px', height: '36px' }}>
                        <span>{admin?.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="d-none d-md-inline">{admin?.username}</span>
                    </div>
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/admin/profile">
                      <i className="bi bi-person me-2"></i> {t('profile')}
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/admin/settings">
                      <i className="bi bi-gear me-2"></i> {t('settings')}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> {t('logout')}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="outline-primary" className="me-2">
                  <i className="bi bi-box-arrow-in-right me-1"></i> {t('login')}
                </Button>
                <Button as={Link} to="/register" variant="primary">
                  <i className="bi bi-person-plus me-1"></i> {t('register')}
                </Button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default UserNavbar; 