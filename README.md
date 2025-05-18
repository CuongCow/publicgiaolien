# Giao Liên - Mã Nguồn Công Khai

## Giới thiệu

Đây là phiên bản công khai của mã nguồn hệ thống Giao Liên - nền tảng quản lý trò chơi mật thư, trạm, đội chơi và bảng xếp hạng.

Repository này được tạo ra với mục đích **minh bạch hoá mã nguồn** nhằm chứng minh:
- Không có mã độc hoặc các đoạn mã có thể gây hại
- Không có chức năng thu thập dữ liệu người dùng trái phép
- Không có gian lận hoặc hack trong hệ thống

## Lưu ý

Repository này là phiên bản công khai của mã nguồn, trong đó:
- Đã loại bỏ tất cả thông tin nhạy cảm như khóa API, token, mật khẩu
- Đã loại bỏ các dịch vụ tracking và analytics
- Chỉ giữ lại mã nguồn cần thiết cho việc kiểm tra tính minh bạch

Để sử dụng mã nguồn này, bạn cần tự cấu hình các biến môi trường và thông tin kết nối cần thiết.

## Cấu trúc dự án

Dự án được xây dựng với kiến trúc MERN Stack:
- **MongoDB**: Cơ sở dữ liệu
- **Express**: Back-end framework
- **React**: Front-end library
- **Node.js**: Runtime environment

### Cấu trúc thư mục:

```
/
├── client/               # Mã nguồn front-end (React)
├── server/               # Mã nguồn back-end (Express + Node.js)
├── public/               # Tài nguyên tĩnh
├── package.json          # Cấu hình npm của dự án
└── README.md             # Tài liệu dự án
```

## Cài đặt và sử dụng

1. Clone repository:
```bash
git clone https://github.com/CuongCow/publicgiaolien.git
cd publicgiaolien
```

2. Cài đặt dependencies:
```bash
npm install
cd client && npm install
cd ../server && npm install
```

3. Tạo file môi trường:
Tạo file `.env` trong thư mục gốc và trong thư mục server với các biến môi trường cần thiết.

4. Chạy ứng dụng ở chế độ development:
```bash
npm run dev
```

## Liên hệ

Nếu có bất kỳ câu hỏi hoặc góp ý nào, vui lòng liên hệ qua website chính thức [www.giaolien.com](https://www.giaolien.com).

## Giấy phép

Mã nguồn này được công bố dưới giấy phép MIT. 