/**
 * Danh sách câu trả lời tự động bổ sung
 * Phần 3/6: Tính năng Giao Liên nâng cao
 */

const additionalReplies3 = [
  // === BỔ SUNG PHẦN 3: TÍNH NĂNG CHẾ ĐỘ CHƠI NÂNG CAO ===
  {
    keyword: "chế độ giới hạn thời gian",
    response: "Chế độ giới hạn thời gian cho phép thiết lập thời gian tối đa để hoàn thành từng trạm hoặc toàn bộ giải đấu. Bật tính năng này trong 'Cài đặt giải đấu' > 'Giới hạn thời gian'.",
    category: "features",
    priority: 80
  },
  {
    keyword: "chơi theo lịch trình",
    response: "Chế độ chơi theo lịch trình cho phép bạn thiết lập thời gian cụ thể khi mỗi trạm được mở. Thiết lập lịch trình trong 'Quản lý trạm' > 'Lịch trình mở trạm'.",
    category: "features",
    priority: 80
  },
  {
    keyword: "tính năng mở khóa tuần tự",
    response: "Tính năng mở khóa tuần tự yêu cầu đội hoàn thành một trạm trước khi trạm tiếp theo được mở. Bật tính năng này trong phần 'Thiết lập trạm' > 'Điều kiện mở khóa'.",
    category: "features",
    priority: 85
  },
  {
    keyword: "điểm thưởng thời gian",
    response: "Điểm thưởng thời gian cung cấp điểm bổ sung cho đội hoàn thành trạm nhanh hơn mức thời gian chuẩn. Thiết lập điểm thưởng trong 'Quản lý trạm' > 'Cài đặt điểm thưởng'.",
    category: "features",
    priority: 80
  },
  {
    keyword: "điểm phạt thời gian",
    response: "Điểm phạt thời gian sẽ trừ điểm của đội khi vượt quá thời gian qui định cho một trạm. Thiết lập điểm phạt trong 'Quản lý trạm' > 'Cài đặt điểm phạt'.",
    category: "features",
    priority: 80
  },
  
  // CHẾ ĐỘ THỬ THÁCH NÂNG CAO
  {
    keyword: "mật thư phân nhánh",
    response: "Mật thư phân nhánh cho phép tạo các nhánh nội dung khác nhau tùy thuộc vào đáp án của đội chơi. Đội sẽ nhận được nội dung tiếp theo dựa vào lựa chọn của họ.",
    category: "stations",
    priority: 85
  },
  {
    keyword: "thử thách đồng đội",
    response: "Thử thách đồng đội yêu cầu hai hoặc nhiều đội phối hợp để giải quyết một trạm. Bạn có thể thiết lập thử thách này trong phần 'Kiểu trạm' > 'Trạm đồng đội'.",
    category: "stations",
    priority: 80
  },
  {
    keyword: "thử thách độc quyền",
    response: "Thử thách độc quyền chỉ cho phép một đội hoàn thành tại một thời điểm. Đội đầu tiên hoàn thành sẽ 'khóa' trạm này cho các đội khác.",
    category: "stations",
    priority: 80
  },
  {
    keyword: "trạm đối kháng",
    response: "Trạm đối kháng đưa các đội vào tình huống cạnh tranh trực tiếp. Đội hoàn thành nhanh hơn hoặc chính xác hơn sẽ giành được điểm cao hơn hoặc lợi thế trong trò chơi.",
    category: "stations",
    priority: 80
  },
  {
    keyword: "trạm năng lượng",
    response: "Trạm năng lượng cho phép đội tích lũy 'năng lượng' có thể sử dụng để mở khóa trạm đặc biệt hoặc nhận gợi ý cho các thử thách khó. Thiết lập trong 'Kiểu trạm' > 'Trạm năng lượng'.",
    category: "stations",
    priority: 75
  },
  
  // TÍNH NĂNG TÙY CHỈNH GIAO DIỆN TRẠM
  {
    keyword: "giao diện tùy chỉnh",
    response: "Giao Liên cho phép tùy chỉnh giao diện hiển thị của mỗi trạm với các theme khác nhau như 'Cổ điển', 'Hiện đại', 'Bí ẩn', hoặc tạo theme riêng.",
    category: "stations",
    priority: 75
  },
  {
    keyword: "tùy chỉnh bố cục",
    response: "Để tùy chỉnh bố cục trạm, vào 'Quản lý trạm' > 'Chỉnh sửa trạm' > 'Tùy chỉnh bố cục'. Bạn có thể chọn vị trí hiển thị của hình ảnh, văn bản, và form trả lời.",
    category: "stations",
    priority: 70
  },
  {
    keyword: "hiệu ứng đặc biệt",
    response: "Giao Liên hỗ trợ nhiều hiệu ứng đặc biệt như chuyển động văn bản, hiệu ứng nhấp nháy, hoặc tiếng động khi hoàn thành trạm. Thêm hiệu ứng trong phần 'Tùy chỉnh trạm' > 'Hiệu ứng'.",
    category: "stations",
    priority: 70
  },
  {
    keyword: "hình nền tùy chỉnh",
    response: "Để thay đổi hình nền cho trạm, vào 'Quản lý trạm' > 'Chỉnh sửa trạm' > 'Tùy chỉnh giao diện' > 'Hình nền'. Bạn có thể tải lên hình ảnh riêng hoặc chọn từ thư viện có sẵn.",
    category: "stations",
    priority: 70
  },
  {
    keyword: "phông chữ đặc biệt",
    response: "Giao Liên hỗ trợ nhiều phông chữ đặc biệt phù hợp với các loại mật thư khác nhau. Chọn phông chữ trong phần 'Tùy chỉnh trạm' > 'Phông chữ'.",
    category: "stations",
    priority: 70
  },
  
  // CHẾ ĐỘ CHƠI ĐẶC BIỆT
  {
    keyword: "chế độ sinh tồn",
    response: "Chế độ sinh tồn là một kiểu chơi đặc biệt trong đó mỗi đội có số lần thử giới hạn cho toàn bộ giải đấu. Khi hết lượt thử, đội sẽ bị loại khỏi cuộc chơi.",
    category: "features",
    priority: 80
  },
  {
    keyword: "chế độ thám hiểm",
    response: "Chế độ thám hiểm cho phép đội tự do khám phá các trạm theo thứ tự tùy ý, thay vì theo một tuyến đường cố định. Thiết lập trong 'Cài đặt giải đấu' > 'Kiểu chơi' > 'Thám hiểm'.",
    category: "features",
    priority: 75
  },
  {
    keyword: "chế độ trốn tìm",
    response: "Chế độ trốn tìm biến các trạm thành 'kho báu' được giấu tại các vị trí vật lý. Đội cần tìm kiếm và quét mã QR để mở trạm, tạo trải nghiệm thực tế.",
    category: "features",
    priority: 80
  },
  {
    keyword: "chế độ câu đố liên hoàn",
    response: "Chế độ câu đố liên hoàn kết nối các trạm thành một chuỗi câu đố lớn. Đáp án của trạm trước sẽ là manh mối hoặc một phần đáp án cho trạm tiếp theo.",
    category: "features",
    priority: 85
  },
  {
    keyword: "chế độ giới hạn người chơi",
    response: "Chế độ giới hạn người chơi yêu cầu đội chỉ định thành viên cụ thể để giải từng trạm, khuyến khích mọi người trong đội tham gia đóng góp.",
    category: "features",
    priority: 75
  },
  
  // TÍNH NĂNG TƯƠNG TÁC PHONG PHÚ
  {
    keyword: "bình luận trực tiếp",
    response: "Tính năng bình luận trực tiếp cho phép admin gửi thông điệp đến tất cả đội hoặc đội cụ thể trong suốt giải đấu. Sử dụng tính năng này để gửi gợi ý hoặc thông báo quan trọng.",
    category: "features",
    priority: 75
  },
  {
    keyword: "hỏi đáp tự động",
    response: "Hệ thống hỏi đáp tự động cho phép đội chơi đặt câu hỏi và nhận phản hồi tức thì từ hệ thống AI, giúp giải quyết thắc mắc mà không cần can thiệp từ admin.",
    category: "features",
    priority: 75
  },
  {
    keyword: "gợi ý theo cấp độ",
    response: "Tính năng gợi ý theo cấp độ cung cấp nhiều mức độ gợi ý cho mỗi trạm, từ mơ hồ đến cụ thể. Đội có thể mở gợi ý mới khi cần, nhưng sẽ bị trừ điểm tương ứng.",
    category: "features",
    priority: 80
  },
  {
    keyword: "video hướng dẫn",
    response: "Bạn có thể thêm video hướng dẫn cho mỗi trạm để giải thích cách chơi hoặc cung cấp gợi ý bằng hình ảnh. Tải lên video trong phần 'Quản lý trạm' > 'Thêm tài nguyên' > 'Video'.",
    category: "stations",
    priority: 70
  },
  {
    keyword: "phản hồi tùy chỉnh",
    response: "Phản hồi tùy chỉnh cho phép bạn thiết lập thông báo riêng khi đội trả lời đúng, sai, hoặc gặp lỗi. Tùy chỉnh phản hồi trong 'Quản lý trạm' > 'Phản hồi tùy chỉnh'.",
    category: "stations",
    priority: 70
  },
  
  // LỰA CHỌN ĐA DẠNG CHO ĐÁNH GIÁ VÀ TÍNH ĐIỂM
  {
    keyword: "hệ thống chấm điểm",
    response: "Giao Liên hỗ trợ nhiều hệ thống chấm điểm như điểm cố định, điểm theo thời gian, điểm theo số lần thử, và điểm theo độ chính xác. Chọn hệ thống phù hợp trong 'Cài đặt giải đấu' > 'Hệ thống điểm'.",
    category: "features",
    priority: 80
  },
  {
    keyword: "điểm thưởng",
    response: "Bạn có thể thiết lập điểm thưởng cho các thành tích đặc biệt như hoàn thành trạm nhanh nhất, ít lần thử nhất, hoặc hoàn thành tất cả các thử thách phụ.",
    category: "features",
    priority: 75
  },
  {
    keyword: "thang điểm tùy chỉnh",
    response: "Thang điểm tùy chỉnh cho phép bạn định nghĩa giá trị điểm riêng cho từng trạm, phù hợp với độ khó. Thiết lập thang điểm trong 'Quản lý trạm' > 'Điểm số'.",
    category: "features",
    priority: 75
  },
  {
    keyword: "điểm theo nhiệm vụ",
    response: "Hệ thống điểm theo nhiệm vụ chia mỗi trạm thành nhiều nhiệm vụ nhỏ, mỗi nhiệm vụ có giá trị điểm riêng. Đội có thể hoàn thành một phần trạm và nhận điểm tương ứng.",
    category: "features",
    priority: 75
  },
  {
    keyword: "hệ số nhân điểm",
    response: "Tính năng hệ số nhân điểm cho phép tăng giá trị điểm của các trạm sau một mốc thời gian nhất định, tạo thêm thách thức và khuyến khích hoàn thành sớm.",
    category: "features",
    priority: 70
  },
  
  // TÍNH NĂNG PHÂN TÍCH DỮ LIỆU
  {
    keyword: "phân tích thời gian thực",
    response: "Tính năng phân tích thời gian thực cung cấp thông tin cập nhật liên tục về hiệu suất của đội chơi, giúp bạn đưa ra quyết định điều chỉnh kịp thời trong quá trình diễn ra giải đấu.",
    category: "reports",
    priority: 80
  },
  {
    keyword: "biểu đồ nhiệt",
    response: "Biểu đồ nhiệt hiển thị trực quan các khu vực trạm mà đội chơi dành nhiều thời gian nhất, giúp xác định phần nào của thử thách gây khó khăn cho người chơi.",
    category: "reports",
    priority: 70
  },
  {
    keyword: "so sánh giải đấu",
    response: "Tính năng so sánh giải đấu cho phép đối chiếu số liệu thống kê giữa các giải đấu khác nhau, giúp đánh giá sự tiến bộ và hiệu quả của các thay đổi trong thiết kế trò chơi.",
    category: "reports",
    priority: 70
  },
  {
    keyword: "phân tích từ khóa",
    response: "Phân tích từ khóa giúp bạn xem các từ và cụm từ phổ biến trong các câu trả lời sai của đội chơi, giúp hiểu rõ hơn về cách suy nghĩ và hiểu lầm phổ biến của họ.",
    category: "reports",
    priority: 70
  },
  {
    keyword: "biểu đồ tiến trình",
    response: "Biểu đồ tiến trình hiển thị tốc độ giải từng trạm của các đội theo thời gian, giúp bạn nắm rõ diễn biến cuộc chơi và nhịp độ tiến triển của từng đội.",
    category: "reports",
    priority: 75
  },
  
  // TÍNH NĂNG XỬ LÝ ĐÁP ÁN NÂNG CAO
  {
    keyword: "đáp án đa dạng",
    response: "Tính năng đáp án đa dạng cho phép thiết lập nhiều phương án đáp án đúng cho mỗi trạm, hỗ trợ các biến thể chính tả và cách diễn đạt khác nhau của cùng một đáp án.",
    category: "stations",
    priority: 85
  },
  {
    keyword: "đáp án một phần",
    response: "Đáp án một phần cho phép chấp nhận và tính điểm cho câu trả lời gần đúng hoặc chỉ đúng một phần, thay vì yêu cầu hoàn toàn chính xác.",
    category: "stations",
    priority: 80
  },
  {
    keyword: "đáp án theo trình tự",
    response: "Đáp án theo trình tự yêu cầu các đáp án phải được nhập theo đúng thứ tự. Điều này phù hợp cho các thử thách giải mã bước, hoặc các câu đố liên tiếp.",
    category: "stations",
    priority: 80
  },
  {
    keyword: "đáp án phụ thuộc",
    response: "Đáp án phụ thuộc là loại đáp án thay đổi dựa trên các điều kiện như thời gian, số lần thử, hoặc kết quả từ trạm trước đó, tạo trải nghiệm động cho người chơi.",
    category: "stations",
    priority: 80
  },
  {
    keyword: "đáp án mở",
    response: "Đáp án mở cho phép kiểm tra logic thay vì giá trị chính xác, ví dụ như chấp nhận bất kỳ số nào trong một phạm vi cụ thể hoặc chấp nhận các biểu thức toán học tương đương.",
    category: "stations",
    priority: 75
  },
  
  // QUẢN LÝ THIẾT BỊ VÀ TRUY CẬP
  {
    keyword: "giới hạn thiết bị",
    response: "Tính năng giới hạn thiết bị cho phép quy định số lượng thiết bị tối đa mà mỗi đội được phép sử dụng cùng lúc, ngăn chặn việc chia nhỏ đội để giải nhiều trạm.",
    category: "security",
    priority: 80
  },
  {
    keyword: "theo dõi thiết bị",
    response: "Hệ thống theo dõi thiết bị ghi lại thông tin về các thiết bị được sử dụng bởi mỗi đội, bao gồm loại thiết bị, trình duyệt, và địa chỉ IP, giúp phát hiện hành vi đáng ngờ.",
    category: "security",
    priority: 80
  },
  {
    keyword: "chế độ kiosk",
    response: "Chế độ kiosk biến thiết bị thành trạm chơi chuyên dụng, chặn truy cập vào các trang web và ứng dụng khác, giúp đảm bảo công bằng trong các sự kiện thi đấu trực tiếp.",
    category: "security",
    priority: 75
  },
  {
    keyword: "chống sao chép nội dung",
    response: "Tính năng chống sao chép nội dung ngăn người chơi sao chép văn bản hoặc hình ảnh từ trạm, buộc họ phải làm việc với nội dung trong môi trường kiểm soát.",
    category: "security",
    priority: 80
  },
  {
    keyword: "truy cập có thời hạn",
    response: "Truy cập có thời hạn giới hạn thời gian mà đội có thể xem nội dung trạm, sau đó buộc họ phải làm mới hoặc chuyển sang trạm khác.",
    category: "security",
    priority: 75
  }
];

module.exports = additionalReplies3; 