import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AdminNavbar from '../../components/Navbar';
import SuperAdminMenu from '../../components/SuperAdminMenu';
import axios from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const SuperAdminDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    admins: 0,
    teams: 0,
    inviteCodes: 0,
    notifications: 0,
    logs: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi API để lấy thống kê từ Super Admin
        const response = await axios.get('/api/superadmin/database/stats');
        
        setStats({
          admins: response.data.collections.admins || 0,
          teams: response.data.collections.teams || 0,
          inviteCodes: response.data.collections.inviteCodes || 0,
          notifications: response.data.collections.notifications || 0,
          logs: response.data.collections.systemLogs || 0
        });
      } catch (error) {
        console.error('Error fetching superadmin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <>
      <AdminNavbar />
      <Container fluid>
        <Row>
          <Col md={3} lg={2} className="d-none d-md-block bg-light sidebar">
            <SuperAdminMenu />
          </Col>
          
          <Col md={9} lg={10} className="ms-sm-auto px-md-4">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2">{t('superadmin_dashboard_title')}</h1>
              <span className="badge bg-danger">{t('superadmin_role')}</span>
            </div>
            
            <Row className="mb-4">
              <Col md={4} className="mb-3">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title">{t('admins_label')}</h5>
                        <h2 className="mb-0">{stats.admins}</h2>
                      </div>
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                        style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-person-badge fs-4"></i>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Link to="/superadmin/admins" className="btn btn-sm btn-outline-primary">{t('view_details')}</Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4} className="mb-3">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title">{t('total_teams_super')}</h5>
                        <h2 className="mb-0">{stats.teams}</h2>
                      </div>
                      <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" 
                        style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-people fs-4"></i>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Link to="/superadmin/teams" className="btn btn-sm btn-outline-success">{t('view_details')}</Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4} className="mb-3">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title">{t('invite_codes_label')}</h5>
                        <h2 className="mb-0">{stats.inviteCodes}</h2>
                      </div>
                      <div className="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center" 
                        style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-ticket-perforated fs-4"></i>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Link to="/superadmin/invite-codes" className="btn btn-sm btn-outline-warning">{t('manage')}</Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={4} className="mb-3">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title">{t('notifications_label')}</h5>
                        <h2 className="mb-0">{stats.notifications}</h2>
                      </div>
                      <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center" 
                        style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-bell fs-4"></i>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Link to="/superadmin/notifications" className="btn btn-sm btn-outline-info">{t('manage')}</Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4} className="mb-3">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title">{t('logs_label')}</h5>
                        <h2 className="mb-0">{stats.logs}</h2>
                      </div>
                      <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" 
                        style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-journal-text fs-4"></i>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Link to="/superadmin/logs" className="btn btn-sm btn-outline-secondary">{t('view_logs')}</Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4} className="mb-3">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title">{t('database_label')}</h5>
                        <h2 className="mb-0">
                          <i className="bi bi-database"></i>
                        </h2>
                      </div>
                      <div className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center" 
                        style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-server fs-4"></i>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Link to="/superadmin/database" className="btn btn-sm btn-outline-danger">{t('manage')}</Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default SuperAdminDashboard; 