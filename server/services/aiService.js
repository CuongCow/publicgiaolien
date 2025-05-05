const fetch = require('node-fetch');
const AutoReply = require('../models/AutoReply');

/**
 * Service xử lý trả lời tự động với sự hỗ trợ của AI
 */
class AIService {
  /**
   * Xử lý tin nhắn và tạo phản hồi tự động
   * Quy trình xử lý: 
   * 1. Kiểm tra với cơ sở dữ liệu câu trả lời có sẵn
   * 2. Nếu không tìm thấy, sử dụng mô hình AI miễn phí để tạo phản hồi
   * 3. Nếu mô hình AI không trả lời được, trả về null
   */
  static async processMessage(message, adminId) {
    try {
      console.log(`AIService.processMessage: Xử lý tin nhắn '${message}' từ admin ${adminId}`);
      
      // Bước 1: Kiểm tra với cơ sở dữ liệu câu trả lời có sẵn
      const dbMatch = await AutoReply.findBestMatch(message);
      if (dbMatch) {
        console.log('AIService: Tìm thấy câu trả lời từ database:', dbMatch.keyword);
        return {
          response: dbMatch.response,
          source: 'database'
        };
      }
      
      console.log('AIService: Không tìm thấy câu trả lời trong database, thử với AI');
      
      // Bước 2: Sử dụng mô hình AI miễn phí
      const aiResponse = await this.getAIResponse(message);
      if (aiResponse) {
        console.log('AIService: Đã tạo câu trả lời từ AI');
        return {
          response: aiResponse,
          source: 'ai'
        };
      }
      
      console.log('AIService: Không tạo được câu trả lời từ AI');
      // Không có câu trả lời
      return null;
    } catch (error) {
      console.error('Lỗi xử lý tin nhắn tự động:', error);
      return null;
    }
  }
  
  /**
   * Tạo phản hồi sử dụng mô hình AI miễn phí
   * Lựa chọn 1: Hugging Face Inference API (miễn phí với giới hạn)
   * Lựa chọn 2: GPT4All (mô hình chạy cục bộ - không sử dụng trong đoạn code này)
   * Tùy chọn: Có thể sử dụng API khác như OpenAI nếu có API key
   */
  static async getAIResponse(message) {
    try {
      // Kiểm tra cấu hình môi trường để sử dụng API phù hợp
      // API HUGGING FACE (miễn phí với giới hạn)
      if (process.env.USE_HUGGINGFACE_API && process.env.HUGGINGFACE_API_KEY) {
        return await this.getHuggingFaceResponse(message);
      }
      
      // Mô phỏng phản hồi cho môi trường phát triển
      // Trong môi trường thực tế, bạn nên sử dụng một API thực sự
      return this.getMockAIResponse(message);
    } catch (error) {
      console.error('Lỗi khi lấy phản hồi từ AI:', error);
      return null;
    }
  }
  
  /**
   * Sử dụng Hugging Face Inference API - sửa lại thông số cho phù hợp với API key của bạn
   */
  static async getHuggingFaceResponse(message) {
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            inputs: message,
            parameters: {
              max_length: 100,
              temperature: 0.7
            }
          }),
        }
      );
      
      const result = await response.json();
      
      if (result && result.generated_text) {
        return result.generated_text;
      } else if (Array.isArray(result) && result[0] && result[0].generated_text) {
        return result[0].generated_text;
      }
      
      return null;
    } catch (error) {
      console.error('Lỗi khi gọi Hugging Face API:', error);
      return null;
    }
  }
  
  /**
   * Mô phỏng phản hồi AI - chỉ dùng cho môi trường phát triển
   * Trong môi trường thực tế, bạn nên thay thế bằng mô hình AI thực
   */
  static getMockAIResponse(message) {
    // Trích xuất các từ khóa cơ bản trong tin nhắn
    const lowerMessage = message.toLowerCase();
    
    // Mảng các phản hồi cơ bản dựa trên từ khóa
    const basicResponses = [
      { keywords: ['xin chào', 'chào', 'hello', 'hi'], response: 'Xin chào! Tôi có thể giúp gì cho bạn?' },
      { keywords: ['cảm ơn', 'thank'], response: 'Rất vui khi được giúp đỡ bạn!' },
      { keywords: ['tạm biệt', 'bye'], response: 'Tạm biệt! Chúc bạn một ngày tốt lành.' },
      { keywords: ['hướng dẫn', 'giúp đỡ', 'help'], response: 'Tôi có thể giúp bạn về các vấn đề kỹ thuật. Bạn cần hỗ trợ về vấn đề gì?' },
      { keywords: ['lỗi', 'error', 'bug'], response: 'Bạn có thể mô tả chi tiết lỗi bạn đang gặp phải không? Như mã lỗi, thời điểm xảy ra, và các bước tái hiện.' },
      { keywords: ['reset', 'đặt lại', 'mật khẩu'], response: 'Để đặt lại mật khẩu, bạn có thể sử dụng chức năng "Quên mật khẩu" trên trang đăng nhập.' },
      { keywords: ['tính năng', 'feature'], response: 'Ứng dụng Giao Liên có nhiều tính năng hữu ích. Bạn muốn tìm hiểu về tính năng cụ thể nào?' },
      { keywords: ['tài khoản', 'account'], response: 'Để quản lý tài khoản, bạn có thể vào mục "Tài khoản" trong menu chính.' }
    ];
    
    // Kiểm tra xem tin nhắn có chứa từ khóa nào không
    for (const item of basicResponses) {
      if (item.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return item.response;
      }
    }
    
    // Trả về câu trả lời mặc định nếu không có từ khóa phù hợp
    return 'Xin lỗi, tôi không hiểu rõ câu hỏi của bạn. Bạn có thể mô tả chi tiết hơn không? Rồi đợi tôi hoạt động trả lời cho bạn nhé';
  }
  
  /**
   * Lưu trữ tin nhắn và phản hồi AI vào cơ sở dữ liệu để cải thiện hệ thống
   */
  static async saveInteraction(message, response, adminId) {
    try {
      // Đối với các câu hỏi phổ biến, lưu vào cơ sở dữ liệu để sử dụng sau này
      // Lưu ý: Chức năng này nên được triển khai thực tế khi có admin xác nhận
      console.log('Saved interaction for future learning:', { message, response });
      return true;
    } catch (error) {
      console.error('Lỗi khi lưu tương tác:', error);
      return false;
    }
  }
}

module.exports = AIService; 