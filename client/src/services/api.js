import axios from 'axios';

// Setup axios instance
// Xác định API URL dựa trên môi trường
let API_URL;
if (process.env.NODE_ENV === 'production') {
  API_URL = process.env.REACT_APP_API_URL || 'https://giaolien-backend-c7ca8074e9c5.herokuapp.com';
} else {
  API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  crossDomain: true
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
  register: (data) => axiosInstance.post('/api/auth/register', data),
  login: (data) => axiosInstance.post('/api/auth/login', data),
  getMe: () => axiosInstance.get('/api/auth/me'),
  updateProfile: (data) => axiosInstance.patch('/api/auth/profile', data),
  checkEmail: (email) => axiosInstance.post('/api/auth/check-email', { email }),
  sendVerificationCode: (email) => axiosInstance.post('/api/auth/send-verification', { email }),
  verifyCode: (email, code) => axiosInstance.post('/api/auth/verify-code', { email, code }),
  resetPassword: (email, code, newPassword) => 
    axiosInstance.post('/api/auth/reset-password', { email, code, password: newPassword }),
  requestPasswordReset: (email) => axiosInstance.post('/api/auth/request-reset', { email }),
  verifyInviteCode: (code) => axiosInstance.post('/api/auth/verify-invite-code', { code }),
  getNotifications: () => axiosInstance.get('/api/auth/notifications')
};

// API trạm
export const stationApi = {
  getAll: () => axiosInstance.get('/api/stations'),
  getById: (id) => axiosInstance.get(`/api/stations/${id}`),
  getByIdForAdmin: (id) => axiosInstance.get(`/api/stations/admin/${id}`),
  create: (data) => axiosInstance.post('/api/stations', data),
  createMultiple: (stationsArray) => axiosInstance.post('/api/stations', stationsArray),
  update: (id, data) => axiosInstance.patch(`/api/stations/${id}`, data),
  delete: (id) => axiosInstance.delete(`/api/stations/${id}`),
  getQRCode: (id) => axiosInstance.get(`/api/stations/${id}/qrcode`),
  uploadImage: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return axiosInstance.post('/api/stations/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// API đội chơi
export const teamApi = {
  getAll: () => axiosInstance.get('/api/teams'),
  getById: (id) => axiosInstance.get(`/api/teams/${id}`),
  create: (data) => axiosInstance.post('/api/teams', data),
  update: (id, data) => axiosInstance.patch(`/api/teams/${id}`, data),
  updateScore: (id, data) => axiosInstance.post(`/api/teams/${id}/score`, data),
  updateStatus: (id, data) => axiosInstance.patch(`/api/teams/${id}/status`, data),
  verifyPassword: (data) => axiosInstance.post('/api/teams/verify', data),
  getRanking: () => axiosInstance.get('/api/teams'),
  delete: (id) => axiosInstance.delete(`/api/teams/${id}`),
  logout: (data) => axiosInstance.post('/api/teams/logout', data)
};

// API submission
export const submissionApi = {
  getAll: () => axiosInstance.get('/api/submissions'),
  getByStation: (stationId) => axiosInstance.get(`/api/submissions/station/${stationId}`),
  getByTeam: (teamName) => axiosInstance.get(`/api/submissions/team/${teamName}`),
  create: (data) => axiosInstance.post('/api/submissions', data),
  getRanking: () => axiosInstance.get('/api/submissions/stats/ranking'),
  exportRanking: () => axiosInstance.get('/api/submissions/stats/ranking/export'),
  resetRanking: () => axiosInstance.delete('/api/submissions/stats/ranking/reset'),
  resetScores: () => axiosInstance.delete('/api/submissions/stats/ranking/reset-scores'),
  deleteAllSubmissions: () => axiosInstance.delete('/api/submissions/delete-all')
};

// API cài đặt hệ thống
export const settingsApi = {
  getSettings: () => axiosInstance.get('/api/settings'),
  updateSettings: (data) => axiosInstance.put('/api/settings', data),
  getPublicSettings: (adminId) => axiosInstance.get(`/api/settings/public/${adminId}`)
};

// Super Admin API
export const superAdminApi = {
  // Admin management
  getAllAdmins: () => axiosInstance.get('/api/superadmin/admins'),
  updateAdmin: (adminId, data) => axiosInstance.patch(`/api/superadmin/admins/${adminId}`, data),
  resetAdminPassword: (adminId, data) => axiosInstance.post(`/api/superadmin/admins/${adminId}/reset-password`, data),
  deleteAdmin: (adminId) => axiosInstance.delete(`/api/superadmin/admins/${adminId}`),
  
  // Invite codes management
  getAllInviteCodes: () => axiosInstance.get('/api/superadmin/invite-codes'),
  createInviteCode: () => axiosInstance.post('/api/superadmin/invite-codes'),
  deleteInviteCode: (codeId) => axiosInstance.delete(`/api/superadmin/invite-codes/${codeId}`),
  
  // Notification management
  getAllNotifications: () => axiosInstance.get('/api/superadmin/notifications'),
  createNotification: (data) => axiosInstance.post('/api/superadmin/notifications', data),
  updateNotification: (notificationId, data) => axiosInstance.patch(`/api/superadmin/notifications/${notificationId}`, data),
  deleteNotification: (notificationId) => axiosInstance.delete(`/api/superadmin/notifications/${notificationId}`),
  
  // Team management
  getAllTeams: () => axiosInstance.get('/api/superadmin/teams'),
  
  // System logs
  getLogs: (page = 1, limit = 50) => 
    axiosInstance.get(`/api/superadmin/logs?page=${page}&limit=${limit}`),
  cleanupLogs: (days) => axiosInstance.post('/api/superadmin/logs/cleanup', { days }),
  
  // System settings
  getSystemSettings: () => axiosInstance.get('/api/superadmin/settings'),
  updateSystemSettings: (data) => axiosInstance.put('/api/superadmin/settings', data),
  
  // IP hạn chế
  addBlockedIP: (ip) => axiosInstance.post('/api/superadmin/settings/blocked-ips', { ip }),
  removeBlockedIP: (ip) => axiosInstance.delete(`/api/superadmin/settings/blocked-ips/${ip}`),
  
  // Database management
  getDatabaseStats: () => axiosInstance.get('/api/superadmin/database/stats'),
  createDatabaseBackup: () => axiosInstance.post('/api/superadmin/database/backup'),
  getBackups: () => axiosInstance.get('/api/superadmin/database/backups'),
  downloadBackup: (filename) => axiosInstance.get(`/api/superadmin/database/backups/${filename}`, {
    responseType: 'blob'
  }),
  deleteBackup: (filename) => axiosInstance.delete(`/api/superadmin/database/backups/${filename}`),
  cleanupSubmissions: (days) => axiosInstance.post('/api/superadmin/database/cleanup/submissions', { days }),
  cleanupNotifications: (days) => axiosInstance.post('/api/superadmin/database/cleanup/notifications', { days }),
  cleanupInactiveTeams: (days) => axiosInstance.post('/api/superadmin/database/cleanup/teams', { days }),
  
  // Thêm phương thức mới
  sendNotificationEmails: () => {
    return axiosInstance.post('/api/superadmin/notifications/send-emails');
  }
};

export default axiosInstance; 