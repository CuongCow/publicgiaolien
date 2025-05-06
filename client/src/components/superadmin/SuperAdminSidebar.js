import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaUsersCog, FaChartBar, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import './SuperAdminSidebar.css';

const SuperAdminSidebar = ({ expanded, onLogout }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/superadmin/dashboard', name: 'Trang chủ', icon: <FaHome /> },
    { path: '/superadmin/team-summary', name: 'Thống kê nhóm', icon: <FaChartBar /> },
    { path: '/superadmin/admins', name: 'Quản lý admin', icon: <FaUsersCog /> },
    { path: '/superadmin/teams', name: 'Quản lý nhóm', icon: <FaUsers /> },
    { path: '/superadmin/settings', name: 'Cài đặt', icon: <FaCog /> },
  ];

  return (
    <div className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        {expanded ? (
          <h3>GL Admin</h3>
        ) : (
          <MdDashboard size={24} />
        )}
      </div>
      
      <div className="sidebar-menu">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <div className="sidebar-icon">{item.icon}</div>
            {expanded && <div className="sidebar-text">{item.name}</div>}
          </Link>
        ))}
      </div>
      
      <div className="sidebar-footer">
        <button className="logout-button" onClick={onLogout}>
          <div className="sidebar-icon"><FaSignOutAlt /></div>
          {expanded && <div className="sidebar-text">Đăng xuất</div>}
        </button>
      </div>
    </div>
  );
};

export default SuperAdminSidebar; 