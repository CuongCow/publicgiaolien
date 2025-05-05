/**
 * Danh sách câu trả lời tự động bổ sung
 * Phần 2/6: Tính năng an ninh và bảo mật
 */

const additionalReplies = [
  // === BỔ SUNG PHẦN 2: TÍNH NĂNG AN NINH VÀ BẢO MẬT ===
  {
    keyword: "bảo mật tài khoản",
    response: "Giao Liên áp dụng nhiều lớp bảo mật tài khoản: mật khẩu mạnh, giới hạn số lần đăng nhập thất bại, và theo dõi hoạt động đáng ngờ. Bạn có thể bật thêm xác thực hai yếu tố cho tài khoản admin.",
    category: "security",
    priority: 85
  },
  {
    keyword: "xác thực hai yếu tố",
    response: "Để bật xác thực hai yếu tố (2FA), vào 'Hồ sơ' > 'Bảo mật' > 'Xác thực hai yếu tố'. Làm theo hướng dẫn để thiết lập với ứng dụng Google Authenticator hoặc Microsoft Authenticator.",
    category: "security",
    priority: 85
  },
  {
    keyword: "mã xác thực",
    response: "Mã xác thực là mã 6 số được tạo bởi ứng dụng xác thực trên điện thoại của bạn. Mã này thay đổi mỗi 30 giây và được sử dụng làm lớp bảo mật thứ hai khi đăng nhập.",
    category: "security",
    priority: 80
  },
  {
    keyword: "đăng nhập an toàn",
    response: "Để đảm bảo đăng nhập an toàn: sử dụng mật khẩu mạnh, không chia sẻ thông tin đăng nhập, bật xác thực hai yếu tố, và đăng xuất sau khi sử dụng trên thiết bị công cộng.",
    category: "security",
    priority: 80
  },
  {
    keyword: "bảo vệ mật khẩu",
    response: "Để bảo vệ mật khẩu: sử dụng ít nhất 10 ký tự, kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt, không dùng thông tin cá nhân, và thay đổi định kỳ ít nhất 3 tháng một lần.",
    category: "security",
    priority: 80
  },
  
  // TÍNH NĂNG QUẢN LÝ QUYỀN
  {
    keyword: "phân quyền admin",
    response: "Hệ thống Giao Liên có 3 cấp độ quyền: Superadmin (toàn quyền), Admin (quản lý trạm và đội chơi), và Editor (chỉ chỉnh sửa nội dung). Superadmin có thể tạo và phân quyền cho các tài khoản khác.",
    category: "users",
    priority: 85
  },
  {
    keyword: "tạo admin mới",
    response: "Để tạo admin mới: đăng nhập với quyền superadmin, vào 'Quản lý Admin' > 'Thêm Admin', điền thông tin cần thiết, chọn cấp độ quyền, và gửi thông tin đăng nhập cho người dùng mới.",
    category: "users",
    priority: 80
  },
  {
    keyword: "chỉnh sửa quyền",
    response: "Để thay đổi quyền của một admin: đăng nhập với quyền superadmin, vào 'Quản lý Admin', tìm tài khoản cần sửa, nhấp vào biểu tượng chỉnh sửa, và thay đổi cấp độ quyền.",
    category: "users",
    priority: 80
  },
  {
    keyword: "hạn chế quyền",
    response: "Để hạn chế quyền của admin, bạn có thể tạo vai trò tùy chỉnh trong 'Cài đặt' > 'Vai trò & Quyền'. Chọn chính xác các quyền cần cấp như quản lý đội, chỉnh sửa trạm, hoặc xem báo cáo.",
    category: "users",
    priority: 75
  },
  {
    keyword: "vô hiệu hóa tài khoản",
    response: "Để vô hiệu hóa tạm thời một tài khoản admin, vào 'Quản lý Admin', tìm tài khoản cần xử lý, và nhấp vào 'Vô hiệu hóa'. Tài khoản sẽ không thể đăng nhập nhưng dữ liệu vẫn được giữ nguyên.",
    category: "users",
    priority: 80
  },
  
  // QUẢN LÝ TÀI NGUYÊN HỆ THỐNG
  {
    keyword: "tối ưu hệ thống",
    response: "Để tối ưu hiệu suất hệ thống, bạn có thể: dọn dẹp hình ảnh không sử dụng, nén hình ảnh trước khi tải lên, xóa dữ liệu cũ không cần thiết, và sao lưu thường xuyên để giảm tải database.",
    category: "system",
    priority: 75
  },
  {
    keyword: "quản lý dung lượng",
    response: "Để kiểm tra và quản lý dung lượng sử dụng, vào 'Cài đặt' > 'Hệ thống' > 'Dung lượng'. Bạn sẽ thấy thông tin về dung lượng đã dùng cho hình ảnh, tệp âm thanh và dữ liệu khác.",
    category: "system",
    priority: 70
  },
  {
    keyword: "dọn dẹp tệp",
    response: "Để dọn dẹp tệp không sử dụng, vào 'Cài đặt' > 'Hệ thống' > 'Bảo trì'. Sử dụng tùy chọn 'Dọn dẹp tệp không sử dụng' để giải phóng dung lượng từ hình ảnh và âm thanh không còn liên kết với trạm nào.",
    category: "system",
    priority: 70
  },
  {
    keyword: "giám sát hiệu suất",
    response: "Để giám sát hiệu suất hệ thống, vào 'Cài đặt' > 'Hệ thống' > 'Hiệu suất'. Bạn có thể xem thông tin về thời gian phản hồi, sử dụng CPU/RAM, và số lượng yêu cầu đồng thời.",
    category: "system",
    priority: 70
  },
  {
    keyword: "cải thiện thời gian tải",
    response: "Để cải thiện thời gian tải trang, bạn có thể: nén hình ảnh trước khi tải lên, giảm số lượng hình ảnh trên mỗi trạm, tối ưu hóa cơ sở dữ liệu thường xuyên, và sử dụng tính năng cache.",
    category: "system",
    priority: 70
  },
  
  // QUẢN LÝ DỮ LIỆU VÀ BÁO CÁO NÂNG CAO
  {
    keyword: "báo cáo chi tiết",
    response: "Để tạo báo cáo chi tiết, vào 'Báo cáo' > 'Báo cáo tùy chỉnh'. Chọn các tham số như khoảng thời gian, đội chơi, trạm, và các chỉ số bạn muốn phân tích và hiển thị.",
    category: "reports",
    priority: 75
  },
  {
    keyword: "biểu đồ phân tích",
    response: "Giao Liên cung cấp nhiều loại biểu đồ phân tích như biểu đồ cột (so sánh điểm số), biểu đồ đường (tiến trình theo thời gian), và biểu đồ tròn (phân bố hoàn thành trạm).",
    category: "reports",
    priority: 70
  },
  {
    keyword: "phân tích xu hướng",
    response: "Tính năng phân tích xu hướng giúp bạn xem sự thay đổi hiệu suất theo thời gian. Vào 'Báo cáo' > 'Xu hướng' để xem các chỉ số như tỷ lệ hoàn thành, thời gian trung bình, và khó khăn gặp phải.",
    category: "reports",
    priority: 70
  },
  {
    keyword: "thống kê trạm",
    response: "Thống kê trạm cung cấp thông tin về độ khó, thời gian trung bình để hoàn thành, tỷ lệ thành công, và các lỗi phổ biến mà đội chơi gặp phải tại mỗi trạm.",
    category: "reports",
    priority: 75
  },
  {
    keyword: "đối sánh hiệu suất",
    response: "Tính năng đối sánh hiệu suất cho phép bạn so sánh kết quả giữa các đội, giữa các trạm, hoặc giữa các giải đấu khác nhau để tìm ra mẫu hình và xu hướng.",
    category: "reports",
    priority: 70
  },
  
  // HỖ TRỢ ĐA NGÔN NGỮ
  {
    keyword: "ngôn ngữ",
    response: "Giao Liên hỗ trợ nhiều ngôn ngữ bao gồm Tiếng Việt, Tiếng Anh, Tiếng Trung, và Tiếng Nhật. Để thay đổi ngôn ngữ, vào 'Cài đặt' > 'Ngôn ngữ' và chọn ngôn ngữ mong muốn.",
    category: "settings",
    priority: 75
  },
  {
    keyword: "đổi ngôn ngữ",
    response: "Để thay đổi ngôn ngữ hiển thị, nhấp vào biểu tượng ngôn ngữ ở góc trên cùng bên phải hoặc vào 'Cài đặt' > 'Ngôn ngữ'. Thay đổi sẽ ảnh hưởng đến giao diện người dùng của bạn.",
    category: "settings",
    priority: 75
  },
  {
    keyword: "nội dung đa ngôn ngữ",
    response: "Để tạo nội dung trạm đa ngôn ngữ, sử dụng tùy chọn 'Bản dịch' khi tạo hoặc chỉnh sửa trạm. Bạn có thể nhập nội dung cho mỗi ngôn ngữ và hệ thống sẽ hiển thị phiên bản phù hợp cho người dùng.",
    category: "stations",
    priority: 70
  },
  {
    keyword: "dịch tự động",
    response: "Giao Liên có tính năng dịch tự động giúp bạn dịch nhanh nội dung trạm sang các ngôn ngữ khác. Tuy nhiên, nên kiểm tra lại bản dịch để đảm bảo chính xác trước khi xuất bản trạm.",
    category: "features",
    priority: 70
  },
  {
    keyword: "báo cáo đa ngôn ngữ",
    response: "Báo cáo và thống kê có thể được xuất ra bằng nhiều ngôn ngữ khác nhau. Chọn ngôn ngữ xuất báo cáo trong mục 'Tùy chọn xuất' khi tạo báo cáo.",
    category: "reports",
    priority: 65
  },
  
  // TÍCH HỢP VÀ MỞ RỘNG
  {
    keyword: "tích hợp api",
    response: "Giao Liên cung cấp API để tích hợp với các hệ thống khác. Vào 'Cài đặt' > 'API & Tích hợp' để tạo khóa API và xem tài liệu về các endpoint có sẵn.",
    category: "technical",
    priority: 70
  },
  {
    keyword: "webhook",
    response: "Tính năng webhook cho phép Giao Liên gửi thông báo tự động đến hệ thống bên ngoài khi có sự kiện như đội hoàn thành trạm hoặc giải đấu kết thúc. Thiết lập trong 'Cài đặt' > 'Webhooks'.",
    category: "technical",
    priority: 70
  },
  {
    keyword: "tích hợp dịch vụ ngoài",
    response: "Giao Liên có thể tích hợp với các dịch vụ ngoài như Google Analytics (theo dõi truy cập), Slack/Discord (thông báo), và các hệ thống email marketing.",
    category: "technical",
    priority: 70
  },
  {
    keyword: "mở rộng tính năng",
    response: "Giao Liên hỗ trợ mở rộng tính năng qua hệ thống plugin. Vào 'Cài đặt' > 'Plugins' để xem và cài đặt các plugin có sẵn hoặc tải lên plugin tùy chỉnh.",
    category: "technical",
    priority: 65
  },
  {
    keyword: "tích hợp mạng xã hội",
    response: "Để tích hợp mạng xã hội, vào 'Cài đặt' > 'Mạng xã hội'. Bạn có thể thiết lập đăng nhập bằng mạng xã hội, chia sẻ thành tích, và đăng bảng xếp hạng lên các nền tảng như Facebook, Twitter.",
    category: "technical",
    priority: 65
  },
  
  // KIỂM SOÁT PHIÊN BẢN
  {
    keyword: "kiểm tra phiên bản",
    response: "Để kiểm tra phiên bản hiện tại của Giao Liên, vào 'Cài đặt' > 'Hệ thống' > 'Thông tin'. Bạn sẽ thấy số phiên bản, ngày cập nhật, và nhật ký thay đổi của phiên bản hiện tại.",
    category: "system",
    priority: 65
  },
  {
    keyword: "cập nhật hệ thống",
    response: "Khi có bản cập nhật mới, bạn sẽ thấy thông báo trong bảng điều khiển. Để cập nhật, vào 'Cài đặt' > 'Hệ thống' > 'Cập nhật' và làm theo hướng dẫn sau khi sao lưu dữ liệu.",
    category: "system",
    priority: 75
  },
  {
    keyword: "nhật ký thay đổi",
    response: "Nhật ký thay đổi (changelog) liệt kê tất cả các tính năng mới, cải tiến và sửa lỗi trong mỗi phiên bản. Xem nhật ký trong 'Cài đặt' > 'Hệ thống' > 'Nhật ký thay đổi'.",
    category: "system",
    priority: 65
  },
  {
    keyword: "kiểm tra tính tương thích",
    response: "Trước khi cập nhật, hệ thống sẽ tự động kiểm tra tính tương thích với cài đặt hiện tại. Báo cáo tương thích sẽ cảnh báo về các vấn đề tiềm ẩn có thể xảy ra sau khi cập nhật.",
    category: "system",
    priority: 70
  },
  {
    keyword: "quay lại phiên bản cũ",
    response: "Nếu gặp vấn đề sau khi cập nhật, bạn có thể quay lại phiên bản trước đó. Vào 'Cài đặt' > 'Hệ thống' > 'Khôi phục' và chọn bản sao lưu trước khi cập nhật để khôi phục.",
    category: "system",
    priority: 75
  },
  
  // TÍNH NĂNG DỰ ĐOÁN VÀ THỐNG KÊ
  {
    keyword: "dự đoán hiệu suất",
    response: "Tính năng dự đoán hiệu suất sử dụng AI để phân tích dữ liệu trước đó và dự đoán kết quả của các đội trong các trạm tương tự. Xem dự đoán trong 'Báo cáo' > 'Dự đoán hiệu suất'.",
    category: "features",
    priority: 70
  },
  {
    keyword: "phân tích hành vi",
    response: "Phân tích hành vi giúp bạn hiểu cách đội chơi tương tác với từng trạm: thời gian tìm hiểu nội dung, số lần thử, và các mẫu hình giải quyết vấn đề. Xem trong 'Báo cáo' > 'Phân tích hành vi'.",
    category: "reports",
    priority: 70
  },
  {
    keyword: "điểm yếu của đội",
    response: "Tính năng 'Điểm yếu của đội' phân tích hiệu suất của từng đội qua các loại thử thách khác nhau, giúp xác định đội nào gặp khó khăn với loại bài toán cụ thể nào.",
    category: "reports",
    priority: 70
  },
  {
    keyword: "gợi ý cải thiện",
    response: "Dựa trên phân tích dữ liệu, Giao Liên cung cấp gợi ý cải thiện thiết kế trò chơi. Xem gợi ý trong 'Báo cáo' > 'Cải thiện thiết kế' sau khi giải đấu kết thúc.",
    category: "reports",
    priority: 65
  },
  {
    keyword: "phân tích độ khó",
    response: "Phân tích độ khó giúp đánh giá mức độ thách thức của từng trạm dựa trên tỷ lệ hoàn thành, thời gian giải, và số lần thử. Sử dụng thông tin này để cân bằng độ khó trong giải đấu tiếp theo.",
    category: "reports",
    priority: 70
  },
  
  // TÍNH NĂNG THEO DÕI THỜI GIAN THỰC
  {
    keyword: "theo dõi trực tiếp",
    response: "Để theo dõi hoạt động của đội chơi theo thời gian thực, sử dụng 'Bảng điều khiển trực tiếp' trong menu chính. Bạn sẽ thấy thông tin về đội đang hoạt động, trạm đang được truy cập, và tiến độ chung.",
    category: "features",
    priority: 80
  },
  {
    keyword: "màn hình theo dõi",
    response: "Màn hình theo dõi lớn có thể được cài đặt để hiển thị bảng xếp hạng, hoạt động gần đây, và thông báo quan trọng trên màn hình lớn tại địa điểm tổ chức. Truy cập qua 'Công cụ' > 'Màn hình theo dõi'.",
    category: "features",
    priority: 75
  },
  {
    keyword: "cảnh báo realtime",
    response: "Hệ thống cảnh báo thời gian thực sẽ thông báo cho bạn khi có sự kiện quan trọng như đội hoàn thành trạm, phát hiện gian lận, hoặc vấn đề kỹ thuật xảy ra.",
    category: "features",
    priority: 75
  },
  {
    keyword: "giao tiếp với đội",
    response: "Tính năng giao tiếp cho phép gửi tin nhắn trực tiếp đến các đội đang chơi. Sử dụng tính năng này để gửi gợi ý, thông báo thay đổi, hoặc trả lời câu hỏi từ đội chơi.",
    category: "features",
    priority: 75
  },
  {
    keyword: "điều khiển từ xa",
    response: "Tính năng điều khiển từ xa cho phép bạn kích hoạt/vô hiệu hóa trạm, đặt lại mật khẩu đội, hoặc cung cấp gợi ý bổ sung từ xa mà không cần can thiệp trực tiếp.",
    category: "features",
    priority: 75
  }
];

module.exports = additionalReplies; 