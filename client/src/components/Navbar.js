import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../services/api';
import TermReplacer from '../utils/TermReplacer';
import NotificationBell from './NotificationBell';

const AdminNavbar = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await authApi.getMe();
        setAdmin(res.data);
      } catch (error) {
        console.error('Failed to fetch admin data', error);
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

  if (loading) {
    return null;
  }
  
  return (
    <Navbar expand="lg" className="navbar py-2 shadow-sm sticky-top bg-white">
      <Container fluid className="px-4">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img src="/logo192.png" alt="Logo" style={{ height: '2.2rem', marginRight: '0.5rem' }} />
          <div className="d-flex flex-column">
            <span className="fw-bold mb-0 lh-1">Giao Liên</span>
            <div className="d-flex mt-1">
              {isSuperAdmin && <span className="badge bg-danger rounded-pill me-1" style={{ fontSize: '0.65rem' }}>Super</span>}
              <span className="badge bg-primary rounded-pill" style={{ fontSize: '0.65rem' }}>Admin</span>
            </div>
          </div>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link as={Link} to="/admin/dashboard" className={`mx-md-1 px-md-3 px-2 rounded-pill ${isActive('/admin/dashboard')}`}>
              <i className="bi bi-speedometer2 me-1"></i> <span className="d-inline d-md-inline">Tổng quan</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/stations" className={`mx-md-1 px-md-3 px-2 rounded-pill ${isActive('/admin/stations')}`}>
              <i className="bi bi-geo-alt me-1"></i> <span className="d-inline d-md-inline"><TermReplacer>Trạm</TermReplacer></span>
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/teams" className={`mx-md-1 px-md-3 px-2 rounded-pill ${isActive('/admin/teams')}`}>
              <i className="bi bi-people-fill me-1"></i> <span className="d-inline d-md-inline">Đội chơi</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/ranking" className={`mx-md-1 px-md-3 px-2 rounded-pill ${isActive('/admin/ranking')}`}>
              <i className="bi bi-trophy me-1"></i> <span className="d-inline d-md-inline">BXH</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/submissions" className={`mx-md-1 px-md-3 px-2 rounded-pill ${isActive('/admin/submissions')}`}>
              <i className="bi bi-list-check me-1"></i> <span className="d-inline d-md-inline">Lịch sử</span>
            </Nav.Link>
            {isSuperAdmin && (
              <Nav.Link as={Link} to="/superadmin" className={`mx-md-1 px-md-3 px-2 rounded-pill ${isActive('/superadmin')}`}>
                <i className="bi bi-shield me-1"></i> <span className="d-inline d-md-inline">Hệ thống</span>
              </Nav.Link>
            )}
          </Nav>
          
          <div className="d-flex align-items-center justify-content-end">
            <div className="notification-wrapper me-3 d-flex align-items-center justify-content-center">
              <NotificationBell />
            </div>
            
            <Dropdown align="end">
              <Dropdown.Toggle variant="light" id="dropdown-basic" className="d-flex align-items-center border-0 bg-transparent shadow-none p-0">
                <div className="avatar-container">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                       style={{ width: '36px', height: '36px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <span>{admin?.username.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow border-0 rounded-3 mt-2">
                <div className="px-3 py-2 text-center border-bottom">
                  <strong>{admin?.username}</strong>
                </div>
                <Dropdown.Item as={Link} to="/admin/profile" className="py-2">
                  <i className="bi bi-person me-2"></i> Hồ sơ
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/settings" className="py-2">
                  <i className="bi bi-gear me-2"></i> Cài đặt
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="py-2 text-danger">
                  <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar; 