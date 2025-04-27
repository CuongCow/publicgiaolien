import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AdminNavbar from '../../components/Navbar';
import { stationApi, teamApi, submissionApi } from '../../services/api';
import { replaceStationTerm } from '../../utils/helpers';
import TermReplacer from '../../utils/TermReplacer';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    stationCount: 0,
    teamCount: 0,
    submissionCount: 0,
  });

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
        <h1 className="mb-4">Tổng quan hệ thống</h1>
        
        <Row className="mb-4">
          <Col md={4}>
            <Card className="shadow-sm mb-3">
              <Card.Body className="text-center">
                <h2>{stats.stationCount}</h2>
                <Card.Title><TermReplacer>Tổng số trạm</TermReplacer></Card.Title>
                <p className="text-muted"><TermReplacer>Tổng số trạm</TermReplacer></p>
                <Button as={Link} to="/admin/stations" variant="outline-primary">
                <TermReplacer>Quản lý trạm</TermReplacer>
                </Button>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="shadow-sm mb-3">
              <Card.Body className="text-center">
                <h2>{stats.teamCount}</h2>
                <Card.Title><TermReplacer>Tổng số đội chơi</TermReplacer></Card.Title>
                <p className="text-muted">Tổng số đội chơi</p>
                <Button as={Link} to="/admin/ranking" variant="outline-primary">
                  Xem bảng xếp hạng
                </Button>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="shadow-sm mb-3">
              <Card.Body className="text-center">
                <h2>{stats.submissionCount}</h2>
                <Card.Title><TermReplacer>Tổng số lần nộp</TermReplacer></Card.Title>
                <p className="text-muted">Tổng số lần nộp</p>
                <Button as={Link} to="/admin/submissions" variant="outline-primary">
                  Xem chi tiết
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Body>
                <h3><TermReplacer>Quản lý trạm mật thư</TermReplacer></h3>
                <p className="text-muted">
                <TermReplacer>Tạo, chỉnh sửa và quản lý các trạm mật thư cho cuộc chơi. Mỗi trạm sẽ có 
                  một mã QR riêng để đội chơi quét và truy cập.</TermReplacer>
                </p>
                <Button as={Link} to="/admin/stations/new" variant="primary">
                <TermReplacer>Tạo trạm mới</TermReplacer>
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