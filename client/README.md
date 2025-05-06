# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

# Giao Liên - Hệ thống quản lý trạm

## Tính năng mới: Super Admin

Hệ thống hiện hỗ trợ phân quyền Super Admin với các tính năng:

1. **Quản lý Admin**: Xem danh sách tất cả các admin trong hệ thống
2. **Quản lý mã mời**: Tạo và quản lý mã mời để đăng ký tài khoản admin mới
3. **Quản lý đội**: Xem và quản lý tất cả các đội trong hệ thống

### Cách sử dụng

1. **Đăng nhập Super Admin**: 
   - Tài khoản mặc định: `superadmin` / `admin123`
   - Sau khi đăng nhập lần đầu, vui lòng đổi mật khẩu

2. **Tạo mã mời**:
   - Vào trang quản lý hệ thống
   - Nhấn nút "Tạo mã mời"
   - Mã mời có hiệu lực trong 7 ngày và chỉ sử dụng được một lần

3. **Đăng ký tài khoản Admin mới**:
   - Đăng ký với mã mời hợp lệ từ Super Admin
   - Tài khoản mới sẽ có vai trò Admin thông thường

## Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống

- Node.js >= 14.x
- MongoDB >= 4.4
- NPM >= 6.x

### 2. Cài đặt

```bash
# Clone repository
git clone <repository-url>
cd giao-lien

# Cài đặt dependencies cho server
cd server
npm install

# Cài đặt dependencies cho client
cd ../client
npm install
```

### 3. Cấu hình

Tạo file `.env` trong thư mục `server` với các biến môi trường sau:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/giaolien
JWT_SECRET=tcl_secret_key_2025
```

### 4. Khởi tạo Super Admin (nếu chưa có)

```bash
cd server
node scripts/createSuperAdmin.js
```

### 5. Chạy ứng dụng

```bash
# Chạy server (từ thư mục server)
npm start

# Chạy client (từ thư mục client)
npm start
```

Server sẽ chạy tại http://localhost:5000 và client sẽ chạy tại http://localhost:3000.
