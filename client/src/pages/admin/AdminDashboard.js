import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AdminNavbar from '../../components/Navbar';
import { stationApi, teamApi, submissionApi } from '../../services/api';
import { replaceStationTerm } from '../../utils/helpers';
import TermReplacer from '../../utils/TermReplacer';
import { useLanguage } from '../../context/LanguageContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    stationCount: 0,
    teamCount: 0,
    submissionCount: 0,
  });

  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stationsRes, teamsRes, submissionsRes] = await Promise.all([
          stationApi.getAll(),
          teamApi.getAll(),
          submissionApi.getAll()
        ]);

        setStats({
          stationCount: stationsRes.data.length,
          teamCount: teamsRes.data.length,
          submissionCount: submissionsRes.data.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <AdminNavbar />
      <Container>
        <h1 className="mb-4">{t('system_overview')}</h1>
        
        <Row className="mb-4">
          <Col md={4}>
            <Card className="shadow-sm mb-3">
              <Card.Body className="text-center">
                <h2>{stats.stationCount}</h2>
                <Card.Title><TermReplacer>{t('total_stations')}</TermReplacer></Card.Title>
                <p className="text-muted"><TermReplacer>{t('total_stations')}</TermReplacer></p>
                <Button as={Link} to="/admin/stations" variant="outline-primary">
                  {t('manage_stations')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="shadow-sm mb-3">
              <Card.Body className="text-center">
                <h2>{stats.teamCount}</h2>
                <Card.Title><TermReplacer>{t('total_teams')}</TermReplacer></Card.Title>
                <p className="text-muted">{t('total_teams')}</p>
                <Button as={Link} to="/admin/ranking" variant="outline-primary">
                  {t('view_ranking')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="shadow-sm mb-3">
              <Card.Body className="text-center">
                <h2>{stats.submissionCount}</h2>
                <Card.Title><TermReplacer>{t('total_submissions')}</TermReplacer></Card.Title>
                <p className="text-muted">{t('total_submissions')}</p>
                <Button as={Link} to="/admin/submissions" variant="outline-primary">
                  {t('view_details')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Body>
                <h3><TermReplacer>{t('station_management')}</TermReplacer></h3>
                <p className="text-muted">
                  <TermReplacer>{t('station_management_description')}</TermReplacer>
                </p>
                <Button as={Link} to="/admin/stations/new" variant="primary">
                  {t('create_station')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AdminDashboard; 