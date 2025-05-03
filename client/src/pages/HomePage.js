import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Accordion, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';
import '../styles/HomePage.css';
import { authApi } from '../services/api';
import { replaceStationTerm } from '../utils/helpers';
import TermReplacer from '../utils/TermReplacer';
import SEOHelmet from '../components/SEOHelmet';

const HomePage = () => {
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
      <SEOHelmet 
        title="Trang Chủ"
        description="Hệ thống Giao Liên - Nền tảng quản lý trò chơi mật thư, quản lý trạm, đội chơi và bảng xếp hạng. Tạo và tham gia các hoạt động giải mật thư, trò chơi nhóm."
        pageName="home"
      />
      
      <UserNavbar />
      <div className="video-background">
        <video autoPlay loop muted className="video-bg">
          <source src="/vecteezy_vietnam-flag.mp4" type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ video HTML5.
        </video>
        <div className="overlay"></div>
      </div>
      
      <Container className="home-content py-4">
        <div className="flag-banner"></div>
        
        <Row className="mb-5">
          <Col>
            <div className="text-center mb-5">
              <h1 className="main-title" data-aos="fade-down">Giao Liên</h1>
              
              
              <div className="mt-5" data-aos="zoom-in" data-aos-delay="600">
                {!loading && (
                  isAdmin ? (
                    <>
                      <Button as={Link} to="/admin" size="lg" variant="primary" className="me-3 px-4 py-2 hero-btn">
                        <i className="bi bi-speedometer2 me-2"></i> Quản trị hệ thống
                      </Button>
                      <Button as={Link} to="/about" size="lg" variant="outline-light" className="px-4 py-2 hero-btn">
                        <i className="bi bi-info-circle me-2"></i> Tìm hiểu thêm
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button as={Link} to="/register" size="lg" variant="primary" className="me-3 px-4 py-2 hero-btn">
                        <i className="bi bi-person-plus me-2"></i> Đăng ký tham gia
                      </Button>
                      <Button as={Link} to="/about" size="lg" variant="outline-light" className="px-4 py-2 hero-btn">
                        <i className="bi bi-info-circle me-2"></i> Tìm hiểu thêm
                      </Button>
                    </>
                  )
                )}
              </div>
            </div>
          </Col>
        </Row>

        <Row className="mb-5" data-aos="fade-up" data-aos-delay="300">
          <Col lg={12}>
            <Card className="content-card">
              <Card.Header>
                <h2 className="section-title">
                  <span className="title-icon">★</span>
                  Giao Liên Và Tình Báo Trong Chiến Tranh Việt Nam
                </h2>
              </Card.Header>
              <Card.Body>
                <div className="image-quote">
                  <div className="quote-decoration"></div>
                  <blockquote>
                    "Giao liên là những cầu nối quan trọng, những người anh hùng thầm lặng đã góp phần vào chiến thắng vĩ đại của dân tộc."
                  </blockquote>
                </div>
                
                <p>
                  Trong lịch sử chiến tranh Việt Nam, <strong>Giao Liên</strong> và <strong>Tình Báo</strong> là hai vai trò khác nhau với những nhiệm vụ riêng biệt:
                </p>
                
                <p>
                  <strong>Giao Liên</strong> đóng vai trò là người vận chuyển, đưa thông tin giữa tình báo và quân ta. Họ chịu trách nhiệm vận chuyển thông tin, tài liệu, 
                  và đôi khi là vũ khí giữa các đơn vị trong chiến tranh. Giao liên đảm bảo 
                  thông tin được truyền đạt an toàn và kịp thời, đặc biệt trong bối cảnh chiến tranh, nơi giao liên, 
                  đặc biệt là nữ giao liên, thường cải trang để tránh bị phát hiện.
                </p>
                <p>
                  Trong khi đó, <strong>Tình Báo</strong> đóng vai trò then chốt trong việc nắm bắt, lấy thông tin. Họ thâm nhập vào hàng ngũ đối phương, 
                  thu thập thông tin tình báo quan trọng và chuyển giao cho giao liên để đưa về cho quân ta. 
                  Tình báo là "tai mắt" trong khi giao liên là "cầu nối" của cuộc kháng chiến.
                </p>
                <p>
                  Ví dụ, giao liên có thể dẫn dắt các cán bộ cấp cao như Lê Duẩn vào Sài Gòn, sử dụng các phương tiện 
                  như xe ngựa hoặc giỏ đi chợ để che giấu tài liệu. Nữ giao liên như Võ Thị Tâm, Nguyễn Thị Phương, và Lại Thị Kim Túy đã đóng vai trò 
                  quan trọng trong việc dẫn dắt cán bộ, vận chuyển vũ khí, và xây dựng cơ sở cách mạng.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-5" data-aos="fade-up" data-aos-delay="300">
          <Col lg={12}>
            <Card className="content-card">
              <Card.Header>
                <h2 className="section-title">
                  <span className="title-icon">★</span>
                  Danh Sách Các Tình Báo Và Giao Liên Tiêu Biểu
                </h2>
              </Card.Header>
              <Card.Body>
                <div className="vietnam-map-decoration"></div>
                
                <p>
                  Dựa trên các nguồn tài liệu lịch sử, dưới đây là danh sách một số tình báo và giao liên nổi tiếng của Việt Nam 
                  trong chiến tranh:
                </p>
                
                <Table striped bordered hover responsive className="mt-4">
                  <thead className="table-header">
                    <tr>
                      <th>Tên</th>
                      <th>Vai Trò</th>
                      <th>Thành Tựu Nổi Bật</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Đinh Thị Vân</strong></td>
                      <td>Tình báo</td>
                      <td>Vẽ bản đồ phòng ngự Nam vĩ tuyến 17, cung cấp thông tin chiến lược quân sự</td>
                    </tr>
                    <tr>
                      <td><strong>Phạm Xuân Ẩn</strong></td>
                      <td>Tình báo</td>
                      <td>Thâm nhập cấp cao, bảo vệ cán bộ Cộng sản, mệnh danh "Ký giả số 1 Việt Nam"</td>
                    </tr>
                    <tr>
                      <td><strong>Phạm Ngọc Thảo</strong></td>
                      <td>Tình báo</td>
                      <td>Đạo diễn đảo chính, hoạt động độc lập dưới Hồ Chí Minh và Lê Duẩn</td>
                    </tr>
                    <tr>
                      <td><strong>Nguyễn Thị Phương</strong></td>
                      <td>Giao liên</td>
                      <td>Vận chuyển vũ khí và tài liệu bằng thuyền ba lá từ Bến Tre đến Cà Mau</td>
                    </tr>
                    <tr>
                      <td><strong>Lại Thị Kim Túy</strong></td>
                      <td>Giao liên</td>
                      <td>Tham gia dẫn đường trong trận Mậu Thân, đóng góp vào chiến thắng của quân giải phóng</td>
                    </tr>
                  </tbody>
                </Table>
                
                <p className="mt-4">Ngoài ra, còn có các giao liên tiêu biểu khác như:</p>
                <ul className="agent-list">
                  <li><strong>Dương Kim Bằng:</strong> Dẫn Lê Duẩn từ Chiến khu Đ vào Sài Gòn năm 1947-1948, cải trang thành thương nhân.</li>
                  <li><strong>Lý Ngọc Phương (Hồ Anh):</strong> Vận chuyển tài liệu bằng ví da trong sứ mệnh 1956-1957, đảm bảo an toàn cho Lê Duẩn.</li>
                  <li><strong>Nguyễn Thị Hữu (Sáu Trung):</strong> Sử dụng đồng hồ để tính thời gian cho các nhiệm vụ, phục vụ Khu ủy Sài Gòn-Gia Định.</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-5" data-aos="fade-up" data-aos-delay="300">
          <Col lg={12}>
            <Card className="content-card">
              <Card.Header>
                <h2 className="section-title">
                  <span className="title-icon">★</span>
                  Áp Dụng Vai Trò "Giao Liên" Trong Hội Trại
                </h2>
              </Card.Header>
              <Card.Body>                
                <p>
                  Trong hội trại, đặc biệt là trò chơi "Hành trình trò chơi lớn," vai trò "Giao Liên" được mô phỏng 
                  để tái hiện chức năng lịch sử của họ. Cụ thể, "Giao Liên" là thành viên duy nhất trong đội được phép 
                  sử dụng điện thoại để gửi đáp án mật thư đến Ban Tổ Chức (BTC). Tuy nhiên, họ không được tham gia 
                  giải mã hoặc cho phép giải cùng đội.
                </p>
                
                <Accordion className="mt-4">
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Các biện pháp có thể áp dụng</Accordion.Header>
                    <Accordion.Body>
                      <ul>
                        <li><strong>Cách ly vật lý:</strong> "Giao Liên" phải ở xa khu vực đội giải mã, chỉ được gọi khi đội đã có đáp án.</li>
                        <li><strong>Không tiết lộ thông tin:</strong> Đội có thể ghi đáp án vào giấy, gấp lại hoặc niêm phong, và chỉ trao cho "Giao Liên" khi đã hoàn tất.</li>
                        <li><strong>Nghiêm cấm trao đổi:</strong> Nếu "Giao Liên" phải ở cùng đội, họ phải giữ im lặng và không được đóng góp ý kiến trong quá trình giải mã.</li>
                        <li><strong>Hình phạt nếu vi phạm:</strong> Nếu "Giao Liên" tham gia giải mã, đội có thể bị trừ điểm hoặc phải hoàn thành thêm nhiệm vụ.</li>
                      </ul>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
                
                <div className="text-center mt-5">
                  {!loading && (
                    isAdmin ? (
                      <Button as={Link} to="/admin/stations" size="lg" variant="danger" className="px-4 py-3 action-btn">
                        <i className="bi bi-geo-alt-fill me-2"></i>
                        <TermReplacer>Quản lý trạm</TermReplacer>
                      </Button>
                    ) : (
                      <Button as={Link} to="/register" size="lg" variant="danger" className="px-4 py-3 action-btn pulse-btn">
                        <i className="bi bi-play-fill me-2"></i> Bắt đầu tham gia ngay
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
            <div className="vietnam-patriots">
              <p>Tự hào Việt Nam - Tự hào dân tộc</p>
              <div className="red-strip"></div>
              <div className="yellow-star-footer">★</div>
            </div>
            
            <p className="peace-quote">
              Hòa bình chưa bao giờ là dễ, vẫn còn đó những tuổi thanh xuân dang dở, những hy vọng của người mẹ trông con về, những anh hùng chưa biết tên
            </p>
            
            <p className="disclaimer">
              Nội dung trên được tham khảo từ AI và các trang báo, nếu có sai sót xin các đồng chí bỏ qua.
            </p>
            <p className="copyright">© 2025 Hệ thống Giao Liên - Phát triển bởi CuongCow</p>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default HomePage; 