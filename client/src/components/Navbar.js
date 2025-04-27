import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../services/api';
import { replaceStationTerm } from '../utils/helpers';
import TermReplacer from '../utils/TermReplacer';

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
  
  if (loading) {
    return null;
  }
  
  return (
    <Navbar expand="lg" className="navbar py-3 mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img src="/logo192.png" alt="Logo" style={{ height: '2rem', marginRight: '0.5rem' }} />
          <span className="fw-bold">Giao Liên</span>
          <span className="ms-1 badge bg-primary">Admin</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/admin/dashboard" className={isActive('/admin/dashboard')}>
              <i className="bi bi-speedometer2 me-1"></i> Tổng quan
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/stations" className={isActive('/admin/stations')}>
              <i className="bi bi-geo-alt me-1"></i> <TermReplacer>Trạm</TermReplacer>
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/teams" className={isActive('/admin/teams')}>
              <i className="bi bi-people-fill me-2"></i>
              Đội chơi
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/ranking" className={isActive('/admin/ranking')}>
              <i className="bi bi-trophy me-1"></i> Bảng xếp hạng
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/submissions" className={isActive('/admin/submissions')}>
              <i className="bi bi-list-check me-1"></i> Lịch sử trả lời
            </Nav.Link>
          </Nav>
          
          <div className="d-flex align-items-center">
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
                  <i className="bi bi-person me-2"></i> Hồ sơ
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/settings">
                  <i className="bi bi-gear me-2"></i> Cài đặt
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
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