const axios = require('axios');
const WebSocket = require('ws');
const config = require('../config');

// Config cho VietQR API
const VIETQR_CONFIG = {
  apiUrl: 'https://api.vietqr.org/vqr/api',
  wsUrl: 'ws://api.vietqr.org/vqr/socket',
  username: process.env.VIETQR_USERNAME || 'your_username', 
  password: process.env.VIETQR_PASSWORD || 'your_password',
  clientId: process.env.VIETQR_CLIENT_ID || 'your_client_id',
  // Thêm thông tin tài khoản ngân hàng của bạn
  bankInfo: {
    bankName: 'Vietinbank',
    accountNumber: '0799444052',
    accountName: 'DAO NHUT CUONG',
    bankId: '970415' // Mã ngân hàng Vietinbank
  }
};

// Biến lưu trữ token và trạng thái kết nối
let accessToken = null;
let tokenExpiry = null;
let wsConnection = null;
let transactionCallbacks = {};

/**
 * Lấy token xác thực từ VietQR API
 */
async function getToken() {
  try {
    // Kiểm tra nếu token vẫn còn hiệu lực
    if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
      return accessToken;
    }

    // Tạo xác thực Basic Auth
    const auth = Buffer.from(`${VIETQR_CONFIG.username}:${VIETQR_CONFIG.password}`).toString('base64');
    
    const response = await axios.post(
      `${VIETQR_CONFIG.apiUrl}/peripheral/ecommerce/token_generate`,
      {},
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': `Basic ${auth}`
        }
      }
    );

    if (response.data && response.data.access_token) {
      accessToken = response.data.access_token;
      
      // Mặc định là 300 giây, nhưng nếu API trả về thời gian thì sử dụng giá trị đó
      const expiresIn = response.data.expires_in || 300;
      tokenExpiry = new Date(new Date().getTime() + expiresIn * 1000);
      
      console.log('[VietQR] Đã lấy token thành công');
      return accessToken;
    } else {
      throw new Error('Không nhận được token từ VietQR API');
    }
  } catch (error) {
    console.error('[VietQR] Lỗi khi lấy token:', error.message);
    throw error;
  }
}

/**
 * Gọi API đồng bộ Ecommerce
 */
async function syncEcommerce(websiteUrl) {
  try {
    const token = await getToken();
    
    const response = await axios.post(
      `${VIETQR_CONFIG.apiUrl}/ecommerce`, 
      {
        ecommerceSite: websiteUrl || 'https://giaolien.com',
        terminalCode: 'GIAOLIEN',
        webhook: `${config.API_URL}/api/payments/verify-bank`
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('[VietQR] Đồng bộ Ecommerce thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('[VietQR] Lỗi khi đồng bộ Ecommerce:', error.message);
    throw error;
  }
}

/**
 * Khởi tạo kết nối WebSocket để nhận thông báo
 */
function initWebSocketConnection() {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    return wsConnection;
  }

  const wsUrl = `${VIETQR_CONFIG.wsUrl}?clientId=${VIETQR_CONFIG.clientId}`;
  wsConnection = new WebSocket(wsUrl);

  wsConnection.on('open', () => {
    console.log('[VietQR] Kết nối WebSocket đã được thiết lập');
  });

  wsConnection.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      // Xử lý tin nhắn theo loại thông báo
      if (message.notificationType === 'N05') {
        // Biến động số dư
        console.log('[VietQR] Nhận thông báo biến động số dư:', message);
        
        // Tìm và xử lý giao dịch tương ứng
        handleTransactionNotification(message);
      } else if (message.notificationType === 'N22') {
        // Thêm tài khoản ngân hàng thành công
        console.log('[VietQR] Tài khoản ngân hàng đã được thêm thành công:', message);
      }
    } catch (error) {
      console.error('[VietQR] Lỗi khi xử lý tin nhắn WebSocket:', error);
    }
  });

  wsConnection.on('error', (error) => {
    console.error('[VietQR] Lỗi WebSocket:', error.message);
    // Thử kết nối lại sau 30 giây
    setTimeout(() => {
      if (wsConnection.readyState !== WebSocket.OPEN) {
        initWebSocketConnection();
      }
    }, 30000);
  });

  wsConnection.on('close', () => {
    console.log('[VietQR] Kết nối WebSocket đã đóng. Thử kết nối lại...');
    setTimeout(initWebSocketConnection, 5000);
  });

  return wsConnection;
}

/**
 * Xử lý thông báo giao dịch từ WebSocket
 */
async function handleTransactionNotification(notification) {
  try {
    // Kiểm tra xem có phải là giao dịch vào không
    if (notification.transType !== 'C') {
      return;
    }

    const transactionCode = notification.content;
    const amount = parseInt(notification.amount);
    
    // Gọi API kiểm tra giao dịch để xác nhận
    const response = await axios.post(
      `${config.API_URL}/api/payments/verify-bank`, 
      {
        transactionId: notification.referencenumber,
        content: transactionCode,
        amount: amount,
        status: 'success',
        bankReference: notification.transactionid
      }
    );

    console.log('[VietQR] Đã xử lý thông báo thanh toán:', response.data);
    
    // Gọi callback nếu có
    if (transactionCallbacks[transactionCode]) {
      transactionCallbacks[transactionCode](notification);
      delete transactionCallbacks[transactionCode]; // Xóa callback sau khi xử lý
    }
  } catch (error) {
    console.error('[VietQR] Lỗi khi xử lý thông báo giao dịch:', error.message);
  }
}

/**
 * Kiểm tra trạng thái đơn hàng
 */
async function checkTransactionStatus(bankAccount, bankCode, orderId) {
  try {
    const token = await getToken();
    
    // Tạo checksum
    const checkSum = require('crypto')
      .createHash('md5')
      .update(bankAccount + VIETQR_CONFIG.username)
      .digest('hex');
    
    const response = await axios.post(
      `${VIETQR_CONFIG.apiUrl}/ecommerce-transactions/check-order`,
      {
        bankAccount: bankAccount,
        bankCode: bankCode,
        type: '0',
        value: orderId,
        checkSum: checkSum
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('[VietQR] Lỗi khi kiểm tra trạng thái giao dịch:', error.message);
    throw error;
  }
}

/**
 * Tạo mã QR thanh toán
 */
async function generateQRCode(transactionCode, amount) {
  try {
    const token = await getToken();
    
    const response = await axios.post(
      `${VIETQR_CONFIG.apiUrl}/qr/generate-customer`,
      {
        bankAccount: VIETQR_CONFIG.bankInfo.accountNumber,
        bankCode: VIETQR_CONFIG.bankInfo.bankId,
        amount: amount,
        content: transactionCode,
        orderId: transactionCode,
        qrTemplate: "compact"
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response.data && response.data.qrDataURL) {
      return { qrDataURL: response.data.qrDataURL };
    } else {
      throw new Error('Không nhận được mã QR từ VietQR API');
    }
  } catch (error) {
    console.error('[VietQR] Lỗi khi tạo mã QR:', error.message);
    throw error;
  }
}

/**
 * Đăng ký callback cho giao dịch cụ thể
 */
function registerTransactionCallback(transactionCode, callback) {
  transactionCallbacks[transactionCode] = callback;
}

/**
 * Khởi tạo dịch vụ VietQR
 */
async function initialize() {
  try {
    // Lấy token và thiết lập kết nối
    await getToken();
    initWebSocketConnection();
    console.log('[VietQR] Đã khởi tạo dịch vụ VietQR thành công');
  } catch (error) {
    console.error('[VietQR] Lỗi khi khởi tạo dịch vụ VietQR:', error.message);
  }
}

module.exports = {
  initialize,
  getToken,
  syncEcommerce,
  generateQRCode,
  checkTransactionStatus,
  registerTransactionCallback,
  VIETQR_CONFIG
}; 