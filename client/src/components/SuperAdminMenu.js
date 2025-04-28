import React from 'react';
import { Nav, Dropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const SuperAdminMenu = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'active' : '';
  };
  
  return (
    <Nav className="flex-column mt-3 superadmin-menu">
      <h5 className="sidebar-heading d-flex justify-content-between align-items-center px-3 text-muted text-uppercase">
        <span>QUẢN TRỊ</span>
        <span className="badge bg-danger">Super</span>
      </h5>
      
      <Nav.Link as={Link} to="/superadmin/notifications" className={isActive('/superadmin/notifications')}>
        <i className="bi bi-bell me-2"></i>Thông báo
      </Nav.Link>
      
      <Nav.Link as={Link} to="/superadmin/admins" className={isActive('/superadmin/admins')}>
        <i className="bi bi-person-badge me-2"></i>Admin
      </Nav.Link>
      
      <Nav.Link as={Link} to="/superadmin/invite-codes" className={isActive('/superadmin/invite-codes')}>
        <i className="bi bi-ticket-perforated me-2"></i>Mã mời
      </Nav.Link>
      
      <Nav.Link as={Link} to="/superadmin/teams" className={isActive('/superadmin/teams')}>
        <i className="bi bi-people me-2"></i>Đội
      </Nav.Link>
      
      <Nav.Link as={Link} to="/superadmin/security" className={isActive('/superadmin/security')}>
        <i className="bi bi-shield-lock me-2"></i>An toàn
      </Nav.Link>
      
      <Nav.Link as={Link} to="/superadmin/logs" className={isActive('/superadmin/logs')}>
        <i className="bi bi-journal-text me-2"></i>Log Edit
      </Nav.Link>
      
      <Nav.Link as={Link} to="/superadmin/database" className={isActive('/superadmin/database')}>
        <i className="bi bi-server me-2"></i> Database
      </Nav.Link>
    </Nav>
  );
};

export default SuperAdminMenu; 