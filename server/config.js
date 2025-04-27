const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: 5000,
  MONGODB_URI: 'mongodb://localhost:27017/giaolien',
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: 'tcl_secret_key_2025'
}; 