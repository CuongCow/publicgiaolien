const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Tắt các warning
    mongoose.set('strictQuery', true);
    
    const MONGO_URI = 'mongodb+srv://cuongdn:v446gy9nDmuyKsqg@cluster0.frhl2tm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout sau 5 giây
      socketTimeoutMS: 45000, // Timeout sau 45 giây
    };

    await mongoose.connect(MONGO_URI, options);
    console.log('MongoDB đã kết nối thành công');
  } catch (err) {
    console.error('Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB; 