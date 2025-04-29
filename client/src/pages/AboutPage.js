import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';
import '../styles/HomePage.css';
import { authApi } from '../services/api';

const AboutPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await authApi.getMe();
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Lỗi kiểm tra đăng nhập:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  return (
    <>
      <UserNavbar />
      <div className="video-background">
        <video autoPlay loop muted className="video-bg">
          <source src="/vecteezy_vietnam-flag.mp4" type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ video HTML5.
        </video>
        <div className="overlay"></div>
      </div>
      
      <Container className="home-content py-4">
        <Row className="mb-4">
          <Col>
            <div className="text-center mb-4">
              <h1 className="main-title">Về Hệ Thống</h1>
              <p className="subtitle">Giới thiệu và hướng dẫn sử dụng</p>
            </div>
          </Col>
        </Row>

        <Row className="mb-5">
          <Col lg={12}>
            <Card className="content-card">
              <Card.Header>
                <h2 className="section-title">Lời Cam Kết</h2>
              </Card.Header>
              <Card.Body>
                <p>
                  <strong>Cam kết giữ bảo mật về tất cả cơ sở dữ liệu, đảm bảo riêng tư tuyệt đối</strong>
                </p>
                <ul className="agent-list">
                  <li>
                    Hệ thống Giao Liên cam kết bảo vệ tuyệt đối thông tin cá nhân và dữ liệu của tất cả người dùng.
                  </li>
                  <li>
                    Không chia sẻ thông tin cho bên thứ ba khi chưa có sự đồng ý. Cam kết không bán hoặc trao đổi thông tin cá nhân với bên thứ ba.
                  </li>
                  <li>
                    Nếu có chia sẻ, phải có sự đồng ý rõ ràng của người dùng hoặc theo quy định pháp luật.
                  </li>
                  <li>
                    Bảo vệ dữ liệu bằng các biện pháp kỹ thuật và tổ chức: áp dụng mã hóa, tường lửa, phân quyền truy cập.
                  </li>
                  <li>
                    Tuân thủ các quy định pháp lý về bảo mật thông tin như Luật An toàn thông tin mạng (Việt Nam), GDPR (châu Âu), CCPA (California, Mỹ).
                  </li>
                  <li>
                    Cho phép người dùng kiểm soát dữ liệu cá nhân: xem, sửa, xoá hoặc yêu cầu ngừng xử lý dữ liệu cá nhân thông qua cổng thông tin, email hoặc trung tâm hỗ trợ.
                  </li>
                  <li>
                    Cam kết lưu trữ dữ liệu trong thời gian hợp lý, không giữ thông tin cá nhân lâu hơn mức cần thiết, tự động xoá hoặc ẩn danh dữ liệu sau một thời gian nhất định.
                  </li>
                </ul>
                
                <p className="mt-4">
                  <strong>Nếu như vi phạm</strong>
                </p>
                <ul className="agent-list">
                  <li>
                    Tôi chịu toàn bộ trách nghiệm về hành vi bị lộ thông tin của bạn.
                  </li>
                  <li>
                    Thông báo kịp thời nếu xảy ra vi phạm dữ liệu, cung cấp thông tin cụ thể nếu dữ liệu bị rò rỉ hoặc bị tấn công.
                  </li>
                  <li>
                    Hướng dẫn người dùng các biện pháp xử lý và phòng tránh tiếp theo.
                  </li>
                  <li>
                    Cam kết thực hiện các biện pháp khắc phục ngay lập tức nếu phát hiện sự cố.
                  </li>
                  <li>
                    Thông báo minh bạch đến Ban tổ chức và các đơn vị liên quan về tình hình sự cố.
                  </li>
                  <li>
                    Đảm bảo các hoạt động mật thư và trò chơi tiếp tục diễn ra một cách công bằng và nguyên vẹn.
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-5">
          <Col lg={12}>
            <Card className="content-card">
              <Card.Header>
                <h2 className="section-title">Giới Thiệu</h2>
              </Card.Header>
              <Card.Body>
                <p>
                  Hệ thống <strong>Giao Liên</strong> là một nền tảng được phát triển nhằm hỗ trợ tổ chức 
                  các hoạt động trò chơi giải mật thư, đặc biệt trong bối cảnh các hoạt động trại hè, hội trại 
                  hoặc sự kiện tập thể.
                </p>
                <p>
                  Lấy cảm hứng từ vai trò lịch sử của các "Giao Liên" trong chiến tranh Việt Nam, hệ thống 
                  được thiết kế để tái hiện và giáo dục người chơi về lịch sử đấu tranh của dân tộc, đồng thời 
                  tạo ra không gian trải nghiệm thú vị và bổ ích.
                </p>
                <div className="text-center mt-5">
                  {!loading && (
                    isAdmin ? (
                      <Button as={Link} to="/admin" size="lg" variant="primary" className="px-4 py-2">
                        <i className="bi bi-speedometer2 me-2"></i> Truy cập bảng điều khiển
                      </Button>
                    ) : (
                      <Button as={Link} to="/register" size="lg" variant="primary" className="px-4 py-2">
                        <i className="bi bi-person-plus me-2"></i> Đăng ký tham gia
                      </Button>
                    )
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-5">
          <Col lg={12}>
            <Card className="content-card">
              <Card.Header>
                <h2 className="section-title">Hướng Dẫn Sử Dụng</h2>
              </Card.Header>
              <Card.Body>
                <h4>Đối với Người Chơi:</h4>
                <ol>
                  <li><strong>Đăng ký tài khoản:</strong> Đăng ký tài khoản người dùng với tên đội của bạn.</li>
                  <li><strong>Truy cập trạm:</strong> Quét mã QR hoặc nhập mã trạm để truy cập nhiệm vụ.</li>
                  <li><strong>Giải mật thư:</strong> Làm việc với đội để giải mã thông điệp được cung cấp.</li>
                  <li><strong>Gửi đáp án:</strong> Chỉ Giao Liên của đội mới được phép gửi đáp án.</li>
                  <li><strong>Theo dõi tiến độ:</strong> Xem bảng xếp hạng và tiến độ của đội mình.</li>
                </ol>

                <h4 className="mt-4">Đối với Ban Tổ Chức:</h4>
                <ol>
                  <li><strong>Đăng nhập:</strong> Sử dụng tài khoản admin để truy cập bảng điều khiển.</li>
                  <li><strong>Quản lý trạm:</strong> Tạo, chỉnh sửa và quản lý các trạm với mật thư, đáp án.</li>
                  <li><strong>Quản lý đội chơi:</strong> Xem danh sách đội chơi và tiến độ của từng đội.</li>
                  <li><strong>Theo dõi kết quả:</strong> Xem bảng xếp hạng và lịch sử trả lời của các đội.</li>
                  <li><strong>Xuất báo cáo:</strong> Tạo báo cáo kết quả cuối cùng sau khi hoạt động kết thúc.</li>
                </ol>
                
                <div className="text-center mt-5">
                  {!loading && (
                    isAdmin ? (
                      <Button as={Link} to="/admin/stations" size="lg" variant="danger" className="px-4 py-2">
                        <i className="bi bi-geo-alt-fill me-2"></i> Quản lý trạm
                      </Button>
                    ) : (
                      <Button as={Link} to="/login" size="lg" variant="outline-primary" className="px-4 py-2">
                        <i className="bi bi-box-arrow-in-right me-2"></i> Đăng nhập để quản lý
                      </Button>
                    )
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-5 pt-3 text-center">
          <Col>
            <p className="copyright">© 2025 Hệ thống Giao Liên - Phát triển bởi CuongCow</p>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AboutPage; 