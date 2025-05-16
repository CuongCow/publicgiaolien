import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../services/api';
import TermReplacer from '../utils/TermReplacer';
import NotificationBell from './NotificationBell';
import ChatButton from './ChatButton';
import { useLanguage } from '../context/LanguageContext';
import './NavbarStyles.css';

const AdminNavbar = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await authApi.getMe();
        setAdmin(res.data);
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdmin();
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'active' : '';
  };
  
  const isSuperAdmin = admin?.role === 'superadmin';

  // Renderコンテンツメニュー 固定表示
  const renderNavItems = () => (
    <Nav className="mx-auto icon-only-nav">
      <Nav.Link as={Link} to="/admin/dashboard" className={`nav-icon-link ${isActive('/admin/dashboard')}`} title={t('dashboard')}>
        <i className="bi bi-speedometer2"></i>
        <span className="nav-text">{t('dashboard')}</span>
      </Nav.Link>
      <Nav.Link as={Link} to="/admin/stations" className={`nav-icon-link ${isActive('/admin/stations')}`} title={t('stations')}>
        <i className="bi bi-geo-alt"></i>
        <span className="nav-text"><TermReplacer>{t('stations')}</TermReplacer></span>
      </Nav.Link>
      <Nav.Link as={Link} to="/admin/teams" className={`nav-icon-link ${isActive('/admin/teams')}`} title={t('teams')}>
        <i className="bi bi-people-fill"></i>
        <span className="nav-text">{t('teams')}</span>
      </Nav.Link>
      <Nav.Link as={Link} to="/admin/secret-messages" className={`nav-icon-link ${isActive('/admin/secret-messages')}`} title="Mật thư">
        <i className="bi bi-file-earmark-lock"></i>
        <span className="nav-text">Mật thư</span>
      </Nav.Link>
      <Nav.Link as={Link} to="/admin/forms" className={`nav-icon-link ${isActive('/admin/forms')}`} title="Biểu mẫu">
        <i className="bi bi-file-earmark-text"></i>
        <span className="nav-text">Biểu mẫu</span>
      </Nav.Link>
      <Nav.Link as={Link} to="/admin/ranking" className={`nav-icon-link ${isActive('/admin/ranking')}`} title={t('ranking')}>
        <i className="bi bi-trophy"></i>
        <span className="nav-text">{t('ranking')}</span>
      </Nav.Link>
      <Nav.Link as={Link} to="/admin/submissions" className={`nav-icon-link ${isActive('/admin/submissions')}`} title={t('history')}>
        <i className="bi bi-list-check"></i>
        <span className="nav-text">{t('history')}</span>
      </Nav.Link>
      {!loading && isSuperAdmin && (
        <Nav.Link as={Link} to="/superadmin" className={`nav-icon-link ${isActive('/superadmin')}`} title={t('system')}>
          <i className="bi bi-shield"></i>
          <span className="nav-text">{t('system')}</span>
        </Nav.Link>
      )}
    </Nav>
  );
  
  return (
    <Navbar expand="lg" className="navbar py-2 shadow-sm sticky-top bg-white">
      <Container fluid className="px-4">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img src="/logo192.png" alt="Logo" style={{ height: '2.2rem', marginRight: '0.5rem' }} />
          <div className="d-flex flex-column">
            <span className="fw-bold mb-0 lh-1">Giao Liên</span>
            <div className="d-flex mt-1">
              {!loading && isSuperAdmin && <span className="badge bg-danger rounded-pill me-1" style={{ fontSize: '0.65rem' }}>Super</span>}
              <span className="badge bg-primary rounded-pill" style={{ fontSize: '0.65rem' }}>Admin</span>
            </div>
          </div>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          {renderNavItems()}
          
          <div className="d-flex align-items-center justify-content-end">
            <div className="notification-wrapper me-3 d-flex align-items-center justify-content-center">
              {!loading && <NotificationBell />}
              {loading && (
                <div className="nav-placeholder" style={{ width: '24px', height: '24px' }}></div>
              )}
            </div>
            
            {/* Component Chat - Chỉ hiển thị cho admin và superadmin */}
            {!loading && admin && (admin.role === 'admin' || admin.role === 'superadmin') && (
              <div className="me-3 d-flex align-items-center justify-content-center">
                <ChatButton />
              </div>
            )}
            
            <Dropdown align="end">
              <Dropdown.Toggle variant="light" id="dropdown-basic" className="d-flex align-items-center border-0 bg-transparent shadow-none p-0">
                <div className="avatar-container">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                       style={{ width: '36px', height: '36px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <span>{loading ? '?' : admin?.username.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
              </Dropdown.Toggle>

              {!loading && (
              <Dropdown.Menu className="shadow border-0 rounded-3 mt-2">
                <div className="px-3 py-2 text-center border-bottom">
                  <strong>{admin?.username}</strong>
                </div>
                <Dropdown.Item as={Link} to="/admin/profile" className="py-2">
                  <i className="bi bi-person me-2"></i> {t('profile')}
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/settings" className="py-2">
                  <i className="bi bi-gear me-2"></i> {t('settings')}
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="py-2 text-danger">
                  <i className="bi bi-box-arrow-right me-2"></i> {t('logout')}
                </Dropdown.Item>
              </Dropdown.Menu>
              )}
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar; 