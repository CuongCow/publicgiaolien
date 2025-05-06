const express = require('express');
const router = express.Router();
const Station = require('../models/Station');
const Team = require('../models/Team');
const qrcode = require('qrcode');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Thiết lập kết nối đến MongoDB cho GridFS
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://cuongdn:v446gy9nDmuyKsqg@cluster0.frhl2tm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Khởi tạo GridFS Storage
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      // Kiểm tra loại file
      if (!file.mimetype.startsWith('image/')) {
        return reject('Chỉ cho phép tải lên hình ảnh');
      }
      
      const filename = `station-image-${Date.now()}-${path.basename(file.originalname)}`;
      const fileInfo = {
        filename: filename,
        bucketName: 'stationImages'
      };
      resolve(fileInfo);
    });
  }
});

// Cấu hình multer với GridFS Storage
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  }
});

// Hàm helper để tạo hoặc cập nhật team từ danh sách tên
const createOrUpdateTeams = async (teamNames, adminId) => {
  if (!teamNames || !teamNames.length) return;
  
  const existingTeams = await Team.find({ 
    adminId: adminId,
    name: { $in: teamNames }
  });
  
  const existingTeamNames = existingTeams.map(team => team.name);
  
  // Lọc ra các tên đội chưa tồn tại
  const newTeamNames = teamNames.filter(name => !existingTeamNames.includes(name));
  
  // Tạo các đội mới
  if (newTeamNames.length > 0) {
    const teamsToCreate = newTeamNames.map(name => ({
      name: name,
      adminId: adminId
      // Mật khẩu sẽ tự động tạo bởi giá trị mặc định từ schema
    }));
    
    await Team.insertMany(teamsToCreate);
  }
};

// Lấy tất cả các trạm của admin đang đăng nhập
router.get('/', auth, async (req, res) => {
  try {
    const stations = await Station.find({ adminId: req.admin.id }).sort({ createdAt: -1 });
    console.log(`Tìm thấy ${stations.length} trạm cho admin ID: ${req.admin.id}`);
    res.json(stations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload hình ảnh cho trạm
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file nào được tải lên' });
    }

    // Tạo URL cho hình ảnh
    const imageUrl = `/api/stations/images/${req.file.filename}`;
    
    res.json({ 
      imageUrl,
      message: 'Tải hình ảnh thành công' 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Xem hình ảnh (endpoint công khai)
router.get('/images/:filename', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'stationImages'
    });
    
    // Tìm file bằng tên
    const file = await db.collection('stationImages.files').findOne({ filename: req.params.filename });
    
    if (!file) {
      return res.status(404).json({ message: 'Không tìm thấy hình ảnh' });
    }
    
    // Set header phù hợp
    res.set('Content-Type', file.contentType);
    
    // Tạo stream để đọc file
    const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
    
    // Pipe stream đến response
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tạo trạm mới
router.post('/', auth, async (req, res) => {
  try {
    // Kiểm tra xem yêu cầu là tạo nhiều trạm hay một trạm
    if (Array.isArray(req.body)) {
      // Tạo nhiều trạm
      const stationsToCreate = req.body.map(station => ({
        ...station,
        adminId: req.admin.id
      }));
      
      // Tạo các đội cho tất cả trạm
      if (stationsToCreate.length > 0 && stationsToCreate[0].teams && stationsToCreate[0].teams.length > 0) {
        await createOrUpdateTeams(stationsToCreate[0].teams, req.admin.id);
      }

      const createdStations = await Station.insertMany(stationsToCreate);
      res.status(201).json(createdStations);
    } else {
      // Tạo một trạm
      const station = new Station({
        ...req.body,
        adminId: req.admin.id
      });
      
      // Tạo các đội mới nếu có
      if (station.teams && station.teams.length > 0) {
        await createOrUpdateTeams(station.teams, req.admin.id);
      }

      const newStation = await station.save();
      res.status(201).json(newStation);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Lấy một trạm cụ thể (công khai cho người dùng)
router.get('/:id', async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) return res.status(404).json({ message: 'Không tìm thấy trạm' });
    
    // Nếu có thông tin user/admin từ middleware auth và id khác với adminId của trạm
    if (req.admin && req.admin.id !== station.adminId.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập trạm này' });
    }
    
    res.json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy trạm đang hoạt động của admin (endpoint công khai cho trang chờ đội)
router.get('/active/:adminId', async (req, res) => {
  try {
    const adminId = req.params.adminId;
    if (!adminId) {
      return res.status(400).json({ message: 'Thiếu adminId' });
    }

    // Kiểm tra xem có trạm đang hoạt động không dựa vào thời gian bắt đầu gần nhất
    // Lưu ý: Cần phải có thêm trường isActive trong model Station để làm việc này tốt hơn
    // Đây là giải pháp tạm thời
    const activeStation = await Station.findOne({ 
      adminId: adminId,
      isActive: true
    });

    if (!activeStation) {
      // Trả về null để client biết không có trạm nào đang hoạt động
      return res.json(null);
    }

    res.json(activeStation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy một trạm cụ thể (xác thực admin)
router.get('/admin/:id', auth, async (req, res) => {
  try {
    const station = await Station.findOne({
      _id: req.params.id,
      adminId: req.admin.id
    });
    if (!station) return res.status(404).json({ message: 'Không tìm thấy trạm' });
    
    // Log thông tin trạm để debug
    console.log('Sending station data:', {
      id: station._id,
      name: station.name,
      messageType: station.messageType,
      hasTeamSpecificContents: station.teamSpecificContents ? station.teamSpecificContents.length : 0
    });

    // Nếu có nội dung riêng cho từng đội, log thêm thông tin chi tiết
    if (station.messageType === 'individual' && station.teamSpecificContents && station.teamSpecificContents.length > 0) {
      console.log('First team specific content:', {
        team: station.teamSpecificContents[0].team,
        contentType: station.teamSpecificContents[0].contentType,
        correctAnswer: station.teamSpecificContents[0].correctAnswer,
        correctAnswerType: Array.isArray(station.teamSpecificContents[0].correctAnswer) ? 'array' : typeof station.teamSpecificContents[0].correctAnswer
      });
    }

    res.json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cập nhật trạm
router.patch('/:id', auth, async (req, res) => {
  try {
    const station = await Station.findOne({
      _id: req.params.id,
      adminId: req.admin.id
    });
    
    if (!station) return res.status(404).json({ message: 'Không tìm thấy trạm' });

    // Debug log
    console.log('Update station request body:', {
      fontSize: req.body.fontSize,
      fontWeight: req.body.fontWeight,
      lineHeight: req.body.lineHeight,
      paragraphSpacing: req.body.paragraphSpacing,
      messageType: req.body.messageType,
      hasTeamContents: req.body.teamSpecificContents ? 'yes' : 'no'
    });

    // Cập nhật danh sách đội nếu có
    if (req.body.teams) {
      await createOrUpdateTeams(req.body.teams, req.admin.id);
      station.teams = req.body.teams;
    }

    if (req.body.name) station.name = req.body.name;
    if (req.body.content) station.content = req.body.content;
    if (req.body.contentType) station.contentType = req.body.contentType;
    if (req.body.ottContent !== undefined) station.ottContent = req.body.ottContent;
    if (req.body.nwContent !== undefined) station.nwContent = req.body.nwContent;
    if (req.body.showText !== undefined) station.showText = req.body.showText;
    if (req.body.showImage !== undefined) station.showImage = req.body.showImage;
    if (req.body.showOTT !== undefined) station.showOTT = req.body.showOTT;
    if (req.body.showNW !== undefined) station.showNW = req.body.showNW;
    if (req.body.correctAnswer) station.correctAnswer = req.body.correctAnswer;
    if (req.body.maxAttempts) station.maxAttempts = req.body.maxAttempts;
    if (req.body.lockTime) station.lockTime = req.body.lockTime;
    if (req.body.gameName !== undefined) station.gameName = req.body.gameName;
    if (req.body.gameNote !== undefined) station.gameNote = req.body.gameNote;
    if (req.body.fontSize) station.fontSize = req.body.fontSize;
    if (req.body.fontWeight) station.fontWeight = req.body.fontWeight;
    if (req.body.lineHeight) station.lineHeight = req.body.lineHeight;
    if (req.body.paragraphSpacing) station.paragraphSpacing = req.body.paragraphSpacing;
    if (req.body.messageType) station.messageType = req.body.messageType;
    if (req.body.teamSpecificContents) station.teamSpecificContents = req.body.teamSpecificContents;
    if (req.body.isActive !== undefined) station.isActive = req.body.isActive;

    const updatedStation = await station.save();
    res.json(updatedStation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Kích hoạt trạm
router.patch('/:id/activate', auth, async (req, res) => {
  try {
    // Trước tiên, hủy kích hoạt tất cả các trạm khác của admin này
    await Station.updateMany(
      { adminId: req.admin.id, isActive: true },
      { isActive: false }
    );
    
    // Sau đó, kích hoạt trạm được chỉ định
    const station = await Station.findOneAndUpdate(
      { _id: req.params.id, adminId: req.admin.id },
      { isActive: true },
      { new: true }
    );
    
    if (!station) return res.status(404).json({ message: 'Không tìm thấy trạm' });
    
    res.json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Vô hiệu hóa trạm
router.patch('/:id/deactivate', auth, async (req, res) => {
  try {
    const station = await Station.findOneAndUpdate(
      { _id: req.params.id, adminId: req.admin.id },
      { isActive: false },
      { new: true }
    );
    
    if (!station) return res.status(404).json({ message: 'Không tìm thấy trạm' });
    
    res.json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Xóa trạm
router.delete('/:id', auth, async (req, res) => {
  try {
    const station = await Station.findOne({
      _id: req.params.id,
      adminId: req.admin.id
    });
    
    if (!station) return res.status(404).json({ message: 'Không tìm thấy trạm' });

    await Station.deleteOne({ _id: req.params.id });
    res.json({ message: 'Đã xóa trạm' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tạo QR code cho trạm
router.get('/:id/qrcode', auth, async (req, res) => {
  try {
    const station = await Station.findOne({
      _id: req.params.id,
      adminId: req.admin.id
    });
    
    if (!station) return res.status(404).json({ message: 'Không tìm thấy trạm' });

    // Lấy origin URL từ request header hoặc sử dụng CLIENT_URL từ biến môi trường
    const origin = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:3000';
    
    // Tạo URL cho trạm
    const url = `${origin}/station/${station._id}`;
    
    // Tạo QR code với mức sửa lỗi cao để hỗ trợ thêm logo sau này
    const qrCodeDataUrl = await qrcode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 4,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    res.json({ qrCode: qrCodeDataUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 