import axios from 'axios';

// Setup axios instance
// Xác định API URL dựa trên môi trường
let API_URL;
if (process.env.NODE_ENV === 'production') {
  API_URL = process.env.REACT_APP_API_URL || 'https://giaolien-backend.herokuapp.com/api';
} else {
  API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API xác thực
export const authApi = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  getMe: () => axiosInstance.get('/auth/me'),
  updateProfile: (data) => axiosInstance.patch('/auth/profile', data),
  checkEmail: (email) => axiosInstance.post('/auth/check-email', { email }),
  sendVerificationCode: (email) => axiosInstance.post('/auth/send-verification', { email }),
  verifyCode: (email, code) => axiosInstance.post('/auth/verify-code', { email, code }),
  resetPassword: (email, code, newPassword) => 
    axiosInstance.post('/auth/reset-password', { email, code, password: newPassword }),
  requestPasswordReset: (email) => axiosInstance.post('/auth/request-reset', { email })
};

// API trạm
export const stationApi = {
  getAll: () => axiosInstance.get('/stations'),
  getById: (id) => axiosInstance.get(`/stations/${id}`),
  getByIdForAdmin: (id) => axiosInstance.get(`/stations/admin/${id}`),
  create: (data) => axiosInstance.post('/stations', data),
  createMultiple: (stationsArray) => axiosInstance.post('/stations', stationsArray),
  update: (id, data) => axiosInstance.patch(`/stations/${id}`, data),
  delete: (id) => axiosInstance.delete(`/stations/${id}`),
  getQRCode: (id) => axiosInstance.get(`/stations/${id}/qrcode`),
  uploadImage: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return axiosInstance.post('/stations/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// API đội chơi
export const teamApi = {
  getAll: () => axiosInstance.get('/teams'),
  getById: (id) => axiosInstance.get(`/teams/${id}`),
  create: (data) => axiosInstance.post('/teams', data),
  update: (id, data) => axiosInstance.patch(`/teams/${id}`, data),
  updateScore: (id, data) => axiosInstance.post(`/teams/${id}/score`, data),
  updateStatus: (id, data) => axiosInstance.patch(`/teams/${id}/status`, data),
  verifyPassword: (data) => axiosInstance.post('/teams/verify', data),
  getRanking: () => axiosInstance.get('/teams'),
  delete: (id) => axiosInstance.delete(`/teams/${id}`),
  logout: (data) => axiosInstance.post('/teams/logout', data)
};

// API submission
export const submissionApi = {
  getAll: () => axiosInstance.get('/submissions'),
  getByStation: (stationId) => axiosInstance.get(`/submissions/station/${stationId}`),
  getByTeam: (teamName) => axiosInstance.get(`/submissions/team/${teamName}`),
  create: (data) => axiosInstance.post('/submissions', data),
  getRanking: () => axiosInstance.get('/submissions/stats/ranking'),
  exportRanking: () => axiosInstance.get('/submissions/stats/ranking/export'),
  resetRanking: () => axiosInstance.delete('/submissions/stats/ranking/reset'),
  resetScores: () => axiosInstance.delete('/submissions/stats/ranking/reset-scores'),
  deleteAllSubmissions: () => axiosInstance.delete('/submissions/delete-all')
};

// API cài đặt hệ thống
export const settingsApi = {
  getSettings: () => axiosInstance.get('/settings'),
  updateSettings: (data) => axiosInstance.put('/settings', data),
  getPublicSettings: (adminId) => axiosInstance.get(`/settings/public/${adminId}`)
};

export default axiosInstance; 