const express = require('express');
const router = express.Router();
const AutoReply = require('../models/AutoReply');
const { auth } = require('../middleware/auth');
const { superAdminAuth } = require('../middleware/superAdminAuth');

// @route   GET api/auto-reply
// @desc    Lấy danh sách câu trả lời tự động
// @access  Private (Admin)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    let query = {};
    
    // Lọc theo danh mục nếu có
    if (category) {
      query.category = category;
    }
    
    // Tìm kiếm theo từ khóa hoặc phản hồi
    if (search) {
      query.$or = [
        { keyword: { $regex: search, $options: 'i' } },
        { response: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Đếm tổng số bản ghi
    const total = await AutoReply.countDocuments(query);
    
    // Lấy danh sách theo phân trang
    const autoReplies = await AutoReply.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username name');
    
    res.json({
      autoReplies,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách câu trả lời tự động:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   GET api/auto-reply/categories
// @desc    Lấy danh sách danh mục
// @access  Private (Admin)
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await AutoReply.distinct('category');
    res.json(categories);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách danh mục:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   GET api/auto-reply/:id
// @desc    Lấy thông tin chi tiết câu trả lời tự động
// @access  Private (Admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const autoReply = await AutoReply.findById(req.params.id)
      .populate('createdBy', 'username name');
    
    if (!autoReply) {
      return res.status(404).json({ message: 'Không tìm thấy câu trả lời tự động' });
    }
    
    res.json(autoReply);
  } catch (err) {
    console.error('Lỗi khi lấy chi tiết câu trả lời tự động:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   POST api/auto-reply
// @desc    Tạo câu trả lời tự động mới
// @access  Private (SuperAdmin)
router.post('/', superAdminAuth, async (req, res) => {
  try {
    const { keyword, response, category, priority, isActive } = req.body;
    
    // Kiểm tra xem từ khóa đã tồn tại chưa
    const existing = await AutoReply.findOne({ keyword: keyword.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Từ khóa này đã tồn tại' });
    }
    
    const newAutoReply = new AutoReply({
      keyword: keyword.toLowerCase(),
      response,
      category: category || 'general',
      priority: priority || 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.admin.id
    });
    
    await newAutoReply.save();
    
    res.status(201).json(newAutoReply);
  } catch (err) {
    console.error('Lỗi khi tạo câu trả lời tự động:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   PUT api/auto-reply/:id
// @desc    Cập nhật câu trả lời tự động
// @access  Private (SuperAdmin)
router.put('/:id', superAdminAuth, async (req, res) => {
  try {
    const { keyword, response, category, priority, isActive } = req.body;
    
    // Kiểm tra xem từ khóa đã tồn tại chưa (nếu đã thay đổi từ khóa)
    if (keyword) {
      const existing = await AutoReply.findOne({ 
        keyword: keyword.toLowerCase(), 
        _id: { $ne: req.params.id } 
      });
      
      if (existing) {
        return res.status(400).json({ message: 'Từ khóa này đã tồn tại' });
      }
    }
    
    // Tìm và cập nhật
    const autoReply = await AutoReply.findById(req.params.id);
    
    if (!autoReply) {
      return res.status(404).json({ message: 'Không tìm thấy câu trả lời tự động' });
    }
    
    if (keyword) autoReply.keyword = keyword.toLowerCase();
    if (response) autoReply.response = response;
    if (category) autoReply.category = category;
    if (priority !== undefined) autoReply.priority = priority;
    if (isActive !== undefined) autoReply.isActive = isActive;
    
    await autoReply.save();
    
    res.json(autoReply);
  } catch (err) {
    console.error('Lỗi khi cập nhật câu trả lời tự động:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   DELETE api/auto-reply/:id
// @desc    Xóa câu trả lời tự động
// @access  Private (SuperAdmin)
router.delete('/:id', superAdminAuth, async (req, res) => {
  try {
    const autoReply = await AutoReply.findById(req.params.id);
    
    if (!autoReply) {
      return res.status(404).json({ message: 'Không tìm thấy câu trả lời tự động' });
    }
    
    await AutoReply.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Đã xóa câu trả lời tự động' });
  } catch (err) {
    console.error('Lỗi khi xóa câu trả lời tự động:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   POST api/auto-reply/batch-import
// @desc    Import nhiều câu trả lời tự động
// @access  Private (SuperAdmin)
router.post('/batch-import', superAdminAuth, async (req, res) => {
  try {
    const { autoReplies } = req.body;
    
    if (!Array.isArray(autoReplies) || autoReplies.length === 0) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
    
    const results = {
      success: 0,
      failed: 0,
      duplicates: 0
    };
    
    for (const item of autoReplies) {
      try {
        // Kiểm tra dữ liệu
        if (!item.keyword || !item.response) {
          results.failed++;
          continue;
        }
        
        // Kiểm tra trùng lặp
        const existing = await AutoReply.findOne({ keyword: item.keyword.toLowerCase() });
        if (existing) {
          results.duplicates++;
          continue;
        }
        
        // Tạo mới
        const newAutoReply = new AutoReply({
          keyword: item.keyword.toLowerCase(),
          response: item.response,
          category: item.category || 'general',
          priority: item.priority || 0,
          isActive: item.isActive !== undefined ? item.isActive : true,
          createdBy: req.admin.id
        });
        
        await newAutoReply.save();
        results.success++;
      } catch (error) {
        results.failed++;
      }
    }
    
    res.status(201).json({
      message: 'Import hoàn tất',
      results
    });
  } catch (err) {
    console.error('Lỗi khi import câu trả lời tự động:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   GET api/auto-reply/find-match
// @desc    Tìm câu trả lời phù hợp với tin nhắn
// @access  Public (Sử dụng nội bộ qua socket.io)
router.get('/find-match/:message', async (req, res) => {
  try {
    const message = req.params.message;
    
    if (!message) {
      return res.status(400).json({ message: 'Thiếu thông tin tin nhắn' });
    }
    
    const match = await AutoReply.findBestMatch(message);
    
    if (!match) {
      return res.status(404).json({ message: 'Không tìm thấy câu trả lời phù hợp' });
    }
    
    res.json({ response: match.response });
  } catch (err) {
    console.error('Lỗi khi tìm câu trả lời phù hợp:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router; 