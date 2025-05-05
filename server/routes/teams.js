const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { auth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const UAParser = require('ua-parser-js');

// Lấy tất cả các đội của admin
router.get('/', auth, async (req, res) => {
  try {
    const teams = await Team.find({ adminId: req.admin.id }).sort({ totalScore: -1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tạo đội mới
router.post('/', auth, async (req, res) => {
  const team = new Team({
    name: req.body.name,
    adminId: req.admin.id,
    password: req.body.password // Nếu không cung cấp, sẽ sử dụng giá trị mặc định
  });

  try {
    const newTeam = await team.save();
    res.status(201).json(newTeam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Lấy một đội cụ thể
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) return res.status(404).json({ message: 'Không tìm thấy đội' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cập nhật thông tin đội
router.patch('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findOne({
      _id: req.params.id,
      adminId: req.admin.id
    });
    
    if (!team) return res.status(404).json({ message: 'Không tìm thấy đội' });

    if (req.body.name) team.name = req.body.name;
    if (req.body.password) team.password = req.body.password;
    
    const updatedTeam = await team.save();
    res.json(updatedTeam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xóa đội
router.delete('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findOne({
      _id: req.params.id,
      adminId: req.admin.id
    });
    
    if (!team) return res.status(404).json({ message: 'Không tìm thấy đội' });

    await Team.deleteOne({ _id: req.params.id });
    res.json({ message: 'Đã xóa đội' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cập nhật điểm cho đội
router.post('/:id/score', auth, async (req, res) => {
  try {
    const team = await Team.findOne({
      _id: req.params.id,
      adminId: req.admin.id
    });
    
    if (!team) return res.status(404).json({ message: 'Không tìm thấy đội' });

    const { stationId, score } = req.body;
    
    // Kiểm tra xem đội đã hoàn thành trạm này chưa
    const stationIndex = team.completedStations.findIndex(
      station => station.stationId.toString() === stationId
    );
    
    if (stationIndex !== -1) {
      // Nếu đã hoàn thành, cập nhật điểm nếu cao hơn
      if (score > team.completedStations[stationIndex].score) {
        team.totalScore = team.totalScore - team.completedStations[stationIndex].score + score;
        team.completedStations[stationIndex].score = score;
        team.completedStations[stationIndex].completedAt = Date.now();
      }
    } else {
      // Nếu chưa hoàn thành, thêm vào danh sách
      team.completedStations.push({
        stationId,
        score,
        completedAt: Date.now()
      });
      team.totalScore += score;
    }
    
    const updatedTeam = await team.save();
    res.json(updatedTeam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Lấy xếp hạng các đội
router.get('/ranking/all', auth, async (req, res) => {
  try {
    const teams = await Team.find({ adminId: req.admin.id }).sort({ totalScore: -1, name: 1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cập nhật trạng thái của đội
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, content } = req.body;
    const team = await Team.findById(req.params.id);
    
    if (!team) return res.status(404).json({ message: 'Không tìm thấy đội' });
    
    team.status = status;
    team.lastActivity = Date.now();
    
    if (status === 'copied' && content) {
      team.copiedContent.push(content);
    }
    
    await team.save();
    res.json({ message: 'Đã cập nhật trạng thái' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xác thực mật khẩu đội
router.post('/verify', async (req, res) => {
  try {
    const { teamName, password } = req.body;
    const team = await Team.findOne({ name: teamName });
    
    if (!team) {
      return res.status(404).json({ message: 'Không tìm thấy đội' });
    }
    
    if (team.password !== password) {
      return res.status(401).json({ message: 'Mật khẩu không chính xác' });
    }
    
    // Lấy thông tin thiết bị
    const userAgent = req.headers['user-agent'];
    let deviceInfo = 'Không xác định';
    
    try {
      if (userAgent) {
        const parser = new UAParser(userAgent);
        const result = parser.getResult();
        const browser = result.browser.name ? `${result.browser.name} ${result.browser.version}` : 'Không xác định';
        const os = result.os.name ? `${result.os.name} ${result.os.version}` : 'Không xác định';
        const device = result.device.vendor 
          ? `${result.device.vendor} ${result.device.model || ''} ${result.device.type || ''}`
          : (result.device.type || 'Desktop');
        deviceInfo = `${browser} trên ${os} (${device})`.trim();
      }
    } catch (error) {
      console.error('Lỗi phân tích user agent:', error);
    }
    
    // Kiểm tra nếu đội đã đăng nhập trên thiết bị khác
    if (team.sessionId && team.status === 'active') {
      return res.status(403).json({ 
        message: 'Đội của bạn đã đăng nhập trên một thiết bị khác. Vui lòng đăng xuất thiết bị đó trước khi đăng nhập lại.',
        alreadyLoggedIn: true,
        deviceInfo: team.deviceInfo
      });
    }
    
    // Tạo session mới
    const sessionId = uuidv4();
    
    // Cập nhật trạng thái đội là đang hoạt động và lưu sessionId
    team.status = 'active';
    team.lastActivity = Date.now();
    team.sessionId = sessionId;
    team.deviceInfo = deviceInfo;
    
    await team.save();
    
    res.json({ 
      success: true, 
      teamId: team._id,
      sessionId: sessionId,
      message: 'Xác thực thành công' 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Thêm route để đăng xuất
router.post('/logout', async (req, res) => {
  try {
    const { teamId, sessionId } = req.body;
    
    // Xác thực session ID để đảm bảo chỉ thiết bị đang đăng nhập mới có thể đăng xuất
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({ message: 'Không tìm thấy đội' });
    }
    
    // Kiểm tra xem sessionId có khớp không
    if (team.sessionId !== sessionId) {
      return res.status(401).json({ message: 'Phiên không hợp lệ' });
    }
    
    // Đặt lại thông tin phiên và trạng thái
    team.sessionId = null;
    team.deviceInfo = null;
    team.status = 'inactive';
    team.lastActivity = Date.now();
    
    await team.save();
    
    res.json({ success: true, message: 'Đã đăng xuất thành công' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Đăng xuất đội do Admin thực hiện (buộc đăng xuất)
router.post('/force-logout/:id', auth, async (req, res) => {
  try {
    const teamId = req.params.id;
    
    // Tìm đội theo ID và đảm bảo admin có quyền quản lý đội này
    const team = await Team.findOne({
      _id: teamId,
      adminId: req.admin.id
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Không tìm thấy đội hoặc bạn không có quyền quản lý đội này' });
    }
    
    // Đặt lại thông tin phiên và trạng thái
    team.sessionId = null;
    team.deviceInfo = null;
    team.status = 'inactive';
    team.lastActivity = Date.now();
    
    await team.save();
    
    res.json({ 
      success: true, 
      message: 'Đã buộc đăng xuất đội thành công',
      team: {
        _id: team._id,
        name: team.name,
        status: team.status,
        lastActivity: team.lastActivity
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 