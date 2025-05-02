const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Station = require('../models/Station');
const Team = require('../models/Team');
const { auth } = require('../middleware/auth');

// Lấy tất cả các lần nộp (admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Lấy danh sách trạm của admin
    const stations = await Station.find({ adminId: req.admin.id });
    const stationIds = stations.map(station => station._id);
    
    // Lấy danh sách nộp bài liên quan đến các trạm của admin
    const submissions = await Submission.find({ 
      stationId: { $in: stationIds } 
    }).sort({ timestamp: -1 });
    
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy các lần nộp theo trạm (admin only)
router.get('/station/:stationId', auth, async (req, res) => {
  try {
    // Kiểm tra trạm có thuộc admin không
    const station = await Station.findOne({
      _id: req.params.stationId,
      adminId: req.admin.id
    });
    
    if (!station) {
      return res.status(404).json({ message: 'Không tìm thấy trạm' });
    }
    
    const submissions = await Submission.find({ 
      stationId: req.params.stationId 
    }).sort({ timestamp: -1 });
    
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy các lần nộp theo đội (user)
router.get('/team/:teamName', async (req, res) => {
  try {
    // Lấy tất cả submissions của đội này
    const submissions = await Submission.find({ 
      teamName: req.params.teamName
    }).sort({ timestamp: -1 });
    
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tạo lần nộp mới (user)
router.post('/', async (req, res) => {
  try {
    const { stationId, teamName, answer } = req.body;
    
    // Tìm trạm
    const station = await Station.findById(stationId);
    if (!station) return res.status(404).json({ message: 'Không tìm thấy trạm' });
    
    // Kiểm tra xem đội có tồn tại trong trạm này không
    if (!station.teams.includes(teamName)) {
      return res.status(400).json({ message: 'Đội chơi không thuộc trạm này' });
    }
    
    // Tìm tất cả lần nộp của đội ở trạm này
    const previousSubmissions = await Submission.find({ 
      stationId, 
      teamName 
    }).sort({ timestamp: -1 });
    
    // Kiểm tra xem có lần nộp đúng trước đó không
    const hasCorrectSubmission = previousSubmissions.some(sub => sub.isCorrect);
    if (hasCorrectSubmission) {
      return res.status(400).json({ message: 'Đội đã hoàn thành trạm này' });
    }
    
    // Kiểm tra xem có đang trong thời gian khóa không
    const latestSubmission = previousSubmissions[0];
    if (latestSubmission && latestSubmission.nextAttemptAllowed && new Date() < new Date(latestSubmission.nextAttemptAllowed)) {
      // Vẫn trong thời gian chờ
      return res.status(400).json({ 
        message: 'Đang trong thời gian chờ',
        nextAttemptAllowed: latestSubmission.nextAttemptAllowed
      });
    }
    
    // Kiểm tra nếu người dùng đã vượt qua thời gian chờ, đánh dấu như một "chu kỳ mới"
    // Lọc các lần nộp trong "chu kỳ" hiện tại (sau thời gian khóa gần nhất)
    let currentCycleSubmissions = previousSubmissions;
    if (latestSubmission && latestSubmission.nextAttemptAllowed && new Date() >= new Date(latestSubmission.nextAttemptAllowed)) {
      // Đã hết thời gian chờ - bắt đầu chu kỳ mới với số lần thử ban đầu
      currentCycleSubmissions = []; // Bắt đầu với 0 lần thử trong chu kỳ mới
    } else if (previousSubmissions.length > 0) {
      // Tìm lần submission cuối cùng mà có nextAttemptAllowed trong quá khứ
      let lastCooldownIndex = -1;
      for (let i = 0; i < previousSubmissions.length; i++) {
        if (previousSubmissions[i].nextAttemptAllowed && 
            new Date() >= new Date(previousSubmissions[i].nextAttemptAllowed)) {
          lastCooldownIndex = i;
          break;
        }
      }
      
      // Nếu tìm thấy một cooldown đã hết hạn, chỉ tính các lần nộp sau đó
      if (lastCooldownIndex !== -1) {
        currentCycleSubmissions = previousSubmissions.slice(0, lastCooldownIndex);
      }
    }
    
    // Tính số lần thử trong chu kỳ hiện tại
    const attemptNumber = currentCycleSubmissions.length + 1;
    
    // Kiểm tra số lần thử
    const remainingAttempts = station.maxAttempts - attemptNumber + 1;
    const isMaxAttemptsReached = attemptNumber > station.maxAttempts;
    let nextAttemptAllowed = null;
    
    // Nếu đã hết số lần thử, áp dụng thời gian chờ
    if (isMaxAttemptsReached) {
      // Tính thời gian khóa cho lần vượt quá số lần thử
      const lockTime = station.lockTime > 0 ? station.lockTime : 5; // Mặc định 5 phút nếu không có
      nextAttemptAllowed = new Date(Date.now() + lockTime * 60000);
      
      return res.status(400).json({ 
        message: 'Đã hết lần thử. Hãy đợi sau thời gian chờ để được cấp lại lượt thử.',
        nextAttemptAllowed,
        remainingAttempts: 0
      });
    }
    
    // Chuyển đáp án của người dùng sang chữ thường
    const userAnswer = answer.toLowerCase().trim();
    
    // Kiểm tra xem đáp án có khớp với một trong các đáp án chính xác không
    // Nếu correctAnswer là chuỗi (phiên bản cũ), convert sang mảng
    const correctAnswers = Array.isArray(station.correctAnswer) 
      ? station.correctAnswer 
      : [station.correctAnswer];
    
    // Kiểm tra nếu đáp án người dùng khớp với bất kỳ đáp án nào trong mảng
    const isCorrect = correctAnswers.some(correctAns => 
      correctAns.toLowerCase().trim() === userAnswer
    );
    
    // Khi trả lời sai lần cuối cùng có sẵn, đặt thời gian chờ
    if (!isCorrect && attemptNumber >= station.maxAttempts && station.lockTime > 0) {
      nextAttemptAllowed = new Date(Date.now() + station.lockTime * 60000);
    }
    
    // Tạo submission mới
    const submission = new Submission({
      stationId,
      teamName,
      answer,
      isCorrect,
      score: 0, // Điểm sẽ được cập nhật nếu đúng
      attemptNumber,
      nextAttemptAllowed
    });
    
    const newSubmission = await submission.save();
    
    // Nếu đúng, tính điểm dựa trên thứ hạng
    let score = 0;
    if (isCorrect) {
      // Tìm đội
      let team = await Team.findOne({ 
        name: teamName,
        adminId: station.adminId 
      });
      
      // Nếu đội chưa tồn tại, tạo mới
      if (!team) {
        team = new Team({ 
          name: teamName,
          adminId: station.adminId 
        });
      }
      
      // Tìm các đội đã hoàn thành trạm này thành công
      const correctSubmissions = await Submission.find({
        stationId,
        isCorrect: true
      }).sort({ timestamp: 1 }); // Sắp xếp theo thời gian tăng dần
      
      // Tìm thứ hạng của đội hiện tại
      const rank = correctSubmissions.findIndex(sub => sub.teamName === teamName) + 1;
      
      // Tính điểm dựa trên thứ hạng
      if (rank === 1) score = 10;      // Đội nhanh nhất
      else if (rank === 2) score = 9;  // Đội nhanh nhì
      else if (rank === 3) score = 8;  // Đội nhanh ba
      else if (rank === 4) score = 7;  // Đội nhanh tư
      else if (rank === 5) score = 6;  // Đội nhanh năm
      else score = 5;                  // Các đội còn lại
      
      // Cập nhật điểm cho submission
      newSubmission.score = score;
      await newSubmission.save();
      
      // Thêm trạm vào danh sách đã hoàn thành
      const completedIndex = team.completedStations.findIndex(
        station => station.stationId.toString() === stationId
      );
      
      if (completedIndex === -1) {
        team.completedStations.push({
          stationId,
          score,
          completedAt: Date.now()
        });
        team.totalScore += score;
      }
      
      await team.save();
    }
    
    res.status(201).json({
      submission: newSubmission,
      isCorrect,
      score,
      attemptCount: attemptNumber,
      remainingAttempts: remainingAttempts > 0 ? remainingAttempts - 1 : 0, // Đảm bảo không âm
      message: isCorrect 
        ? 'Chính xác!' 
        : `Không chính xác! Còn ${remainingAttempts > 1 ? (remainingAttempts - 1) : 0} lần thử.`
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Lấy thống kê xếp hạng (admin only)
router.get('/stats/ranking', auth, async (req, res) => {
  try {
    const teams = await Team.find({ adminId: req.admin.id }).sort({ totalScore: -1, name: 1 });
    
    // Lấy thêm thông tin chi tiết về các trạm đã hoàn thành
    const ranking = await Promise.all(teams.map(async (team) => {
      const completedStationsDetails = await Promise.all(
        team.completedStations.map(async (station) => {
          const stationInfo = await Station.findById(station.stationId);
          return {
            ...station.toObject(),
            stationName: stationInfo ? stationInfo.name : 'Trạm không tồn tại'
          };
        })
      );
      
      return {
        _id: team._id,
        name: team.name,
        totalScore: team.totalScore,
        completedStations: completedStationsDetails,
        createdAt: team.createdAt
      };
    }));
    
    res.json(ranking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Xuất bảng xếp hạng sang dạng Excel (admin only)
router.get('/stats/ranking/export', auth, async (req, res) => {
  try {
    const teams = await Team.find({ adminId: req.admin.id }).sort({ totalScore: -1, name: 1 });
    
    // Lấy thêm thông tin chi tiết về các trạm đã hoàn thành
    const ranking = await Promise.all(teams.map(async (team) => {
      const completedStationsDetails = await Promise.all(
        team.completedStations.map(async (station) => {
          const stationInfo = await Station.findById(station.stationId);
          return {
            ...station.toObject(),
            stationName: stationInfo ? stationInfo.name : 'Trạm không tồn tại'
          };
        })
      );
      
      return {
        _id: team._id,
        name: team.name,
        totalScore: team.totalScore,
        completedStations: completedStationsDetails,
        createdAt: team.createdAt
      };
    }));
    
    // Chuẩn bị dữ liệu cho Excel
    const rankingData = ranking.map((team, index) => ({
      Hạng: index + 1,
      'Tên đội': team.name,
      'Tổng điểm': team.totalScore,
      'Số trạm hoàn thành': team.completedStations.length,
      'Thời gian tham gia': new Date(team.createdAt).toLocaleString('vi-VN')
    }));
    
    // Chi tiết cho mỗi đội
    const teamDetailsData = [];
    
    // Lấy tên mật thư từ trạm đầu tiên nếu có
    let gameName = '';
    if (ranking.length > 0 && 
        ranking[0].completedStations.length > 0 &&
        ranking[0].completedStations[0].stationId) {
      const firstStation = await Station.findById(ranking[0].completedStations[0].stationId);
      if (firstStation && firstStation.gameName) {
        gameName = firstStation.gameName;
      }
    }
    
    ranking.forEach(team => {
      // Header cho đội
      teamDetailsData.push({
        'Tên đội': team.name,
        'Tổng điểm': team.totalScore,
        'Số trạm hoàn thành': team.completedStations.length
      });
      
      // Các trạm đã hoàn thành
      team.completedStations.forEach((station, index) => {
        teamDetailsData.push({
          'STT': index + 1,
          'Tên trạm': station.stationName,
          'Điểm': station.score,
          'Thời gian hoàn thành': new Date(station.completedAt).toLocaleString('vi-VN')
        });
      });
      
      // Dòng trống giữa các đội
      teamDetailsData.push({});
    });
    
    res.json({
      ranking: rankingData,
      teamDetails: teamDetailsData,
      gameName: gameName
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Xóa bảng xếp hạng (admin only)
router.delete('/stats/ranking/reset', auth, async (req, res) => {
  try {
    // Xóa tất cả đội của admin
    await Team.deleteMany({ adminId: req.admin.id });
    
    // Xóa tất cả submissions liên quan đến admin
    const stations = await Station.find({ adminId: req.admin.id });
    const stationIds = stations.map(station => station._id);
    
    await Submission.deleteMany({ 
      stationId: { $in: stationIds } 
    });
    
    res.json({ message: 'Đã xóa bảng xếp hạng, tất cả kết quả và đội chơi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Xóa chỉ điểm và xếp hạng, giữ lại danh sách đội (admin only)
router.delete('/stats/ranking/reset-scores', auth, async (req, res) => {
  try {
    // Lấy danh sách đội của admin
    const teams = await Team.find({ adminId: req.admin.id });
    
    // Đặt lại điểm và trạm đã hoàn thành cho mỗi đội
    for (const team of teams) {
      team.totalScore = 0;
      team.completedStations = [];
      await team.save();
    }
    
    // Xóa tất cả submissions liên quan đến admin
    const stations = await Station.find({ adminId: req.admin.id });
    const stationIds = stations.map(station => station._id);
    
    const result = await Submission.deleteMany({ 
      stationId: { $in: stationIds } 
    });
    
    res.json({ 
      message: 'Đã xóa bảng xếp hạng và kết quả',
      teamsAffected: teams.length,
      submissionsDeleted: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Xóa chỉ lịch sử trả lời (admin only)
router.delete('/delete-all', auth, async (req, res) => {
  try {
    // Lấy danh sách trạm của admin
    const stations = await Station.find({ adminId: req.admin.id });
    const stationIds = stations.map(station => station._id);
    
    // Chỉ xóa submissions liên quan đến admin, không ảnh hưởng đến teams
    const result = await Submission.deleteMany({ 
      stationId: { $in: stationIds } 
    });
    
    res.json({ 
      message: 'Đã xóa tất cả lịch sử trả lời',
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 