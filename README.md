# Giao Lien - Ứng dụng Trò chơi Giải Mật thư

Ứng dụng web quản lý trò chơi giải mật thư. Hỗ trợ tạo trạm, quản lý đội, xếp hạng và theo dõi tiến trình.

## Cấu trúc dự án

- `/client` - Frontend React
- `/server` - Backend Node.js/Express

## Tính năng

- Đăng nhập/đăng ký quản trị viên
- Quản lý trạm chơi
- Quản lý đội chơi
- Theo dõi điểm số và tiến trình
- Xếp hạng theo thời gian và điểm số

## Cài đặt và chạy

### Yêu cầu

- Node.js >=14.x
- MongoDB
- npm hoặc yarn

### Backend Server

```bash
cd server
npm install
npm run dev  # Chạy phát triển
# hoặc
npm start    # Chạy production
```

### Frontend Client

```bash
cd client
npm install
npm start    # Chạy phát triển
npm run build  # Build cho production
```

## Deployment

### Frontend (Vercel)

Đã triển khai tại: [https://giaolien.vercel.app](https://giaolien.vercel.app)

### Backend (Heroku)

API đã triển khai tại: [https://giaolien-backend.herokuapp.com](https://giaolien-backend.herokuapp.com)

## Môi trường

Tạo file `.env` trong thư mục `/server` với nội dung:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/giaolien
JWT_SECRET=your_jwt_secret
```

## Tác giả

CuongCow - Đại học FPT 