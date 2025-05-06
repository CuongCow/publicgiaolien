# Hướng dẫn triển khai Giao Lien lên Vercel

## Cập nhật mới nhất

Sau khi thực hiện nhiều thay đổi để khắc phục vấn đề API trên Vercel, chúng ta đã cập nhật các cấu hình sau:

1. Cải thiện cấu hình `rewrites` trong `vercel.json` để đảm bảo route API đúng cách
2. Thêm `headers` trong `vercel.json` để xử lý CORS
3. Thêm `server.js` trong thư mục gốc để điều hướng vào server chính
4. Cập nhật cấu hình `package.json` để chỉ đúng entry point
5. Cải thiện xử lý CORS trong server

## Các bước tiếp theo sau khi deploy

1. **Kiểm tra API endpoint**:
   - Truy cập `/api/test` để xem API serverless function
   - Truy cập `/api/status` để kiểm tra API server chính
   - Kiểm tra `/api/check/login-test` với phương thức POST để test API đăng nhập

2. **Log và debug**:
   - Xem logs trong bảng điều khiển Vercel
   - Sử dụng DevTools trong trình duyệt để theo dõi requests API

## Xử lý các vấn đề thường gặp

### 1. API trả về HTML thay vì JSON

**Nguyên nhân**: 
- Route trong Vercel không được cấu hình đúng
- Frontend được phục vụ cho các API routes

**Giải pháp**:
- Kiểm tra cấu hình `rewrites` trong `vercel.json`
- Đảm bảo API routes được liệt kê trước frontend routes

### 2. Lỗi 405 Method Not Allowed 

**Nguyên nhân**:
- CORS không được cấu hình đúng
- OPTIONS preflight request không được xử lý

**Giải pháp**:
- Đảm bảo xử lý CORS đúng cách trong server
- Thêm handlers cho OPTIONS requests
- Xác thực headers được gửi đúng từ frontend

### 3. URL API trong frontend không đúng

**Nguyên nhận**:
- URL API tuyệt đối được sử dụng thay vì tương đối trong môi trường production

**Giải pháp**:
- Sử dụng URL tương đối trong môi trường production
- Cấu hình axios baseURL là chuỗi rỗng trong production

## Cách kiểm tra đăng nhập

1. Mở DevTools (F12) trước khi thử đăng nhập
2. Vào tab Network để theo dõi requests
3. Thử đăng nhập và kiểm tra request `/api/auth/login`:
   - Có request OPTIONS trước request POST không?
   - Headers của request có đúng không?
   - Response có mã lỗi gì không?

## Các lệnh hữu ích khi debug

```bash
# Kiểm tra API status
curl -v https://your-vercel-domain.vercel.app/api/status

# Test login API với curl
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  https://your-vercel-domain.vercel.app/api/auth/login
```

## Biện pháp cuối cùng

Nếu không thể giải quyết vấn đề với cách tiếp cận hiện tại, bạn có thể cân nhắc:

1. Tách riêng backend và frontend thành hai dự án Vercel khác nhau
2. Sử dụng MongoDB Realm hoặc Firebase Functions thay vì máy chủ Express
3. Sử dụng Next.js API Routes để xây dựng lại API endpoints 

## Cập nhật mới nhất

Sau khi thực hiện nhiều thay đổi để khắc phục vấn đề API trên Vercel, chúng ta đã cập nhật các cấu hình sau:

1. Cải thiện cấu hình `rewrites` trong `vercel.json` để đảm bảo route API đúng cách
2. Thêm `headers` trong `vercel.json` để xử lý CORS
3. Thêm `server.js` trong thư mục gốc để điều hướng vào server chính
4. Cập nhật cấu hình `package.json` để chỉ đúng entry point
5. Cải thiện xử lý CORS trong server

## Các bước tiếp theo sau khi deploy

1. **Kiểm tra API endpoint**:
   - Truy cập `/api/test` để xem API serverless function
   - Truy cập `/api/status` để kiểm tra API server chính
   - Kiểm tra `/api/check/login-test` với phương thức POST để test API đăng nhập

2. **Log và debug**:
   - Xem logs trong bảng điều khiển Vercel
   - Sử dụng DevTools trong trình duyệt để theo dõi requests API

## Xử lý các vấn đề thường gặp

### 1. API trả về HTML thay vì JSON

**Nguyên nhân**: 
- Route trong Vercel không được cấu hình đúng
- Frontend được phục vụ cho các API routes

**Giải pháp**:
- Kiểm tra cấu hình `rewrites` trong `vercel.json`
- Đảm bảo API routes được liệt kê trước frontend routes

### 2. Lỗi 405 Method Not Allowed 

**Nguyên nhân**:
- CORS không được cấu hình đúng
- OPTIONS preflight request không được xử lý

**Giải pháp**:
- Đảm bảo xử lý CORS đúng cách trong server
- Thêm handlers cho OPTIONS requests
- Xác thực headers được gửi đúng từ frontend

### 3. URL API trong frontend không đúng

**Nguyên nhận**:
- URL API tuyệt đối được sử dụng thay vì tương đối trong môi trường production

**Giải pháp**:
- Sử dụng URL tương đối trong môi trường production
- Cấu hình axios baseURL là chuỗi rỗng trong production

## Cách kiểm tra đăng nhập

1. Mở DevTools (F12) trước khi thử đăng nhập
2. Vào tab Network để theo dõi requests
3. Thử đăng nhập và kiểm tra request `/api/auth/login`:
   - Có request OPTIONS trước request POST không?
   - Headers của request có đúng không?
   - Response có mã lỗi gì không?

## Các lệnh hữu ích khi debug

```bash
# Kiểm tra API status
curl -v https://your-vercel-domain.vercel.app/api/status

# Test login API với curl
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  https://your-vercel-domain.vercel.app/api/auth/login
```

## Biện pháp cuối cùng

Nếu không thể giải quyết vấn đề với cách tiếp cận hiện tại, bạn có thể cân nhắc:

1. Tách riêng backend và frontend thành hai dự án Vercel khác nhau
2. Sử dụng MongoDB Realm hoặc Firebase Functions thay vì máy chủ Express
3. Sử dụng Next.js API Routes để xây dựng lại API endpoints 