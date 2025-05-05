/**
 * Danh sách 1000 câu trả lời tự động mở rộng
 * Sử dụng để nâng cao khả năng tương tác của hệ thống chat tự động
 * Được tạo tự động bởi script generateExpandedReplies.js
 */

const expandedReplies = [
  {
    keyword: "xin chào",
    response: "Chào bạn! Rất vui được gặp bạn. Tôi có thể hỗ trợ bạn vấn đề gì?",
    category: "greeting",
    priority: 86
  },
  {
    keyword: "xin chào",
    response: "Chào bạn! Tôi là trợ lý ảo của Giao Liên, hãy cho tôi biết tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 93
  },
  {
    keyword: "chào",
    response: "Xin chào! Hôm nay bạn cần hỗ trợ về vấn đề gì?",
    category: "greeting",
    priority: 82
  },
  {
    keyword: "chào",
    response: "Xin chào! Cảm ơn bạn đã liên hệ với bộ phận hỗ trợ Giao Liên.",
    category: "greeting",
    priority: 99
  },
  {
    keyword: "chào",
    response: "Xin chào! Bạn đang cần thông tin hoặc hỗ trợ về vấn đề gì?",
    category: "greeting",
    priority: 83
  },
  {
    keyword: "hello",
    response: "Xin chào! Hôm nay bạn cần hỗ trợ về vấn đề gì?",
    category: "greeting",
    priority: 89
  },
  {
    keyword: "hello",
    response: "Xin chào! Tôi là trợ lý ảo của Giao Liên. Tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 99
  },
  {
    keyword: "hi",
    response: "Chào bạn! Tôi là trợ lý ảo của Giao Liên, rất vui được hỗ trợ bạn.",
    category: "greeting",
    priority: 89
  },
  {
    keyword: "hi",
    response: "Xin chào! Bạn đang cần thông tin hoặc hỗ trợ về vấn đề gì?",
    category: "greeting",
    priority: 98
  },
  {
    keyword: "hi",
    response: "Chào mừng bạn đến với hệ thống hỗ trợ Giao Liên. Tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 96
  },
  {
    keyword: "hey",
    response: "Xin chào! Tôi là trợ lý ảo của Giao Liên. Tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 94
  },
  {
    keyword: "hey",
    response: "Xin chào! Tôi đang sẵn sàng hỗ trợ bạn với các câu hỏi về Giao Liên.",
    category: "greeting",
    priority: 91
  },
  {
    keyword: "hey",
    response: "Xin chào! Cảm ơn bạn đã liên hệ với bộ phận hỗ trợ Giao Liên.",
    category: "greeting",
    priority: 90
  },
  {
    keyword: "chào buổi sáng",
    response: "Xin chào! Hôm nay bạn cần hỗ trợ về vấn đề gì?",
    category: "greeting",
    priority: 96
  },
  {
    keyword: "chào buổi sáng",
    response: "Xin chào! Tôi là trợ lý ảo của Giao Liên. Tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 99
  },
  {
    keyword: "chào buổi sáng",
    response: "Chào bạn, rất vui được gặp lại! Tôi có thể trợ giúp bạn điều gì?",
    category: "greeting",
    priority: 85
  },
  {
    keyword: "chào buổi chiều",
    response: "Xin chào! Tôi là trợ lý ảo của Giao Liên. Tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 88
  },
  {
    keyword: "chào buổi chiều",
    response: "Chào bạn! Tôi là trợ lý ảo của Giao Liên, hãy cho tôi biết tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 92
  },
  {
    keyword: "chào buổi chiều",
    response: "Xin chào! Hôm nay bạn cần hỗ trợ về vấn đề gì?",
    category: "greeting",
    priority: 98
  },
  {
    keyword: "chào buổi tối",
    response: "Xin chào! Cảm ơn bạn đã liên hệ với bộ phận hỗ trợ Giao Liên.",
    category: "greeting",
    priority: 92
  },
  {
    keyword: "chào buổi tối",
    response: "Xin chào! Tôi là trợ lý ảo của Giao Liên. Tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 96
  },
  {
    keyword: "kính chào",
    response: "Chào bạn! Tôi là trợ lý ảo của Giao Liên, rất vui được hỗ trợ bạn.",
    category: "greeting",
    priority: 88
  },
  {
    keyword: "kính chào",
    response: "Chào mừng bạn đến với hệ thống hỗ trợ Giao Liên. Tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 98
  },
  {
    keyword: "kính chào",
    response: "Xin chào! Hôm nay bạn cần hỗ trợ về vấn đề gì?",
    category: "greeting",
    priority: 99
  },
  {
    keyword: "chào admin",
    response: "Xin chào! Tôi đang sẵn sàng hỗ trợ bạn với các câu hỏi về Giao Liên.",
    category: "greeting",
    priority: 91
  },
  {
    keyword: "chào admin",
    response: "Chào mừng bạn đến với hệ thống hỗ trợ Giao Liên. Tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 88
  },
  {
    keyword: "xin chào admin",
    response: "Chào bạn! Tôi là trợ lý ảo của Giao Liên, hãy cho tôi biết tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 92
  },
  {
    keyword: "xin chào admin",
    response: "Xin chào! Tôi đang sẵn sàng hỗ trợ bạn với các câu hỏi về Giao Liên.",
    category: "greeting",
    priority: 91
  },
  {
    keyword: "chào bạn",
    response: "Chào bạn! Tôi là trợ lý ảo của Giao Liên, rất vui được hỗ trợ bạn.",
    category: "greeting",
    priority: 90
  },
  {
    keyword: "chào bạn",
    response: "Chào bạn, rất vui được gặp lại! Tôi có thể trợ giúp bạn điều gì?",
    category: "greeting",
    priority: 92
  },
  {
    keyword: "rất vui được gặp",
    response: "Xin chào! Tôi là trợ lý ảo của Giao Liên. Tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 96
  },
  {
    keyword: "rất vui được gặp",
    response: "Xin chào! Tôi đang sẵn sàng hỗ trợ bạn với các câu hỏi về Giao Liên.",
    category: "greeting",
    priority: 96
  },
  {
    keyword: "làm quen",
    response: "Chào bạn! Tôi là trợ lý ảo của Giao Liên, hãy cho tôi biết tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 85
  },
  {
    keyword: "làm quen",
    response: "Xin chào! Hôm nay bạn cần hỗ trợ về vấn đề gì?",
    category: "greeting",
    priority: 87
  },
  {
    keyword: "làm quen",
    response: "Chào bạn, rất vui được gặp lại! Tôi có thể trợ giúp bạn điều gì?",
    category: "greeting",
    priority: 98
  },
  {
    keyword: "gặp lại",
    response: "Xin chào! Bạn đang cần thông tin hoặc hỗ trợ về vấn đề gì?",
    category: "greeting",
    priority: 80
  },
  {
    keyword: "gặp lại",
    response: "Chào bạn! Tôi là trợ lý ảo của Giao Liên, hãy cho tôi biết tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 86
  },
  {
    keyword: "gặp lại",
    response: "Chào mừng bạn đến với hệ thống hỗ trợ Giao Liên. Tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 91
  },
  {
    keyword: "chào mừng",
    response: "Xin chào! Cảm ơn bạn đã liên hệ với bộ phận hỗ trợ Giao Liên.",
    category: "greeting",
    priority: 96
  },
  {
    keyword: "chào mừng",
    response: "Chào bạn! Tôi là trợ lý ảo của Giao Liên, hãy cho tôi biết tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 96
  },
  {
    keyword: "quay lại",
    response: "Xin chào! Tôi đang sẵn sàng hỗ trợ bạn với các câu hỏi về Giao Liên.",
    category: "greeting",
    priority: 92
  },
  {
    keyword: "quay lại",
    response: "Chào bạn! Tôi là trợ lý ảo của Giao Liên, hãy cho tôi biết tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 94
  },
  {
    keyword: "quay lại",
    response: "Xin chào! Cảm ơn bạn đã liên hệ với bộ phận hỗ trợ Giao Liên.",
    category: "greeting",
    priority: 96
  },
  {
    keyword: "trở lại",
    response: "Chào bạn! Tôi là trợ lý ảo của Giao Liên, hãy cho tôi biết tôi có thể giúp gì cho bạn?",
    category: "greeting",
    priority: 89
  },
  {
    keyword: "trở lại",
    response: "Xin chào! Tôi đang sẵn sàng hỗ trợ bạn với các câu hỏi về Giao Liên.",
    category: "greeting",
    priority: 91
  },
  {
    keyword: "cảm ơn",
    response: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Tôi luôn sẵn sàng hỗ trợ bạn!",
    category: "thanks",
    priority: 59
  },
  {
    keyword: "cảm ơn",
    response: "Không có gì! Tôi rất vui khi được giúp đỡ bạn. Chúc bạn một ngày tốt lành!",
    category: "thanks",
    priority: 69
  },
  {
    keyword: "thank",
    response: "Không có chi! Đó là nhiệm vụ của tôi. Bạn còn cần hỗ trợ gì nữa không?",
    category: "thanks",
    priority: 63
  },
  {
    keyword: "thank",
    response: "Đó là nhiệm vụ của tôi! Hy vọng bạn hài lòng với câu trả lời.",
    category: "thanks",
    priority: 71
  },
  {
    keyword: "thank",
    response: "Không cần cảm ơn đâu! Tôi luôn sẵn sàng hỗ trợ bạn khi cần.",
    category: "thanks",
    priority: 69
  },
  {
    keyword: "cảm ơn bạn",
    response: "Rất vui vì đã giúp được bạn. Nếu có câu hỏi nào khác, hãy liên hệ lại với tôi.",
    category: "thanks",
    priority: 73
  },
  {
    keyword: "cảm ơn bạn",
    response: "Đó là nhiệm vụ của tôi! Hy vọng bạn hài lòng với câu trả lời.",
    category: "thanks",
    priority: 67
  },
  {
    keyword: "cảm ơn bạn",
    response: "Rất vui khi giúp được bạn. Chúc bạn có trải nghiệm tốt với Giao Liên!",
    category: "thanks",
    priority: 55
  },
  {
    keyword: "cảm ơn rất nhiều",
    response: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Tôi luôn sẵn sàng hỗ trợ bạn!",
    category: "thanks",
    priority: 50
  },
  {
    keyword: "cảm ơn rất nhiều",
    response: "Đó là nhiệm vụ của tôi! Hy vọng bạn hài lòng với câu trả lời.",
    category: "thanks",
    priority: 77
  },
  {
    keyword: "rất cảm ơn",
    response: "Không cần cảm ơn đâu! Tôi luôn sẵn sàng hỗ trợ bạn khi cần.",
    category: "thanks",
    priority: 58
  },
  {
    keyword: "rất cảm ơn",
    response: "Rất vui khi giúp được bạn. Chúc bạn có trải nghiệm tốt với Giao Liên!",
    category: "thanks",
    priority: 74
  },
  {
    keyword: "rất cảm ơn",
    response: "Không có chi! Đó là nhiệm vụ của tôi. Bạn còn cần hỗ trợ gì nữa không?",
    category: "thanks",
    priority: 72
  },
  {
    keyword: "cảm ơn vì",
    response: "Không có gì! Rất vui khi được hỗ trợ bạn. Bạn cần giúp đỡ gì thêm không?",
    category: "thanks",
    priority: 69
  },
  {
    keyword: "cảm ơn vì",
    response: "Rất vui vì đã giúp được bạn. Nếu có câu hỏi nào khác, hãy liên hệ lại với tôi.",
    category: "thanks",
    priority: 70
  },
  {
    keyword: "cảm ơn vì",
    response: "Đó là nhiệm vụ của tôi! Hy vọng bạn hài lòng với câu trả lời.",
    category: "thanks",
    priority: 52
  },
  {
    keyword: "xin cảm ơn",
    response: "Rất vui khi được giúp đỡ bạn! Nếu có thắc mắc gì khác, đừng ngại hỏi nhé.",
    category: "thanks",
    priority: 54
  },
  {
    keyword: "xin cảm ơn",
    response: "Không có gì! Rất vui khi được hỗ trợ bạn. Bạn cần giúp đỡ gì thêm không?",
    category: "thanks",
    priority: 52
  },
  {
    keyword: "gửi lời cảm ơn",
    response: "Rất vui khi giúp được bạn. Chúc bạn có trải nghiệm tốt với Giao Liên!",
    category: "thanks",
    priority: 60
  },
  {
    keyword: "gửi lời cảm ơn",
    response: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Tôi luôn sẵn sàng hỗ trợ bạn!",
    category: "thanks",
    priority: 53
  },
  {
    keyword: "đa tạ",
    response: "Không có gì! Rất vui khi được hỗ trợ bạn. Bạn cần giúp đỡ gì thêm không?",
    category: "thanks",
    priority: 61
  },
  {
    keyword: "đa tạ",
    response: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Tôi luôn sẵn sàng hỗ trợ bạn!",
    category: "thanks",
    priority: 69
  },
  {
    keyword: "đa tạ",
    response: "Không cần cảm ơn đâu! Tôi luôn sẵn sàng hỗ trợ bạn khi cần.",
    category: "thanks",
    priority: 64
  },
  {
    keyword: "cảm kích",
    response: "Rất vui vì đã giúp được bạn. Nếu có câu hỏi nào khác, hãy liên hệ lại với tôi.",
    category: "thanks",
    priority: 67
  },
  {
    keyword: "cảm kích",
    response: "Đó là nhiệm vụ của tôi! Hy vọng bạn hài lòng với câu trả lời.",
    category: "thanks",
    priority: 74
  },
  {
    keyword: "cảm kích",
    response: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Tôi luôn sẵn sàng hỗ trợ bạn!",
    category: "thanks",
    priority: 54
  },
  {
    keyword: "biết ơn",
    response: "Không có gì! Rất vui khi được hỗ trợ bạn. Bạn cần giúp đỡ gì thêm không?",
    category: "thanks",
    priority: 69
  },
  {
    keyword: "biết ơn",
    response: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Tôi luôn sẵn sàng hỗ trợ bạn!",
    category: "thanks",
    priority: 77
  },
  {
    keyword: "biết ơn",
    response: "Rất vui khi giúp được bạn. Chúc bạn có trải nghiệm tốt với Giao Liên!",
    category: "thanks",
    priority: 66
  },
  {
    keyword: "trân trọng",
    response: "Rất vui vì đã giúp được bạn. Nếu có câu hỏi nào khác, hãy liên hệ lại với tôi.",
    category: "thanks",
    priority: 68
  },
  {
    keyword: "trân trọng",
    response: "Rất vui khi giúp được bạn. Chúc bạn có trải nghiệm tốt với Giao Liên!",
    category: "thanks",
    priority: 62
  },
  {
    keyword: "đánh giá cao",
    response: "Không có chi! Đó là nhiệm vụ của tôi. Bạn còn cần hỗ trợ gì nữa không?",
    category: "thanks",
    priority: 55
  },
  {
    keyword: "đánh giá cao",
    response: "Vui vì đã giúp được bạn! Đừng ngại liên hệ nếu bạn cần thêm thông tin.",
    category: "thanks",
    priority: 62
  },
  {
    keyword: "đánh giá cao",
    response: "Không cần cảm ơn đâu! Tôi luôn sẵn sàng hỗ trợ bạn khi cần.",
    category: "thanks",
    priority: 56
  },
  {
    keyword: "cảm ơn sự giúp đỡ",
    response: "Vui vì đã giúp được bạn! Đừng ngại liên hệ nếu bạn cần thêm thông tin.",
    category: "thanks",
    priority: 79
  },
  {
    keyword: "cảm ơn sự giúp đỡ",
    response: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Tôi luôn sẵn sàng hỗ trợ bạn!",
    category: "thanks",
    priority: 78
  },
  {
    keyword: "cảm ơn hỗ trợ",
    response: "Rất vui vì đã giúp được bạn. Nếu có câu hỏi nào khác, hãy liên hệ lại với tôi.",
    category: "thanks",
    priority: 56
  },
  {
    keyword: "cảm ơn hỗ trợ",
    response: "Không có chi! Đó là nhiệm vụ của tôi. Bạn còn cần hỗ trợ gì nữa không?",
    category: "thanks",
    priority: 68
  },
  {
    keyword: "cảm ơn hỗ trợ",
    response: "Không có gì! Tôi rất vui khi được giúp đỡ bạn. Chúc bạn một ngày tốt lành!",
    category: "thanks",
    priority: 68
  },
  {
    keyword: "thật tuyệt",
    response: "Không cần cảm ơn đâu! Tôi luôn sẵn sàng hỗ trợ bạn khi cần.",
    category: "thanks",
    priority: 53
  },
  {
    keyword: "thật tuyệt",
    response: "Không có gì! Tôi rất vui khi được giúp đỡ bạn. Chúc bạn một ngày tốt lành!",
    category: "thanks",
    priority: 74
  },
  {
    keyword: "thật tuyệt",
    response: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Tôi luôn sẵn sàng hỗ trợ bạn!",
    category: "thanks",
    priority: 50
  },
  {
    keyword: "tạm biệt",
    response: "Tạm biệt và cảm ơn bạn đã liên hệ với chúng tôi!",
    category: "goodbye",
    priority: 61
  },
  {
    keyword: "tạm biệt",
    response: "Chúc bạn một ngày vui vẻ! Hẹn gặp lại.",
    category: "goodbye",
    priority: 54
  },
  {
    keyword: "tạm biệt",
    response: "Tạm biệt! Hy vọng đã giải đáp được thắc mắc của bạn.",
    category: "goodbye",
    priority: 54
  },
  {
    keyword: "bye",
    response: "Tạm biệt bạn! Chúc bạn một ngày tốt lành.",
    category: "goodbye",
    priority: 52
  },
  {
    keyword: "bye",
    response: "Tạm biệt và chúc bạn thành công với dự án của mình!",
    category: "goodbye",
    priority: 54
  },
  {
    keyword: "chào tạm biệt",
    response: "Chào tạm biệt! Nếu cần hỗ trợ thêm, đừng ngại liên hệ lại nhé.",
    category: "goodbye",
    priority: 61
  },
  {
    keyword: "chào tạm biệt",
    response: "Chào tạm biệt! Rất vui vì đã hỗ trợ được bạn hôm nay.",
    category: "goodbye",
    priority: 72
  },
  {
    keyword: "chào tạm biệt",
    response: "Chào tạm biệt! Rất vui được trò chuyện với bạn.",
    category: "goodbye",
    priority: 57
  },
  {
    keyword: "hẹn gặp lại",
    response: "Tạm biệt! Hẹn gặp lại bạn sớm.",
    category: "goodbye",
    priority: 65
  },
  {
    keyword: "hẹn gặp lại",
    response: "Tạm biệt và chúc bạn thành công với dự án của mình!",
    category: "goodbye",
    priority: 75
  },
  {
    keyword: "hẹn gặp lại",
    response: "Chào tạm biệt! Rất vui vì đã hỗ trợ được bạn hôm nay.",
    category: "goodbye",
    priority: 61
  },
  {
    keyword: "gặp lại sau",
    response: "Chào tạm biệt! Rất vui vì đã hỗ trợ được bạn hôm nay.",
    category: "goodbye",
    priority: 58
  },
  {
    keyword: "gặp lại sau",
    response: "Tạm biệt và chúc bạn thành công với dự án của mình!",
    category: "goodbye",
    priority: 76
  },
  {
    keyword: "gặp lại sau",
    response: "Chào tạm biệt! Rất vui được trò chuyện với bạn.",
    category: "goodbye",
    priority: 79
  },
  {
    keyword: "chúc ngày tốt lành",
    response: "Chào tạm biệt! Rất vui vì đã hỗ trợ được bạn hôm nay.",
    category: "goodbye",
    priority: 63
  },
  {
    keyword: "chúc ngày tốt lành",
    response: "Tạm biệt! Hẹn gặp lại bạn sớm.",
    category: "goodbye",
    priority: 68
  },
  {
    keyword: "chúc ngày tốt lành",
    response: "Tạm biệt! Hy vọng đã giải đáp được thắc mắc của bạn.",
    category: "goodbye",
    priority: 78
  },
  {
    keyword: "chúc buổi tối vui vẻ",
    response: "Chào tạm biệt! Rất vui vì đã hỗ trợ được bạn hôm nay.",
    category: "goodbye",
    priority: 68
  },
  {
    keyword: "chúc buổi tối vui vẻ",
    response: "Chúc bạn một ngày vui vẻ! Hẹn gặp lại.",
    category: "goodbye",
    priority: 65
  },
  {
    keyword: "tối nay nói chuyện tiếp",
    response: "Tạm biệt! Hy vọng đã giải đáp được thắc mắc của bạn.",
    category: "goodbye",
    priority: 69
  },
  {
    keyword: "tối nay nói chuyện tiếp",
    response: "Hẹn gặp lại bạn! Đừng quên liên hệ nếu cần thêm hỗ trợ.",
    category: "goodbye",
    priority: 75
  },
  {
    keyword: "đi đây",
    response: "Tạm biệt và chúc bạn thành công với dự án của mình!",
    category: "goodbye",
    priority: 66
  },
  {
    keyword: "đi đây",
    response: "Chúc bạn một ngày vui vẻ! Hẹn gặp lại.",
    category: "goodbye",
    priority: 61
  },
  {
    keyword: "đi đây",
    response: "Tạm biệt! Hẹn gặp lại bạn sớm.",
    category: "goodbye",
    priority: 66
  },
  {
    keyword: "kết thúc",
    response: "Chào tạm biệt! Rất vui được trò chuyện với bạn.",
    category: "goodbye",
    priority: 70
  },
  {
    keyword: "kết thúc",
    response: "Tạm biệt! Hẹn gặp lại bạn sớm.",
    category: "goodbye",
    priority: 79
  },
  {
    keyword: "kết thúc",
    response: "Tạm biệt và cảm ơn bạn đã liên hệ với chúng tôi!",
    category: "goodbye",
    priority: 54
  },
  {
    keyword: "kết thúc cuộc trò chuyện",
    response: "Chào tạm biệt! Rất vui vì đã hỗ trợ được bạn hôm nay.",
    category: "goodbye",
    priority: 59
  },
  {
    keyword: "kết thúc cuộc trò chuyện",
    response: "Tạm biệt và cảm ơn bạn đã liên hệ với chúng tôi!",
    category: "goodbye",
    priority: 75
  },
  {
    keyword: "mai gặp lại",
    response: "Chúc bạn một ngày vui vẻ! Hẹn gặp lại.",
    category: "goodbye",
    priority: 51
  },
  {
    keyword: "mai gặp lại",
    response: "Hẹn gặp lại bạn! Đừng quên liên hệ nếu cần thêm hỗ trợ.",
    category: "goodbye",
    priority: 52
  },
  {
    keyword: "mai gặp lại",
    response: "Chào tạm biệt! Rất vui được trò chuyện với bạn.",
    category: "goodbye",
    priority: 72
  },
  {
    keyword: "hẹn sớm gặp lại",
    response: "Tạm biệt và chúc bạn thành công với dự án của mình!",
    category: "goodbye",
    priority: 50
  },
  {
    keyword: "hẹn sớm gặp lại",
    response: "Hẹn gặp lại bạn! Đừng quên liên hệ nếu cần thêm hỗ trợ.",
    category: "goodbye",
    priority: 67
  },
  {
    keyword: "tạm biệt nhé",
    response: "Chào tạm biệt! Rất vui được trò chuyện với bạn.",
    category: "goodbye",
    priority: 60
  },
  {
    keyword: "tạm biệt nhé",
    response: "Tạm biệt và chúc bạn thành công với dự án của mình!",
    category: "goodbye",
    priority: 62
  },
  {
    keyword: "tạm biệt nhé",
    response: "Chào tạm biệt! Nếu cần hỗ trợ thêm, đừng ngại liên hệ lại nhé.",
    category: "goodbye",
    priority: 74
  },
  {
    keyword: "sẽ nói chuyện sau",
    response: "Tạm biệt và chúc bạn thành công với dự án của mình!",
    category: "goodbye",
    priority: 58
  },
  {
    keyword: "sẽ nói chuyện sau",
    response: "Chào tạm biệt! Rất vui được trò chuyện với bạn.",
    category: "goodbye",
    priority: 64
  },
  {
    keyword: "sẽ nói chuyện sau",
    response: "Tạm biệt! Hy vọng đã giải đáp được thắc mắc của bạn.",
    category: "goodbye",
    priority: 75
  },
  {
    keyword: "hướng dẫn",
    response: "Chúng tôi đang phát triển thông tin về help. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "help",
    priority: 74
  },
  {
    keyword: "hướng dẫn",
    response: "help là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "help",
    priority: 50
  },
  {
    keyword: "hướng dẫn",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về help.",
    category: "help",
    priority: 65
  },
  {
    keyword: "giúp đỡ",
    response: "Chúng tôi đang phát triển thông tin về help. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "help",
    priority: 50
  },
  {
    keyword: "giúp đỡ",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về help.",
    category: "help",
    priority: 70
  },
  {
    keyword: "giúp đỡ",
    response: "Chúng tôi có nhiều tài liệu về help. Bạn muốn biết thêm về khía cạnh nào?",
    category: "help",
    priority: 70
  },
  {
    keyword: "help",
    response: "Cảm ơn bạn đã liên hệ về help. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "help",
    priority: 76
  },
  {
    keyword: "help",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về help.",
    category: "help",
    priority: 60
  },
  {
    keyword: "trợ giúp",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về help.",
    category: "help",
    priority: 78
  },
  {
    keyword: "trợ giúp",
    response: "help là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "help",
    priority: 63
  },
  {
    keyword: "trợ giúp",
    response: "Cảm ơn bạn đã liên hệ về help. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "help",
    priority: 78
  },
  {
    keyword: "cần giúp",
    response: "Cảm ơn bạn đã liên hệ về help. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "help",
    priority: 79
  },
  {
    keyword: "cần giúp",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về help.",
    category: "help",
    priority: 74
  },
  {
    keyword: "cần giúp",
    response: "help là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "help",
    priority: 52
  },
  {
    keyword: "cần hỗ trợ",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về help.",
    category: "help",
    priority: 68
  },
  {
    keyword: "cần hỗ trợ",
    response: "Chúng tôi đang phát triển thông tin về help. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "help",
    priority: 64
  },
  {
    keyword: "cần hỗ trợ",
    response: "Chúng tôi có nhiều tài liệu về help. Bạn muốn biết thêm về khía cạnh nào?",
    category: "help",
    priority: 68
  },
  {
    keyword: "làm thế nào",
    response: "Cảm ơn bạn đã liên hệ về help. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "help",
    priority: 73
  },
  {
    keyword: "làm thế nào",
    response: "help là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "help",
    priority: 50
  },
  {
    keyword: "làm thế nào",
    response: "Chúng tôi có nhiều tài liệu về help. Bạn muốn biết thêm về khía cạnh nào?",
    category: "help",
    priority: 63
  },
  {
    keyword: "hỗ trợ",
    response: "Cảm ơn bạn đã liên hệ về help. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "help",
    priority: 76
  },
  {
    keyword: "hỗ trợ",
    response: "Chúng tôi đang phát triển thông tin về help. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "help",
    priority: 54
  },
  {
    keyword: "hỗ trợ",
    response: "help là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "help",
    priority: 73
  },
  {
    keyword: "giải thích",
    response: "Chúng tôi đang phát triển thông tin về help. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "help",
    priority: 68
  },
  {
    keyword: "giải thích",
    response: "Chúng tôi có nhiều tài liệu về help. Bạn muốn biết thêm về khía cạnh nào?",
    category: "help",
    priority: 61
  },
  {
    keyword: "không hiểu",
    response: "Cảm ơn bạn đã liên hệ về help. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "help",
    priority: 60
  },
  {
    keyword: "không hiểu",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về help.",
    category: "help",
    priority: 74
  },
  {
    keyword: "hướng dẫn sử dụng",
    response: "Chúng tôi đang phát triển thông tin về help. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "help",
    priority: 70
  },
  {
    keyword: "hướng dẫn sử dụng",
    response: "help là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "help",
    priority: 50
  },
  {
    keyword: "không biết cách",
    response: "help là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "help",
    priority: 51
  },
  {
    keyword: "không biết cách",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về help.",
    category: "help",
    priority: 79
  },
  {
    keyword: "không biết cách",
    response: "Chúng tôi đang phát triển thông tin về help. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "help",
    priority: 53
  },
  {
    keyword: "cách để",
    response: "Cảm ơn bạn đã liên hệ về help. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "help",
    priority: 71
  },
  {
    keyword: "cách để",
    response: "Chúng tôi có nhiều tài liệu về help. Bạn muốn biết thêm về khía cạnh nào?",
    category: "help",
    priority: 77
  },
  {
    keyword: "cách để",
    response: "Chúng tôi đang phát triển thông tin về help. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "help",
    priority: 60
  },
  {
    keyword: "cần chỉ dẫn",
    response: "help là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "help",
    priority: 72
  },
  {
    keyword: "cần chỉ dẫn",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về help.",
    category: "help",
    priority: 65
  },
  {
    keyword: "cần chỉ dẫn",
    response: "Chúng tôi đang phát triển thông tin về help. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "help",
    priority: 72
  },
  {
    keyword: "cách dùng",
    response: "Cảm ơn bạn đã liên hệ về help. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "help",
    priority: 56
  },
  {
    keyword: "cách dùng",
    response: "help là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "help",
    priority: 56
  },
  {
    keyword: "hướng dẫn chi tiết",
    response: "Chúng tôi có nhiều tài liệu về help. Bạn muốn biết thêm về khía cạnh nào?",
    category: "help",
    priority: 55
  },
  {
    keyword: "hướng dẫn chi tiết",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về help.",
    category: "help",
    priority: 69
  },
  {
    keyword: "hướng dẫn chi tiết",
    response: "Cảm ơn bạn đã liên hệ về help. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "help",
    priority: 66
  },
  {
    keyword: "manual",
    response: "help là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "help",
    priority: 75
  },
  {
    keyword: "manual",
    response: "Cảm ơn bạn đã liên hệ về help. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "help",
    priority: 78
  },
  {
    keyword: "thắc mắc",
    response: "Chúng tôi có nhiều tài liệu về help. Bạn muốn biết thêm về khía cạnh nào?",
    category: "help",
    priority: 76
  },
  {
    keyword: "thắc mắc",
    response: "help là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "help",
    priority: 66
  },
  {
    keyword: "thắc mắc",
    response: "Chúng tôi đang phát triển thông tin về help. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "help",
    priority: 77
  },
  {
    keyword: "câu hỏi",
    response: "Chúng tôi đang phát triển thông tin về help. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "help",
    priority: 63
  },
  {
    keyword: "câu hỏi",
    response: "Chúng tôi có nhiều tài liệu về help. Bạn muốn biết thêm về khía cạnh nào?",
    category: "help",
    priority: 77
  },
  {
    keyword: "câu hỏi",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về help.",
    category: "help",
    priority: 53
  },
  {
    keyword: "lỗi",
    response: "Cảm ơn bạn đã liên hệ về error. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "error",
    priority: 83
  },
  {
    keyword: "lỗi",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 89
  },
  {
    keyword: "lỗi",
    response: "error là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "error",
    priority: 88
  },
  {
    keyword: "error",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về error.",
    category: "error",
    priority: 76
  },
  {
    keyword: "error",
    response: "Cảm ơn bạn đã liên hệ về error. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "error",
    priority: 77
  },
  {
    keyword: "error",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 79
  },
  {
    keyword: "bug",
    response: "error là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "error",
    priority: 83
  },
  {
    keyword: "bug",
    response: "Chúng tôi đang phát triển thông tin về error. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "error",
    priority: 76
  },
  {
    keyword: "bug",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 82
  },
  {
    keyword: "vấn đề",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 81
  },
  {
    keyword: "vấn đề",
    response: "error là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "error",
    priority: 76
  },
  {
    keyword: "không hoạt động",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 86
  },
  {
    keyword: "không hoạt động",
    response: "Cảm ơn bạn đã liên hệ về error. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "error",
    priority: 78
  },
  {
    keyword: "hỏng",
    response: "Chúng tôi đang phát triển thông tin về error. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "error",
    priority: 84
  },
  {
    keyword: "hỏng",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 89
  },
  {
    keyword: "hỏng",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về error.",
    category: "error",
    priority: 82
  },
  {
    keyword: "trục trặc",
    response: "Cảm ơn bạn đã liên hệ về error. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "error",
    priority: 89
  },
  {
    keyword: "trục trặc",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về error.",
    category: "error",
    priority: 77
  },
  {
    keyword: "sự cố",
    response: "Chúng tôi đang phát triển thông tin về error. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "error",
    priority: 76
  },
  {
    keyword: "sự cố",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 84
  },
  {
    keyword: "sự cố",
    response: "error là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "error",
    priority: 79
  },
  {
    keyword: "lỗi kết nối",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về error.",
    category: "error",
    priority: 82
  },
  {
    keyword: "lỗi kết nối",
    response: "Cảm ơn bạn đã liên hệ về error. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "error",
    priority: 88
  },
  {
    keyword: "lỗi đăng nhập",
    response: "error là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "error",
    priority: 80
  },
  {
    keyword: "lỗi đăng nhập",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 88
  },
  {
    keyword: "không vào được",
    response: "error là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "error",
    priority: 88
  },
  {
    keyword: "không vào được",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 78
  },
  {
    keyword: "không vào được",
    response: "Chúng tôi đang phát triển thông tin về error. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "error",
    priority: 80
  },
  {
    keyword: "bị lỗi",
    response: "Cảm ơn bạn đã liên hệ về error. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "error",
    priority: 81
  },
  {
    keyword: "bị lỗi",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về error.",
    category: "error",
    priority: 87
  },
  {
    keyword: "lỗi hệ thống",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 80
  },
  {
    keyword: "lỗi hệ thống",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về error.",
    category: "error",
    priority: 81
  },
  {
    keyword: "gặp khó khăn",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về error.",
    category: "error",
    priority: 80
  },
  {
    keyword: "gặp khó khăn",
    response: "Chúng tôi đang phát triển thông tin về error. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "error",
    priority: 85
  },
  {
    keyword: "gặp khó khăn",
    response: "Cảm ơn bạn đã liên hệ về error. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "error",
    priority: 83
  },
  {
    keyword: "không thành công",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 89
  },
  {
    keyword: "không thành công",
    response: "Cảm ơn bạn đã liên hệ về error. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "error",
    priority: 79
  },
  {
    keyword: "thất bại",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 88
  },
  {
    keyword: "thất bại",
    response: "Chúng tôi đang phát triển thông tin về error. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "error",
    priority: 89
  },
  {
    keyword: "thất bại",
    response: "Cảm ơn bạn đã liên hệ về error. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "error",
    priority: 83
  },
  {
    keyword: "phát sinh lỗi",
    response: "Cảm ơn bạn đã liên hệ về error. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "error",
    priority: 75
  },
  {
    keyword: "phát sinh lỗi",
    response: "error là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "error",
    priority: 86
  },
  {
    keyword: "báo lỗi",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 88
  },
  {
    keyword: "báo lỗi",
    response: "error là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "error",
    priority: 89
  },
  {
    keyword: "lỗi khi",
    response: "error là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "error",
    priority: 88
  },
  {
    keyword: "lỗi khi",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về error.",
    category: "error",
    priority: 80
  },
  {
    keyword: "không thể",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 81
  },
  {
    keyword: "không thể",
    response: "error là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "error",
    priority: 77
  },
  {
    keyword: "không đúng",
    response: "Cảm ơn bạn đã liên hệ về error. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "error",
    priority: 81
  },
  {
    keyword: "không đúng",
    response: "Chúng tôi đang phát triển thông tin về error. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "error",
    priority: 79
  },
  {
    keyword: "không đúng",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 77
  },
  {
    keyword: "sai",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về error.",
    category: "error",
    priority: 83
  },
  {
    keyword: "sai",
    response: "Cảm ơn bạn đã liên hệ về error. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "error",
    priority: 88
  },
  {
    keyword: "sai",
    response: "error là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "error",
    priority: 87
  },
  {
    keyword: "hỏng",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 79
  },
  {
    keyword: "hỏng",
    response: "Cảm ơn bạn đã liên hệ về error. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "error",
    priority: 81
  },
  {
    keyword: "lỗi 404",
    response: "Chúng tôi đang phát triển thông tin về error. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "error",
    priority: 82
  },
  {
    keyword: "lỗi 404",
    response: "error là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "error",
    priority: 79
  },
  {
    keyword: "lỗi 404",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 85
  },
  {
    keyword: "lỗi 500",
    response: "Chúng tôi có nhiều tài liệu về error. Bạn muốn biết thêm về khía cạnh nào?",
    category: "error",
    priority: 81
  },
  {
    keyword: "lỗi 500",
    response: "Chúng tôi đang phát triển thông tin về error. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "error",
    priority: 87
  },
  {
    keyword: "lỗi 500",
    response: "Cảm ơn bạn đã liên hệ về error. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "error",
    priority: 82
  },
  {
    keyword: "không tìm thấy",
    response: "Cảm ơn bạn đã liên hệ về error. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "error",
    priority: 89
  },
  {
    keyword: "không tìm thấy",
    response: "error là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "error",
    priority: 76
  },
  {
    keyword: "không tìm thấy",
    response: "Chúng tôi đang phát triển thông tin về error. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "error",
    priority: 79
  },
  {
    keyword: "tài khoản",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về account.",
    category: "account",
    priority: 77
  },
  {
    keyword: "tài khoản",
    response: "Cảm ơn bạn đã liên hệ về account. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "account",
    priority: 71
  },
  {
    keyword: "account",
    response: "Chúng tôi đang phát triển thông tin về account. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "account",
    priority: 81
  },
  {
    keyword: "account",
    response: "account là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "account",
    priority: 75
  },
  {
    keyword: "đăng nhập",
    response: "Chúng tôi đang phát triển thông tin về account. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "account",
    priority: 74
  },
  {
    keyword: "đăng nhập",
    response: "Cảm ơn bạn đã liên hệ về account. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "account",
    priority: 76
  },
  {
    keyword: "đăng nhập",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về account.",
    category: "account",
    priority: 84
  },
  {
    keyword: "đăng ký",
    response: "Cảm ơn bạn đã liên hệ về account. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "account",
    priority: 75
  },
  {
    keyword: "đăng ký",
    response: "account là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "account",
    priority: 80
  },
  {
    keyword: "tạo tài khoản",
    response: "Chúng tôi có nhiều tài liệu về account. Bạn muốn biết thêm về khía cạnh nào?",
    category: "account",
    priority: 70
  },
  {
    keyword: "tạo tài khoản",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về account.",
    category: "account",
    priority: 79
  },
  {
    keyword: "tạo tài khoản",
    response: "Chúng tôi đang phát triển thông tin về account. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "account",
    priority: 77
  },
  {
    keyword: "mật khẩu",
    response: "Chúng tôi có nhiều tài liệu về account. Bạn muốn biết thêm về khía cạnh nào?",
    category: "account",
    priority: 76
  },
  {
    keyword: "mật khẩu",
    response: "Cảm ơn bạn đã liên hệ về account. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "account",
    priority: 84
  },
  {
    keyword: "quên mật khẩu",
    response: "account là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "account",
    priority: 84
  },
  {
    keyword: "quên mật khẩu",
    response: "Chúng tôi có nhiều tài liệu về account. Bạn muốn biết thêm về khía cạnh nào?",
    category: "account",
    priority: 72
  },
  {
    keyword: "quên mật khẩu",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về account.",
    category: "account",
    priority: 70
  },
  {
    keyword: "đổi mật khẩu",
    response: "Chúng tôi có nhiều tài liệu về account. Bạn muốn biết thêm về khía cạnh nào?",
    category: "account",
    priority: 77
  },
  {
    keyword: "đổi mật khẩu",
    response: "Cảm ơn bạn đã liên hệ về account. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "account",
    priority: 74
  },
  {
    keyword: "đổi mật khẩu",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về account.",
    category: "account",
    priority: 73
  },
  {
    keyword: "reset password",
    response: "Chúng tôi đang phát triển thông tin về account. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "account",
    priority: 76
  },
  {
    keyword: "reset password",
    response: "account là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "account",
    priority: 76
  },
  {
    keyword: "khóa tài khoản",
    response: "Cảm ơn bạn đã liên hệ về account. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "account",
    priority: 78
  },
  {
    keyword: "khóa tài khoản",
    response: "account là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "account",
    priority: 79
  },
  {
    keyword: "kích hoạt tài khoản",
    response: "Chúng tôi có nhiều tài liệu về account. Bạn muốn biết thêm về khía cạnh nào?",
    category: "account",
    priority: 78
  },
  {
    keyword: "kích hoạt tài khoản",
    response: "Cảm ơn bạn đã liên hệ về account. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "account",
    priority: 82
  },
  {
    keyword: "kích hoạt tài khoản",
    response: "Chúng tôi đang phát triển thông tin về account. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "account",
    priority: 78
  },
  {
    keyword: "xác minh tài khoản",
    response: "account là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "account",
    priority: 84
  },
  {
    keyword: "xác minh tài khoản",
    response: "Chúng tôi đang phát triển thông tin về account. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "account",
    priority: 73
  },
  {
    keyword: "đăng xuất",
    response: "account là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "account",
    priority: 73
  },
  {
    keyword: "đăng xuất",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về account.",
    category: "account",
    priority: 74
  },
  {
    keyword: "đăng xuất",
    response: "Chúng tôi có nhiều tài liệu về account. Bạn muốn biết thêm về khía cạnh nào?",
    category: "account",
    priority: 79
  },
  {
    keyword: "thông tin tài khoản",
    response: "account là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "account",
    priority: 84
  },
  {
    keyword: "thông tin tài khoản",
    response: "Chúng tôi có nhiều tài liệu về account. Bạn muốn biết thêm về khía cạnh nào?",
    category: "account",
    priority: 83
  },
  {
    keyword: "thông tin tài khoản",
    response: "Cảm ơn bạn đã liên hệ về account. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "account",
    priority: 82
  },
  {
    keyword: "hồ sơ",
    response: "account là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "account",
    priority: 84
  },
  {
    keyword: "hồ sơ",
    response: "Chúng tôi có nhiều tài liệu về account. Bạn muốn biết thêm về khía cạnh nào?",
    category: "account",
    priority: 75
  },
  {
    keyword: "hồ sơ",
    response: "Chúng tôi đang phát triển thông tin về account. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "account",
    priority: 81
  },
  {
    keyword: "profile",
    response: "Chúng tôi có nhiều tài liệu về account. Bạn muốn biết thêm về khía cạnh nào?",
    category: "account",
    priority: 74
  },
  {
    keyword: "profile",
    response: "Cảm ơn bạn đã liên hệ về account. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "account",
    priority: 80
  },
  {
    keyword: "email",
    response: "Chúng tôi có nhiều tài liệu về account. Bạn muốn biết thêm về khía cạnh nào?",
    category: "account",
    priority: 81
  },
  {
    keyword: "email",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về account.",
    category: "account",
    priority: 75
  },
  {
    keyword: "email",
    response: "Chúng tôi đang phát triển thông tin về account. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "account",
    priority: 79
  },
  {
    keyword: "tên đăng nhập",
    response: "Chúng tôi đang phát triển thông tin về account. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "account",
    priority: 82
  },
  {
    keyword: "tên đăng nhập",
    response: "Cảm ơn bạn đã liên hệ về account. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "account",
    priority: 74
  },
  {
    keyword: "tên đăng nhập",
    response: "Chúng tôi có nhiều tài liệu về account. Bạn muốn biết thêm về khía cạnh nào?",
    category: "account",
    priority: 81
  },
  {
    keyword: "username",
    response: "account là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "account",
    priority: 78
  },
  {
    keyword: "username",
    response: "Chúng tôi đang phát triển thông tin về account. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "account",
    priority: 76
  },
  {
    keyword: "username",
    response: "Chúng tôi có nhiều tài liệu về account. Bạn muốn biết thêm về khía cạnh nào?",
    category: "account",
    priority: 80
  },
  {
    keyword: "tên người dùng",
    response: "Chúng tôi có nhiều tài liệu về account. Bạn muốn biết thêm về khía cạnh nào?",
    category: "account",
    priority: 81
  },
  {
    keyword: "tên người dùng",
    response: "Cảm ơn bạn đã liên hệ về account. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "account",
    priority: 72
  },
  {
    keyword: "thông tin cá nhân",
    response: "Chúng tôi đang phát triển thông tin về account. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "account",
    priority: 79
  },
  {
    keyword: "thông tin cá nhân",
    response: "Cảm ơn bạn đã liên hệ về account. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "account",
    priority: 70
  },
  {
    keyword: "cập nhật thông tin",
    response: "Chúng tôi đang phát triển thông tin về account. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "account",
    priority: 84
  },
  {
    keyword: "cập nhật thông tin",
    response: "account là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "account",
    priority: 75
  },
  {
    keyword: "xóa tài khoản",
    response: "Cảm ơn bạn đã liên hệ về account. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "account",
    priority: 84
  },
  {
    keyword: "xóa tài khoản",
    response: "Chúng tôi đang phát triển thông tin về account. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "account",
    priority: 76
  },
  {
    keyword: "cài đặt",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về settings.",
    category: "settings",
    priority: 64
  },
  {
    keyword: "cài đặt",
    response: "Cảm ơn bạn đã liên hệ về settings. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "settings",
    priority: 67
  },
  {
    keyword: "settings",
    response: "Chúng tôi có nhiều tài liệu về settings. Bạn muốn biết thêm về khía cạnh nào?",
    category: "settings",
    priority: 68
  },
  {
    keyword: "settings",
    response: "Chúng tôi đang phát triển thông tin về settings. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "settings",
    priority: 59
  },
  {
    keyword: "tùy chỉnh",
    response: "Cảm ơn bạn đã liên hệ về settings. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "settings",
    priority: 74
  },
  {
    keyword: "tùy chỉnh",
    response: "settings là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "settings",
    priority: 50
  },
  {
    keyword: "tùy chỉnh",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về settings.",
    category: "settings",
    priority: 51
  },
  {
    keyword: "thiết lập",
    response: "settings là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "settings",
    priority: 77
  },
  {
    keyword: "thiết lập",
    response: "Chúng tôi có nhiều tài liệu về settings. Bạn muốn biết thêm về khía cạnh nào?",
    category: "settings",
    priority: 66
  },
  {
    keyword: "thiết lập",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về settings.",
    category: "settings",
    priority: 72
  },
  {
    keyword: "thay đổi",
    response: "settings là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "settings",
    priority: 61
  },
  {
    keyword: "thay đổi",
    response: "Cảm ơn bạn đã liên hệ về settings. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "settings",
    priority: 54
  },
  {
    keyword: "thay đổi",
    response: "Chúng tôi có nhiều tài liệu về settings. Bạn muốn biết thêm về khía cạnh nào?",
    category: "settings",
    priority: 62
  },
  {
    keyword: "cấu hình",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về settings.",
    category: "settings",
    priority: 57
  },
  {
    keyword: "cấu hình",
    response: "Chúng tôi có nhiều tài liệu về settings. Bạn muốn biết thêm về khía cạnh nào?",
    category: "settings",
    priority: 73
  },
  {
    keyword: "tùy biến",
    response: "settings là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "settings",
    priority: 58
  },
  {
    keyword: "tùy biến",
    response: "Cảm ơn bạn đã liên hệ về settings. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "settings",
    priority: 51
  },
  {
    keyword: "điều chỉnh",
    response: "Chúng tôi đang phát triển thông tin về settings. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "settings",
    priority: 73
  },
  {
    keyword: "điều chỉnh",
    response: "Cảm ơn bạn đã liên hệ về settings. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "settings",
    priority: 56
  },
  {
    keyword: "set up",
    response: "Chúng tôi đang phát triển thông tin về settings. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "settings",
    priority: 74
  },
  {
    keyword: "set up",
    response: "settings là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "settings",
    priority: 62
  },
  {
    keyword: "set up",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về settings.",
    category: "settings",
    priority: 77
  },
  {
    keyword: "config",
    response: "Chúng tôi có nhiều tài liệu về settings. Bạn muốn biết thêm về khía cạnh nào?",
    category: "settings",
    priority: 78
  },
  {
    keyword: "config",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về settings.",
    category: "settings",
    priority: 50
  },
  {
    keyword: "preferences",
    response: "Cảm ơn bạn đã liên hệ về settings. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "settings",
    priority: 51
  },
  {
    keyword: "preferences",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về settings.",
    category: "settings",
    priority: 68
  },
  {
    keyword: "options",
    response: "settings là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "settings",
    priority: 68
  },
  {
    keyword: "options",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về settings.",
    category: "settings",
    priority: 51
  },
  {
    keyword: "options",
    response: "Chúng tôi đang phát triển thông tin về settings. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "settings",
    priority: 66
  },
  {
    keyword: "chọn lựa",
    response: "Chúng tôi đang phát triển thông tin về settings. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "settings",
    priority: 50
  },
  {
    keyword: "chọn lựa",
    response: "Chúng tôi có nhiều tài liệu về settings. Bạn muốn biết thêm về khía cạnh nào?",
    category: "settings",
    priority: 56
  },
  {
    keyword: "chọn lựa",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về settings.",
    category: "settings",
    priority: 67
  },
  {
    keyword: "phương thức",
    response: "settings là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "settings",
    priority: 62
  },
  {
    keyword: "phương thức",
    response: "Cảm ơn bạn đã liên hệ về settings. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "settings",
    priority: 52
  },
  {
    keyword: "phương thức",
    response: "Chúng tôi có nhiều tài liệu về settings. Bạn muốn biết thêm về khía cạnh nào?",
    category: "settings",
    priority: 79
  },
  {
    keyword: "thay đổi cài đặt",
    response: "settings là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "settings",
    priority: 73
  },
  {
    keyword: "thay đổi cài đặt",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về settings.",
    category: "settings",
    priority: 63
  },
  {
    keyword: "thay đổi thiết lập",
    response: "Cảm ơn bạn đã liên hệ về settings. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "settings",
    priority: 72
  },
  {
    keyword: "thay đổi thiết lập",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về settings.",
    category: "settings",
    priority: 79
  },
  {
    keyword: "thay đổi thiết lập",
    response: "Chúng tôi có nhiều tài liệu về settings. Bạn muốn biết thêm về khía cạnh nào?",
    category: "settings",
    priority: 74
  },
  {
    keyword: "thay đổi thông tin",
    response: "settings là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "settings",
    priority: 58
  },
  {
    keyword: "thay đổi thông tin",
    response: "Chúng tôi đang phát triển thông tin về settings. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "settings",
    priority: 73
  },
  {
    keyword: "thay đổi thông tin",
    response: "Cảm ơn bạn đã liên hệ về settings. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "settings",
    priority: 60
  },
  {
    keyword: "tính năng",
    response: "Chúng tôi đang phát triển thông tin về features. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "features",
    priority: 75
  },
  {
    keyword: "tính năng",
    response: "Chúng tôi có nhiều tài liệu về features. Bạn muốn biết thêm về khía cạnh nào?",
    category: "features",
    priority: 65
  },
  {
    keyword: "tính năng",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về features.",
    category: "features",
    priority: 73
  },
  {
    keyword: "chức năng",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về features.",
    category: "features",
    priority: 74
  },
  {
    keyword: "chức năng",
    response: "features là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "features",
    priority: 77
  },
  {
    keyword: "features",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về features.",
    category: "features",
    priority: 67
  },
  {
    keyword: "features",
    response: "Cảm ơn bạn đã liên hệ về features. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "features",
    priority: 77
  },
  {
    keyword: "function",
    response: "Chúng tôi đang phát triển thông tin về features. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "features",
    priority: 60
  },
  {
    keyword: "function",
    response: "features là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "features",
    priority: 73
  },
  {
    keyword: "khả năng",
    response: "features là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "features",
    priority: 77
  },
  {
    keyword: "khả năng",
    response: "Cảm ơn bạn đã liên hệ về features. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "features",
    priority: 65
  },
  {
    keyword: "công cụ",
    response: "Chúng tôi đang phát triển thông tin về features. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "features",
    priority: 78
  },
  {
    keyword: "công cụ",
    response: "features là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "features",
    priority: 76
  },
  {
    keyword: "tiện ích",
    response: "Chúng tôi có nhiều tài liệu về features. Bạn muốn biết thêm về khía cạnh nào?",
    category: "features",
    priority: 58
  },
  {
    keyword: "tiện ích",
    response: "features là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "features",
    priority: 71
  },
  {
    keyword: "tiện ích",
    response: "Cảm ơn bạn đã liên hệ về features. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "features",
    priority: 64
  },
  {
    keyword: "module",
    response: "Chúng tôi có nhiều tài liệu về features. Bạn muốn biết thêm về khía cạnh nào?",
    category: "features",
    priority: 73
  },
  {
    keyword: "module",
    response: "features là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "features",
    priority: 72
  },
  {
    keyword: "phần mềm",
    response: "features là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "features",
    priority: 70
  },
  {
    keyword: "phần mềm",
    response: "Chúng tôi có nhiều tài liệu về features. Bạn muốn biết thêm về khía cạnh nào?",
    category: "features",
    priority: 58
  },
  {
    keyword: "ứng dụng",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về features.",
    category: "features",
    priority: 53
  },
  {
    keyword: "ứng dụng",
    response: "features là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "features",
    priority: 76
  },
  {
    keyword: "extension",
    response: "Cảm ơn bạn đã liên hệ về features. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "features",
    priority: 55
  },
  {
    keyword: "extension",
    response: "Chúng tôi đang phát triển thông tin về features. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "features",
    priority: 67
  },
  {
    keyword: "extension",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về features.",
    category: "features",
    priority: 75
  },
  {
    keyword: "plugin",
    response: "Chúng tôi có nhiều tài liệu về features. Bạn muốn biết thêm về khía cạnh nào?",
    category: "features",
    priority: 73
  },
  {
    keyword: "plugin",
    response: "Chúng tôi đang phát triển thông tin về features. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "features",
    priority: 64
  },
  {
    keyword: "plugin",
    response: "Cảm ơn bạn đã liên hệ về features. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "features",
    priority: 77
  },
  {
    keyword: "add-on",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về features.",
    category: "features",
    priority: 61
  },
  {
    keyword: "add-on",
    response: "Chúng tôi có nhiều tài liệu về features. Bạn muốn biết thêm về khía cạnh nào?",
    category: "features",
    priority: 61
  },
  {
    keyword: "add-on",
    response: "Chúng tôi đang phát triển thông tin về features. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "features",
    priority: 72
  },
  {
    keyword: "component",
    response: "features là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "features",
    priority: 73
  },
  {
    keyword: "component",
    response: "Cảm ơn bạn đã liên hệ về features. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "features",
    priority: 79
  },
  {
    keyword: "capability",
    response: "Cảm ơn bạn đã liên hệ về features. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "features",
    priority: 64
  },
  {
    keyword: "capability",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về features.",
    category: "features",
    priority: 77
  },
  {
    keyword: "service",
    response: "Cảm ơn bạn đã liên hệ về features. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "features",
    priority: 71
  },
  {
    keyword: "service",
    response: "features là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "features",
    priority: 66
  },
  {
    keyword: "service",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về features.",
    category: "features",
    priority: 50
  },
  {
    keyword: "operation",
    response: "Chúng tôi có nhiều tài liệu về features. Bạn muốn biết thêm về khía cạnh nào?",
    category: "features",
    priority: 64
  },
  {
    keyword: "operation",
    response: "Cảm ơn bạn đã liên hệ về features. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "features",
    priority: 79
  },
  {
    keyword: "operation",
    response: "Chúng tôi đang phát triển thông tin về features. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "features",
    priority: 57
  },
  {
    keyword: "functionality",
    response: "Cảm ơn bạn đã liên hệ về features. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "features",
    priority: 52
  },
  {
    keyword: "functionality",
    response: "Chúng tôi đang phát triển thông tin về features. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "features",
    priority: 52
  },
  {
    keyword: "functionality",
    response: "Chúng tôi có nhiều tài liệu về features. Bạn muốn biết thêm về khía cạnh nào?",
    category: "features",
    priority: 79
  },
  {
    keyword: "khả năng mới",
    response: "Chúng tôi có nhiều tài liệu về features. Bạn muốn biết thêm về khía cạnh nào?",
    category: "features",
    priority: 74
  },
  {
    keyword: "khả năng mới",
    response: "Chúng tôi đang phát triển thông tin về features. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "features",
    priority: 77
  },
  {
    keyword: "khả năng mới",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về features.",
    category: "features",
    priority: 74
  },
  {
    keyword: "thông báo",
    response: "notifications là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "notifications",
    priority: 65
  },
  {
    keyword: "thông báo",
    response: "Chúng tôi đang phát triển thông tin về notifications. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "notifications",
    priority: 72
  },
  {
    keyword: "notification",
    response: "Chúng tôi đang phát triển thông tin về notifications. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "notifications",
    priority: 57
  },
  {
    keyword: "notification",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về notifications.",
    category: "notifications",
    priority: 54
  },
  {
    keyword: "notification",
    response: "Cảm ơn bạn đã liên hệ về notifications. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "notifications",
    priority: 79
  },
  {
    keyword: "alert",
    response: "Cảm ơn bạn đã liên hệ về notifications. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "notifications",
    priority: 52
  },
  {
    keyword: "alert",
    response: "Chúng tôi có nhiều tài liệu về notifications. Bạn muốn biết thêm về khía cạnh nào?",
    category: "notifications",
    priority: 51
  },
  {
    keyword: "tin nhắn",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về notifications.",
    category: "notifications",
    priority: 61
  },
  {
    keyword: "tin nhắn",
    response: "Cảm ơn bạn đã liên hệ về notifications. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "notifications",
    priority: 74
  },
  {
    keyword: "tin nhắn",
    response: "notifications là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "notifications",
    priority: 62
  },
  {
    keyword: "message",
    response: "Cảm ơn bạn đã liên hệ về notifications. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "notifications",
    priority: 57
  },
  {
    keyword: "message",
    response: "Chúng tôi có nhiều tài liệu về notifications. Bạn muốn biết thêm về khía cạnh nào?",
    category: "notifications",
    priority: 72
  },
  {
    keyword: "message",
    response: "notifications là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "notifications",
    priority: 75
  },
  {
    keyword: "nhắc nhở",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về notifications.",
    category: "notifications",
    priority: 77
  },
  {
    keyword: "nhắc nhở",
    response: "Chúng tôi có nhiều tài liệu về notifications. Bạn muốn biết thêm về khía cạnh nào?",
    category: "notifications",
    priority: 57
  },
  {
    keyword: "nhắc nhở",
    response: "Chúng tôi đang phát triển thông tin về notifications. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "notifications",
    priority: 57
  },
  {
    keyword: "reminder",
    response: "Chúng tôi đang phát triển thông tin về notifications. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "notifications",
    priority: 54
  },
  {
    keyword: "reminder",
    response: "Cảm ơn bạn đã liên hệ về notifications. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "notifications",
    priority: 68
  },
  {
    keyword: "cảnh báo",
    response: "Cảm ơn bạn đã liên hệ về notifications. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "notifications",
    priority: 77
  },
  {
    keyword: "cảnh báo",
    response: "notifications là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "notifications",
    priority: 60
  },
  {
    keyword: "tin tức",
    response: "Chúng tôi có nhiều tài liệu về notifications. Bạn muốn biết thêm về khía cạnh nào?",
    category: "notifications",
    priority: 77
  },
  {
    keyword: "tin tức",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về notifications.",
    category: "notifications",
    priority: 76
  },
  {
    keyword: "tin tức",
    response: "Chúng tôi đang phát triển thông tin về notifications. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "notifications",
    priority: 70
  },
  {
    keyword: "update",
    response: "Cảm ơn bạn đã liên hệ về notifications. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "notifications",
    priority: 62
  },
  {
    keyword: "update",
    response: "Chúng tôi có nhiều tài liệu về notifications. Bạn muốn biết thêm về khía cạnh nào?",
    category: "notifications",
    priority: 59
  },
  {
    keyword: "cập nhật",
    response: "notifications là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "notifications",
    priority: 76
  },
  {
    keyword: "cập nhật",
    response: "Chúng tôi có nhiều tài liệu về notifications. Bạn muốn biết thêm về khía cạnh nào?",
    category: "notifications",
    priority: 64
  },
  {
    keyword: "cập nhật",
    response: "Cảm ơn bạn đã liên hệ về notifications. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "notifications",
    priority: 77
  },
  {
    keyword: "thông tin mới",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về notifications.",
    category: "notifications",
    priority: 68
  },
  {
    keyword: "thông tin mới",
    response: "notifications là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "notifications",
    priority: 68
  },
  {
    keyword: "tin mới",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về notifications.",
    category: "notifications",
    priority: 60
  },
  {
    keyword: "tin mới",
    response: "Chúng tôi đang phát triển thông tin về notifications. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "notifications",
    priority: 67
  },
  {
    keyword: "tin mới",
    response: "Cảm ơn bạn đã liên hệ về notifications. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "notifications",
    priority: 61
  },
  {
    keyword: "news",
    response: "Cảm ơn bạn đã liên hệ về notifications. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "notifications",
    priority: 68
  },
  {
    keyword: "news",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về notifications.",
    category: "notifications",
    priority: 53
  },
  {
    keyword: "broadcast",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về notifications.",
    category: "notifications",
    priority: 63
  },
  {
    keyword: "broadcast",
    response: "notifications là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "notifications",
    priority: 73
  },
  {
    keyword: "broadcast",
    response: "Chúng tôi có nhiều tài liệu về notifications. Bạn muốn biết thêm về khía cạnh nào?",
    category: "notifications",
    priority: 57
  },
  {
    keyword: "announcement",
    response: "Chúng tôi có nhiều tài liệu về notifications. Bạn muốn biết thêm về khía cạnh nào?",
    category: "notifications",
    priority: 70
  },
  {
    keyword: "announcement",
    response: "Cảm ơn bạn đã liên hệ về notifications. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "notifications",
    priority: 73
  },
  {
    keyword: "announcement",
    response: "Chúng tôi đang phát triển thông tin về notifications. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "notifications",
    priority: 78
  },
  {
    keyword: "thông tin quan trọng",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về notifications.",
    category: "notifications",
    priority: 68
  },
  {
    keyword: "thông tin quan trọng",
    response: "Cảm ơn bạn đã liên hệ về notifications. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "notifications",
    priority: 52
  },
  {
    keyword: "nhắc nhở",
    response: "notifications là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "notifications",
    priority: 54
  },
  {
    keyword: "nhắc nhở",
    response: "Cảm ơn bạn đã liên hệ về notifications. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "notifications",
    priority: 79
  },
  {
    keyword: "mail",
    response: "Chúng tôi đang phát triển thông tin về notifications. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "notifications",
    priority: 70
  },
  {
    keyword: "mail",
    response: "notifications là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "notifications",
    priority: 50
  },
  {
    keyword: "mail",
    response: "Cảm ơn bạn đã liên hệ về notifications. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "notifications",
    priority: 64
  },
  {
    keyword: "email",
    response: "Chúng tôi đang phát triển thông tin về notifications. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "notifications",
    priority: 50
  },
  {
    keyword: "email",
    response: "Cảm ơn bạn đã liên hệ về notifications. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "notifications",
    priority: 61
  },
  {
    keyword: "chat",
    response: "Cảm ơn bạn đã liên hệ về chat. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "chat",
    priority: 63
  },
  {
    keyword: "chat",
    response: "Chúng tôi đang phát triển thông tin về chat. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "chat",
    priority: 65
  },
  {
    keyword: "chat",
    response: "chat là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "chat",
    priority: 50
  },
  {
    keyword: "nhắn tin",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về chat.",
    category: "chat",
    priority: 75
  },
  {
    keyword: "nhắn tin",
    response: "Chúng tôi đang phát triển thông tin về chat. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "chat",
    priority: 56
  },
  {
    keyword: "nhắn tin",
    response: "chat là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "chat",
    priority: 77
  },
  {
    keyword: "trò chuyện",
    response: "Chúng tôi đang phát triển thông tin về chat. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "chat",
    priority: 77
  },
  {
    keyword: "trò chuyện",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về chat.",
    category: "chat",
    priority: 61
  },
  {
    keyword: "trò chuyện",
    response: "chat là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "chat",
    priority: 76
  },
  {
    keyword: "tán gẫu",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về chat.",
    category: "chat",
    priority: 54
  },
  {
    keyword: "tán gẫu",
    response: "Cảm ơn bạn đã liên hệ về chat. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "chat",
    priority: 79
  },
  {
    keyword: "nói chuyện",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về chat.",
    category: "chat",
    priority: 79
  },
  {
    keyword: "nói chuyện",
    response: "chat là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "chat",
    priority: 65
  },
  {
    keyword: "giao tiếp",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về chat.",
    category: "chat",
    priority: 50
  },
  {
    keyword: "giao tiếp",
    response: "Chúng tôi có nhiều tài liệu về chat. Bạn muốn biết thêm về khía cạnh nào?",
    category: "chat",
    priority: 55
  },
  {
    keyword: "liên lạc",
    response: "Chúng tôi đang phát triển thông tin về chat. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "chat",
    priority: 71
  },
  {
    keyword: "liên lạc",
    response: "chat là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "chat",
    priority: 68
  },
  {
    keyword: "liên lạc",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về chat.",
    category: "chat",
    priority: 50
  },
  {
    keyword: "messenger",
    response: "Chúng tôi đang phát triển thông tin về chat. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "chat",
    priority: 62
  },
  {
    keyword: "messenger",
    response: "Cảm ơn bạn đã liên hệ về chat. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "chat",
    priority: 76
  },
  {
    keyword: "messenger",
    response: "chat là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "chat",
    priority: 58
  },
  {
    keyword: "tin nhắn",
    response: "chat là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "chat",
    priority: 79
  },
  {
    keyword: "tin nhắn",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về chat.",
    category: "chat",
    priority: 55
  },
  {
    keyword: "message",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về chat.",
    category: "chat",
    priority: 56
  },
  {
    keyword: "message",
    response: "Chúng tôi đang phát triển thông tin về chat. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "chat",
    priority: 78
  },
  {
    keyword: "message",
    response: "Chúng tôi có nhiều tài liệu về chat. Bạn muốn biết thêm về khía cạnh nào?",
    category: "chat",
    priority: 69
  },
  {
    keyword: "SMS",
    response: "Cảm ơn bạn đã liên hệ về chat. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "chat",
    priority: 57
  },
  {
    keyword: "SMS",
    response: "Chúng tôi có nhiều tài liệu về chat. Bạn muốn biết thêm về khía cạnh nào?",
    category: "chat",
    priority: 52
  },
  {
    keyword: "nhắn gửi",
    response: "Chúng tôi có nhiều tài liệu về chat. Bạn muốn biết thêm về khía cạnh nào?",
    category: "chat",
    priority: 70
  },
  {
    keyword: "nhắn gửi",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về chat.",
    category: "chat",
    priority: 51
  },
  {
    keyword: "nhắn gửi",
    response: "Chúng tôi đang phát triển thông tin về chat. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "chat",
    priority: 71
  },
  {
    keyword: "gửi tin",
    response: "Chúng tôi có nhiều tài liệu về chat. Bạn muốn biết thêm về khía cạnh nào?",
    category: "chat",
    priority: 61
  },
  {
    keyword: "gửi tin",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về chat.",
    category: "chat",
    priority: 65
  },
  {
    keyword: "gửi tin",
    response: "Chúng tôi đang phát triển thông tin về chat. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "chat",
    priority: 79
  },
  {
    keyword: "inbox",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về chat.",
    category: "chat",
    priority: 55
  },
  {
    keyword: "inbox",
    response: "Chúng tôi đang phát triển thông tin về chat. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "chat",
    priority: 78
  },
  {
    keyword: "inbox",
    response: "Chúng tôi có nhiều tài liệu về chat. Bạn muốn biết thêm về khía cạnh nào?",
    category: "chat",
    priority: 70
  },
  {
    keyword: "DM",
    response: "Chúng tôi đang phát triển thông tin về chat. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "chat",
    priority: 58
  },
  {
    keyword: "DM",
    response: "Cảm ơn bạn đã liên hệ về chat. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "chat",
    priority: 52
  },
  {
    keyword: "DM",
    response: "chat là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "chat",
    priority: 57
  },
  {
    keyword: "direct message",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về chat.",
    category: "chat",
    priority: 51
  },
  {
    keyword: "direct message",
    response: "Chúng tôi đang phát triển thông tin về chat. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "chat",
    priority: 67
  },
  {
    keyword: "direct message",
    response: "Cảm ơn bạn đã liên hệ về chat. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "chat",
    priority: 69
  },
  {
    keyword: "group chat",
    response: "Cảm ơn bạn đã liên hệ về chat. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "chat",
    priority: 54
  },
  {
    keyword: "group chat",
    response: "chat là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "chat",
    priority: 72
  },
  {
    keyword: "group chat",
    response: "Chúng tôi đang phát triển thông tin về chat. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "chat",
    priority: 65
  },
  {
    keyword: "team chat",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về chat.",
    category: "chat",
    priority: 60
  },
  {
    keyword: "team chat",
    response: "chat là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "chat",
    priority: 73
  },
  {
    keyword: "chat room",
    response: "Chúng tôi có nhiều tài liệu về chat. Bạn muốn biết thêm về khía cạnh nào?",
    category: "chat",
    priority: 55
  },
  {
    keyword: "chat room",
    response: "Chúng tôi đang phát triển thông tin về chat. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "chat",
    priority: 62
  },
  {
    keyword: "chat room",
    response: "chat là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "chat",
    priority: 64
  },
  {
    keyword: "channel",
    response: "Chúng tôi đang phát triển thông tin về chat. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "chat",
    priority: 54
  },
  {
    keyword: "channel",
    response: "Chúng tôi có nhiều tài liệu về chat. Bạn muốn biết thêm về khía cạnh nào?",
    category: "chat",
    priority: 77
  },
  {
    keyword: "channel",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về chat.",
    category: "chat",
    priority: 70
  },
  {
    keyword: "báo cáo",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về reports.",
    category: "reports",
    priority: 67
  },
  {
    keyword: "báo cáo",
    response: "reports là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "reports",
    priority: 68
  },
  {
    keyword: "thống kê",
    response: "Chúng tôi có nhiều tài liệu về reports. Bạn muốn biết thêm về khía cạnh nào?",
    category: "reports",
    priority: 55
  },
  {
    keyword: "thống kê",
    response: "Cảm ơn bạn đã liên hệ về reports. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "reports",
    priority: 72
  },
  {
    keyword: "report",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về reports.",
    category: "reports",
    priority: 70
  },
  {
    keyword: "report",
    response: "reports là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "reports",
    priority: 53
  },
  {
    keyword: "analytics",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về reports.",
    category: "reports",
    priority: 60
  },
  {
    keyword: "analytics",
    response: "Chúng tôi có nhiều tài liệu về reports. Bạn muốn biết thêm về khía cạnh nào?",
    category: "reports",
    priority: 67
  },
  {
    keyword: "analytics",
    response: "reports là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "reports",
    priority: 59
  },
  {
    keyword: "số liệu",
    response: "Chúng tôi có nhiều tài liệu về reports. Bạn muốn biết thêm về khía cạnh nào?",
    category: "reports",
    priority: 58
  },
  {
    keyword: "số liệu",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về reports.",
    category: "reports",
    priority: 79
  },
  {
    keyword: "dữ liệu",
    response: "Chúng tôi có nhiều tài liệu về reports. Bạn muốn biết thêm về khía cạnh nào?",
    category: "reports",
    priority: 70
  },
  {
    keyword: "dữ liệu",
    response: "Cảm ơn bạn đã liên hệ về reports. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "reports",
    priority: 51
  },
  {
    keyword: "dữ liệu",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về reports.",
    category: "reports",
    priority: 79
  },
  {
    keyword: "data",
    response: "reports là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "reports",
    priority: 60
  },
  {
    keyword: "data",
    response: "Chúng tôi có nhiều tài liệu về reports. Bạn muốn biết thêm về khía cạnh nào?",
    category: "reports",
    priority: 63
  },
  {
    keyword: "data",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về reports.",
    category: "reports",
    priority: 53
  },
  {
    keyword: "metrics",
    response: "reports là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "reports",
    priority: 69
  },
  {
    keyword: "metrics",
    response: "Chúng tôi đang phát triển thông tin về reports. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "reports",
    priority: 54
  },
  {
    keyword: "insight",
    response: "Cảm ơn bạn đã liên hệ về reports. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "reports",
    priority: 74
  },
  {
    keyword: "insight",
    response: "reports là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "reports",
    priority: 70
  },
  {
    keyword: "performance",
    response: "Cảm ơn bạn đã liên hệ về reports. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "reports",
    priority: 71
  },
  {
    keyword: "performance",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về reports.",
    category: "reports",
    priority: 65
  },
  {
    keyword: "hiệu suất",
    response: "reports là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "reports",
    priority: 59
  },
  {
    keyword: "hiệu suất",
    response: "Chúng tôi đang phát triển thông tin về reports. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "reports",
    priority: 61
  },
  {
    keyword: "hiệu suất",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về reports.",
    category: "reports",
    priority: 54
  },
  {
    keyword: "tổng kết",
    response: "Cảm ơn bạn đã liên hệ về reports. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "reports",
    priority: 51
  },
  {
    keyword: "tổng kết",
    response: "Chúng tôi đang phát triển thông tin về reports. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "reports",
    priority: 59
  },
  {
    keyword: "tổng kết",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về reports.",
    category: "reports",
    priority: 77
  },
  {
    keyword: "summary",
    response: "reports là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "reports",
    priority: 71
  },
  {
    keyword: "summary",
    response: "Chúng tôi có nhiều tài liệu về reports. Bạn muốn biết thêm về khía cạnh nào?",
    category: "reports",
    priority: 78
  },
  {
    keyword: "summary",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về reports.",
    category: "reports",
    priority: 79
  },
  {
    keyword: "overview",
    response: "reports là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "reports",
    priority: 78
  },
  {
    keyword: "overview",
    response: "Cảm ơn bạn đã liên hệ về reports. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "reports",
    priority: 67
  },
  {
    keyword: "overview",
    response: "Chúng tôi đang phát triển thông tin về reports. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "reports",
    priority: 55
  },
  {
    keyword: "tổng quan",
    response: "Cảm ơn bạn đã liên hệ về reports. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "reports",
    priority: 58
  },
  {
    keyword: "tổng quan",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về reports.",
    category: "reports",
    priority: 50
  },
  {
    keyword: "tổng quan",
    response: "reports là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "reports",
    priority: 55
  },
  {
    keyword: "đánh giá",
    response: "Cảm ơn bạn đã liên hệ về reports. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "reports",
    priority: 61
  },
  {
    keyword: "đánh giá",
    response: "reports là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "reports",
    priority: 71
  },
  {
    keyword: "phân tích",
    response: "Chúng tôi đang phát triển thông tin về reports. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "reports",
    priority: 62
  },
  {
    keyword: "phân tích",
    response: "Cảm ơn bạn đã liên hệ về reports. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "reports",
    priority: 76
  },
  {
    keyword: "phân tích",
    response: "reports là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "reports",
    priority: 78
  },
  {
    keyword: "tài liệu",
    response: "Chúng tôi có nhiều tài liệu về reports. Bạn muốn biết thêm về khía cạnh nào?",
    category: "reports",
    priority: 50
  },
  {
    keyword: "tài liệu",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về reports.",
    category: "reports",
    priority: 50
  },
  {
    keyword: "trích xuất",
    response: "reports là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "reports",
    priority: 70
  },
  {
    keyword: "trích xuất",
    response: "Chúng tôi có nhiều tài liệu về reports. Bạn muốn biết thêm về khía cạnh nào?",
    category: "reports",
    priority: 71
  },
  {
    keyword: "trích xuất",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về reports.",
    category: "reports",
    priority: 71
  },
  {
    keyword: "xuất dữ liệu",
    response: "Chúng tôi có nhiều tài liệu về reports. Bạn muốn biết thêm về khía cạnh nào?",
    category: "reports",
    priority: 53
  },
  {
    keyword: "xuất dữ liệu",
    response: "Chúng tôi đang phát triển thông tin về reports. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "reports",
    priority: 77
  },
  {
    keyword: "export data",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về reports.",
    category: "reports",
    priority: 65
  },
  {
    keyword: "export data",
    response: "Cảm ơn bạn đã liên hệ về reports. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "reports",
    priority: 59
  },
  {
    keyword: "người dùng",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về users.",
    category: "users",
    priority: 61
  },
  {
    keyword: "người dùng",
    response: "users là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "users",
    priority: 72
  },
  {
    keyword: "người dùng",
    response: "Chúng tôi đang phát triển thông tin về users. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "users",
    priority: 65
  },
  {
    keyword: "user",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về users.",
    category: "users",
    priority: 52
  },
  {
    keyword: "user",
    response: "Chúng tôi có nhiều tài liệu về users. Bạn muốn biết thêm về khía cạnh nào?",
    category: "users",
    priority: 78
  },
  {
    keyword: "user",
    response: "Chúng tôi đang phát triển thông tin về users. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "users",
    priority: 53
  },
  {
    keyword: "thành viên",
    response: "Chúng tôi có nhiều tài liệu về users. Bạn muốn biết thêm về khía cạnh nào?",
    category: "users",
    priority: 65
  },
  {
    keyword: "thành viên",
    response: "users là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "users",
    priority: 55
  },
  {
    keyword: "member",
    response: "Cảm ơn bạn đã liên hệ về users. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "users",
    priority: 53
  },
  {
    keyword: "member",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về users.",
    category: "users",
    priority: 53
  },
  {
    keyword: "member",
    response: "Chúng tôi đang phát triển thông tin về users. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "users",
    priority: 50
  },
  {
    keyword: "nhân viên",
    response: "Cảm ơn bạn đã liên hệ về users. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "users",
    priority: 64
  },
  {
    keyword: "nhân viên",
    response: "Chúng tôi có nhiều tài liệu về users. Bạn muốn biết thêm về khía cạnh nào?",
    category: "users",
    priority: 77
  },
  {
    keyword: "nhân viên",
    response: "Chúng tôi đang phát triển thông tin về users. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "users",
    priority: 77
  },
  {
    keyword: "khách hàng",
    response: "Cảm ơn bạn đã liên hệ về users. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "users",
    priority: 78
  },
  {
    keyword: "khách hàng",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về users.",
    category: "users",
    priority: 51
  },
  {
    keyword: "client",
    response: "Chúng tôi có nhiều tài liệu về users. Bạn muốn biết thêm về khía cạnh nào?",
    category: "users",
    priority: 64
  },
  {
    keyword: "client",
    response: "Cảm ơn bạn đã liên hệ về users. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "users",
    priority: 76
  },
  {
    keyword: "admin",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về users.",
    category: "users",
    priority: 66
  },
  {
    keyword: "admin",
    response: "users là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "users",
    priority: 77
  },
  {
    keyword: "administrator",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về users.",
    category: "users",
    priority: 58
  },
  {
    keyword: "administrator",
    response: "Chúng tôi có nhiều tài liệu về users. Bạn muốn biết thêm về khía cạnh nào?",
    category: "users",
    priority: 72
  },
  {
    keyword: "quản trị viên",
    response: "Chúng tôi đang phát triển thông tin về users. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "users",
    priority: 57
  },
  {
    keyword: "quản trị viên",
    response: "Cảm ơn bạn đã liên hệ về users. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "users",
    priority: 73
  },
  {
    keyword: "superadmin",
    response: "Chúng tôi có nhiều tài liệu về users. Bạn muốn biết thêm về khía cạnh nào?",
    category: "users",
    priority: 61
  },
  {
    keyword: "superadmin",
    response: "Cảm ơn bạn đã liên hệ về users. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "users",
    priority: 76
  },
  {
    keyword: "superadmin",
    response: "Chúng tôi đang phát triển thông tin về users. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "users",
    priority: 51
  },
  {
    keyword: "quản lý",
    response: "Chúng tôi đang phát triển thông tin về users. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "users",
    priority: 76
  },
  {
    keyword: "quản lý",
    response: "Chúng tôi có nhiều tài liệu về users. Bạn muốn biết thêm về khía cạnh nào?",
    category: "users",
    priority: 62
  },
  {
    keyword: "quản lý",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về users.",
    category: "users",
    priority: 66
  },
  {
    keyword: "manager",
    response: "Cảm ơn bạn đã liên hệ về users. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "users",
    priority: 73
  },
  {
    keyword: "manager",
    response: "Chúng tôi có nhiều tài liệu về users. Bạn muốn biết thêm về khía cạnh nào?",
    category: "users",
    priority: 60
  },
  {
    keyword: "CEO",
    response: "Chúng tôi đang phát triển thông tin về users. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "users",
    priority: 69
  },
  {
    keyword: "CEO",
    response: "Chúng tôi có nhiều tài liệu về users. Bạn muốn biết thêm về khía cạnh nào?",
    category: "users",
    priority: 55
  },
  {
    keyword: "CEO",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về users.",
    category: "users",
    priority: 76
  },
  {
    keyword: "director",
    response: "Chúng tôi có nhiều tài liệu về users. Bạn muốn biết thêm về khía cạnh nào?",
    category: "users",
    priority: 68
  },
  {
    keyword: "director",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về users.",
    category: "users",
    priority: 77
  },
  {
    keyword: "leader",
    response: "Chúng tôi đang phát triển thông tin về users. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "users",
    priority: 64
  },
  {
    keyword: "leader",
    response: "users là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "users",
    priority: 50
  },
  {
    keyword: "leader",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về users.",
    category: "users",
    priority: 66
  },
  {
    keyword: "nhóm",
    response: "users là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "users",
    priority: 75
  },
  {
    keyword: "nhóm",
    response: "Chúng tôi có nhiều tài liệu về users. Bạn muốn biết thêm về khía cạnh nào?",
    category: "users",
    priority: 57
  },
  {
    keyword: "team",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về users.",
    category: "users",
    priority: 74
  },
  {
    keyword: "team",
    response: "Chúng tôi có nhiều tài liệu về users. Bạn muốn biết thêm về khía cạnh nào?",
    category: "users",
    priority: 74
  },
  {
    keyword: "team",
    response: "Cảm ơn bạn đã liên hệ về users. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "users",
    priority: 67
  },
  {
    keyword: "group",
    response: "Chúng tôi có nhiều tài liệu về users. Bạn muốn biết thêm về khía cạnh nào?",
    category: "users",
    priority: 61
  },
  {
    keyword: "group",
    response: "Cảm ơn bạn đã liên hệ về users. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "users",
    priority: 66
  },
  {
    keyword: "group",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về users.",
    category: "users",
    priority: 52
  },
  {
    keyword: "phòng ban",
    response: "Cảm ơn bạn đã liên hệ về users. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "users",
    priority: 60
  },
  {
    keyword: "phòng ban",
    response: "Chúng tôi có nhiều tài liệu về users. Bạn muốn biết thêm về khía cạnh nào?",
    category: "users",
    priority: 71
  },
  {
    keyword: "phòng ban",
    response: "Chúng tôi đang phát triển thông tin về users. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "users",
    priority: 61
  },
  {
    keyword: "department",
    response: "Cảm ơn bạn đã liên hệ về users. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "users",
    priority: 63
  },
  {
    keyword: "department",
    response: "Chúng tôi đang phát triển thông tin về users. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "users",
    priority: 79
  },
  {
    keyword: "department",
    response: "users là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "users",
    priority: 57
  },
  {
    keyword: "tổ chức",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về users.",
    category: "users",
    priority: 76
  },
  {
    keyword: "tổ chức",
    response: "Chúng tôi có nhiều tài liệu về users. Bạn muốn biết thêm về khía cạnh nào?",
    category: "users",
    priority: 56
  },
  {
    keyword: "organization",
    response: "users là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "users",
    priority: 77
  },
  {
    keyword: "organization",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về users.",
    category: "users",
    priority: 65
  },
  {
    keyword: "organization",
    response: "Chúng tôi đang phát triển thông tin về users. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "users",
    priority: 58
  },
  {
    keyword: "bảo mật",
    response: "Chúng tôi đang phát triển thông tin về security. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "security",
    priority: 62
  },
  {
    keyword: "bảo mật",
    response: "Cảm ơn bạn đã liên hệ về security. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "security",
    priority: 71
  },
  {
    keyword: "security",
    response: "Chúng tôi đang phát triển thông tin về security. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "security",
    priority: 56
  },
  {
    keyword: "security",
    response: "Cảm ơn bạn đã liên hệ về security. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "security",
    priority: 63
  },
  {
    keyword: "an toàn",
    response: "Cảm ơn bạn đã liên hệ về security. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "security",
    priority: 57
  },
  {
    keyword: "an toàn",
    response: "security là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "security",
    priority: 68
  },
  {
    keyword: "bảo vệ",
    response: "Chúng tôi có nhiều tài liệu về security. Bạn muốn biết thêm về khía cạnh nào?",
    category: "security",
    priority: 54
  },
  {
    keyword: "bảo vệ",
    response: "Chúng tôi đang phát triển thông tin về security. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "security",
    priority: 61
  },
  {
    keyword: "bảo vệ",
    response: "Cảm ơn bạn đã liên hệ về security. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "security",
    priority: 79
  },
  {
    keyword: "protection",
    response: "Chúng tôi đang phát triển thông tin về security. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "security",
    priority: 70
  },
  {
    keyword: "protection",
    response: "Chúng tôi có nhiều tài liệu về security. Bạn muốn biết thêm về khía cạnh nào?",
    category: "security",
    priority: 78
  },
  {
    keyword: "protection",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về security.",
    category: "security",
    priority: 52
  },
  {
    keyword: "firewall",
    response: "Cảm ơn bạn đã liên hệ về security. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "security",
    priority: 71
  },
  {
    keyword: "firewall",
    response: "security là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "security",
    priority: 56
  },
  {
    keyword: "antivirus",
    response: "Cảm ơn bạn đã liên hệ về security. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "security",
    priority: 72
  },
  {
    keyword: "antivirus",
    response: "Chúng tôi có nhiều tài liệu về security. Bạn muốn biết thêm về khía cạnh nào?",
    category: "security",
    priority: 69
  },
  {
    keyword: "xác thực",
    response: "Chúng tôi có nhiều tài liệu về security. Bạn muốn biết thêm về khía cạnh nào?",
    category: "security",
    priority: 61
  },
  {
    keyword: "xác thực",
    response: "Chúng tôi đang phát triển thông tin về security. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "security",
    priority: 64
  },
  {
    keyword: "xác thực",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về security.",
    category: "security",
    priority: 68
  },
  {
    keyword: "authentication",
    response: "Chúng tôi đang phát triển thông tin về security. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "security",
    priority: 69
  },
  {
    keyword: "authentication",
    response: "Chúng tôi có nhiều tài liệu về security. Bạn muốn biết thêm về khía cạnh nào?",
    category: "security",
    priority: 78
  },
  {
    keyword: "authorization",
    response: "Chúng tôi đang phát triển thông tin về security. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "security",
    priority: 59
  },
  {
    keyword: "authorization",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về security.",
    category: "security",
    priority: 71
  },
  {
    keyword: "permission",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về security.",
    category: "security",
    priority: 59
  },
  {
    keyword: "permission",
    response: "security là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "security",
    priority: 57
  },
  {
    keyword: "permission",
    response: "Chúng tôi đang phát triển thông tin về security. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "security",
    priority: 62
  },
  {
    keyword: "quyền hạn",
    response: "Cảm ơn bạn đã liên hệ về security. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "security",
    priority: 73
  },
  {
    keyword: "quyền hạn",
    response: "Chúng tôi có nhiều tài liệu về security. Bạn muốn biết thêm về khía cạnh nào?",
    category: "security",
    priority: 52
  },
  {
    keyword: "quyền truy cập",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về security.",
    category: "security",
    priority: 60
  },
  {
    keyword: "quyền truy cập",
    response: "Chúng tôi có nhiều tài liệu về security. Bạn muốn biết thêm về khía cạnh nào?",
    category: "security",
    priority: 79
  },
  {
    keyword: "access",
    response: "Cảm ơn bạn đã liên hệ về security. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "security",
    priority: 71
  },
  {
    keyword: "access",
    response: "Chúng tôi đang phát triển thông tin về security. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "security",
    priority: 76
  },
  {
    keyword: "riêng tư",
    response: "Chúng tôi có nhiều tài liệu về security. Bạn muốn biết thêm về khía cạnh nào?",
    category: "security",
    priority: 52
  },
  {
    keyword: "riêng tư",
    response: "security là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "security",
    priority: 62
  },
  {
    keyword: "riêng tư",
    response: "Chúng tôi đang phát triển thông tin về security. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "security",
    priority: 62
  },
  {
    keyword: "privacy",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về security.",
    category: "security",
    priority: 56
  },
  {
    keyword: "privacy",
    response: "Chúng tôi có nhiều tài liệu về security. Bạn muốn biết thêm về khía cạnh nào?",
    category: "security",
    priority: 58
  },
  {
    keyword: "mã hóa",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về security.",
    category: "security",
    priority: 60
  },
  {
    keyword: "mã hóa",
    response: "Chúng tôi có nhiều tài liệu về security. Bạn muốn biết thêm về khía cạnh nào?",
    category: "security",
    priority: 63
  },
  {
    keyword: "encryption",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về security.",
    category: "security",
    priority: 78
  },
  {
    keyword: "encryption",
    response: "Chúng tôi có nhiều tài liệu về security. Bạn muốn biết thêm về khía cạnh nào?",
    category: "security",
    priority: 63
  },
  {
    keyword: "xác thực hai yếu tố",
    response: "Chúng tôi có nhiều tài liệu về security. Bạn muốn biết thêm về khía cạnh nào?",
    category: "security",
    priority: 50
  },
  {
    keyword: "xác thực hai yếu tố",
    response: "Cảm ơn bạn đã liên hệ về security. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "security",
    priority: 59
  },
  {
    keyword: "xác thực hai yếu tố",
    response: "security là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "security",
    priority: 55
  },
  {
    keyword: "2FA",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về security.",
    category: "security",
    priority: 72
  },
  {
    keyword: "2FA",
    response: "Cảm ơn bạn đã liên hệ về security. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "security",
    priority: 77
  },
  {
    keyword: "mật khẩu mạnh",
    response: "Chúng tôi có nhiều tài liệu về security. Bạn muốn biết thêm về khía cạnh nào?",
    category: "security",
    priority: 77
  },
  {
    keyword: "mật khẩu mạnh",
    response: "Chúng tôi đang phát triển thông tin về security. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "security",
    priority: 71
  },
  {
    keyword: "mật khẩu mạnh",
    response: "security là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "security",
    priority: 67
  },
  {
    keyword: "strong password",
    response: "Chúng tôi có nhiều tài liệu về security. Bạn muốn biết thêm về khía cạnh nào?",
    category: "security",
    priority: 70
  },
  {
    keyword: "strong password",
    response: "security là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "security",
    priority: 66
  },
  {
    keyword: "strong password",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về security.",
    category: "security",
    priority: 56
  },
  {
    keyword: "bảo mật thông tin",
    response: "Cảm ơn bạn đã liên hệ về security. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "security",
    priority: 77
  },
  {
    keyword: "bảo mật thông tin",
    response: "security là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "security",
    priority: 65
  },
  {
    keyword: "hệ thống",
    response: "Chúng tôi đang phát triển thông tin về system. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "system",
    priority: 52
  },
  {
    keyword: "hệ thống",
    response: "Chúng tôi có nhiều tài liệu về system. Bạn muốn biết thêm về khía cạnh nào?",
    category: "system",
    priority: 76
  },
  {
    keyword: "system",
    response: "system là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "system",
    priority: 51
  },
  {
    keyword: "system",
    response: "Chúng tôi có nhiều tài liệu về system. Bạn muốn biết thêm về khía cạnh nào?",
    category: "system",
    priority: 72
  },
  {
    keyword: "system",
    response: "Chúng tôi đang phát triển thông tin về system. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "system",
    priority: 77
  },
  {
    keyword: "server",
    response: "Chúng tôi đang phát triển thông tin về system. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "system",
    priority: 64
  },
  {
    keyword: "server",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về system.",
    category: "system",
    priority: 60
  },
  {
    keyword: "database",
    response: "Chúng tôi đang phát triển thông tin về system. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "system",
    priority: 74
  },
  {
    keyword: "database",
    response: "Chúng tôi có nhiều tài liệu về system. Bạn muốn biết thêm về khía cạnh nào?",
    category: "system",
    priority: 74
  },
  {
    keyword: "cơ sở dữ liệu",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về system.",
    category: "system",
    priority: 56
  },
  {
    keyword: "cơ sở dữ liệu",
    response: "Chúng tôi có nhiều tài liệu về system. Bạn muốn biết thêm về khía cạnh nào?",
    category: "system",
    priority: 55
  },
  {
    keyword: "backend",
    response: "Chúng tôi có nhiều tài liệu về system. Bạn muốn biết thêm về khía cạnh nào?",
    category: "system",
    priority: 64
  },
  {
    keyword: "backend",
    response: "system là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "system",
    priority: 53
  },
  {
    keyword: "frontend",
    response: "system là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "system",
    priority: 52
  },
  {
    keyword: "frontend",
    response: "Cảm ơn bạn đã liên hệ về system. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "system",
    priority: 73
  },
  {
    keyword: "API",
    response: "Chúng tôi đang phát triển thông tin về system. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "system",
    priority: 72
  },
  {
    keyword: "API",
    response: "Chúng tôi có nhiều tài liệu về system. Bạn muốn biết thêm về khía cạnh nào?",
    category: "system",
    priority: 71
  },
  {
    keyword: "service",
    response: "Cảm ơn bạn đã liên hệ về system. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "system",
    priority: 54
  },
  {
    keyword: "service",
    response: "Chúng tôi có nhiều tài liệu về system. Bạn muốn biết thêm về khía cạnh nào?",
    category: "system",
    priority: 77
  },
  {
    keyword: "service",
    response: "Chúng tôi đang phát triển thông tin về system. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "system",
    priority: 54
  },
  {
    keyword: "microservice",
    response: "system là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "system",
    priority: 64
  },
  {
    keyword: "microservice",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về system.",
    category: "system",
    priority: 51
  },
  {
    keyword: "microservice",
    response: "Cảm ơn bạn đã liên hệ về system. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "system",
    priority: 52
  },
  {
    keyword: "cloud",
    response: "Cảm ơn bạn đã liên hệ về system. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "system",
    priority: 63
  },
  {
    keyword: "cloud",
    response: "system là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "system",
    priority: 70
  },
  {
    keyword: "cloud",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về system.",
    category: "system",
    priority: 72
  },
  {
    keyword: "đám mây",
    response: "system là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "system",
    priority: 76
  },
  {
    keyword: "đám mây",
    response: "Cảm ơn bạn đã liên hệ về system. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "system",
    priority: 72
  },
  {
    keyword: "đám mây",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về system.",
    category: "system",
    priority: 54
  },
  {
    keyword: "lưu trữ",
    response: "Chúng tôi đang phát triển thông tin về system. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "system",
    priority: 71
  },
  {
    keyword: "lưu trữ",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về system.",
    category: "system",
    priority: 69
  },
  {
    keyword: "storage",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về system.",
    category: "system",
    priority: 56
  },
  {
    keyword: "storage",
    response: "Chúng tôi có nhiều tài liệu về system. Bạn muốn biết thêm về khía cạnh nào?",
    category: "system",
    priority: 72
  },
  {
    keyword: "hosting",
    response: "Chúng tôi đang phát triển thông tin về system. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "system",
    priority: 69
  },
  {
    keyword: "hosting",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về system.",
    category: "system",
    priority: 74
  },
  {
    keyword: "domain",
    response: "Chúng tôi có nhiều tài liệu về system. Bạn muốn biết thêm về khía cạnh nào?",
    category: "system",
    priority: 58
  },
  {
    keyword: "domain",
    response: "Cảm ơn bạn đã liên hệ về system. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "system",
    priority: 50
  },
  {
    keyword: "tên miền",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về system.",
    category: "system",
    priority: 55
  },
  {
    keyword: "tên miền",
    response: "Chúng tôi đang phát triển thông tin về system. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "system",
    priority: 71
  },
  {
    keyword: "tên miền",
    response: "system là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "system",
    priority: 64
  },
  {
    keyword: "SSL",
    response: "Chúng tôi đang phát triển thông tin về system. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "system",
    priority: 61
  },
  {
    keyword: "SSL",
    response: "system là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "system",
    priority: 55
  },
  {
    keyword: "nâng cấp",
    response: "Chúng tôi đang phát triển thông tin về system. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "system",
    priority: 59
  },
  {
    keyword: "nâng cấp",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về system.",
    category: "system",
    priority: 66
  },
  {
    keyword: "nâng cấp",
    response: "system là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "system",
    priority: 54
  },
  {
    keyword: "update",
    response: "Chúng tôi có nhiều tài liệu về system. Bạn muốn biết thêm về khía cạnh nào?",
    category: "system",
    priority: 70
  },
  {
    keyword: "update",
    response: "Chúng tôi đang phát triển thông tin về system. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "system",
    priority: 64
  },
  {
    keyword: "update",
    response: "Cảm ơn bạn đã liên hệ về system. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "system",
    priority: 58
  },
  {
    keyword: "phiên bản",
    response: "system là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "system",
    priority: 60
  },
  {
    keyword: "phiên bản",
    response: "Chúng tôi đang phát triển thông tin về system. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "system",
    priority: 75
  },
  {
    keyword: "phiên bản",
    response: "Chúng tôi có nhiều tài liệu về system. Bạn muốn biết thêm về khía cạnh nào?",
    category: "system",
    priority: 64
  },
  {
    keyword: "version",
    response: "Chúng tôi có nhiều tài liệu về system. Bạn muốn biết thêm về khía cạnh nào?",
    category: "system",
    priority: 77
  },
  {
    keyword: "version",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về system.",
    category: "system",
    priority: 62
  },
  {
    keyword: "release",
    response: "Chúng tôi đang phát triển thông tin về system. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "system",
    priority: 63
  },
  {
    keyword: "release",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về system.",
    category: "system",
    priority: 60
  },
  {
    keyword: "deployment",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về system.",
    category: "system",
    priority: 52
  },
  {
    keyword: "deployment",
    response: "Chúng tôi có nhiều tài liệu về system. Bạn muốn biết thêm về khía cạnh nào?",
    category: "system",
    priority: 70
  },
  {
    keyword: "triển khai",
    response: "Chúng tôi có nhiều tài liệu về system. Bạn muốn biết thêm về khía cạnh nào?",
    category: "system",
    priority: 53
  },
  {
    keyword: "triển khai",
    response: "system là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "system",
    priority: 56
  },
  {
    keyword: "triển khai",
    response: "Chúng tôi đang phát triển thông tin về system. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "system",
    priority: 50
  },
  {
    keyword: "maintenance",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về system.",
    category: "system",
    priority: 68
  },
  {
    keyword: "maintenance",
    response: "Cảm ơn bạn đã liên hệ về system. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "system",
    priority: 54
  },
  {
    keyword: "maintenance",
    response: "Chúng tôi đang phát triển thông tin về system. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "system",
    priority: 74
  },
  {
    keyword: "bảo trì",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về system.",
    category: "system",
    priority: 62
  },
  {
    keyword: "bảo trì",
    response: "Cảm ơn bạn đã liên hệ về system. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "system",
    priority: 50
  },
  {
    keyword: "hạ tầng",
    response: "Cảm ơn bạn đã liên hệ về system. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "system",
    priority: 67
  },
  {
    keyword: "hạ tầng",
    response: "Chúng tôi có nhiều tài liệu về system. Bạn muốn biết thêm về khía cạnh nào?",
    category: "system",
    priority: 55
  },
  {
    keyword: "infrastructure",
    response: "Chúng tôi đang phát triển thông tin về system. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "system",
    priority: 73
  },
  {
    keyword: "infrastructure",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về system.",
    category: "system",
    priority: 59
  },
  {
    keyword: "hiệu suất",
    response: "Chúng tôi có nhiều tài liệu về performance. Bạn muốn biết thêm về khía cạnh nào?",
    category: "performance",
    priority: 68
  },
  {
    keyword: "hiệu suất",
    response: "Cảm ơn bạn đã liên hệ về performance. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "performance",
    priority: 79
  },
  {
    keyword: "hiệu suất",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về performance.",
    category: "performance",
    priority: 60
  },
  {
    keyword: "performance",
    response: "Chúng tôi đang phát triển thông tin về performance. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "performance",
    priority: 61
  },
  {
    keyword: "performance",
    response: "performance là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "performance",
    priority: 66
  },
  {
    keyword: "performance",
    response: "Chúng tôi có nhiều tài liệu về performance. Bạn muốn biết thêm về khía cạnh nào?",
    category: "performance",
    priority: 68
  },
  {
    keyword: "tốc độ",
    response: "Chúng tôi đang phát triển thông tin về performance. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "performance",
    priority: 76
  },
  {
    keyword: "tốc độ",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về performance.",
    category: "performance",
    priority: 62
  },
  {
    keyword: "tốc độ",
    response: "Chúng tôi có nhiều tài liệu về performance. Bạn muốn biết thêm về khía cạnh nào?",
    category: "performance",
    priority: 64
  },
  {
    keyword: "speed",
    response: "Chúng tôi đang phát triển thông tin về performance. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "performance",
    priority: 72
  },
  {
    keyword: "speed",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về performance.",
    category: "performance",
    priority: 68
  },
  {
    keyword: "speed",
    response: "Cảm ơn bạn đã liên hệ về performance. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "performance",
    priority: 77
  },
  {
    keyword: "nhanh",
    response: "performance là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "performance",
    priority: 65
  },
  {
    keyword: "nhanh",
    response: "Cảm ơn bạn đã liên hệ về performance. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "performance",
    priority: 71
  },
  {
    keyword: "chậm",
    response: "Chúng tôi đang phát triển thông tin về performance. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "performance",
    priority: 76
  },
  {
    keyword: "chậm",
    response: "performance là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "performance",
    priority: 78
  },
  {
    keyword: "chậm",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về performance.",
    category: "performance",
    priority: 73
  },
  {
    keyword: "lag",
    response: "Chúng tôi đang phát triển thông tin về performance. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "performance",
    priority: 59
  },
  {
    keyword: "lag",
    response: "Cảm ơn bạn đã liên hệ về performance. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "performance",
    priority: 64
  },
  {
    keyword: "lag",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về performance.",
    category: "performance",
    priority: 56
  },
  {
    keyword: "giật",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về performance.",
    category: "performance",
    priority: 52
  },
  {
    keyword: "giật",
    response: "performance là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "performance",
    priority: 66
  },
  {
    keyword: "giật",
    response: "Cảm ơn bạn đã liên hệ về performance. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "performance",
    priority: 56
  },
  {
    keyword: "mượt",
    response: "Chúng tôi có nhiều tài liệu về performance. Bạn muốn biết thêm về khía cạnh nào?",
    category: "performance",
    priority: 63
  },
  {
    keyword: "mượt",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về performance.",
    category: "performance",
    priority: 59
  },
  {
    keyword: "mượt",
    response: "performance là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "performance",
    priority: 59
  },
  {
    keyword: "smooth",
    response: "Cảm ơn bạn đã liên hệ về performance. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "performance",
    priority: 54
  },
  {
    keyword: "smooth",
    response: "Chúng tôi có nhiều tài liệu về performance. Bạn muốn biết thêm về khía cạnh nào?",
    category: "performance",
    priority: 78
  },
  {
    keyword: "smooth",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về performance.",
    category: "performance",
    priority: 58
  },
  {
    keyword: "responsive",
    response: "Chúng tôi có nhiều tài liệu về performance. Bạn muốn biết thêm về khía cạnh nào?",
    category: "performance",
    priority: 64
  },
  {
    keyword: "responsive",
    response: "Chúng tôi đang phát triển thông tin về performance. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "performance",
    priority: 54
  },
  {
    keyword: "responsive",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về performance.",
    category: "performance",
    priority: 62
  },
  {
    keyword: "phản hồi",
    response: "Chúng tôi đang phát triển thông tin về performance. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "performance",
    priority: 77
  },
  {
    keyword: "phản hồi",
    response: "Chúng tôi có nhiều tài liệu về performance. Bạn muốn biết thêm về khía cạnh nào?",
    category: "performance",
    priority: 63
  },
  {
    keyword: "tải",
    response: "Cảm ơn bạn đã liên hệ về performance. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "performance",
    priority: 61
  },
  {
    keyword: "tải",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về performance.",
    category: "performance",
    priority: 63
  },
  {
    keyword: "load",
    response: "Chúng tôi có nhiều tài liệu về performance. Bạn muốn biết thêm về khía cạnh nào?",
    category: "performance",
    priority: 50
  },
  {
    keyword: "load",
    response: "Chúng tôi đang phát triển thông tin về performance. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "performance",
    priority: 61
  },
  {
    keyword: "load",
    response: "performance là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "performance",
    priority: 65
  },
  {
    keyword: "tải trang",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về performance.",
    category: "performance",
    priority: 72
  },
  {
    keyword: "tải trang",
    response: "Chúng tôi có nhiều tài liệu về performance. Bạn muốn biết thêm về khía cạnh nào?",
    category: "performance",
    priority: 52
  },
  {
    keyword: "tải trang",
    response: "Chúng tôi đang phát triển thông tin về performance. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "performance",
    priority: 72
  },
  {
    keyword: "page load",
    response: "performance là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "performance",
    priority: 68
  },
  {
    keyword: "page load",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về performance.",
    category: "performance",
    priority: 72
  },
  {
    keyword: "thời gian phản hồi",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về performance.",
    category: "performance",
    priority: 69
  },
  {
    keyword: "thời gian phản hồi",
    response: "performance là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "performance",
    priority: 59
  },
  {
    keyword: "response time",
    response: "performance là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "performance",
    priority: 78
  },
  {
    keyword: "response time",
    response: "Chúng tôi có nhiều tài liệu về performance. Bạn muốn biết thêm về khía cạnh nào?",
    category: "performance",
    priority: 64
  },
  {
    keyword: "response time",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về performance.",
    category: "performance",
    priority: 68
  },
  {
    keyword: "tối ưu",
    response: "Chúng tôi có nhiều tài liệu về performance. Bạn muốn biết thêm về khía cạnh nào?",
    category: "performance",
    priority: 78
  },
  {
    keyword: "tối ưu",
    response: "performance là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "performance",
    priority: 66
  },
  {
    keyword: "optimization",
    response: "Cảm ơn bạn đã liên hệ về performance. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "performance",
    priority: 50
  },
  {
    keyword: "optimization",
    response: "performance là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "performance",
    priority: 65
  },
  {
    keyword: "cải thiện",
    response: "performance là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "performance",
    priority: 76
  },
  {
    keyword: "cải thiện",
    response: "Cảm ơn bạn đã liên hệ về performance. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "performance",
    priority: 54
  },
  {
    keyword: "improvement",
    response: "performance là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "performance",
    priority: 76
  },
  {
    keyword: "improvement",
    response: "Chúng tôi đang phát triển thông tin về performance. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "performance",
    priority: 74
  },
  {
    keyword: "nâng cao",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về performance.",
    category: "performance",
    priority: 58
  },
  {
    keyword: "nâng cao",
    response: "Cảm ơn bạn đã liên hệ về performance. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "performance",
    priority: 58
  },
  {
    keyword: "enhance",
    response: "Chúng tôi đang phát triển thông tin về performance. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "performance",
    priority: 61
  },
  {
    keyword: "enhance",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về performance.",
    category: "performance",
    priority: 57
  },
  {
    keyword: "kỹ thuật",
    response: "Chúng tôi có nhiều tài liệu về technical. Bạn muốn biết thêm về khía cạnh nào?",
    category: "technical",
    priority: 58
  },
  {
    keyword: "kỹ thuật",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 77
  },
  {
    keyword: "kỹ thuật",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 56
  },
  {
    keyword: "technical",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 61
  },
  {
    keyword: "technical",
    response: "technical là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "technical",
    priority: 71
  },
  {
    keyword: "technical",
    response: "Chúng tôi có nhiều tài liệu về technical. Bạn muốn biết thêm về khía cạnh nào?",
    category: "technical",
    priority: 78
  },
  {
    keyword: "công nghệ",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 57
  },
  {
    keyword: "công nghệ",
    response: "technical là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "technical",
    priority: 60
  },
  {
    keyword: "công nghệ",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 54
  },
  {
    keyword: "technology",
    response: "Chúng tôi đang phát triển thông tin về technical. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "technical",
    priority: 66
  },
  {
    keyword: "technology",
    response: "technical là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "technical",
    priority: 76
  },
  {
    keyword: "development",
    response: "Chúng tôi đang phát triển thông tin về technical. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "technical",
    priority: 72
  },
  {
    keyword: "development",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 78
  },
  {
    keyword: "development",
    response: "technical là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "technical",
    priority: 76
  },
  {
    keyword: "phát triển",
    response: "technical là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "technical",
    priority: 57
  },
  {
    keyword: "phát triển",
    response: "Chúng tôi đang phát triển thông tin về technical. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "technical",
    priority: 63
  },
  {
    keyword: "phát triển",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 78
  },
  {
    keyword: "coding",
    response: "technical là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "technical",
    priority: 59
  },
  {
    keyword: "coding",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 62
  },
  {
    keyword: "coding",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 58
  },
  {
    keyword: "lập trình",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 68
  },
  {
    keyword: "lập trình",
    response: "Chúng tôi đang phát triển thông tin về technical. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "technical",
    priority: 64
  },
  {
    keyword: "lập trình",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 57
  },
  {
    keyword: "programming",
    response: "Chúng tôi có nhiều tài liệu về technical. Bạn muốn biết thêm về khía cạnh nào?",
    category: "technical",
    priority: 66
  },
  {
    keyword: "programming",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 63
  },
  {
    keyword: "programming",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 76
  },
  {
    keyword: "software",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 65
  },
  {
    keyword: "software",
    response: "technical là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "technical",
    priority: 54
  },
  {
    keyword: "software",
    response: "Chúng tôi có nhiều tài liệu về technical. Bạn muốn biết thêm về khía cạnh nào?",
    category: "technical",
    priority: 70
  },
  {
    keyword: "phần mềm",
    response: "technical là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "technical",
    priority: 58
  },
  {
    keyword: "phần mềm",
    response: "Chúng tôi đang phát triển thông tin về technical. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "technical",
    priority: 58
  },
  {
    keyword: "phần mềm",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 77
  },
  {
    keyword: "hardware",
    response: "Chúng tôi đang phát triển thông tin về technical. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "technical",
    priority: 66
  },
  {
    keyword: "hardware",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 68
  },
  {
    keyword: "hardware",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 69
  },
  {
    keyword: "phần cứng",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 56
  },
  {
    keyword: "phần cứng",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 56
  },
  {
    keyword: "phần cứng",
    response: "Chúng tôi đang phát triển thông tin về technical. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "technical",
    priority: 74
  },
  {
    keyword: "network",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 66
  },
  {
    keyword: "network",
    response: "technical là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "technical",
    priority: 68
  },
  {
    keyword: "network",
    response: "Chúng tôi có nhiều tài liệu về technical. Bạn muốn biết thêm về khía cạnh nào?",
    category: "technical",
    priority: 65
  },
  {
    keyword: "mạng",
    response: "Chúng tôi có nhiều tài liệu về technical. Bạn muốn biết thêm về khía cạnh nào?",
    category: "technical",
    priority: 64
  },
  {
    keyword: "mạng",
    response: "technical là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "technical",
    priority: 66
  },
  {
    keyword: "mạng",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 52
  },
  {
    keyword: "internet",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 69
  },
  {
    keyword: "internet",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 50
  },
  {
    keyword: "internet",
    response: "Chúng tôi đang phát triển thông tin về technical. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "technical",
    priority: 69
  },
  {
    keyword: "web",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 78
  },
  {
    keyword: "web",
    response: "Chúng tôi có nhiều tài liệu về technical. Bạn muốn biết thêm về khía cạnh nào?",
    category: "technical",
    priority: 55
  },
  {
    keyword: "web",
    response: "Chúng tôi đang phát triển thông tin về technical. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "technical",
    priority: 63
  },
  {
    keyword: "mobile",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 64
  },
  {
    keyword: "mobile",
    response: "Chúng tôi có nhiều tài liệu về technical. Bạn muốn biết thêm về khía cạnh nào?",
    category: "technical",
    priority: 68
  },
  {
    keyword: "mobile",
    response: "technical là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "technical",
    priority: 72
  },
  {
    keyword: "desktop",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 50
  },
  {
    keyword: "desktop",
    response: "Chúng tôi đang phát triển thông tin về technical. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "technical",
    priority: 78
  },
  {
    keyword: "cloud",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 64
  },
  {
    keyword: "cloud",
    response: "Chúng tôi có nhiều tài liệu về technical. Bạn muốn biết thêm về khía cạnh nào?",
    category: "technical",
    priority: 53
  },
  {
    keyword: "đám mây",
    response: "technical là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "technical",
    priority: 51
  },
  {
    keyword: "đám mây",
    response: "Chúng tôi đang phát triển thông tin về technical. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "technical",
    priority: 57
  },
  {
    keyword: "AI",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 75
  },
  {
    keyword: "AI",
    response: "technical là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "technical",
    priority: 77
  },
  {
    keyword: "machine learning",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 71
  },
  {
    keyword: "machine learning",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 63
  },
  {
    keyword: "machine learning",
    response: "Chúng tôi có nhiều tài liệu về technical. Bạn muốn biết thêm về khía cạnh nào?",
    category: "technical",
    priority: 75
  },
  {
    keyword: "trí tuệ nhân tạo",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 58
  },
  {
    keyword: "trí tuệ nhân tạo",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 55
  },
  {
    keyword: "trí tuệ nhân tạo",
    response: "technical là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "technical",
    priority: 75
  },
  {
    keyword: "dữ liệu",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 76
  },
  {
    keyword: "dữ liệu",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 65
  },
  {
    keyword: "dữ liệu",
    response: "technical là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "technical",
    priority: 58
  },
  {
    keyword: "data",
    response: "Chúng tôi có nhiều tài liệu về technical. Bạn muốn biết thêm về khía cạnh nào?",
    category: "technical",
    priority: 52
  },
  {
    keyword: "data",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 76
  },
  {
    keyword: "data",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 68
  },
  {
    keyword: "big data",
    response: "technical là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "technical",
    priority: 64
  },
  {
    keyword: "big data",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về technical.",
    category: "technical",
    priority: 55
  },
  {
    keyword: "phân tích",
    response: "technical là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "technical",
    priority: 55
  },
  {
    keyword: "phân tích",
    response: "Cảm ơn bạn đã liên hệ về technical. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "technical",
    priority: 50
  },
  {
    keyword: "analytics",
    response: "Chúng tôi có nhiều tài liệu về technical. Bạn muốn biết thêm về khía cạnh nào?",
    category: "technical",
    priority: 75
  },
  {
    keyword: "analytics",
    response: "Chúng tôi đang phát triển thông tin về technical. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "technical",
    priority: 79
  },
  {
    keyword: "thanh toán",
    response: "Cảm ơn bạn đã liên hệ về payment. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "payment",
    priority: 69
  },
  {
    keyword: "thanh toán",
    response: "Chúng tôi có nhiều tài liệu về payment. Bạn muốn biết thêm về khía cạnh nào?",
    category: "payment",
    priority: 51
  },
  {
    keyword: "payment",
    response: "Cảm ơn bạn đã liên hệ về payment. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "payment",
    priority: 74
  },
  {
    keyword: "payment",
    response: "Chúng tôi đang phát triển thông tin về payment. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "payment",
    priority: 73
  },
  {
    keyword: "payment",
    response: "payment là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "payment",
    priority: 72
  },
  {
    keyword: "tiền",
    response: "Chúng tôi có nhiều tài liệu về payment. Bạn muốn biết thêm về khía cạnh nào?",
    category: "payment",
    priority: 53
  },
  {
    keyword: "tiền",
    response: "payment là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "payment",
    priority: 61
  },
  {
    keyword: "money",
    response: "Cảm ơn bạn đã liên hệ về payment. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "payment",
    priority: 64
  },
  {
    keyword: "money",
    response: "payment là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "payment",
    priority: 62
  },
  {
    keyword: "money",
    response: "Chúng tôi có nhiều tài liệu về payment. Bạn muốn biết thêm về khía cạnh nào?",
    category: "payment",
    priority: 59
  },
  {
    keyword: "banking",
    response: "payment là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "payment",
    priority: 76
  },
  {
    keyword: "banking",
    response: "Cảm ơn bạn đã liên hệ về payment. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "payment",
    priority: 54
  },
  {
    keyword: "banking",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về payment.",
    category: "payment",
    priority: 65
  },
  {
    keyword: "ngân hàng",
    response: "Chúng tôi có nhiều tài liệu về payment. Bạn muốn biết thêm về khía cạnh nào?",
    category: "payment",
    priority: 73
  },
  {
    keyword: "ngân hàng",
    response: "payment là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "payment",
    priority: 72
  },
  {
    keyword: "ngân hàng",
    response: "Cảm ơn bạn đã liên hệ về payment. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "payment",
    priority: 50
  },
  {
    keyword: "credit card",
    response: "Cảm ơn bạn đã liên hệ về payment. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "payment",
    priority: 50
  },
  {
    keyword: "credit card",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về payment.",
    category: "payment",
    priority: 70
  },
  {
    keyword: "thẻ tín dụng",
    response: "payment là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "payment",
    priority: 67
  },
  {
    keyword: "thẻ tín dụng",
    response: "Chúng tôi có nhiều tài liệu về payment. Bạn muốn biết thêm về khía cạnh nào?",
    category: "payment",
    priority: 65
  },
  {
    keyword: "thẻ ghi nợ",
    response: "Cảm ơn bạn đã liên hệ về payment. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "payment",
    priority: 55
  },
  {
    keyword: "thẻ ghi nợ",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về payment.",
    category: "payment",
    priority: 51
  },
  {
    keyword: "debit card",
    response: "Cảm ơn bạn đã liên hệ về payment. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "payment",
    priority: 61
  },
  {
    keyword: "debit card",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về payment.",
    category: "payment",
    priority: 51
  },
  {
    keyword: "debit card",
    response: "Chúng tôi đang phát triển thông tin về payment. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "payment",
    priority: 68
  },
  {
    keyword: "e-wallet",
    response: "Chúng tôi có nhiều tài liệu về payment. Bạn muốn biết thêm về khía cạnh nào?",
    category: "payment",
    priority: 76
  },
  {
    keyword: "e-wallet",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về payment.",
    category: "payment",
    priority: 61
  },
  {
    keyword: "ví điện tử",
    response: "payment là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "payment",
    priority: 52
  },
  {
    keyword: "ví điện tử",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về payment.",
    category: "payment",
    priority: 71
  },
  {
    keyword: "chuyển khoản",
    response: "Chúng tôi có nhiều tài liệu về payment. Bạn muốn biết thêm về khía cạnh nào?",
    category: "payment",
    priority: 69
  },
  {
    keyword: "chuyển khoản",
    response: "Chúng tôi đang phát triển thông tin về payment. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "payment",
    priority: 50
  },
  {
    keyword: "transfer",
    response: "Chúng tôi đang phát triển thông tin về payment. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "payment",
    priority: 63
  },
  {
    keyword: "transfer",
    response: "payment là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "payment",
    priority: 79
  },
  {
    keyword: "transfer",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về payment.",
    category: "payment",
    priority: 65
  },
  {
    keyword: "PayPal",
    response: "Chúng tôi có nhiều tài liệu về payment. Bạn muốn biết thêm về khía cạnh nào?",
    category: "payment",
    priority: 63
  },
  {
    keyword: "PayPal",
    response: "Chúng tôi đang phát triển thông tin về payment. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "payment",
    priority: 75
  },
  {
    keyword: "PayPal",
    response: "payment là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "payment",
    priority: 50
  },
  {
    keyword: "Momo",
    response: "Cảm ơn bạn đã liên hệ về payment. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "payment",
    priority: 76
  },
  {
    keyword: "Momo",
    response: "Chúng tôi có nhiều tài liệu về payment. Bạn muốn biết thêm về khía cạnh nào?",
    category: "payment",
    priority: 69
  },
  {
    keyword: "Momo",
    response: "Chúng tôi đang phát triển thông tin về payment. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "payment",
    priority: 76
  },
  {
    keyword: "ZaloPay",
    response: "payment là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "payment",
    priority: 66
  },
  {
    keyword: "ZaloPay",
    response: "Chúng tôi có nhiều tài liệu về payment. Bạn muốn biết thêm về khía cạnh nào?",
    category: "payment",
    priority: 77
  },
  {
    keyword: "VNPay",
    response: "Chúng tôi đang phát triển thông tin về payment. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "payment",
    priority: 70
  },
  {
    keyword: "VNPay",
    response: "Chúng tôi có nhiều tài liệu về payment. Bạn muốn biết thêm về khía cạnh nào?",
    category: "payment",
    priority: 78
  },
  {
    keyword: "hóa đơn",
    response: "Cảm ơn bạn đã liên hệ về payment. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "payment",
    priority: 60
  },
  {
    keyword: "hóa đơn",
    response: "Chúng tôi đang phát triển thông tin về payment. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "payment",
    priority: 65
  },
  {
    keyword: "invoice",
    response: "Chúng tôi có nhiều tài liệu về payment. Bạn muốn biết thêm về khía cạnh nào?",
    category: "payment",
    priority: 77
  },
  {
    keyword: "invoice",
    response: "Cảm ơn bạn đã liên hệ về payment. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "payment",
    priority: 76
  },
  {
    keyword: "invoice",
    response: "Chúng tôi đang phát triển thông tin về payment. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "payment",
    priority: 66
  },
  {
    keyword: "biên lai",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về payment.",
    category: "payment",
    priority: 56
  },
  {
    keyword: "biên lai",
    response: "Cảm ơn bạn đã liên hệ về payment. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "payment",
    priority: 72
  },
  {
    keyword: "receipt",
    response: "Chúng tôi đang phát triển thông tin về payment. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "payment",
    priority: 70
  },
  {
    keyword: "receipt",
    response: "payment là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "payment",
    priority: 79
  },
  {
    keyword: "receipt",
    response: "Cảm ơn bạn đã liên hệ về payment. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "payment",
    priority: 70
  },
  {
    keyword: "phí",
    response: "Chúng tôi có nhiều tài liệu về payment. Bạn muốn biết thêm về khía cạnh nào?",
    category: "payment",
    priority: 53
  },
  {
    keyword: "phí",
    response: "Cảm ơn bạn đã liên hệ về payment. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "payment",
    priority: 67
  },
  {
    keyword: "fee",
    response: "Chúng tôi có nhiều tài liệu về payment. Bạn muốn biết thêm về khía cạnh nào?",
    category: "payment",
    priority: 68
  },
  {
    keyword: "fee",
    response: "Cảm ơn bạn đã liên hệ về payment. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "payment",
    priority: 56
  },
  {
    keyword: "fee",
    response: "payment là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "payment",
    priority: 69
  },
  {
    keyword: "giá",
    response: "payment là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "payment",
    priority: 54
  },
  {
    keyword: "giá",
    response: "Cảm ơn bạn đã liên hệ về payment. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "payment",
    priority: 52
  },
  {
    keyword: "price",
    response: "Chúng tôi đang phát triển thông tin về payment. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "payment",
    priority: 58
  },
  {
    keyword: "price",
    response: "Cảm ơn bạn đã liên hệ về payment. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "payment",
    priority: 55
  },
  {
    keyword: "hỗ trợ",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về support.",
    category: "support",
    priority: 53
  },
  {
    keyword: "hỗ trợ",
    response: "Chúng tôi đang phát triển thông tin về support. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "support",
    priority: 56
  },
  {
    keyword: "support",
    response: "Chúng tôi đang phát triển thông tin về support. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "support",
    priority: 50
  },
  {
    keyword: "support",
    response: "support là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "support",
    priority: 62
  },
  {
    keyword: "trợ giúp",
    response: "Cảm ơn bạn đã liên hệ về support. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "support",
    priority: 75
  },
  {
    keyword: "trợ giúp",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về support.",
    category: "support",
    priority: 51
  },
  {
    keyword: "trợ giúp",
    response: "Chúng tôi đang phát triển thông tin về support. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "support",
    priority: 79
  },
  {
    keyword: "giúp đỡ",
    response: "Chúng tôi đang phát triển thông tin về support. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "support",
    priority: 51
  },
  {
    keyword: "giúp đỡ",
    response: "support là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "support",
    priority: 67
  },
  {
    keyword: "giúp đỡ",
    response: "Chúng tôi có nhiều tài liệu về support. Bạn muốn biết thêm về khía cạnh nào?",
    category: "support",
    priority: 53
  },
  {
    keyword: "service",
    response: "Chúng tôi đang phát triển thông tin về support. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "support",
    priority: 54
  },
  {
    keyword: "service",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về support.",
    category: "support",
    priority: 67
  },
  {
    keyword: "service",
    response: "Chúng tôi có nhiều tài liệu về support. Bạn muốn biết thêm về khía cạnh nào?",
    category: "support",
    priority: 68
  },
  {
    keyword: "dịch vụ",
    response: "Chúng tôi đang phát triển thông tin về support. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "support",
    priority: 59
  },
  {
    keyword: "dịch vụ",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về support.",
    category: "support",
    priority: 50
  },
  {
    keyword: "dịch vụ",
    response: "support là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "support",
    priority: 54
  },
  {
    keyword: "khách hàng",
    response: "Chúng tôi đang phát triển thông tin về support. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "support",
    priority: 61
  },
  {
    keyword: "khách hàng",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về support.",
    category: "support",
    priority: 57
  },
  {
    keyword: "customer",
    response: "Cảm ơn bạn đã liên hệ về support. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "support",
    priority: 76
  },
  {
    keyword: "customer",
    response: "Chúng tôi có nhiều tài liệu về support. Bạn muốn biết thêm về khía cạnh nào?",
    category: "support",
    priority: 72
  },
  {
    keyword: "chăm sóc",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về support.",
    category: "support",
    priority: 58
  },
  {
    keyword: "chăm sóc",
    response: "Chúng tôi có nhiều tài liệu về support. Bạn muốn biết thêm về khía cạnh nào?",
    category: "support",
    priority: 77
  },
  {
    keyword: "chăm sóc",
    response: "Chúng tôi đang phát triển thông tin về support. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "support",
    priority: 70
  },
  {
    keyword: "care",
    response: "Chúng tôi đang phát triển thông tin về support. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "support",
    priority: 75
  },
  {
    keyword: "care",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về support.",
    category: "support",
    priority: 56
  },
  {
    keyword: "tư vấn",
    response: "Chúng tôi đang phát triển thông tin về support. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "support",
    priority: 66
  },
  {
    keyword: "tư vấn",
    response: "Cảm ơn bạn đã liên hệ về support. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "support",
    priority: 75
  },
  {
    keyword: "tư vấn",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về support.",
    category: "support",
    priority: 57
  },
  {
    keyword: "consultant",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về support.",
    category: "support",
    priority: 66
  },
  {
    keyword: "consultant",
    response: "Chúng tôi có nhiều tài liệu về support. Bạn muốn biết thêm về khía cạnh nào?",
    category: "support",
    priority: 62
  },
  {
    keyword: "consultant",
    response: "Chúng tôi đang phát triển thông tin về support. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "support",
    priority: 60
  },
  {
    keyword: "tư vấn viên",
    response: "Chúng tôi có nhiều tài liệu về support. Bạn muốn biết thêm về khía cạnh nào?",
    category: "support",
    priority: 64
  },
  {
    keyword: "tư vấn viên",
    response: "support là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "support",
    priority: 64
  },
  {
    keyword: "consultant",
    response: "support là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "support",
    priority: 75
  },
  {
    keyword: "consultant",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về support.",
    category: "support",
    priority: 74
  },
  {
    keyword: "consultant",
    response: "Chúng tôi có nhiều tài liệu về support. Bạn muốn biết thêm về khía cạnh nào?",
    category: "support",
    priority: 72
  },
  {
    keyword: "hotline",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về support.",
    category: "support",
    priority: 55
  },
  {
    keyword: "hotline",
    response: "Chúng tôi đang phát triển thông tin về support. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "support",
    priority: 60
  },
  {
    keyword: "đường dây nóng",
    response: "Chúng tôi có nhiều tài liệu về support. Bạn muốn biết thêm về khía cạnh nào?",
    category: "support",
    priority: 51
  },
  {
    keyword: "đường dây nóng",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về support.",
    category: "support",
    priority: 73
  },
  {
    keyword: "liên hệ",
    response: "Chúng tôi đang phát triển thông tin về support. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "support",
    priority: 70
  },
  {
    keyword: "liên hệ",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về support.",
    category: "support",
    priority: 77
  },
  {
    keyword: "contact",
    response: "Chúng tôi có nhiều tài liệu về support. Bạn muốn biết thêm về khía cạnh nào?",
    category: "support",
    priority: 65
  },
  {
    keyword: "contact",
    response: "Cảm ơn bạn đã liên hệ về support. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "support",
    priority: 72
  },
  {
    keyword: "contact",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về support.",
    category: "support",
    priority: 74
  },
  {
    keyword: "phản hồi",
    response: "Chúng tôi có nhiều tài liệu về support. Bạn muốn biết thêm về khía cạnh nào?",
    category: "support",
    priority: 51
  },
  {
    keyword: "phản hồi",
    response: "Chúng tôi đang phát triển thông tin về support. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "support",
    priority: 65
  },
  {
    keyword: "feedback",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về support.",
    category: "support",
    priority: 75
  },
  {
    keyword: "feedback",
    response: "support là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "support",
    priority: 51
  },
  {
    keyword: "góp ý",
    response: "Chúng tôi đang phát triển thông tin về support. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "support",
    priority: 73
  },
  {
    keyword: "góp ý",
    response: "support là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "support",
    priority: 65
  },
  {
    keyword: "suggestion",
    response: "Chúng tôi đang phát triển thông tin về support. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "support",
    priority: 57
  },
  {
    keyword: "suggestion",
    response: "Cảm ơn bạn đã liên hệ về support. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "support",
    priority: 54
  },
  {
    keyword: "khiếu nại",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về support.",
    category: "support",
    priority: 74
  },
  {
    keyword: "khiếu nại",
    response: "Chúng tôi đang phát triển thông tin về support. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "support",
    priority: 76
  },
  {
    keyword: "khiếu nại",
    response: "support là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "support",
    priority: 52
  },
  {
    keyword: "complaint",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về support.",
    category: "support",
    priority: 74
  },
  {
    keyword: "complaint",
    response: "support là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "support",
    priority: 55
  },
  {
    keyword: "complaint",
    response: "Chúng tôi có nhiều tài liệu về support. Bạn muốn biết thêm về khía cạnh nào?",
    category: "support",
    priority: 70
  },
  {
    keyword: "câu hỏi thường gặp",
    response: "faq là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "faq",
    priority: 50
  },
  {
    keyword: "câu hỏi thường gặp",
    response: "Cảm ơn bạn đã liên hệ về faq. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "faq",
    priority: 64
  },
  {
    keyword: "faq",
    response: "Chúng tôi đang phát triển thông tin về faq. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "faq",
    priority: 68
  },
  {
    keyword: "faq",
    response: "Chúng tôi có nhiều tài liệu về faq. Bạn muốn biết thêm về khía cạnh nào?",
    category: "faq",
    priority: 77
  },
  {
    keyword: "frequently asked questions",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về faq.",
    category: "faq",
    priority: 60
  },
  {
    keyword: "frequently asked questions",
    response: "Cảm ơn bạn đã liên hệ về faq. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "faq",
    priority: 64
  },
  {
    keyword: "frequently asked questions",
    response: "Chúng tôi đang phát triển thông tin về faq. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "faq",
    priority: 51
  },
  {
    keyword: "câu hỏi phổ biến",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về faq.",
    category: "faq",
    priority: 60
  },
  {
    keyword: "câu hỏi phổ biến",
    response: "faq là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "faq",
    priority: 66
  },
  {
    keyword: "common questions",
    response: "faq là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "faq",
    priority: 77
  },
  {
    keyword: "thắc mắc",
    response: "Chúng tôi đang phát triển thông tin về faq. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "faq",
    priority: 68
  },
  {
    keyword: "query",
    response: "faq là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "faq",
    priority: 76
  },
  {
    keyword: "vấn đề",
    response: "Chúng tôi có nhiều tài liệu về faq. Bạn muốn biết thêm về khía cạnh nào?",
    category: "faq",
    priority: 75
  },
  {
    keyword: "issue",
    response: "Cảm ơn bạn đã liên hệ về faq. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "faq",
    priority: 69
  },
  {
    keyword: "giải đáp",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về faq.",
    category: "faq",
    priority: 61
  },
  {
    keyword: "answer",
    response: "Chúng tôi đang phát triển thông tin về faq. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "faq",
    priority: 56
  },
  {
    keyword: "trả lời",
    response: "faq là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "faq",
    priority: 67
  },
  {
    keyword: "reply",
    response: "Chúng tôi có nhiều tài liệu về faq. Bạn muốn biết thêm về khía cạnh nào?",
    category: "faq",
    priority: 65
  },
  {
    keyword: "response",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về faq.",
    category: "faq",
    priority: 69
  },
  {
    keyword: "giải thích",
    response: "Cảm ơn bạn đã liên hệ về faq. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "faq",
    priority: 69
  },
  {
    keyword: "explanation",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về faq.",
    category: "faq",
    priority: 58
  },
  {
    keyword: "hướng dẫn",
    response: "Cảm ơn bạn đã liên hệ về faq. Vui lòng cho biết thêm chi tiết để chúng tôi hỗ trợ hiệu quả hơn.",
    category: "faq",
    priority: 55
  },
  {
    keyword: "guide",
    response: "Cảm ơn bạn đã quan tâm đến vấn đề này. Đội ngũ hỗ trợ sẽ giúp bạn về faq.",
    category: "faq",
    priority: 72
  },
  {
    keyword: "tutorial",
    response: "faq là một phần quan trọng của Giao Liên. Bạn cần thông tin gì cụ thể?",
    category: "faq",
    priority: 73
  },
  {
    keyword: "hướng dẫn từng bước",
    response: "Chúng tôi đang phát triển thông tin về faq. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
    category: "faq",
    priority: 67
  },
  {
    keyword: "step-by-step",
    response: "Chúng tôi có nhiều tài liệu về faq. Bạn muốn biết thêm về khía cạnh nào?",
    category: "faq",
    priority: 77
  }
];

module.exports = expandedReplies;