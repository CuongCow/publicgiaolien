const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://cuongdn:v446gy9nDmuyKsqg@cluster0.frhl2tm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  CLIENT_URL: process.env.CLIENT_URL || "http://192.168.1.8:3000",
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "tcl_secret_key_2025"
}; 