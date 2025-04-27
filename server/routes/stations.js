const express = require('express');
const router = express.Router();
const Station = require('../models/Station');
const Team = require('../models/Team');
const qrcode = require('qrcode');
const auth = require('../middleware/auth');
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
    res.json(station);
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

    const updatedStation = await station.save();
    res.json(updatedStation);
  } catch (err) {
    res.status(400).json({ message: err.message });
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

    await station.remove();
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

    // Tạo URL cho trạm
    const url = `${process.env.CLIENT_URL || 'http://192.168.1.8:3000'}/station/${station._id}`;
    
    // Tạo QR code
    const qrCodeDataUrl = await qrcode.toDataURL(url);
    
    res.json({ qrCode: qrCodeDataUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 