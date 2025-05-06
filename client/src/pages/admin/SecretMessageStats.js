import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { secretMessageApi } from '../../services/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Dữ liệu mẫu để hiển thị khi API bị lỗi
const sampleData = {
  totalResponses: 0,
  correctResponses: 0,
  incorrectResponses: 0,
  accuracyRate: 0,
  dailyStats: [
    { date: '2025-04-30', total: 0, correct: 0, incorrect: 0 },
    { date: '2025-05-01', total: 0, correct: 0, incorrect: 0 },
    { date: '2025-05-02', total: 0, correct: 0, incorrect: 0 },
    { date: '2025-05-03', total: 0, correct: 0, incorrect: 0 },
    { date: '2025-05-04', total: 0, correct: 0, incorrect: 0 },
    { date: '2025-05-05', total: 0, correct: 0, incorrect: 0 },
    { date: '2025-05-06', total: 0, correct: 0, incorrect: 0 },
  ],
  messageStats: [],
  userRankings: []
};

const SecretMessageStats = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useSampleData, setUseSampleData] = useState(false);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await secretMessageApi.getStatistics();
        
        if (response && response.data && response.data.success) {
          // Kiểm tra xem dữ liệu có rỗng không
          const stats = response.data.statistics;
          if (!stats || 
              (stats.totalResponses === 0 && 
               (!stats.messageStats || stats.messageStats.length === 0) && 
               (!stats.userRankings || stats.userRankings.length === 0))) {
            // Nếu dữ liệu rỗng, hiển thị thông báo phù hợp
            setStatistics({
              ...sampleData,
              isEmpty: true // Thêm flag để biết đây là dữ liệu rỗng
            });
          } else {
            setStatistics({
              ...stats,
              isEmpty: false
            });
          }
          setError(null);
          setUseSampleData(false);
        } else {
          console.error('Lỗi khi tải dữ liệu thống kê:', response?.data?.message || 'Không có phản hồi hợp lệ');
          if (response?.data?.error) {
            console.error('Chi tiết lỗi:', response.data.error);
          }
          setError('Không thể tải dữ liệu thống kê');
          
          // Sử dụng dữ liệu mẫu nếu có lỗi từ API
          setStatistics({
            ...sampleData,
            isSample: true // Thêm flag để biết đây là dữ liệu mẫu
          });
          setUseSampleData(true);
        }
      } catch (err) {
        console.error('Lỗi khi tải thống kê:', err);
        
        // Hiển thị lỗi
        setError('Có lỗi xảy ra, vui lòng thử lại sau hoặc đảm bảo đã đăng nhập. Mã lỗi: ' + 
          (err.response?.status || 'unknown'));
        
        // Hiển thị dữ liệu mẫu thay vì không có gì
        setUseSampleData(true);
        setStatistics({
          ...sampleData,
          isSample: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();

    // Cập nhật dữ liệu mỗi 60 giây
    const intervalId = setInterval(fetchStatistics, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Biểu đồ tròn thống kê tổng số
  const renderTotalsPieChart = () => {
    if (!statistics) return null;

    const data = {
      labels: ['Đúng', 'Sai'],
      datasets: [
        {
          data: [statistics.correctResponses, statistics.incorrectResponses],
          backgroundColor: ['#4CAF50', '#F44336'],
          borderColor: ['#388E3C', '#D32F2F'],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'Thống kê trả lời',
          font: {
            size: 16,
          }
        },
      },
    };

    return <Pie data={data} options={options} />;
  };

  // Biểu đồ cột thống kê theo ngày
  const renderDailyBarChart = () => {
    if (!statistics || !statistics.dailyStats) return null;

    const data = {
      labels: statistics.dailyStats.map(stat => 
        format(new Date(stat.date), 'dd/MM', { locale: vi })
      ),
      datasets: [
        {
          label: 'Đúng',
          data: statistics.dailyStats.map(stat => stat.correct),
          backgroundColor: '#4CAF50',
        },
        {
          label: 'Sai',
          data: statistics.dailyStats.map(stat => stat.incorrect),
          backgroundColor: '#F44336',
        },
      ],
    };

    const options = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Số lượt trả lời',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Ngày',
          },
        },
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Thống kê theo ngày (7 ngày gần nhất)',
          font: {
            size: 16,
          }
        },
      },
    };

    return <Bar data={data} options={options} />;
  };

  // Biểu đồ cột thống kê theo mật thư
  const renderMessageStatsChart = () => {
    if (!statistics || !statistics.messageStats || statistics.messageStats.length === 0) return null;

    const data = {
      labels: statistics.messageStats.map(stat => {
        // Rút gọn tên mật thư nếu quá dài
        const name = stat.name || 'Không tên';
        return name.length > 15 ? name.substring(0, 15) + '...' : name;
      }),
      datasets: [
        {
          label: 'Đúng',
          data: statistics.messageStats.map(stat => stat.correct),
          backgroundColor: '#4CAF50',
          borderColor: '#388E3C',
          borderWidth: 1,
        },
        {
          label: 'Sai',
          data: statistics.messageStats.map(stat => stat.incorrect),
          backgroundColor: '#F44336',
          borderColor: '#D32F2F',
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Số lượt trả lời',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Mật thư',
          },
        },
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Thống kê theo mật thư',
          font: {
            size: 16,
          }
        },
      },
    };

    return <Bar data={data} options={options} />;
  };

  // Render bảng xếp hạng người dùng
  const renderUserRankingsTable = () => {
    if (!statistics || !statistics.userRankings || statistics.userRankings.length === 0) {
      return (
        <div className="text-center p-4">
          <i className="bi bi-people display-4 text-muted"></i>
          <p className="mt-3">Chưa có dữ liệu xếp hạng</p>
        </div>
      );
    }

    return (
      <Table hover responsive className="align-middle">
        <thead>
          <tr className="bg-light">
            <th className="text-center">#</th>
            <th>Người dùng</th>
            <th className="text-center">Đúng</th>
            <th className="text-center">Tổng số</th>
            <th className="text-center">Độ chính xác</th>
          </tr>
        </thead>
        <tbody>
          {statistics.userRankings.map((user, index) => (
            <tr key={index} className={index < 3 ? 'table-warning' : ''}>
              <td className="text-center fw-bold">
                {index === 0 && <span className="badge text-bg-warning"><i className="bi bi-trophy-fill"></i> 1</span>}
                {index === 1 && <span className="badge text-bg-secondary"><i className="bi bi-trophy"></i> 2</span>}
                {index === 2 && <span className="badge text-bg-danger"><i className="bi bi-trophy"></i> 3</span>}
                {index > 2 && user.rank}
              </td>
              <td>
                <div className="fw-bold">{user.userName}</div>
              </td>
              <td className="text-center text-success fw-bold">{user.correctAttempts}</td>
              <td className="text-center">{user.totalAttempts}</td>
              <td className="text-center">
                <Badge 
                  bg={
                    parseFloat(user.accuracy) > 80 ? 'success' :
                    parseFloat(user.accuracy) > 50 ? 'primary' :
                    'danger'
                  }
                >
                  {user.accuracy}%
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  // Thống kê tổng quan
  const renderOverviewStats = () => {
    if (!statistics) return null;

    return (
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="display-6 text-primary mb-2">{statistics.totalResponses}</div>
              <div className="text-muted">Tổng lượt trả lời</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="display-6 text-success mb-2">{statistics.correctResponses}</div>
              <div className="text-muted">Trả lời đúng</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="display-6 text-danger mb-2">{statistics.incorrectResponses}</div>
              <div className="text-muted">Trả lời sai</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="display-6 text-info mb-2">{statistics.accuracyRate}%</div>
              <div className="text-muted">Tỉ lệ chính xác</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải dữ liệu thống kê...</p>
      </div>
    );
  }

  if (error && !useSampleData) {
    return (
      <Alert variant="warning">
        <Alert.Heading>Không thể tải dữ liệu thống kê</Alert.Heading>
        <p>{error}</p>
        <hr />
        <p className="mb-0">
          Để khắc phục vấn đề này, vui lòng:
        </p>
        <ul>
          <li>Đảm bảo bạn đã đăng nhập với quyền admin</li>
          <li>Kiểm tra kết nối internet</li>
          <li>Thử tải lại trang</li>
        </ul>
        <div className="mt-3 d-flex gap-2">
          <Button variant="outline-primary" onClick={() => window.location.reload()}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Tải lại trang
          </Button>
          <Button variant="outline-secondary" onClick={() => setUseSampleData(true)}>
            <i className="bi bi-bar-chart-fill me-2"></i>
            Xem giao diện mẫu
          </Button>
        </div>
      </Alert>
    );
  }

  // Hiển thị thông báo nếu đang sử dụng dữ liệu mẫu
  if (useSampleData) {
    return (
      <div>
        <Alert variant="info" className="mb-4">
          <Alert.Heading>
            <i className="bi bi-info-circle me-2"></i>
            Đang hiển thị dữ liệu mẫu
          </Alert.Heading>
          <p>
            Dữ liệu này chỉ để hiển thị giao diện và không phản ánh dữ liệu thực. 
            Có sự cố khi kết nối với máy chủ.
          </p>
          <Button variant="outline-primary" size="sm" onClick={() => window.location.reload()}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Thử lại
          </Button>
        </Alert>
        
        {renderOverviewStats()}

        <Row className="mb-4">
          <Col md={5}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                {renderTotalsPieChart()}
              </Card.Body>
            </Card>
          </Col>
          <Col md={7}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                {renderDailyBarChart()}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-trophy me-2"></i>
                  Xếp hạng người dùng
                </h5>
              </Card.Header>
              <Card.Body>
                {renderUserRankingsTable()}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  // Thông báo khi không có dữ liệu thực
  if (!statistics || (statistics.isEmpty && !useSampleData)) {
    return (
      <Alert variant="info">
        <Alert.Heading>Chưa có dữ liệu thống kê</Alert.Heading>
        <p>Chưa có phản hồi nào cho mật thư của bạn. Các biểu đồ và bảng xếp hạng sẽ hiển thị khi có dữ liệu.</p>
        <hr />
        <p>Hãy tạo mật thư và chia sẻ cho người dùng của bạn!</p>
        <div className="mt-3">
          <Button variant="outline-primary" size="sm" onClick={() => window.location.reload()}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Làm mới dữ liệu
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="secret-message-stats">
      {renderOverviewStats()}

      <Row className="mb-4">
        <Col md={5}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              {renderTotalsPieChart()}
            </Card.Body>
          </Card>
        </Col>
        <Col md={7}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              {renderDailyBarChart()}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              {renderMessageStatsChart()}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <i className="bi bi-trophy me-2"></i>
                Xếp hạng người dùng
              </h5>
            </Card.Header>
            <Card.Body>
              {renderUserRankingsTable()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SecretMessageStats;
