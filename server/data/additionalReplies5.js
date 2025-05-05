/**
 * Danh sách câu trả lời tự động bổ sung
 * Phần 5/6: Thiết kế trò chơi và mật thư
 */

const additionalReplies5 = [
  // === BỔ SUNG PHẦN 5: THIẾT KẾ TRÒ CHƠI VÀ MẬT THƯ ===
  {
    keyword: "thiết kế trò chơi",
    response: "Khi thiết kế trò chơi Giao Liên, hãy cân nhắc: 1) Cân bằng độ khó, 2) Đa dạng loại thử thách, 3) Tạo tiến trình học tập, 4) Thiết kế trải nghiệm mạch lạc, 5) Đảm bảo các cơ chế phản hồi rõ ràng cho người chơi.",
    category: "game_design",
    priority: 80
  },
  {
    keyword: "độ khó trò chơi",
    response: "Cân bằng độ khó là yếu tố quan trọng. Nên sắp xếp các trạm theo thứ tự tăng dần về độ khó, hoặc xen kẽ trạm khó với trạm dễ hơn. Mỗi giải đấu nên có khoảng 15-20% trạm dễ, 60-70% trạm trung bình, và 10-15% trạm thách thức.",
    category: "game_design",
    priority: 80
  },
  {
    keyword: "loại thử thách",
    response: "Giao Liên hỗ trợ nhiều loại thử thách: giải mã, logic, toán học, quan sát, kiến thức, ngôn ngữ, và đồng đội. Hãy kết hợp đa dạng để phù hợp với nhiều kiểu người chơi và kỹ năng khác nhau.",
    category: "game_design",
    priority: 85
  },
  {
    keyword: "tiến trình khó dần",
    response: "Tiến trình khó dần giúp người chơi cảm thấy thành công và tiến bộ. Bắt đầu với trạm dễ để làm quen với hệ thống, tăng dần độ khó, và đặt trạm khó nhất ở 70-80% tiến trình trò chơi, sau đó giảm nhẹ độ khó để tạo cảm giác hoàn thành.",
    category: "game_design",
    priority: 80
  },
  {
    keyword: "thiết kế mật thư",
    response: "Khi thiết kế mật thư, hãy cân nhắc: 1) Độ phức tạp phù hợp với đối tượng, 2) Manh mối đủ rõ ràng để giải mã, 3) Bối cảnh hợp lý, 4) Kiểm tra nhiều lần để đảm bảo có thể giải được, 5) Tạo phương án dự phòng (như gợi ý) nếu quá khó.",
    category: "game_design",
    priority: 85
  },
  
  // THIẾT KẾ MẬT THƯ NÂNG CAO
  {
    keyword: "mật thư caesar",
    response: "Mật thư Caesar là phương pháp dịch chuyển các chữ cái theo một số vị trí cố định. Để tạo trong Giao Liên, sử dụng công cụ 'Mã hóa' > 'Caesar' và nhập khóa dịch chuyển (ví dụ: +3 hoặc -5).",
    category: "cipher",
    priority: 80
  },
  {
    keyword: "mật mã thay thế",
    response: "Mật mã thay thế thay thế mỗi chữ cái bằng một ký tự hoặc biểu tượng khác. Sử dụng tính năng 'Mã hóa' > 'Thay thế' và tải lên bảng ký tự thay thế hoặc sử dụng các mẫu có sẵn như mật mã Pigpen hoặc mã Morse.",
    category: "cipher",
    priority: 80
  },
  {
    keyword: "mật thư ẩn",
    response: "Mật thư ẩn giấu thông điệp trong văn bản hoặc hình ảnh bình thường. Hãy sử dụng: 1) Chữ cái đầu tiên của mỗi câu/dòng, 2) Chữ được đánh dấu tinh tế, 3) Lớp overlay trong hình ảnh, hoặc 4) Mực vô hình (hiển thị khi người chơi điều chỉnh độ sáng).",
    category: "cipher",
    priority: 85
  },
  {
    keyword: "mã QR động",
    response: "Mã QR động thay đổi điểm đến dựa trên điều kiện như thời gian hoặc vị trí. Tạo mã QR trong 'Mật thư' > 'QR động' và thiết lập các điều kiện kích hoạt, và các URL khác nhau sẽ được hiển thị dựa trên điều kiện được đáp ứng.",
    category: "cipher",
    priority: 80
  },
  {
    keyword: "mật thư đa lớp",
    response: "Mật thư đa lớp là thử thách yêu cầu nhiều bước giải mã liên tiếp. Ví dụ: giải mã Morse → giải mật mã Caesar → đọc ngược thông điệp. Thiết kế trong 'Mật thư' > 'Đa lớp' và thiết lập chuỗi các bước mã hóa.",
    category: "cipher",
    priority: 85
  },
  
  // LOẠI MẬT THƯ CỤ THỂ
  {
    keyword: "mật thư bin-hex",
    response: "Mật thư nhị phân-hex chuyển đổi văn bản thành dạng nhị phân hoặc hệ thập lục phân. Sử dụng công cụ 'Mã hóa' > 'Bin-Hex' để chuyển đổi. Ví dụ: 'hi' có thể trở thành '01101000 01101001' hoặc '68 69'.",
    category: "cipher",
    priority: 75
  },
  {
    keyword: "mật thư vigenère",
    response: "Mật thư Vigenère sử dụng một từ khóa để mã hóa, tạo mã phức tạp hơn Caesar. Sử dụng 'Mã hóa' > 'Vigenère' và nhập từ khóa (ví dụ: 'GIAOLIEN'). Hệ thống sẽ tự động tạo bảng và áp dụng mã hóa.",
    category: "cipher",
    priority: 80
  },
  {
    keyword: "mật thư đảo ngược",
    response: "Mật thư đảo ngược có thể đảo ngược từng từ, toàn bộ câu, hoặc theo một mẫu cụ thể. Sử dụng 'Mã hóa' > 'Đảo ngược' và chọn phương thức đảo ngược phù hợp với độ khó mong muốn.",
    category: "cipher",
    priority: 75
  },
  {
    keyword: "mật thư rải rác",
    response: "Mật thư rải rác giấu các chữ cái hoặc từ quan trọng trong một văn bản dài. Người chơi phải tìm và kết hợp chúng để có thông điệp. Ví dụ: chọn mỗi chữ cái thứ 5, hoặc chữ đầu tiên của mỗi đoạn.",
    category: "cipher",
    priority: 80
  },
  {
    keyword: "mật thư hình ảnh",
    response: "Mật thư hình ảnh giấu thông điệp trong các chi tiết của hình ảnh. Sử dụng 'Mật thư' > 'Hình ảnh' để tải lên và chỉnh sửa. Bạn có thể giấu thông điệp trong: chi tiết nhỏ, điểm nóng ẩn, mã màu sắc, hoặc kết hợp nhiều hình.",
    category: "cipher",
    priority: 85
  },
  
  // CHIẾN LƯỢC THIẾT KẾ TRẠM
  {
    keyword: "chuỗi trạm liên kết",
    response: "Chuỗi trạm liên kết tạo câu chuyện mạch lạc giữa các trạm. Đáp án từ trạm trước là manh mối cho trạm tiếp theo. Thiết kế này tạo cảm giác thành tựu cao, nhưng cần cẩn thận vì một trạm bị kẹt có thể chặn toàn bộ tiến trình.",
    category: "game_design",
    priority: 85
  },
  {
    keyword: "mô hình hub",
    response: "Mô hình hub có một trạm trung tâm dẫn đến nhiều trạm nhánh. Người chơi có thể giải các trạm nhánh theo bất kỳ thứ tự nào và quay lại hub. Mô hình này linh hoạt, giảm tắc nghẽn, và cho phép nhóm phân chia công việc.",
    category: "game_design",
    priority: 80
  },
  {
    keyword: "trạm song song",
    response: "Trạm song song cho phép nhiều đường đi qua trò chơi. Người chơi có thể chọn lộ trình dựa trên sở thích hoặc kỹ năng. Thiết kế này tăng khả năng tái chơi và phù hợp với nhiều nhóm người chơi khác nhau.",
    category: "game_design",
    priority: 80
  },
  {
    keyword: "trạm phụ thuộc thời gian",
    response: "Trạm phụ thuộc thời gian chỉ khả dụng hoặc thay đổi nội dung theo thời gian thực. Ví dụ: trạm mở vào giờ cụ thể, đáp án thay đổi theo giờ trong ngày, hoặc manh mối xuất hiện sau một khoảng thời gian cố định.",
    category: "game_design",
    priority: 80
  },
  {
    keyword: "trạm đa kết quả",
    response: "Trạm đa kết quả có nhiều kết quả khả thi dựa trên lựa chọn hoặc đáp án. Mỗi lựa chọn dẫn đến hướng đi hoặc nội dung khác nhau, tạo trải nghiệm cá nhân hóa và khuyến khích người chơi thử lại với chiến lược khác.",
    category: "game_design",
    priority: 80
  },
  
  // MẸO THIẾT KẾ TRÒ CHƠI
  {
    keyword: "câu chuyện mạch lạc",
    response: "Xây dựng câu chuyện mạch lạc giúp người chơi đắm chìm. Hãy tạo chủ đề xuyên suốt, nhân vật liên quan, và lý do hợp lý để giải các mật thư. Câu chuyện có thể là hành trình thám hiểm, giải cứu, hoặc thám tử điều tra.",
    category: "game_design",
    priority: 75
  },
  {
    keyword: "hệ thống gợi ý",
    response: "Hệ thống gợi ý tốt có nhiều cấp độ, từ mơ hồ đến cụ thể. Thiết kế 3-4 gợi ý cho mỗi trạm, bắt đầu với manh mối tinh tế và dần tiết lộ nhiều thông tin hơn. Áp dụng chi phí điểm khác nhau cho mỗi cấp gợi ý.",
    category: "game_design",
    priority: 85
  },
  {
    keyword: "thử nghiệm trước",
    response: "Thử nghiệm trước vô cùng quan trọng. Kiểm tra mỗi trạm với nhiều người có trình độ khác nhau. Điều chỉnh dựa trên phản hồi và thời gian giải trung bình. Đặc biệt chú ý đến trạm mà hầu hết người thử nghiệm đều bị kẹt.",
    category: "game_design",
    priority: 85
  },
  {
    keyword: "khuyến khích hợp tác",
    response: "Khuyến khích hợp tác giữa người chơi bằng cách thiết kế trạm yêu cầu nhiều kỹ năng hoặc kiến thức khác nhau. Ví dụ: một người giải mã trong khi người khác tìm kiếm mẫu hình, hoặc trạm yêu cầu thành viên ở các vị trí khác nhau.",
    category: "game_design",
    priority: 75
  },
  {
    keyword: "phần thưởng tiến độ",
    response: "Phần thưởng tiến độ cung cấp động lực liên tục. Thay vì chỉ có phần thưởng cuối cùng, hãy thêm thành tựu nhỏ khi hoàn thành các cột mốc. Ví dụ: mở khóa manh mối đặc biệt, công cụ mới, hoặc điểm thưởng sau mỗi 3-5 trạm.",
    category: "game_design",
    priority: 75
  },
  
  // CHỦ ĐỀ VÀ CÂU CHUYỆN
  {
    keyword: "chủ đề khảo cổ",
    response: "Chủ đề khảo cổ học bao gồm khám phá di tích, giải mã văn bản cổ, và tìm hiểu nền văn minh mất tích. Trạm có thể sử dụng các ký tự hiển thị giống hieroglyph, bản đồ kho báu, hoặc bài giải đố dựa trên văn hóa cổ đại.",
    category: "themes",
    priority: 70
  },
  {
    keyword: "chủ đề khoa học",
    response: "Chủ đề khoa học có thể tập trung vào thí nghiệm, khám phá, hoặc xử lý khủng hoảng khoa học. Các trạm có thể bao gồm giải phương trình, giải mã chuỗi DNA, cân bằng phản ứng hóa học, hoặc xác định các hiện tượng thiên văn.",
    category: "themes",
    priority: 70
  },
  {
    keyword: "chủ đề điệp viên",
    response: "Chủ đề điệp viên tạo không khí bí mật với mã hóa, giải mã thông điệp, và hoạt động bí mật. Các trạm có thể bao gồm theo dõi đối tượng, phá mã khóa, giải mã thông điệp bí mật, hoặc vô hiệu hóa 'bom hẹn giờ'.",
    category: "themes",
    priority: 75
  },
  {
    keyword: "chủ đề du hành thời gian",
    response: "Chủ đề du hành thời gian kết hợp các thời kỳ lịch sử khác nhau. Người chơi có thể 'du hành' qua các thời đại, với mỗi trạm đại diện cho một thời kỳ với kiểu mã hóa, công nghệ, và thử thách phù hợp với thời đại đó.",
    category: "themes",
    priority: 70
  },
  {
    keyword: "chủ đề sách và văn học",
    response: "Chủ đề văn học dựa trên các tác phẩm nổi tiếng. Trạm có thể là các câu đố liên quan đến nhân vật, cốt truyện, hoặc trích dẫn. Đặc biệt hiệu quả khi kết hợp với loạt sách được yêu thích như Harry Potter hoặc Sherlock Holmes.",
    category: "themes",
    priority: 70
  },
  
  // THIẾT KẾ TRẠM NÂNG CAO
  {
    keyword: "trạm đa giác quan",
    response: "Trạm đa giác quan kết hợp nhiều loại nội dung: văn bản, hình ảnh, âm thanh, và video. Ví dụ: giải mã một đoạn âm thanh để tìm manh mối, sau đó kết hợp với hình ảnh để có đáp án hoàn chỉnh. Phương pháp này phù hợp với nhiều kiểu học tập khác nhau.",
    category: "stations",
    priority: 80
  },
  {
    keyword: "trạm thực tế",
    response: "Trạm thực tế kết hợp nội dung kỹ thuật số với thế giới thực. Ví dụ: tìm một địa điểm vật lý dựa trên manh mối online, quét mã QR tại địa điểm đó, sau đó quay lại nền tảng trực tuyến để giải mã thông tin mới nhận được.",
    category: "stations",
    priority: 85
  },
  {
    keyword: "trạm social media",
    response: "Trạm social media tích hợp nền tảng mạng xã hội vào trò chơi. Người chơi có thể cần tìm manh mối từ một tài khoản Instagram ảo, phân tích dòng thời gian Twitter, hoặc giải mã một bài đăng Facebook. Nhớ tạo tài khoản dành riêng cho trò chơi.",
    category: "stations",
    priority: 75
  },
  {
    keyword: "trạm tương tác nhóm",
    response: "Trạm tương tác nhóm yêu cầu nhiều người phối hợp. Ví dụ: một người xem hình ảnh nhưng không thấy văn bản, người khác thấy văn bản nhưng không thấy hình ảnh, họ phải trao đổi thông tin để giải trạm. Tạo trải nghiệm này bằng cách phân công quyền xem khác nhau.",
    category: "stations",
    priority: 80
  },
  {
    keyword: "trạm phụ thuộc môi trường",
    response: "Trạm phụ thuộc môi trường thay đổi dựa trên dữ liệu thực tế như thời tiết, vị trí, hoặc thời gian. Ví dụ: manh mối chỉ hiện ra khi trời mưa, hoặc đáp án liên quan đến nhiệt độ hiện tại tại địa phương của người chơi.",
    category: "stations",
    priority: 75
  },
  
  // CHIẾN LƯỢC ĐÁNH GIÁ VÀ CẢI THIỆN
  {
    keyword: "phân tích dữ liệu người chơi",
    response: "Phân tích dữ liệu người chơi để cải thiện thiết kế. Xem xét: 1) Thời gian trung bình mỗi trạm, 2) Tỷ lệ bỏ cuộc tại trạm cụ thể, 3) Số lần thử trước khi giải đúng, 4) Điểm dừng phổ biến. Sử dụng thông tin này để điều chỉnh độ khó.",
    category: "analysis",
    priority: 70
  },
  {
    keyword: "bản đồ nhiệt",
    response: "Bản đồ nhiệt hiển thị các điểm người chơi tương tác nhiều nhất. Đặc biệt hữu ích cho trạm dựa trên hình ảnh để xem người chơi tập trung vào đâu. Dùng thông tin này để đặt manh mối tốt hơn hoặc điều chỉnh mức độ hiển thị.",
    category: "analysis",
    priority: 70
  },
  {
    keyword: "thu thập phản hồi có cấu trúc",
    response: "Thu thập phản hồi có cấu trúc thông qua khảo sát sau trò chơi. Hỏi về trạm yêu thích/ít thích nhất, độ khó tổng thể (thang điểm 1-5), và điểm cụ thể cần cải thiện. Thêm cả câu hỏi mở để nhận thông tin chi tiết hơn.",
    category: "analysis",
    priority: 75
  },
  {
    keyword: "so sánh phân tổ",
    response: "So sánh hiệu suất giữa các nhóm người chơi khác nhau (ví dụ: nhóm trẻ vs. người lớn, người mới vs. người có kinh nghiệm) để hiểu cách trải nghiệm thay đổi dựa trên đối tượng. Điều chỉnh độ khó hoặc thêm các mức độ khó khác nhau nếu cần.",
    category: "analysis",
    priority: 70
  },
  {
    keyword: "lặp lại và cải tiến",
    response: "Lặp lại và cải tiến liên tục là bí quyết cho trò chơi thành công. Sau mỗi lần chơi, ghi lại những gì hoạt động tốt và không tốt, thực hiện điều chỉnh nhỏ, và thử nghiệm lại. Hướng tới cải tiến từng bước thay vì thay đổi lớn.",
    category: "analysis",
    priority: 75
  },
  
  // MẬT THƯ THEO TRÌNH ĐỘ
  {
    keyword: "mật thư cho người mới",
    response: "Mật thư cho người mới nên đơn giản và có hướng dẫn rõ ràng. Tốt nhất là sử dụng: 1) Mã Caesar với độ dịch chuyển nhỏ, 2) Mật mã đơn giản như đảo ngược văn bản, 3) Mã Morse cơ bản, hoặc 4) Mật thư hình ảnh có manh mối rõ ràng.",
    category: "cipher",
    priority: 80
  },
  {
    keyword: "mật thư trung cấp",
    response: "Mật thư trung cấp có thể phức tạp hơn nhưng vẫn cần manh mối. Thử: 1) Kết hợp hai loại mã đơn giản (ví dụ: đầu tiên là Morse, sau đó đảo ngược), 2) Mã Vigenère với từ khóa ngắn, 3) Mật thư số học đơn giản, hoặc 4) Mật thư ẩn trong hình ảnh.",
    category: "cipher",
    priority: 80
  },
  {
    keyword: "mật thư nâng cao",
    response: "Mật thư nâng cao thách thức ngay cả người chơi có kinh nghiệm. Có thể sử dụng: 1) Nhiều lớp mã hóa (3+ kỹ thuật), 2) Mã hóa không tiêu chuẩn như Playfair hoặc Hill, 3) Mật thư cần kết hợp thông tin từ nhiều nguồn, hoặc 4) Mã hóa dựa trên thuật toán phức tạp.",
    category: "cipher",
    priority: 85
  },
  {
    keyword: "mật thư cho trẻ em",
    response: "Mật thư cho trẻ em cần trực quan và thú vị. Sử dụng: 1) Mã màu sắc đơn giản, 2) Ghép hình để hiện thông điệp, 3) Mật thư hình ảnh dễ nhận biết, 4) Mã thay thế bằng biểu tượng vui nhộn, hoặc 5) Mật thư đơn giản như 'chữ cái đầu tiên của mỗi dòng'.",
    category: "cipher",
    priority: 80
  },
  {
    keyword: "mật thư cho chuyên gia",
    response: "Mật thư cho chuyên gia có thể cực kỳ phức tạp. Thử thách với: 1) Mã kết hợp (ví dụ: mật mã Nihilist), 2) Mã hóa không có manh mối trực tiếp, 3) Mật thư đa phương tiện yêu cầu phân tích chuyên sâu, 4) Mật thư yêu cầu kiến thức chuyên ngành, hoặc 5) Mật thư biến đổi theo thời gian.",
    category: "cipher",
    priority: 85
  }
];

module.exports = additionalReplies5; 