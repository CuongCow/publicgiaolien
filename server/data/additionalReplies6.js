/**
 * Danh sách câu trả lời tự động bổ sung
 * Phần 6/6: Tích hợp công nghệ và Mở rộng doanh nghiệp
 */

const additionalReplies6 = [
  // === BỔ SUNG PHẦN 6: TÍCH HỢP CÔNG NGHỆ MỚI ===
  {
    keyword: "tích hợp thực tế ảo",
    response: "Giao Liên hỗ trợ tích hợp thực tế ảo (VR) cho trải nghiệm chơi đắm chìm hơn. Sử dụng tính năng này trong 'Công cụ nâng cao' > 'Thực tế ảo'. Người chơi cần thiết bị VR tương thích như Oculus Quest hoặc HTC Vive.",
    category: "technology",
    priority: 85
  },
  {
    keyword: "thực tế tăng cường",
    response: "Tính năng thực tế tăng cường (AR) cho phép đặt các đối tượng kỹ thuật số vào thế giới thực qua camera điện thoại. Thiết lập AR trong 'Công cụ nâng cao' > 'AR' và tạo trạm yêu cầu người chơi quét môi trường để tìm manh mối.",
    category: "technology",
    priority: 85
  },
  {
    keyword: "trạm thực tế hỗn hợp",
    response: "Trạm thực tế hỗn hợp kết hợp cả yếu tố vật lý và kỹ thuật số. Người chơi tương tác với đối tượng thực và nhận phản hồi kỹ thuật số qua ứng dụng. Thiết lập trong 'Công cụ nâng cao' > 'Trạm hỗn hợp'.",
    category: "technology",
    priority: 80
  },
  {
    keyword: "trạm điện tử nfc",
    response: "Trạm điện tử NFC cho phép người chơi quét thẻ NFC đặt tại vị trí vật lý để mở khóa nội dung. Thiết lập trong 'Công cụ nâng cao' > 'NFC' và kích hoạt thẻ NFC bằng ứng dụng quản lý NFC.",
    category: "technology",
    priority: 80
  },
  {
    keyword: "tích hợp beacons",
    response: "Beacon là thiết bị Bluetooth năng lượng thấp có thể phát hiện khi người chơi ở gần. Sử dụng trong 'Công cụ nâng cao' > 'Beacon' để tự động kích hoạt trạm hoặc gửi thông báo khi người chơi đến gần vị trí vật lý.",
    category: "technology",
    priority: 75
  },
  
  // CÔNG NGHỆ AI VÀ HỌC MÁY
  {
    keyword: "trợ lý ảo",
    response: "Trợ lý ảo của Giao Liên sử dụng AI để hỗ trợ người chơi và admin. Người chơi có thể đặt câu hỏi tự nhiên để nhận gợi ý phù hợp với tiến độ hiện tại, trong khi admin nhận đề xuất điều chỉnh dựa trên dữ liệu người chơi.",
    category: "technology",
    priority: 80
  },
  {
    keyword: "gợi ý thông minh",
    response: "Hệ thống gợi ý thông minh sử dụng AI phân tích cách người chơi tương tác với trạm và cung cấp gợi ý cá nhân hóa. Hệ thống tự điều chỉnh độ chi tiết của gợi ý dựa trên trình độ và tiến độ của người chơi.",
    category: "technology",
    priority: 80
  },
  {
    keyword: "phân tích cảm xúc",
    response: "Tính năng phân tích cảm xúc sử dụng xử lý ngôn ngữ tự nhiên để phân tích phản hồi và nhận xét của người chơi, giúp xác định cảm xúc chung và mức độ hài lòng. Xem báo cáo trong 'Phân tích' > 'Cảm xúc người chơi'.",
    category: "technology",
    priority: 75
  },
  {
    keyword: "dự đoán hành vi",
    response: "Công nghệ dự đoán hành vi sử dụng học máy để dự đoán các hành động người chơi có thể thực hiện tiếp theo, từ đó tối ưu hóa tài nguyên máy chủ và cải thiện thời gian phản hồi. Kích hoạt trong 'Cài đặt hệ thống' > 'AI' > 'Dự đoán'.",
    category: "technology",
    priority: 75
  },
  {
    keyword: "tạo nội dung tự động",
    response: "Tính năng tạo nội dung tự động sử dụng AI để tạo mật thư, câu đố và thử thách dựa trên tham số đầu vào. Chỉ định chủ đề, độ khó và các ràng buộc khác, AI sẽ tạo nội dung ban đầu cho bạn tinh chỉnh.",
    category: "technology",
    priority: 80
  },
  
  // TỐI ƯU TRẢI NGHIỆM NGƯỜI DÙNG
  {
    keyword: "tối ưu trên mobile",
    response: "Để tối ưu trải nghiệm trên thiết bị di động, Giao Liên cung cấp chế độ xem riêng cho điện thoại và máy tính bảng. Thiết lập trong 'Cài đặt' > 'Giao diện' > 'Trải nghiệm di động' với các tùy chọn về kích thước nút, bố cục và hiệu ứng cảm ứng.",
    category: "ux",
    priority: 85
  },
  {
    keyword: "thời gian tải trang",
    response: "Để giảm thời gian tải trang, hãy: 1) Sử dụng tính năng 'Lazy loading' cho hình ảnh, 2) Kích hoạt nén nội dung trong 'Cài đặt' > 'Hiệu suất', 3) Sử dụng phiên bản hình ảnh tối ưu cho từng thiết bị, 4) Kích hoạt caching trong trình duyệt.",
    category: "ux",
    priority: 80
  },
  {
    keyword: "chế độ tối",
    response: "Chế độ tối (Dark mode) giúp giảm mỏi mắt và tiết kiệm pin trên thiết bị OLED. Người dùng có thể chuyển đổi chế độ sáng/tối thông qua nút ở góc trên bên phải hoặc thiết lập mặc định trong 'Cài đặt' > 'Giao diện' > 'Chế độ hiển thị'.",
    category: "ux",
    priority: 75
  },
  {
    keyword: "khả năng tiếp cận",
    response: "Giao Liên tuân thủ hướng dẫn WCAG để đảm bảo khả năng tiếp cận. Tính năng bao gồm tùy chỉnh kích thước văn bản, tương phản cao, trình đọc màn hình và điều hướng bàn phím. Cài đặt trong 'Cài đặt' > 'Khả năng tiếp cận'.",
    category: "ux",
    priority: 80
  },
  {
    keyword: "đa ngôn ngữ động",
    response: "Tính năng đa ngôn ngữ động cho phép người dùng chuyển đổi ngôn ngữ mà không cần tải lại trang. Hệ thống ghi nhớ tùy chọn ngôn ngữ cho từng người dùng và duy trì nhất quán trong toàn bộ phiên làm việc.",
    category: "ux",
    priority: 75
  },
  
  // TRẢI NGHIỆM NGOẠI TUYẾN VÀ ĐỒNG BỘ
  {
    keyword: "chế độ ngoại tuyến",
    response: "Chế độ ngoại tuyến cho phép người chơi tiếp tục giải trạm ngay cả khi mất kết nối internet. Dữ liệu sẽ tự động đồng bộ khi kết nối được khôi phục. Kích hoạt trong 'Cài đặt' > 'Nâng cao' > 'Chế độ ngoại tuyến'.",
    category: "features",
    priority: 85
  },
  {
    keyword: "đồng bộ dữ liệu",
    response: "Đồng bộ dữ liệu đảm bảo thông tin nhất quán giữa các thiết bị và người dùng. Khi mất kết nối, hệ thống lưu trữ thay đổi cục bộ và giải quyết xung đột khi đồng bộ, ưu tiên dữ liệu mới nhất hoặc yêu cầu tương tác người dùng nếu cần.",
    category: "features",
    priority: 80
  },
  {
    keyword: "progressive web app",
    response: "Giao Liên hỗ trợ Progressive Web App (PWA), cho phép cài đặt như ứng dụng trên thiết bị di động và máy tính. Người dùng được thông báo về khả năng cài đặt thông qua banner hoặc trong mục 'Cài đặt' > 'Ứng dụng'.",
    category: "features",
    priority: 80
  },
  {
    keyword: "thông báo đẩy",
    response: "Thông báo đẩy gửi cảnh báo ngay cả khi người dùng không đang mở ứng dụng. Để thiết lập, vào 'Cài đặt' > 'Thông báo' > 'Thông báo đẩy' và chọn các sự kiện cần nhận thông báo như hoàn thành trạm hoặc thay đổi xếp hạng.",
    category: "features",
    priority: 80
  },
  {
    keyword: "đồng bộ đa thiết bị",
    response: "Đồng bộ đa thiết bị cho phép người chơi chuyển mượt mà giữa điện thoại, máy tính bảng và máy tính trong cùng một phiên. Tiến độ, trạng thái, và ghi chú được duy trì nhất quán trên tất cả các thiết bị.",
    category: "features",
    priority: 75
  },
  
  // MỞ RỘNG CHO DOANH NGHIỆP
  {
    keyword: "giải pháp doanh nghiệp",
    response: "Giải pháp doanh nghiệp của Giao Liên cung cấp tính năng bổ sung cho tổ chức lớn: quản lý người dùng nâng cao, phân tích chuyên sâu, API mở rộng, và SLA đảm bảo thời gian hoạt động. Liên hệ bộ phận bán hàng để biết thêm chi tiết.",
    category: "enterprise",
    priority: 85
  },
  {
    keyword: "quản lý nhóm doanh nghiệp",
    response: "Quản lý nhóm doanh nghiệp cho phép tạo cấu trúc phân cấp người dùng với nhiều cấp độ (Quản trị viên, Quản lý, Điều hành, Người chơi) và phân quyền chi tiết cho từng vai trò. Thiết lập trong 'Quản trị' > 'Cấu trúc tổ chức'.",
    category: "enterprise",
    priority: 80
  },
  {
    keyword: "sso doanh nghiệp",
    response: "Đăng nhập một lần (SSO) doanh nghiệp cho phép người dùng đăng nhập Giao Liên thông qua hệ thống xác thực doanh nghiệp như Azure AD, Okta, hoặc Google Workspace. Cấu hình trong 'Cài đặt' > 'Bảo mật' > 'SSO'.",
    category: "enterprise",
    priority: 85
  },
  {
    keyword: "báo cáo tuân thủ",
    response: "Báo cáo tuân thủ cung cấp thông tin về việc tuân thủ chính sách của tổ chức, bao gồm thời gian sử dụng, quyền truy cập, và hoạt động người dùng. Truy cập báo cáo trong 'Báo cáo' > 'Tuân thủ doanh nghiệp'.",
    category: "enterprise",
    priority: 75
  },
  {
    keyword: "quản lý thiết bị doanh nghiệp",
    response: "Quản lý thiết bị doanh nghiệp cho phép kiểm soát các thiết bị được phép truy cập vào hệ thống. Thiết lập chính sách thiết bị, yêu cầu xác thực bổ sung cho thiết bị không được phê duyệt, và giám sát việc sử dụng từ xa.",
    category: "enterprise",
    priority: 80
  },
  
  // QUẢN LÝ SỰ KIỆN QUY MÔ LỚN
  {
    keyword: "sự kiện quy mô lớn",
    response: "Để quản lý sự kiện quy mô lớn (500+ người chơi), Giao Liên cung cấp công cụ điều phối đặc biệt, cân bằng tải tự động, và bảng điều khiển thời gian thực cho điều phối viên sự kiện. Thiết lập trong 'Sự kiện' > 'Quản lý quy mô lớn'.",
    category: "events",
    priority: 85
  },
  {
    keyword: "phân luồng người chơi",
    response: "Phân luồng người chơi giúp phân phối đồng đều người chơi giữa các trạm, tránh ùn tắc. Hệ thống đề xuất lộ trình tối ưu cho từng đội hoặc tự động chuyển hướng đến trạm ít đông người hơn.",
    category: "events",
    priority: 80
  },
  {
    keyword: "điều phối nhân sự",
    response: "Công cụ điều phối nhân sự giúp phân công và quản lý nhân viên tại sự kiện lớn. Phân công nhân viên cho từng khu vực, gửi thông báo và chỉ dẫn, và theo dõi vị trí nhân viên trên bản đồ thời gian thực.",
    category: "events",
    priority: 80
  },
  {
    keyword: "hệ thống thông báo khẩn cấp",
    response: "Hệ thống thông báo khẩn cấp cho phép gửi cảnh báo ưu tiên cao đến tất cả người tham gia trong trường hợp khẩn cấp. Thông báo được đảm bảo hiển thị và yêu cầu xác nhận từ người nhận.",
    category: "events",
    priority: 90
  },
  {
    keyword: "bản đồ sự kiện",
    response: "Bản đồ sự kiện hiển thị vị trí trạm, khu vực dịch vụ (thức ăn, nhà vệ sinh, y tế), và mật độ người chơi theo thời gian thực. Người chơi sử dụng bản đồ để điều hướng, trong khi quản trị viên thấy thông tin mật độ và phân tích lưu lượng.",
    category: "events",
    priority: 80
  },
  
  // PHÂN TÍCH VÀ BI NÂNG CAO
  {
    keyword: "phân tích dự đoán",
    response: "Phân tích dự đoán sử dụng AI và học máy để dự báo kết quả tương lai dựa trên dữ liệu lịch sử. Dự đoán thời gian hoàn thành, tỷ lệ thành công, và điểm số tiềm năng cho từng đội. Xem trong 'Phân tích' > 'Dự đoán'.",
    category: "analytics",
    priority: 80
  },
  {
    keyword: "phân tích hành trình",
    response: "Phân tích hành trình theo dõi toàn bộ quá trình của người chơi từ đầu đến cuối. Xác định điểm mạnh, điểm yếu, điểm tắc nghẽn, và mô hình hành vi. Xem báo cáo trong 'Phân tích' > 'Hành trình người chơi'.",
    category: "analytics",
    priority: 80
  },
  {
    keyword: "trực quan hóa dữ liệu",
    response: "Trực quan hóa dữ liệu chuyển đổi số liệu phức tạp thành biểu đồ và hình ảnh dễ hiểu. Tạo bảng điều khiển tùy chỉnh với các biểu đồ kéo-thả, bộ lọc tương tác, và chia sẻ báo cáo với các bên liên quan.",
    category: "analytics",
    priority: 75
  },
  {
    keyword: "xuất dữ liệu phân tích",
    response: "Xuất dữ liệu phân tích cho phép trích xuất dữ liệu thô hoặc báo cáo đã xử lý dưới dạng CSV, Excel, PDF hoặc định dạng PowerBI/Tableau. Lập lịch xuất tự động hoặc kích hoạt theo điều kiện tùy chỉnh.",
    category: "analytics",
    priority: 75
  },
  {
    keyword: "tích hợp bi",
    response: "Tích hợp BI (Business Intelligence) kết nối Giao Liên với nền tảng BI doanh nghiệp như Power BI, Tableau, hoặc Looker. Dữ liệu được đồng bộ theo lịch trình hoặc thời gian thực để phân tích nâng cao và tạo báo cáo chuyên nghiệp.",
    category: "analytics",
    priority: 80
  },
  
  // TÙY BIẾN VÀ MỞ RỘNG
  {
    keyword: "white label",
    response: "Giải pháp White Label cho phép tùy chỉnh hoàn toàn giao diện Giao Liên với thương hiệu riêng của bạn. Thiết lập logo, màu sắc, phông chữ, và thậm chí tên ứng dụng và URL tùy chỉnh. Cấu hình trong 'Cài đặt' > 'Thương hiệu'.",
    category: "customization",
    priority: 85
  },
  {
    keyword: "tùy biến quy trình",
    response: "Tùy biến quy trình cho phép điều chỉnh các luồng công việc trong Giao Liên để phù hợp với nhu cầu cụ thể. Tạo các bước tùy chỉnh, thêm điểm phê duyệt, và tùy chỉnh quy trình cho từng loại sự kiện hoặc trạm.",
    category: "customization",
    priority: 80
  },
  {
    keyword: "phát triển plugin",
    response: "Nền tảng phát triển plugin cho phép tạo tính năng tùy chỉnh cho Giao Liên. Sử dụng API và SDK để phát triển plugin bổ sung chức năng, tích hợp với hệ thống bên ngoài, hoặc tạo loại trạm mới.",
    category: "customization",
    priority: 75
  },
  {
    keyword: "tùy chỉnh trường dữ liệu",
    response: "Tính năng tùy chỉnh trường dữ liệu cho phép thêm trường và thuộc tính mới cho đội, trạm, người chơi, và giải đấu. Thiết lập các trường tùy chỉnh với kiểu dữ liệu, quy tắc xác thực và quyền truy cập.",
    category: "customization",
    priority: 75
  },
  {
    keyword: "quản lý api",
    response: "Quản lý API cho phép tạo và quản lý khóa API, theo dõi sử dụng, thiết lập giới hạn tốc độ, và xác định quyền truy cập chi tiết. Truy cập tài liệu API và công cụ thử nghiệm trong 'Nhà phát triển' > 'API'.",
    category: "customization",
    priority: 80
  },
  
  // BẢO MẬT NÂNG CAO
  {
    keyword: "audit trail",
    response: "Audit Trail lưu trữ chi tiết tất cả hoạt động trong hệ thống với dấu thời gian, người dùng, địa chỉ IP, và thay đổi dữ liệu. Giúp tuân thủ quy định, khắc phục sự cố và phân tích bảo mật. Xem nhật ký trong 'Bảo mật' > 'Audit Trail'.",
    category: "security",
    priority: 85
  },
  {
    keyword: "phân tích bảo mật",
    response: "Phân tích bảo mật chủ động phát hiện mẫu hình đáng ngờ như đăng nhập bất thường, truy cập dữ liệu bất thường, hoặc hành vi người dùng không điển hình. Cấu hình mức cảnh báo trong 'Bảo mật' > 'Phân tích bảo mật'.",
    category: "security",
    priority: 85
  },
  {
    keyword: "thử nghiệm xâm nhập",
    response: "Giao Liên được thử nghiệm xâm nhập thường xuyên để xác định và khắc phục lỗ hổng bảo mật. Báo cáo kiểm tra gần đây và trạng thái các biện pháp khắc phục có sẵn cho khách hàng doanh nghiệp trong 'Bảo mật' > 'Báo cáo'.",
    category: "security",
    priority: 80
  },
  {
    keyword: "bảo vệ ddos",
    response: "Bảo vệ DDoS đảm bảo khả năng phục hồi trước các cuộc tấn công từ chối dịch vụ. Hệ thống giám sát lưu lượng, phát hiện mẫu hình bất thường, và tự động triển khai biện pháp giảm thiểu khi phát hiện tấn công.",
    category: "security",
    priority: 80
  },
  {
    keyword: "kiểm soát quyền chi tiết",
    response: "Kiểm soát quyền chi tiết cho phép phân quyền chính xác đến từng tính năng, trạm, và thậm chí từng trường dữ liệu cụ thể. Tạo vai trò tùy chỉnh và quy tắc truy cập dựa trên nhiều thuộc tính như vị trí, thời gian, và ngữ cảnh.",
    category: "security",
    priority: 85
  }
];

module.exports = additionalReplies6; 