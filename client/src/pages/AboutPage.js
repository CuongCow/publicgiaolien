import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Accordion } from 'react-bootstrap';
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
                <h2 className="section-title">Tính Năng Hệ Thống</h2>
              </Card.Header>
              <Card.Body>
                <Accordion defaultActiveKey="0" className="feature-accordion">
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>
                      <i className="bi bi-speedometer2 me-2"></i> Tổng quan
                    </Accordion.Header>
                    <Accordion.Body>
                      <p>Trang Tổng quan cung cấp cái nhìn tổng thể về hệ thống và hoạt động trò chơi hiện tại:</p>
                      <ul>
                        <li><strong>Thống kê tổng quan:</strong> Hiển thị số lượng trạm, đội chơi và lượt trả lời</li>
                        <li><strong>Truy cập nhanh:</strong> Các liên kết nhanh đến các chức năng quản lý quan trọng</li>
                        <li><strong>Thông báo hệ thống:</strong> Hiển thị các thông báo quan trọng và cập nhật mới nhất</li>
                      </ul>
                      <p>Đây là điểm xuất phát lý tưởng cho Ban tổ chức để kiểm soát và điều hành toàn bộ hoạt động.</p>
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="1">
                    <Accordion.Header>
                      <i className="bi bi-geo-alt me-2"></i> Trạm
                    </Accordion.Header>
                    <Accordion.Body>
                      <p>Phần Quản lý Trạm cho phép tạo và quản lý các trạm trong hoạt động:</p>
                      <ul>
                        <li><strong>Tạo trạm mới:</strong> Thiết lập trạm với tên, mô tả và hình ảnh</li>
                        <li><strong>Soạn nội dung:</strong> Tạo nội dung trạm với định dạng phong phú (văn bản, hình ảnh)</li>
                        <li><strong>Thiết lập đáp án:</strong> Cấu hình đáp án chính xác và gợi ý</li>
                        <li><strong>Tạo mã QR:</strong> Tự động tạo mã QR cho mỗi trạm để dễ dàng truy cập</li>
                        <li><strong>Tùy chỉnh giao diện:</strong> Điều chỉnh phông chữ, kích thước và giao diện hiển thị</li>
                        <li><strong>Kiểm soát truy cập:</strong> Quản lý quyền truy cập vào từng trạm</li>
                        <li><strong>Theo dõi tiến độ:</strong> Xem số lượt truy cập và tỷ lệ trả lời đúng của từng trạm</li>
                      </ul>
                      <p>Chức năng này giúp Ban tổ chức dễ dàng thiết kế và điều chỉnh trải nghiệm chơi game theo nhiều chủ đề khác nhau.</p>
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="2">
                    <Accordion.Header>
                      <i className="bi bi-people-fill me-2"></i> Đội chơi
                    </Accordion.Header>
                    <Accordion.Body>
                      <p>Phần Quản lý Đội chơi cho phép Ban tổ chức điều hành và giám sát các đội tham gia:</p>
                      <ul>
                        <li><strong>Đăng ký đội:</strong> Tạo đội mới với thông tin chi tiết (tên đội, thành viên, liên hệ)</li>
                        <li><strong>Quản lý mật khẩu:</strong> Cấp phát và đặt lại mật khẩu cho đội</li>
                        <li><strong>Phân quyền:</strong> Thiết lập quyền truy cập cho từng đội</li>
                        <li><strong>Theo dõi hoạt động:</strong> Giám sát lịch sử tương tác và thời gian hoạt động</li>
                        <li><strong>Điều chỉnh điểm số:</strong> Thêm/trừ điểm thủ công khi cần thiết</li>
                        <li><strong>Gửi thông báo:</strong> Gửi thông báo trực tiếp đến các đội</li>
                        <li><strong>Tạm khóa/mở khóa:</strong> Quản lý trạng thái hoạt động của đội</li>
                        <li><strong>Xuất dữ liệu:</strong> Xuất thông tin đội để báo cáo và phân tích</li>
                      </ul>
                      <p>Chức năng này cung cấp công cụ mạnh mẽ để quản lý người tham gia, đảm bảo trải nghiệm chơi game công bằng và hiệu quả.</p>
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="3">
                    <Accordion.Header>
                      <i className="bi bi-file-earmark-lock me-2"></i> Mật thư
                    </Accordion.Header>
                    <Accordion.Body>
                      <p>Phần Quản lý Mật thư cho phép tạo và điều hành các thử thách mật thư độc lập:</p>
                      <ul>
                        <li><strong>Tạo mật thư:</strong> Soạn mật thư với nhiều loại nội dung (văn bản, hình ảnh, kết hợp)</li>
                        <li><strong>Cấu hình đáp án:</strong> Thiết lập nhiều đáp án chính xác và giới hạn số lần thử</li>
                        <li><strong>Thu thập thông tin:</strong> Tùy chỉnh các trường thông tin cần thu thập từ người chơi</li>
                        <li><strong>Tùy chỉnh phông chữ:</strong> Thiết lập kiểu chữ, kích thước và định dạng nội dung</li>
                        <li><strong>Xuất mã QR:</strong> Tạo và tải xuống mã QR cho mật thư để dễ dàng chia sẻ</li>
                        <li><strong>Theo dõi người dùng:</strong> Giám sát ai đã xem và trả lời mật thư</li>
                        <li><strong>Ghi chú cho đội chơi:</strong> Thêm hướng dẫn và thông tin hỗ trợ đội chơi</li>
                        <li><strong>Xuất báo cáo:</strong> Xuất dữ liệu phản hồi sang Excel để phân tích</li>
                      </ul>
                      <p>Tính năng này hoạt động độc lập với hệ thống trạm, cho phép tổ chức các hoạt động mật thư linh hoạt hơn và thu thập thông tin từ người chơi.</p>
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="4">
                    <Accordion.Header>
                      <i className="bi bi-trophy me-2"></i> Bảng xếp hạng
                    </Accordion.Header>
                    <Accordion.Body>
                      <p>Phần Bảng xếp hạng hiển thị thành tích của các đội tham gia:</p>
                      <ul>
                        <li><strong>Xếp hạng thời gian thực:</strong> Cập nhật điểm số và thứ hạng tự động</li>
                        <li><strong>Nhiều chế độ sắp xếp:</strong> Sắp xếp theo điểm số, thời gian hoàn thành, số trạm đã ghé qua</li>
                        <li><strong>Hiệu ứng trực quan:</strong> Đánh dấu thay đổi thứ hạng với hiệu ứng trực quan</li>
                        <li><strong>Lọc và tìm kiếm:</strong> Tìm kiếm đội cụ thể hoặc lọc theo tiêu chí</li>
                        <li><strong>Hiển thị chi tiết:</strong> Xem thông tin chi tiết về tiến độ của từng đội</li>
                        <li><strong>Chế độ hiển thị công khai:</strong> Chọn hiển thị/ẩn bảng xếp hạng với người chơi</li>
                        <li><strong>Xuất dữ liệu:</strong> Tải xuống bảng xếp hạng dưới nhiều định dạng</li>
                        <li><strong>Đặt lại xếp hạng:</strong> Tùy chọn đặt lại bảng xếp hạng khi cần</li>
                      </ul>
                      <p>Tính năng này tạo không khí cạnh tranh lành mạnh và động lực cho người chơi, đồng thời cung cấp công cụ để Ban tổ chức theo dõi tiến trình của trò chơi.</p>
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="5">
                    <Accordion.Header>
                      <i className="bi bi-list-check me-2"></i> Lịch sử
                    </Accordion.Header>
                    <Accordion.Body>
                      <p>Phần Lịch sử cung cấp thông tin chi tiết về tất cả các hoạt động trong hệ thống:</p>
                      <ul>
                        <li><strong>Theo dõi lượt trả lời:</strong> Xem tất cả lượt trả lời của các đội</li>
                        <li><strong>Lọc theo nhiều tiêu chí:</strong> Lọc theo đội, trạm, thời gian, kết quả</li>
                        <li><strong>Xem chi tiết:</strong> Kiểm tra nội dung đáp án và thời gian phản hồi</li>
                        <li><strong>Thống kê:</strong> Xem số liệu thống kê về tỷ lệ trả lời đúng/sai</li>
                        <li><strong>Xuất báo cáo:</strong> Tạo báo cáo chi tiết về hoạt động của cả hệ thống</li>
                        <li><strong>Tìm kiếm nâng cao:</strong> Tìm kiếm thông tin cụ thể trong lịch sử hoạt động</li>
                        <li><strong>Xóa lịch sử:</strong> Tùy chọn xóa lịch sử để bắt đầu lại (chỉ dành cho admin)</li>
                      </ul>
                      <p>Chức năng này cung cấp khả năng theo dõi toàn diện tình hình hoạt động, giúp Ban tổ chức đánh giá hiệu quả của trò chơi và phân tích hành vi người chơi.</p>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
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