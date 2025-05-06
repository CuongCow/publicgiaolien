// Vercel serverless function cho API đăng nhập
// File này đặt trong thư mục 'api' sẽ được Vercel tự động phục vụ như một serverless function

module.exports = async (req, res) => {
  // Cấu hình CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-auth-token, Authorization, X-Requested-With');
  
  // Xử lý OPTIONS (preflight request)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Chỉ xử lý POST requests
  if (req.method === 'POST') {
    try {
      // Trả về một JSON để test
      return res.status(200).json({
        method: req.method,
        url: req.url,
        body: req.body,
        headers: req.headers,
        message: 'API đăng nhập (serverless function) hoạt động!',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      return res.status(500).json({ 
        message: 'Lỗi từ serverless function',
        error: err.message
      });
    }
  }
  
  // Phương thức không được hỗ trợ
  return res.status(405).json({ message: 'Phương thức không được hỗ trợ' });
}; 