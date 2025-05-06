/**
 * Danh sách các câu trả lời tự động mặc định
 * Sử dụng để thiết lập ban đầu cho hệ thống
 */

const defaultReplies = [
  // Chào hỏi
  {
    keyword: "xin chào",
    response: "Xin chào! Tôi là trợ lý ảo của Giao Liên. Tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 100
  },
  {
    keyword: "hello",
    response: "Chào bạn! Tôi là trợ lý ảo của Giao Liên, rất vui được hỗ trợ bạn.",
    category: "greeting",
    priority: 100
  },
  {
    keyword: "hi",
    response: "Chào bạn! Rất vui được gặp bạn. Tôi có thể hỗ trợ bạn vấn đề gì?",
    category: "greeting",
    priority: 100
  },
  
  // Cảm ơn
  {
    keyword: "cảm ơn",
    response: "Không có gì! Rất vui khi được hỗ trợ bạn. Bạn cần giúp đỡ gì thêm không?",
    category: "thanks",
    priority: 80
  },
  {
    keyword: "thank",
    response: "Rất vui khi được giúp đỡ bạn! Nếu có thắc mắc gì khác, đừng ngại hỏi nhé.",
    category: "thanks",
    priority: 80
  },
  
  // Tạm biệt
  {
    keyword: "tạm biệt",
    response: "Tạm biệt bạn! Chúc bạn một ngày tốt lành.",
    category: "goodbye",
    priority: 70
  },
  {
    keyword: "bye",
    response: "Chào tạm biệt! Rất vui được trò chuyện với bạn.",
    category: "goodbye",
    priority: 70
  },
  
  // Trợ giúp
  {
    keyword: "giúp đỡ",
    response: "Tôi có thể hỗ trợ bạn về các vấn đề kỹ thuật của Giao Liên. Bạn cần trợ giúp về vấn đề cụ thể nào?",
    category: "help",
    priority: 60
  },
  {
    keyword: "help",
    response: "Tôi có thể giúp bạn giải đáp thắc mắc và hướng dẫn sử dụng các tính năng của Giao Liên. Bạn cần hỗ trợ về vấn đề gì?",
    category: "help",
    priority: 60
  },
  
  // Lỗi kỹ thuật
  {
    keyword: "lỗi",
    response: "Rất tiếc về sự cố bạn đang gặp phải. Bạn có thể mô tả chi tiết lỗi, bao gồm: thời điểm xảy ra, các bước tái hiện, và mã lỗi (nếu có) để tôi hỗ trợ tốt hơn.",
    category: "error",
    priority: 90
  },
  {
    keyword: "error",
    response: "Tôi rất tiếc về lỗi bạn đang gặp. Vui lòng cung cấp thêm thông tin: lỗi hiển thị như thế nào, bạn đang thực hiện thao tác gì, và lỗi xảy ra khi nào?",
    category: "error",
    priority: 90
  },
  {
    keyword: "bug",
    response: "Cảm ơn bạn đã báo cáo lỗi. Để giúp chúng tôi xử lý nhanh hơn, bạn có thể chụp màn hình lỗi và mô tả chi tiết các bước tái hiện được không?",
    category: "error",
    priority: 90
  },
  
  // Tài khoản
  {
    keyword: "mật khẩu",
    response: "Để đặt lại mật khẩu, bạn có thể sử dụng chức năng 'Quên mật khẩu' trên trang đăng nhập, hoặc liên hệ với superadmin để được hỗ trợ.",
    category: "account",
    priority: 80
  },
  
  // Chức năng quản lý đội
  {
    keyword: "tạo đội",
    response: "Để tạo đội mới, bạn vào phần 'Quản lý đội chơi', nhấn 'Tạo đội mới' và nhập tên đội. Hệ thống sẽ tự động tạo mật khẩu hoặc bạn có thể tự đặt mật khẩu cho đội.",
    category: "teams",
    priority: 85
  },
  {
    keyword: "xóa đội",
    response: "Để xóa một đội, vào phần 'Quản lý đội chơi', tìm đội bạn muốn xóa và nhấn vào biểu tượng thùng rác. Hệ thống sẽ yêu cầu xác nhận trước khi xóa.",
    category: "teams",
    priority: 85
  },
  {
    keyword: "quản lý đội",
    response: "Trong mục 'Quản lý đội chơi', bạn có thể tạo, chỉnh sửa, xóa đội và xem thông tin chi tiết của từng đội như mật khẩu đăng nhập, điểm số và trạng thái hoạt động.",
    category: "teams",
    priority: 85
  },
  {
    keyword: "đổi mật khẩu đội",
    response: "Để đổi mật khẩu cho một đội, vào phần 'Quản lý đội chơi', nhấn vào biểu tượng chỉnh sửa bên cạnh đội đó, sau đó cập nhật mật khẩu mới trong biểu mẫu hiện ra.",
    category: "teams",
    priority: 80
  },
  {
    keyword: "đăng xuất đội",
    response: "Để đăng xuất một đội đang đăng nhập trên thiết bị khác, vào mục 'Quản lý đội chơi', chọn đội cần đăng xuất và sử dụng tính năng 'Đăng xuất thiết bị' từ menu thao tác.",
    category: "teams",
    priority: 80
  },
  
  // Chức năng trạm
  {
    keyword: "tạo trạm",
    response: "Để tạo trạm mới, vào mục 'Quản lý trạm', nhấn 'Tạo trạm mới' và điền các thông tin cần thiết như tên trạm, nội dung, đáp án đúng và đội tham gia.",
    category: "stations",
    priority: 85
  },
  {
    keyword: "quản lý trạm",
    response: "Trong phần 'Quản lý trạm', bạn có thể tạo, chỉnh sửa, xóa trạm và thiết lập các tùy chọn như nội dung, đáp án, mật thư và cài đặt hiển thị cho từng đội.",
    category: "stations",
    priority: 85
  },
  {
    keyword: "mật thư",
    response: "Giao Liên hỗ trợ tạo mật thư với nhiều định dạng khác nhau. Bạn có thể thêm nội dung dạng OTT và NW cho mỗi trạm, đồng thời tùy chỉnh những định dạng nào được hiển thị.",
    category: "stations",
    priority: 75
  },
  {
    keyword: "qr code",
    response: "Mỗi trạm sẽ được tự động tạo mã QR khi bạn lưu trạm. Bạn có thể in mã QR này và dán ở vị trí trạm để đội chơi quét và truy cập vào nội dung trạm.",
    category: "stations",
    priority: 75
  },
  {
    keyword: "điểm số",
    response: "Bạn có thể cập nhật điểm số cho đội khi họ hoàn thành trạm qua mục 'Quản lý đội chơi' hoặc trực tiếp từ trang chi tiết trạm. Hệ thống sẽ tự động tính tổng điểm cho mỗi đội.",
    category: "stations",
    priority: 80
  },
  
  // Chat và trao đổi
  {
    keyword: "gửi tin nhắn",
    response: "Để gửi tin nhắn tới superadmin, hãy sử dụng biểu tượng chat ở góc trên cùng bên phải của trang. Bạn có thể nhận phản hồi tự động hoặc từ superadmin khi họ online.",
    category: "chat",
    priority: 75
  },
  {
    keyword: "chat",
    response: "Tính năng chat cho phép admin và superadmin trao đổi trực tiếp. Khi superadmin không trực tuyến, hệ thống sẽ tự động trả lời dựa trên cơ sở dữ liệu có sẵn hoặc AI.",
    category: "chat",
    priority: 75
  },
  {
    keyword: "trả lời tự động",
    response: "Hệ thống trả lời tự động sẽ hoạt động khi superadmin không online. Nó sử dụng cơ sở dữ liệu câu trả lời có sẵn hoặc AI để phản hồi tin nhắn của admin.",
    category: "chat",
    priority: 75
  },
  
  // Thông báo và thông tin
  {
    keyword: "tạo thông báo",
    response: "Superadmin có thể tạo thông báo cho tất cả admin hoặc các đối tượng cụ thể qua mục 'Quản lý thông báo'. Thông báo có thể được gửi qua email nếu được cấu hình.",
    category: "notifications",
    priority: 70
  },
  {
    keyword: "xem thông báo",
    response: "Bạn có thể xem tất cả thông báo bằng cách nhấp vào biểu tượng chuông thông báo ở góc trên cùng bên phải của trang. Thông báo mới sẽ được đánh dấu để dễ nhận biết.",
    category: "notifications",
    priority: 70
  },
  
  // Cài đặt và cấu hình
  {
    keyword: "cài đặt hệ thống",
    response: "Cài đặt hệ thống chỉ có thể được thay đổi bởi superadmin. Các cài đặt bao gồm cấu hình email, tùy chọn hiển thị và các thông số khác của hệ thống.",
    category: "settings",
    priority: 70
  },
  {
    keyword: "cập nhật thông tin",
    response: "Để cập nhật thông tin tài khoản, vào mục 'Hồ sơ' hoặc 'Thông tin cá nhân' từ menu người dùng ở góc trên cùng bên phải của trang.",
    category: "settings",
    priority: 70
  },
  
  // Tính năng bảo mật
  {
    keyword: "đổi mật khẩu",
    response: "Để đổi mật khẩu tài khoản, vào mục 'Hồ sơ' hoặc 'Thông tin cá nhân', sau đó chọn 'Đổi mật khẩu'. Bạn sẽ cần nhập mật khẩu hiện tại và mật khẩu mới.",
    category: "security",
    priority: 80
  },
  {
    keyword: "đăng xuất",
    response: "Để đăng xuất khỏi hệ thống, nhấp vào tên người dùng ở góc trên cùng bên phải của trang, sau đó chọn 'Đăng xuất' từ menu hiện ra.",
    category: "security",
    priority: 75
  },
  
  // Tính năng mới và nâng cao
  {
    keyword: "tính năng mật thư riêng",
    response: "Tính năng 'Mật thư riêng' cho phép tạo nội dung khác nhau cho từng đội trên cùng một trạm. Khi tạo trạm, chọn loại mật thư là 'Cá nhân' và thêm nội dung cho từng đội.",
    category: "features",
    priority: 75
  },
  {
    keyword: "tùy chỉnh định dạng",
    response: "Bạn có thể tùy chỉnh định dạng hiển thị mật thư như kích thước chữ, độ đậm, khoảng cách dòng và khoảng cách đoạn văn cho mỗi trạm để phù hợp với nội dung.",
    category: "features",
    priority: 70
  },
  {
    keyword: "nhập nhiều đội",
    response: "Để nhập nhiều đội cùng lúc, khi tạo trạm mới, bạn có thể nhập danh sách tên đội cách nhau bằng dấu phẩy hoặc chọn từ danh sách đội có sẵn.",
    category: "features",
    priority: 70
  },
  
  // Tính năng quản lý và phân tích
  {
    keyword: "nhật ký hệ thống",
    response: "Superadmin có thể xem nhật ký hệ thống để theo dõi các hoạt động như đăng nhập, thay đổi cài đặt, và các thao tác khác trong hệ thống Giao Liên.",
    category: "system",
    priority: 65
  },
  {
    keyword: "xem xếp hạng",
    response: "Để xem xếp hạng các đội, vào mục 'Quản lý đội chơi' và chọn 'Xếp hạng'. Hệ thống sẽ hiển thị danh sách đội theo thứ tự điểm số từ cao đến thấp.",
    category: "reports",
    priority: 70
  },
  
  // Quản lý người dùng
  {
    keyword: "thêm admin",
    response: "Chỉ superadmin mới có quyền thêm admin mới. Để thêm admin, superadmin cần vào phần 'Quản lý Admin' và nhấn 'Thêm Admin mới', sau đó điền thông tin cần thiết.",
    category: "users",
    priority: 80
  },
  {
    keyword: "phân quyền",
    response: "Trong Giao Liên có hai loại tài khoản chính: Admin và Superadmin. Superadmin có toàn quyền quản lý hệ thống, còn Admin chỉ quản lý được đội chơi và trạm của mình.",
    category: "users",
    priority: 75
  },
  
  // FAQ
  {
    keyword: "trạm không hiển thị",
    response: "Nếu trạm không hiển thị, hãy kiểm tra: 1) Trạm đã được đánh dấu là 'Hoạt động' chưa, 2) Đội có nằm trong danh sách đội của trạm không, 3) Đường dẫn trạm có chính xác không.",
    category: "faq",
    priority: 85
  },
  {
    keyword: "không gửi được tin nhắn",
    response: "Nếu không gửi được tin nhắn, hãy kiểm tra kết nối internet của bạn và làm mới trang. Nếu vẫn không được, hãy đăng xuất và đăng nhập lại để thiết lập lại kết nối socket.",
    category: "faq",
    priority: 85
  },
  {
    keyword: "đội không đăng nhập được",
    response: "Nếu đội không đăng nhập được, hãy kiểm tra: 1) Mật khẩu có chính xác không, 2) Đội có đang đăng nhập trên thiết bị khác không, 3) Đội có bị đánh dấu là 'Không hoạt động' không.",
    category: "faq",
    priority: 85
  },
  {
    keyword: "sao lưu dữ liệu",
    response: "Giao Liên tự động sao lưu dữ liệu trên máy chủ MongoDB. Nếu bạn muốn sao lưu thủ công, superadmin có thể sử dụng tính năng xuất dữ liệu trong mục 'Cài đặt hệ thống'.",
    category: "faq",
    priority: 75
  },
  {
    keyword: "thay đổi địa chỉ email",
    response: "Để thay đổi địa chỉ email, vào mục 'Hồ sơ', chọn 'Chỉnh sửa thông tin' và cập nhật email mới. Lưu ý rằng email mới không được trùng với email của admin khác trong hệ thống.",
    category: "faq",
    priority: 75
  },
  
  // Tính năng và tính năng mới
  {
    keyword: "tính năng mới",
    response: "Các tính năng mới của Giao Liên bao gồm: trả lời tự động qua AI, mật thư riêng cho từng đội, tùy chỉnh định dạng hiển thị nội dung, và cải tiến hệ thống quản lý đội chơi.",
    category: "features",
    priority: 80
  },
  {
    keyword: "xử lý nội dung riêng",
    response: "Tính năng 'Xử lý nội dung riêng' cho phép tạo và quản lý nội dung khác nhau cho từng đội trên cùng một trạm, giúp tổ chức các trò chơi phức tạp hơn.",
    category: "features",
    priority: 75
  },
  
  // Các vấn đề kỹ thuật phổ biến
  {
    keyword: "không nhận được thông báo",
    response: "Nếu không nhận được thông báo, hãy kiểm tra: 1) Thông báo có được gửi cho đúng đối tượng không, 2) Cài đặt thông báo trên trình duyệt của bạn, 3) Làm mới trang và đăng nhập lại.",
    category: "error",
    priority: 85
  },
  {
    keyword: "màn hình trắng",
    response: "Nếu bạn gặp màn hình trắng, hãy thử: 1) Xóa cache trình duyệt, 2) Tải lại trang (Ctrl+F5), 3) Kiểm tra kết nối internet, 4) Thử trình duyệt khác.",
    category: "error",
    priority: 85
  },
  
  // === BỔ SUNG PHẦN 1: HƯỚNG DẪN QUẢN LÝ GIẢI ĐẤU ===
  {
    keyword: "tạo giải đấu",
    response: "Để tạo giải đấu mới, vào mục 'Quản lý giải đấu' và nhấp vào 'Tạo giải đấu mới'. Điền các thông tin cần thiết như tên giải đấu, thời gian diễn ra, và các đội tham gia.",
    category: "tournament",
    priority: 85
  },
  {
    keyword: "quản lý giải đấu",
    response: "Hệ thống Giao Liên cho phép bạn tạo và quản lý nhiều giải đấu cùng lúc. Mỗi giải đấu có thể có nhiều trạm và nhiều đội tham gia, với bảng xếp hạng riêng.",
    category: "tournament",
    priority: 85
  },
  {
    keyword: "thiết lập giải đấu",
    response: "Khi thiết lập giải đấu, bạn cần xác định: thời gian bắt đầu/kết thúc, các trạm tham gia, danh sách đội, cách tính điểm, và các tùy chọn hiển thị của bảng xếp hạng.",
    category: "tournament",
    priority: 80
  },
  {
    keyword: "bảng xếp hạng",
    response: "Bảng xếp hạng tự động cập nhật khi có đội hoàn thành trạm. Bạn có thể tùy chỉnh các cột hiển thị như thời gian hoàn thành, số lượt thử, và điểm thưởng.",
    category: "tournament",
    priority: 80
  },
  {
    keyword: "thiết lập luật chơi",
    response: "Trong phần 'Thiết lập luật chơi' của giải đấu, bạn có thể quy định số lần thử tối đa, thời gian khóa giữa các lần thử, và các điều kiện để hoàn thành trạm.",
    category: "tournament",
    priority: 75
  },
  
  // HƯỚNG DẪN THEO DÕI ĐỘI CHƠI
  {
    keyword: "theo dõi đội",
    response: "Để theo dõi hoạt động của đội, vào mục 'Quản lý đội chơi', chọn đội cần theo dõi và nhấp vào 'Xem chi tiết'. Bạn sẽ thấy lịch sử hoạt động, trạm đã hoàn thành và điểm số.",
    category: "teams",
    priority: 80
  },
  {
    keyword: "xem hoạt động đội",
    response: "Trong trang chi tiết đội chơi, bạn có thể xem các hoạt động gần đây như đăng nhập, truy cập trạm, và các lần nộp đáp án. Dữ liệu này giúp phát hiện vấn đề nếu đội gặp khó khăn.",
    category: "teams",
    priority: 75
  },
  {
    keyword: "tính năng kiểm soát gian lận",
    response: "Giao Liên có các tính năng phát hiện gian lận như: theo dõi thiết bị đăng nhập, ghi nhận hành vi sao chép nội dung, và giới hạn số lần đăng nhập cùng lúc cho mỗi đội.",
    category: "teams",
    priority: 85
  },
  {
    keyword: "kiểm soát gian lận",
    response: "Để ngăn chặn gian lận, hệ thống tự động ghi lại thông tin thiết bị của đội, cảnh báo khi phát hiện sao chép nội dung, và gửi thông báo khi có người cố gắng đăng nhập từ thiết bị khác.",
    category: "security",
    priority: 85
  },
  {
    keyword: "kích hoạt trạm",
    response: "Để kích hoạt một trạm, vào mục 'Quản lý trạm', chọn trạm cần kích hoạt và nhấp vào nút 'Kích hoạt'. Trạm đã kích hoạt sẽ hiển thị cho các đội được chọn tham gia.",
    category: "stations",
    priority: 85
  },
  
  // TÍNH NĂNG THEO DÕI TIẾN TRÌNH
  {
    keyword: "xem tiến trình",
    response: "Để xem tiến trình của các đội, vào 'Bảng điều khiển' hoặc trang 'Giải đấu'. Đây là nơi hiển thị tổng quan về số đội đã hoàn thành từng trạm và điểm số hiện tại.",
    category: "reports",
    priority: 75
  },
  {
    keyword: "báo cáo tiến trình",
    response: "Báo cáo tiến trình cung cấp thông tin chi tiết về hiệu suất của từng đội qua các trạm. Bạn có thể xuất báo cáo này dưới dạng Excel để phân tích thêm.",
    category: "reports",
    priority: 75
  },
  {
    keyword: "thời gian thực",
    response: "Giao Liên cập nhật dữ liệu theo thời gian thực. Khi một đội hoàn thành trạm, điểm số và thứ hạng sẽ được cập nhật ngay lập tức trên bảng xếp hạng và báo cáo.",
    category: "features",
    priority: 70
  },
  {
    keyword: "công cụ phân tích",
    response: "Công cụ phân tích của Giao Liên giúp bạn xem các biểu đồ và số liệu về hiệu suất đội chơi, độ khó của từng trạm, và thời gian trung bình để hoàn thành các thử thách.",
    category: "reports",
    priority: 70
  },
  {
    keyword: "thống kê đội chơi",
    response: "Thống kê đội chơi cung cấp dữ liệu chi tiết về số lần thử, thời gian giải các trạm, và tiến độ tổng thể. Dùng thông tin này để điều chỉnh độ khó trò chơi phù hợp.",
    category: "reports",
    priority: 75
  },
  
  // QUẢN LÝ MẬT THƯ NÂNG CAO
  {
    keyword: "định dạng mật thư",
    response: "Giao Liên hỗ trợ nhiều định dạng mật thư như văn bản thường, OTT (One-time transposition), và NW (Nihilist watershed). Mỗi định dạng phù hợp với các loại mật mã khác nhau.",
    category: "stations",
    priority: 80
  },
  {
    keyword: "mật thư riêng biệt",
    response: "Tính năng 'Mật thư riêng biệt' cho phép bạn tạo nội dung và đáp án khác nhau cho từng đội trong cùng một trạm, tạo ra trải nghiệm chơi cá nhân hóa.",
    category: "stations",
    priority: 80
  },
  {
    keyword: "tính năng ott",
    response: "OTT (One-time transposition) là định dạng mật thư cho phép mã hóa nội dung theo bảng chuyển vị. Để sử dụng, nhập nội dung vào trường OTT khi tạo trạm.",
    category: "stations",
    priority: 75
  },
  {
    keyword: "tính năng nw",
    response: "NW (Nihilist watershed) là định dạng mật thư sử dụng kỹ thuật mã hóa Nihilist. Để sử dụng, nhập nội dung vào trường NW khi tạo hoặc chỉnh sửa trạm.",
    category: "stations",
    priority: 75
  },
  {
    keyword: "tùy chỉnh phông chữ",
    response: "Bạn có thể tùy chỉnh phông chữ của mật thư bằng cách thay đổi kích thước, độ đậm, và khoảng cách dòng trong phần 'Tùy chỉnh hiển thị' khi tạo trạm.",
    category: "stations",
    priority: 70
  },
  
  // TÍNH NĂNG ĐÁNH GIÁ VÀ PHẢN HỒI
  {
    keyword: "thu thập phản hồi",
    response: "Để thu thập phản hồi từ đội chơi, bạn có thể kích hoạt tính năng 'Đánh giá' trong mục 'Cài đặt giải đấu'. Đội chơi sẽ được yêu cầu đánh giá sau khi hoàn thành trạm.",
    category: "features",
    priority: 70
  },
  {
    keyword: "đánh giá trạm",
    response: "Tính năng đánh giá trạm cho phép đội chơi cho điểm và góp ý về từng trạm. Dữ liệu này giúp bạn cải thiện thiết kế trò chơi trong tương lai.",
    category: "features",
    priority: 70
  },
  {
    keyword: "xem đánh giá",
    response: "Để xem đánh giá từ đội chơi, vào mục 'Báo cáo' > 'Đánh giá và phản hồi'. Bạn có thể lọc đánh giá theo trạm, đội, hoặc thời gian để phân tích hiệu quả.",
    category: "reports",
    priority: 70
  },
  {
    keyword: "báo cáo đánh giá",
    response: "Báo cáo đánh giá tổng hợp các phản hồi từ đội chơi về độ khó, tính hấp dẫn, và tính rõ ràng của từng trạm. Sử dụng dữ liệu này để cải thiện trò chơi trong tương lai.",
    category: "reports",
    priority: 70
  },
  {
    keyword: "tính năng góp ý",
    response: "Tính năng góp ý cho phép đội chơi gửi phản hồi chi tiết sau khi hoàn thành giải đấu. Bạn có thể xem các góp ý này trong mục 'Báo cáo' > 'Góp ý từ đội chơi'.",
    category: "features",
    priority: 65
  },
  
  // TÍNH NĂNG QUẢN LÝ MEDIA
  {
    keyword: "tải lên hình ảnh",
    response: "Để tải lên hình ảnh cho trạm, nhấp vào nút 'Tải lên hình ảnh' trong phần 'Nội dung trạm' khi tạo hoặc chỉnh sửa trạm. Hệ thống hỗ trợ định dạng JPG, PNG và GIF.",
    category: "stations",
    priority: 75
  },
  {
    keyword: "quản lý hình ảnh",
    response: "Để quản lý hình ảnh đã tải lên, vào mục 'Quản lý media' từ menu chính. Tại đây bạn có thể xem, xóa hoặc thay thế các hình ảnh đã sử dụng trong các trạm.",
    category: "stations",
    priority: 70
  },
  {
    keyword: "hỗ trợ âm thanh",
    response: "Giao Liên hỗ trợ tệp âm thanh định dạng MP3 và WAV. Để thêm âm thanh vào trạm, sử dụng tùy chọn 'Thêm tệp âm thanh' trong phần nội dung trạm.",
    category: "stations",
    priority: 70
  },
  {
    keyword: "hình ảnh trong mật thư",
    response: "Để thêm hình ảnh vào mật thư, tải lên hình ảnh qua nút 'Tải lên hình ảnh', sau đó chọn 'Hiển thị hình ảnh' trong phần tùy chọn hiển thị của trạm.",
    category: "stations",
    priority: 75
  },
  {
    keyword: "giới hạn kích thước",
    response: "Hệ thống giới hạn kích thước tệp tải lên là 5MB cho hình ảnh và 10MB cho tệp âm thanh. Nếu cần tải lên tệp lớn hơn, hãy nén hoặc chia nhỏ tệp trước.",
    category: "stations",
    priority: 70
  },
  
  // TÙY CHỈNH GIAO DIỆN
  {
    keyword: "giao diện chơi",
    response: "Để tùy chỉnh giao diện cho đội chơi, vào 'Cài đặt' > 'Giao diện người dùng'. Bạn có thể thay đổi màu sắc, logo, và các thông điệp hiển thị trong trò chơi.",
    category: "settings",
    priority: 70
  },
  {
    keyword: "tùy chỉnh logo",
    response: "Để thay đổi logo hiển thị trong trò chơi, vào 'Cài đặt' > 'Thương hiệu' và tải lên logo mới. Logo sẽ hiển thị trên trang đăng nhập và trong giao diện trò chơi.",
    category: "settings",
    priority: 70
  },
  {
    keyword: "màu sắc chủ đề",
    response: "Để thay đổi màu sắc chủ đề của trò chơi, vào 'Cài đặt' > 'Giao diện' > 'Màu sắc'. Bạn có thể chọn màu chính, màu phụ và màu nền phù hợp với sự kiện của bạn.",
    category: "settings",
    priority: 65
  },
  {
    keyword: "thông điệp tùy chỉnh",
    response: "Để tạo thông điệp tùy chỉnh hiển thị cho đội chơi, vào 'Cài đặt' > 'Thông điệp'. Bạn có thể tạo thông điệp cho trang đăng nhập, hoàn thành trạm, và kết thúc trò chơi.",
    category: "settings",
    priority: 65
  },
  {
    keyword: "tùy chỉnh giao diện admin",
    response: "Giao diện admin cũng có thể được tùy chỉnh trong 'Cài đặt' > 'Giao diện admin'. Bạn có thể thay đổi bố cục, chế độ hiển thị bảng điều khiển và các thành phần hiển thị mặc định.",
    category: "settings",
    priority: 65
  },
  
  // TÍNH NĂNG XUẤT NHẬP DỮ LIỆU
  {
    keyword: "xuất dữ liệu",
    response: "Để xuất dữ liệu, vào 'Báo cáo' > 'Xuất dữ liệu'. Bạn có thể chọn xuất dữ liệu về đội chơi, trạm, điểm số, hoặc tất cả dưới dạng file Excel hoặc CSV.",
    category: "reports",
    priority: 75
  },
  {
    keyword: "nhập trạm hàng loạt",
    response: "Để nhập nhiều trạm cùng lúc, chuẩn bị file Excel theo mẫu và sử dụng tính năng 'Nhập trạm hàng loạt' trong mục 'Quản lý trạm'. Hệ thống sẽ tự động tạo trạm từ dữ liệu file.",
    category: "stations",
    priority: 80
  },
  {
    keyword: "xuất bảng điểm",
    response: "Để xuất bảng điểm của giải đấu, vào 'Giải đấu' > 'Bảng xếp hạng' > 'Xuất Excel'. File xuất ra sẽ bao gồm thông tin về điểm số, thời gian hoàn thành và thứ hạng của mỗi đội.",
    category: "reports",
    priority: 75
  },
  {
    keyword: "sao lưu giải đấu",
    response: "Để sao lưu toàn bộ dữ liệu của một giải đấu, vào 'Giải đấu' > 'Tùy chọn' > 'Sao lưu giải đấu'. Dữ liệu sẽ được tải xuống dưới dạng file JSON hoặc ZIP tùy vào kích thước.",
    category: "system",
    priority: 80
  },
  {
    keyword: "khôi phục giải đấu",
    response: "Để khôi phục giải đấu từ bản sao lưu, vào 'Giải đấu' > 'Tùy chọn' > 'Khôi phục từ bản sao lưu'. Tải lên file sao lưu và hệ thống sẽ tái tạo lại giải đấu với tất cả dữ liệu.",
    category: "system",
    priority: 80
  },
  
  // QUẢN LÝ THÔNG BÁO MỚI
  {
    keyword: "thông báo định kỳ",
    response: "Để tạo thông báo định kỳ, vào 'Quản lý thông báo' > 'Thông báo định kỳ'. Thiết lập thời gian, tần suất, và nội dung thông báo sẽ được gửi tự động.",
    category: "notifications",
    priority: 75
  },
  {
    keyword: "thông báo tự động",
    response: "Hệ thống hỗ trợ thông báo tự động khi có sự kiện quan trọng như đội hoàn thành trạm, thay đổi thứ hạng, hoặc phát hiện hành vi đáng ngờ.",
    category: "notifications",
    priority: 75
  },
  {
    keyword: "tùy chỉnh thông báo",
    response: "Để tùy chỉnh cách thông báo hiển thị, vào 'Cài đặt' > 'Thông báo'. Bạn có thể thiết lập màu sắc, âm thanh, và thời gian hiển thị của thông báo.",
    category: "notifications",
    priority: 70
  }
];

module.exports = defaultReplies; 