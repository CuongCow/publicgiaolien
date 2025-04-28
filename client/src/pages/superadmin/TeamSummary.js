import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Form, InputGroup } from 'react-bootstrap';
import AdminNavbar from '../../components/Navbar';
import SuperAdminMenu from '../../components/SuperAdminMenu';
import { superAdminApi } from '../../services/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Chart from 'react-apexcharts';

const TeamSummary = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statsData, setStatsData] = useState({
    totalTeams: 0,
    activeTeams: 0,
    avgScore: 0,
    teamsByAdmin: []
  });
  
  // Tạo biểu đồ
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: [],
      },
      yaxis: {
        title: {
          text: 'Số đội'
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " đội"
          }
        }
      },
      colors: ['#0d6efd', '#198754', '#dc3545'],
      title: {
        text: 'Thống kê đội theo Admin',
        align: 'center',
        style: {
          fontSize: '18px',
          fontWeight: 'bold'
        }
      }
    }
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await superAdminApi.getAllTeams();
      
      // Đảm bảo response.data.teams tồn tại, nếu không thì dùng mảng rỗng
      const teamsData = response.data?.teams || [];
      setTeams(teamsData);
      
      // Tính toán số liệu thống kê
      calculateStats(teamsData);
      
      // Chuẩn bị dữ liệu biểu đồ
      prepareChartData(response.data?.teamsByAdmin || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setError('Không thể tải danh sách đội. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (teamsList) => {
    if (!teamsList || !teamsList.length) {
      setStatsData({
        totalTeams: 0,
        activeTeams: 0,
        avgScore: 0,
        teamsByAdmin: []
      });
      return;
    }
    
    const activeTeams = teamsList.filter(team => team.isActive).length;
    const totalScores = teamsList.reduce((sum, team) => sum + (team.score || 0), 0);
    const avgScore = teamsList.length ? (totalScores / teamsList.length).toFixed(2) : 0;
    
    // Nhóm theo admin
    const adminTeamGroups = {};
    teamsList.forEach(team => {
      if (!team) return; // Kiểm tra team tồn tại
      
      const adminId = team.adminId?._id?.toString() || 'unknown';
      const adminName = team.adminId?.name || team.adminId?.username || 'Không xác định';
      
      if (!adminTeamGroups[adminId]) {
        adminTeamGroups[adminId] = {
          adminId,
          adminName,
          teamsCount: 0,
          activeTeamsCount: 0,
          avgScore: 0,
          totalScore: 0
        };
      }
      
      adminTeamGroups[adminId].teamsCount++;
      if (team.isActive) adminTeamGroups[adminId].activeTeamsCount++;
      adminTeamGroups[adminId].totalScore += (team.score || 0);
    });
    
    // Tính điểm trung bình cho mỗi nhóm admin
    Object.values(adminTeamGroups).forEach(group => {
      group.avgScore = group.teamsCount ? (group.totalScore / group.teamsCount).toFixed(2) : 0;
    });
    
    setStatsData({
      totalTeams: teamsList.length,
      activeTeams,
      avgScore,
      teamsByAdmin: Object.values(adminTeamGroups)
    });
  };

  const prepareChartData = (teamsByAdmin) => {
    if (!teamsByAdmin || !teamsByAdmin.length) {
      setChartData(prevState => ({
        ...prevState,
        series: [],
        options: {
          ...prevState.options,
          xaxis: {
            ...prevState.options.xaxis,
            categories: []
          }
        }
      }));
      return;
    }
    
    const categories = teamsByAdmin.map(item => item?.adminName || 'Không xác định');
    const totalTeamsSeries = teamsByAdmin.map(item => item?.teamsCount || 0);
    const activeTeamsSeries = teamsByAdmin.map(item => item?.activeTeamsCount || 0);
    
    setChartData(prevState => ({
      ...prevState,
      series: [
        {
          name: 'Tổng số đội',
          data: totalTeamsSeries
        },
        {
          name: 'Đội đang hoạt động',
          data: activeTeamsSeries
        }
      ],
      options: {
        ...prevState.options,
        xaxis: {
          ...prevState.options.xaxis,
          categories
        }
      }
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Lọc và sắp xếp danh sách đội
  const filteredTeams = teams
    .filter(team => {
      if (!team) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        (team.name?.toLowerCase() || team.teamName?.toLowerCase() || '').includes(searchLower) ||
        (Array.isArray(team.members) && team.members.some(member => (member || '').toLowerCase().includes(searchLower))) ||
        (team.adminId?.name || team.createdBy?.name || '').toLowerCase().includes(searchLower) ||
        (team.adminId?.username || team.createdBy?.username || '').toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'teamName':
          comparison = (a.name || a.teamName || '').localeCompare(b.name || b.teamName || '');
          break;
        case 'score':
          comparison = (a.score || a.totalScore || 0) - (b.score || b.totalScore || 0);
          break;
        case 'stationsCompleted':
          comparison = (a.stationsCompleted?.length || a.completedStations?.length || 0) - 
                       (b.stationsCompleted?.length || b.completedStations?.length || 0);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          break;
        case 'admin':
          comparison = (a.adminId?.name || a.createdBy?.name || '').localeCompare(b.adminId?.name || b.createdBy?.name || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <i className="bi bi-sort-up"></i> : <i className="bi bi-sort-down"></i>;
  };

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
              <h1 className="h2">Tổng đội</h1>
            </div>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            {/* Thống kê */}
            <Row className="mb-4">
              <Col md={4} className="mb-3">
                <Card className="shadow-sm text-center">
                  <Card.Body>
                    <h5 className="text-primary">Tổng số đội</h5>
                    <h2>{statsData.totalTeams}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-3">
                <Card className="shadow-sm text-center">
                  <Card.Body>
                    <h5 className="text-success">Đội đang hoạt động</h5>
                    <h2>{statsData.activeTeams}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-3">
                <Card className="shadow-sm text-center">
                  <Card.Body>
                    <h5 className="text-info">Điểm trung bình</h5>
                    <h2>{statsData.avgScore}</h2>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Biểu đồ */}
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <Chart 
                  options={chartData.options} 
                  series={chartData.series} 
                  type="bar" 
                  height={350} 
                />
              </Card.Body>
            </Card>

            {/* Bảng thống kê theo admin */}
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h5 className="card-title mb-3">Thống kê theo Admin</h5>
                
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Admin</th>
                        <th>Tổng số đội</th>
                        <th>Đội đang hoạt động</th>
                        <th>Điểm trung bình</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData.teamsByAdmin.map((adminStats, index) => (
                        <tr key={adminStats.adminId || index}>
                          <td>{adminStats.adminName}</td>
                          <td>{adminStats.teamsCount}</td>
                          <td>{adminStats.activeTeamsCount}</td>
                          <td>{adminStats.avgScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
            
            {/* Danh sách đội chơi */}
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h5 className="card-title mb-3">Danh sách Đội chơi</h5>

                {/* Tìm kiếm */}
                <Form.Group className="mb-3">
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Tìm kiếm theo tên đội, thành viên hoặc admin..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </InputGroup>
                </Form.Group>
                
                {loading && !teams.length ? (
                  <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Đang tải dữ liệu...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th onClick={() => handleSort('teamName')} style={{ cursor: 'pointer' }}>
                            Tên {getSortIcon('teamName')}
                          </th>
                          <th onClick={() => handleSort('score')} style={{ cursor: 'pointer' }}>
                            Điểm {getSortIcon('score')}
                          </th>
                          <th onClick={() => handleSort('stationsCompleted')} style={{ cursor: 'pointer' }}>
                            Trạm đã hoàn thành {getSortIcon('stationsCompleted')}
                          </th>
                          <th>Trạng thái</th>
                          <th onClick={() => handleSort('admin')} style={{ cursor: 'pointer' }}>
                            Admin {getSortIcon('admin')}
                          </th>
                          <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                            Ngày tạo {getSortIcon('createdAt')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeams.map(team => (
                          <tr key={team._id}>
                            <td>{team.name || team.teamName || 'Không có tên'}</td>
                            <td>
                              <Badge bg="primary">{team.score || team.totalScore || 0}</Badge>
                            </td>
                            <td>
                              {team.stationsCompleted?.length || team.completedStations?.length || 0}
                            </td>
                            <td>
                              {team.isActive || team.status === 'active' ? (
                                <Badge bg="success">Hoạt động</Badge>
                              ) : (
                                <Badge bg="secondary">Không hoạt động</Badge>
                              )}
                            </td>
                            <td>{team.adminId?.name || team.adminId?.username || team.createdBy?.name || team.createdBy?.username || '-'}</td>
                            <td>{formatDate(team.createdAt)}</td>
                          </tr>
                        ))}
                        {filteredTeams.length === 0 && (
                          <tr>
                            <td colSpan="7" className="text-center">Không tìm thấy đội nào</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default TeamSummary; 