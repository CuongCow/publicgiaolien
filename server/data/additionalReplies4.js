/**
 * Danh sách câu trả lời tự động bổ sung
 * Phần 4/6: Hỗ trợ người dùng và xử lý lỗi
 */

const additionalReplies4 = [
  // === BỔ SUNG PHẦN 4: HỖ TRỢ NGƯỜI DÙNG VÀ XỬ LÝ LỖI ===
  {
    keyword: "lỗi đăng nhập",
    response: "Nếu gặp lỗi đăng nhập, hãy kiểm tra: 1) Tên đăng nhập và mật khẩu đã nhập chính xác (phân biệt chữ hoa thường), 2) Tài khoản chưa bị vô hiệu hóa, 3) Không có ai đang đăng nhập trên thiết bị khác.",
    category: "error",
    priority: 90
  },
  {
    keyword: "không đăng nhập được",
    response: "Nếu không đăng nhập được, hãy: 1) Xóa cache và cookies trình duyệt, 2) Thử trình duyệt khác, 3) Kiểm tra kết nối internet. Nếu vẫn lỗi, hãy liên hệ admin với mã lỗi hiển thị.",
    category: "error",
    priority: 90
  },
  {
    keyword: "tài khoản bị khóa",
    response: "Tài khoản có thể bị khóa do: 1) Đăng nhập sai nhiều lần, 2) Phát hiện hoạt động đáng ngờ, 3) Hết hạn dùng, hoặc 4) Bị admin vô hiệu hóa. Liên hệ superadmin để mở khóa.",
    category: "error",
    priority: 85
  },
  {
    keyword: "quên mật khẩu",
    response: "Nếu quên mật khẩu, hãy sử dụng chức năng 'Quên mật khẩu' trên trang đăng nhập. Bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu. Nếu không nhận được email, kiểm tra thư mục spam.",
    category: "account",
    priority: 85
  },
  {
    keyword: "không nhận được email",
    response: "Nếu không nhận được email đặt lại mật khẩu, hãy: 1) Kiểm tra thư mục spam/rác, 2) Xác nhận email đăng ký là chính xác, 3) Đợi 5-10 phút vì đôi khi email đến chậm, 4) Liên hệ admin để được hỗ trợ.",
    category: "error",
    priority: 85
  },
  
  // XỬ LÝ LỖI TRẠM
  {
    keyword: "trạm không tải được",
    response: "Nếu trạm không tải được, hãy: 1) Làm mới trang (F5), 2) Xóa cache trình duyệt, 3) Kiểm tra kết nối internet, 4) Xác nhận trạm đã được kích hoạt và đội có quyền truy cập.",
    category: "error",
    priority: 90
  },
  {
    keyword: "trạm bị lỗi",
    response: "Khi trạm bị lỗi, hãy chụp màn hình lỗi và ghi lại: 1) Tên trạm, 2) Thời điểm xảy ra lỗi, 3) Các bước dẫn đến lỗi, 4) Thiết bị và trình duyệt đang sử dụng. Gửi thông tin này cho admin.",
    category: "error",
    priority: 90
  },
  {
    keyword: "hình ảnh không hiển thị",
    response: "Nếu hình ảnh không hiển thị, hãy: 1) Kiểm tra kết nối internet, 2) Làm mới trang, 3) Xóa cache trình duyệt, 4) Kiểm tra xem trình duyệt có chặn hình ảnh không, 5) Thử trình duyệt khác.",
    category: "error",
    priority: 85
  },
  {
    keyword: "trạm hiển thị sai",
    response: "Khi trạm hiển thị sai định dạng hoặc bố cục, hãy: 1) Thử thu nhỏ/phóng to trang, 2) Xoay màn hình nếu dùng thiết bị di động, 3) Thử trình duyệt khác, 4) Báo cáo vấn đề cho admin.",
    category: "error",
    priority: 85
  },
  {
    keyword: "trạm bị treo",
    response: "Nếu trạm bị treo hoặc không phản hồi, hãy: 1) Đợi một chút vì có thể do kết nối chậm, 2) Làm mới trang (F5), 3) Xóa cache trình duyệt, 4) Đăng xuất và đăng nhập lại, 5) Thử thiết bị khác.",
    category: "error",
    priority: 90
  },
  
  // XỬ LÝ LỖI ĐÁP ÁN
  {
    keyword: "nhập đáp án không được",
    response: "Nếu không nhập được đáp án, hãy kiểm tra: 1) Trạm có đang bị khóa không, 2) Độ dài đáp án có vượt quá giới hạn không, 3) Đáp án có chứa ký tự đặc biệt không được phép không.",
    category: "error",
    priority: 85
  },
  {
    keyword: "đáp án đúng nhưng báo sai",
    response: "Nếu bạn chắc chắn đáp án đúng nhưng hệ thống báo sai, hãy kiểm tra: 1) Có khoảng trắng thừa không, 2) Chữ hoa/thường có đúng không, 3) Có dấu câu hay ký tự đặc biệt không, 4) Định dạng có đúng không (số, chữ, v.v.).",
    category: "error",
    priority: 90
  },
  {
    keyword: "không gửi được đáp án",
    response: "Nếu không gửi được đáp án, hãy: 1) Kiểm tra kết nối internet, 2) Đảm bảo đáp án không vượt quá độ dài cho phép, 3) Làm mới trang và thử lại, 4) Kiểm tra xem trạm có bị khóa hoặc hết thời gian không.",
    category: "error",
    priority: 85
  },
  {
    keyword: "hệ thống không nhận đáp án",
    response: "Khi hệ thống không phản hồi sau khi gửi đáp án, hãy: 1) Đợi một chút vì đôi khi máy chủ xử lý chậm, 2) Làm mới trang và thử lại, 3) Kiểm tra kết nối internet, 4) Thông báo cho admin với ảnh chụp màn hình.",
    category: "error",
    priority: 85
  },
  {
    keyword: "đáp án bị reset",
    response: "Nếu đáp án bị reset hoặc mất khi đang nhập, có thể do: 1) Phiên làm việc hết hạn, 2) Kết nối không ổn định, 3) Cache trình duyệt bị xóa tự động, 4) Có người đăng nhập vào tài khoản từ thiết bị khác.",
    category: "error",
    priority: 80
  },
  
  // XỬ LÝ LỖI KẾT NỐI
  {
    keyword: "mất kết nối",
    response: "Khi gặp lỗi mất kết nối, hãy: 1) Kiểm tra kết nối wifi/dữ liệu di động, 2) Đảm bảo chế độ máy bay đã tắt, 3) Thử kết nối với mạng khác, 4) Khởi động lại thiết bị, 5) Thử thiết bị khác.",
    category: "error",
    priority: 90
  },
  {
    keyword: "kết nối không ổn định",
    response: "Khi kết nối không ổn định, hãy: 1) Di chuyển đến vị trí có tín hiệu mạng tốt hơn, 2) Đóng các ứng dụng khác đang sử dụng mạng, 3) Khởi động lại router nếu dùng wifi, 4) Thử chuyển sang mạng di động hoặc ngược lại.",
    category: "error",
    priority: 85
  },
  {
    keyword: "không đồng bộ dữ liệu",
    response: "Nếu dữ liệu không đồng bộ giữa các thiết bị hoặc thành viên trong đội, hãy: 1) Đảm bảo tất cả đều sử dụng cùng một tài khoản, 2) Làm mới trang trên tất cả các thiết bị, 3) Đăng xuất và đăng nhập lại.",
    category: "error",
    priority: 85
  },
  {
    keyword: "lỗi timeout",
    response: "Lỗi timeout xảy ra khi máy chủ mất quá nhiều thời gian để phản hồi. Hãy: 1) Kiểm tra kết nối internet, 2) Thử lại sau vài phút, 3) Nếu vấn đề tiếp tục, hãy liên hệ admin vì có thể máy chủ đang quá tải.",
    category: "error",
    priority: 85
  },
  {
    keyword: "lỗi máy chủ",
    response: "Khi gặp lỗi máy chủ (thường có mã 500), đây là vấn đề từ phía hệ thống, không phải do bạn. Hãy: 1) Đợi vài phút và thử lại, 2) Báo cáo lỗi cho admin kèm theo mã lỗi và thời gian xảy ra.",
    category: "error",
    priority: 90
  },
  
  // XỬ LÝ LỖI THIẾT BỊ
  {
    keyword: "lỗi trên điện thoại",
    response: "Nếu gặp lỗi trên điện thoại, hãy: 1) Cập nhật trình duyệt lên phiên bản mới nhất, 2) Xóa cache trình duyệt, 3) Kích hoạt chế độ 'Desktop site' để xem phiên bản đầy đủ, 4) Thử xoay màn hình ngang/dọc.",
    category: "error",
    priority: 85
  },
  {
    keyword: "lỗi trên máy tính",
    response: "Nếu gặp lỗi trên máy tính, hãy: 1) Cập nhật trình duyệt, 2) Xóa cache và cookies, 3) Tắt các tiện ích mở rộng/add-on, 4) Thử chế độ ẩn danh/incognito, 5) Thử trình duyệt khác.",
    category: "error",
    priority: 85
  },
  {
    keyword: "lỗi trên ipad",
    response: "Nếu gặp lỗi trên iPad, hãy: 1) Đảm bảo iOS đã cập nhật, 2) Sử dụng Safari thay vì trình duyệt khác để có hiệu suất tốt nhất, 3) Xóa cache trình duyệt, 4) Kiểm tra chế độ nội dung hạn chế có đang bật không.",
    category: "error",
    priority: 80
  },
  {
    keyword: "lỗi trình duyệt",
    response: "Khi gặp lỗi trình duyệt, hãy: 1) Cập nhật lên phiên bản mới nhất, 2) Xóa cache và cookies, 3) Tắt các tiện ích mở rộng, 4) Kiểm tra cài đặt JavaScript và cookie đã bật chưa, 5) Thử chế độ ẩn danh.",
    category: "error",
    priority: 85
  },
  {
    keyword: "bị văng khỏi trò chơi",
    response: "Nếu bị văng đột ngột khỏi trò chơi, có thể do: 1) Kết nối internet không ổn định, 2) Phiên làm việc hết hạn, 3) Tài khoản đang được đăng nhập ở nơi khác, 4) Máy chủ gặp sự cố. Hãy đăng nhập lại và thử lại.",
    category: "error",
    priority: 85
  },
  
  // XỬ LÝ LỖI ĐIỂM SỐ
  {
    keyword: "điểm không cập nhật",
    response: "Nếu điểm không cập nhật sau khi hoàn thành trạm, hãy: 1) Đợi một vài phút vì đôi khi có độ trễ, 2) Làm mới trang, 3) Kiểm tra lại đáp án đã được hệ thống ghi nhận đúng chưa, 4) Liên hệ admin nếu vẫn có vấn đề.",
    category: "error",
    priority: 85
  },
  {
    keyword: "điểm số sai",
    response: "Nếu thấy điểm số không chính xác, hãy: 1) Xác nhận các trạm đã hoàn thành và điểm mỗi trạm, 2) Kiểm tra có bị điểm phạt không, 3) Xem lại công thức tính điểm của giải đấu, 4) Báo cáo sự cố cho admin với chi tiết cụ thể.",
    category: "error",
    priority: 85
  },
  {
    keyword: "điểm bị mất",
    response: "Nếu điểm bị mất hoặc giảm đột ngột, có thể do: 1) Hệ thống phát hiện gian lận và áp dụng điểm phạt, 2) Lỗi đồng bộ dữ liệu, 3) Admin điều chỉnh thủ công, 4) Lỗi hệ thống. Hãy liên hệ admin để kiểm tra.",
    category: "error",
    priority: 90
  },
  {
    keyword: "thành tích không hiển thị",
    response: "Nếu thành tích hoặc tiến độ không hiển thị, hãy: 1) Làm mới trang, 2) Kiểm tra trạm đã được đánh dấu hoàn thành trên hệ thống chưa, 3) Xác nhận đáp án đã được ghi nhận, 4) Đăng xuất và đăng nhập lại.",
    category: "error",
    priority: 80
  },
  {
    keyword: "thứ hạng không cập nhật",
    response: "Thứ hạng có thể không cập nhật ngay lập tức do: 1) Độ trễ đồng bộ dữ liệu, 2) Bảng xếp hạng cập nhật theo lịch định kỳ, 3) Cache trình duyệt. Hãy đợi vài phút và làm mới trang để xem bảng xếp hạng mới nhất.",
    category: "error",
    priority: 80
  },
  
  // XỬ LÝ LỖI BÁO CÁO VÀ THỐNG KÊ
  {
    keyword: "không xuất được báo cáo",
    response: "Nếu không xuất được báo cáo, hãy: 1) Đảm bảo có quyền xem báo cáo, 2) Kiểm tra kết nối internet, 3) Thử giảm phạm vi báo cáo nếu quá lớn, 4) Sử dụng trình duyệt máy tính thay vì thiết bị di động.",
    category: "error",
    priority: 80
  },
  {
    keyword: "báo cáo không chính xác",
    response: "Nếu báo cáo hiển thị dữ liệu không chính xác, hãy: 1) Xác nhận khoảng thời gian báo cáo, 2) Kiểm tra các bộ lọc đã áp dụng, 3) Làm mới trang và tạo lại báo cáo, 4) Báo cáo sự cố cho admin.",
    category: "error",
    priority: 80
  },
  {
    keyword: "biểu đồ không hiển thị",
    response: "Nếu biểu đồ không hiển thị, hãy: 1) Kiểm tra JavaScript đã được bật trong trình duyệt, 2) Làm mới trang, 3) Xóa cache trình duyệt, 4) Thử trình duyệt khác, ưu tiên Chrome hoặc Firefox mới nhất.",
    category: "error",
    priority: 75
  },
  {
    keyword: "không thấy thống kê",
    response: "Nếu không thấy thống kê, có thể do: 1) Chưa đủ dữ liệu để hiển thị (ví dụ: chưa có đội hoàn thành trạm), 2) Không có quyền xem thống kê, 3) Lỗi hiển thị. Thử làm mới trang hoặc liên hệ admin.",
    category: "error",
    priority: 75
  },
  {
    keyword: "dữ liệu không khớp",
    response: "Nếu thấy dữ liệu thống kê không khớp với thực tế, có thể do: 1) Độ trễ cập nhật dữ liệu, 2) Cache trình duyệt chưa làm mới, 3) Lỗi tính toán. Hãy làm mới trang và kiểm tra lại sau vài phút.",
    category: "error",
    priority: 80
  },
  
  // XỬ LÝ LỖI QUYỀN TRUY CẬP
  {
    keyword: "không có quyền truy cập",
    response: "Nếu gặp thông báo 'Không có quyền truy cập', có thể do: 1) Tài khoản không có quyền cần thiết, 2) Phiên làm việc hết hạn, 3) Tài khoản bị hạn chế. Hãy đăng nhập lại hoặc liên hệ admin.",
    category: "error",
    priority: 85
  },
  {
    keyword: "truy cập bị từ chối",
    response: "Khi truy cập bị từ chối, hãy kiểm tra: 1) Đã đăng nhập chưa, 2) Tài khoản có quyền phù hợp không, 3) Giải đấu hoặc trạm có đang mở không, 4) IP của bạn có bị chặn không. Liên hệ admin nếu cần.",
    category: "error",
    priority: 85
  },
  {
    keyword: "không thể chỉnh sửa",
    response: "Nếu không thể chỉnh sửa nội dung, hãy kiểm tra: 1) Tài khoản có quyền chỉnh sửa không, 2) Nội dung có đang bị khóa chỉnh sửa không, 3) Người khác có đang chỉnh sửa cùng lúc không.",
    category: "error",
    priority: 80
  },
  {
    keyword: "không thể tạo mới",
    response: "Nếu không thể tạo mới nội dung, hãy kiểm tra: 1) Tài khoản có quyền tạo mới không, 2) Đã đạt giới hạn số lượng cho phép chưa, 3) Tất cả trường bắt buộc đã điền đầy đủ chưa, 4) Có lỗi xác thực dữ liệu không.",
    category: "error",
    priority: 80
  },
  {
    keyword: "không thể xóa",
    response: "Nếu không thể xóa nội dung, có thể do: 1) Không đủ quyền, 2) Nội dung đang được sử dụng bởi phần khác của hệ thống, 3) Nội dung đã bị khóa. Hãy liên hệ admin nếu cần xóa gấp.",
    category: "error",
    priority: 80
  },
  
  // XỬ LÝ LỖI TÀI KHOẢN
  {
    keyword: "lỗi tạo tài khoản",
    response: "Khi gặp lỗi tạo tài khoản, hãy kiểm tra: 1) Email đã được sử dụng chưa, 2) Mật khẩu đáp ứng các yêu cầu an toàn chưa, 3) Tất cả trường bắt buộc đã điền chưa, 4) Đã chấp nhận điều khoản dịch vụ chưa.",
    category: "error",
    priority: 85
  },
  {
    keyword: "lỗi đổi mật khẩu",
    response: "Khi không thể đổi mật khẩu, hãy kiểm tra: 1) Mật khẩu hiện tại nhập chính xác không, 2) Mật khẩu mới đáp ứng yêu cầu an toàn không, 3) Hai lần nhập mật khẩu mới có khớp không, 4) Tài khoản có bị khóa không.",
    category: "error",
    priority: 85
  },
  {
    keyword: "lỗi cập nhật hồ sơ",
    response: "Nếu không thể cập nhật hồ sơ, hãy kiểm tra: 1) Có trường bắt buộc nào bị bỏ trống không, 2) Định dạng thông tin (email, số điện thoại) có đúng không, 3) Kích thước ảnh đại diện có quá lớn không.",
    category: "error",
    priority: 80
  },
  {
    keyword: "không nhận được thông báo",
    response: "Nếu không nhận được thông báo, hãy kiểm tra: 1) Cài đặt thông báo trong hồ sơ, 2) Thông báo email có bị chặn/vào spam không, 3) Thông báo trình duyệt đã được cấp quyền chưa, 4) Cài đặt 'Không làm phiền' đã tắt chưa.",
    category: "error",
    priority: 80
  },
  {
    keyword: "tài khoản bị hack",
    response: "Nếu nghi ngờ tài khoản bị hack, hãy: 1) Đổi mật khẩu ngay lập tức, 2) Kiểm tra hoạt động gần đây, 3) Kiểm tra thiết bị đăng nhập, 4) Bật xác thực hai yếu tố, 5) Liên hệ admin để được hỗ trợ.",
    category: "security",
    priority: 95
  },
  
  // XỬ LÝ LỖI TỆP VÀ MEDIA
  {
    keyword: "không tải lên được",
    response: "Nếu không tải lên được tệp, hãy kiểm tra: 1) Kích thước tệp có vượt quá giới hạn không, 2) Định dạng tệp có được hỗ trợ không, 3) Kết nối internet có ổn định không, 4) Có đủ quyền tải lên không.",
    category: "error",
    priority: 85
  },
  {
    keyword: "không tải xuống được",
    response: "Nếu không tải xuống được tệp, hãy: 1) Kiểm tra kết nối internet, 2) Đảm bảo có quyền truy cập tệp, 3) Kiểm tra thiết bị có đủ dung lượng không, 4) Thử trình duyệt khác, 5) Báo cáo cho admin nếu vẫn lỗi.",
    category: "error",
    priority: 80
  },
  {
    keyword: "file bị lỗi",
    response: "Nếu tệp bị lỗi hoặc hỏng, hãy: 1) Thử tải lại tệp, 2) Kiểm tra định dạng tệp có tương thích với thiết bị không, 3) Sử dụng phần mềm khác để mở, 4) Liên hệ người tạo tệp để nhận phiên bản nguyên gốc.",
    category: "error",
    priority: 80
  },
  {
    keyword: "video không phát",
    response: "Nếu video không phát, hãy: 1) Kiểm tra kết nối internet, 2) Đảm bảo trình duyệt hỗ trợ định dạng video, 3) Bật JavaScript, 4) Thử chất lượng thấp hơn, 5) Thử trình duyệt khác như Chrome hoặc Firefox.",
    category: "error",
    priority: 80
  },
  {
    keyword: "âm thanh không nghe được",
    response: "Nếu không nghe được âm thanh, hãy kiểm tra: 1) Loa thiết bị đã bật và âm lượng đủ lớn, 2) Trình duyệt đã được cấp quyền âm thanh, 3) Trình duyệt hỗ trợ định dạng âm thanh, 4) Thử tai nghe khác.",
    category: "error",
    priority: 80
  }
];

module.exports = additionalReplies4; 