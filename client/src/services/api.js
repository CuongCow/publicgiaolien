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
    'Accept': 'application/json',
  },
  withCredentials: false
});

// Thêm interceptor để xử lý lỗi
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error:', error);
      return Promise.reject(new Error('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'));
    }
    
    // Xử lý lỗi HTTP từ server
    if (error.response) {
      // Trích xuất message từ response API
      const errorMessage = error.response.data && error.response.data.message 
        ? error.response.data.message 
        : 'Có lỗi xảy ra. Vui lòng thử lại sau.';
        
      // Nếu là lỗi status 400 Bad Request, gói message trong Error object
      if (error.response.status === 400) {
        return Promise.reject(new Error(errorMessage));
      }
    }
    
    return Promise.reject(error);
  }
);

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
  getNotifications: () => axiosInstance.get('/api/auth/notifications'),
  getAllAdmins: () => axiosInstance.get('/api/auth/admins')
};

// API trạm
export const stationApi = {
  getAll: () => axiosInstance.get('/api/stations'),
  getById: (id) => axiosInstance.get(`/api/stations/${id}`),
  getByIdForAdmin: (id) => axiosInstance.get(`/api/stations/admin/${id}`),
  getActiveStationByAdmin: (adminId) => axiosInstance.get(`/api/stations/active/${adminId}`),
  create: (data) => axiosInstance.post('/api/stations', data),
  createMultiple: (stationsArray) => axiosInstance.post('/api/stations', stationsArray),
  update: (id, data) => {
    // Đảm bảo dữ liệu font và định dạng được gửi đi
    const stationData = {
      ...data,
      fontSize: data.fontSize || '1.05rem',
      fontWeight: data.fontWeight || '500',
      lineHeight: data.lineHeight || '1.5',
      paragraphSpacing: data.paragraphSpacing || '0.8rem'
    };
    
    return axiosInstance.patch(`/api/stations/${id}`, stationData);
  },
  setStationActive: (id) => axiosInstance.patch(`/api/stations/${id}/activate`, {}),
  setStationInactive: (id) => axiosInstance.patch(`/api/stations/${id}/deactivate`, {}),
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
  logout: (data) => axiosInstance.post('/api/teams/logout', data),
  forceLogout: (id) => axiosInstance.post(`/api/teams/force-logout/${id}`),
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
  cleanupLogs: (days) => axiosInstance.post('/api/superadmin/logs/cleanup', { olderThanDays: days }),
  
  // System settings
  getSystemSettings: () => axiosInstance.get('/api/superadmin/settings'),
  updateSystemSettings: (data) => axiosInstance.put('/api/superadmin/settings', data),
  
  // IP hạn chế
  addBlockedIP: (ip) => axiosInstance.post('/api/superadmin/settings/blocked-ips', { ip }),
  removeBlockedIP: (ip) => axiosInstance.delete(`/api/superadmin/settings/blocked-ips/${ip}`),
  
  // Database management
  getDatabaseStats: () => axiosInstance.get('/api/superadmin/database/stats'),
  getCollectionDetails: (collectionName, page = 1, limit = 50, adminFilter = null, idFilter = null) => {
    let url = `/api/superadmin/database/collections/${collectionName}?page=${page}&limit=${limit}`;
    if (adminFilter) url += `&adminFilter=${encodeURIComponent(adminFilter)}`;
    if (idFilter) url += `&idFilter=${encodeURIComponent(idFilter)}`;
    return axiosInstance.get(url);
  },
  deleteCollection: (collectionName) => axiosInstance.delete(`/api/superadmin/database/collections/${collectionName}`),
  clearCollection: (collectionName) => axiosInstance.post(`/api/superadmin/database/collections/${collectionName}/clear`),
  deleteDocument: (collectionName, documentId) => axiosInstance.delete(`/api/superadmin/database/collections/${collectionName}/documents/${documentId}`),
  deleteAllCollections: () => axiosInstance.delete('/api/superadmin/database/collections'),
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

// API service cho SecretMessage
export const secretMessageApi = {
  create: (data) => {
    return axiosInstance.post('/api/secret-messages/create', data);
  },
  getAllByAdmin: () => {
    return axiosInstance.get('/api/secret-messages/admin');
  },
  getById: (id) => {
    return axiosInstance.get(`/api/secret-messages/${id}`);
  },
  update: (id, data) => {
    return axiosInstance.put(`/api/secret-messages/${id}`, data)
      .catch(error => {
        console.error('Error updating secret message:', error);
        throw error;
      });
  },
  delete: (id) => {
    return axiosInstance.delete(`/api/secret-messages/${id}`)
      .catch(error => {
        console.error('Error deleting secret message:', error);
        throw error;
      });
  },
  // Phương thức mới để lấy QR code với URL thực tế
  getQRCode: (id) => {
    return axiosInstance.get(`/api/secret-messages/${id}/qrcode`);
  },
  // Phương thức mới cho phản hồi mật thư
  submitAnswer: (secretMessageId, answer) => {
    return axiosInstance.post('/api/secret-messages/response/submit-answer', {
      secretMessageId,
      answer
    });
  },
  submitUserInfo: (secretMessageId, userInfo) => {
    return axiosInstance.post('/api/secret-messages/response/submit-user-info', {
      secretMessageId,
      userInfo
    });
  },
  getMessageResponses: () => {
    return axiosInstance.get('/api/secret-messages/response/admin');
  },
  getRemainingAttempts: (secretMessageId) => {
    return axiosInstance.get(`/api/secret-messages/response/remaining-attempts/${secretMessageId}`);
  },
  checkCorrectAnswer: (secretMessageId) => {
    return axiosInstance.get(`/api/secret-messages/response/check-correct/${secretMessageId}`)
      .catch(error => {
        console.error('Lỗi khi kiểm tra đáp án đúng:', error);
        return { data: { success: false, hasCorrectAnswer: false }};
      });
  },
  deleteMessageResponse: (responseId) => {
    return axiosInstance.delete(`/api/secret-messages/response/${responseId}`);
  },
  deleteAllMessageResponses: () => {
    return axiosInstance.delete('/api/secret-messages/response/all');
  },
  getStatistics: () => {
    return axiosInstance.get('/api/secret-messages/statistics')
      .catch(error => {
        console.error('Lỗi khi lấy thống kê:', error);
        // Trả về dữ liệu rỗng khi có lỗi để tránh crash frontend
        return {
          data: {
            success: true,
            statistics: {
              totalResponses: 0,
              correctResponses: 0,
              incorrectResponses: 0,
              accuracyRate: "0.00",
              dailyStats: [],
              messageStats: [],
              userRankings: []
            },
            error: error.message
          }
        };
      });
  }
};

// API cho biểu mẫu
export const formApi = {
  // Lấy tất cả biểu mẫu
  getAllForms: () => {
    return axiosInstance.get('/forms');
  },
  
  // Lấy biểu mẫu theo ID
  getFormById: (formId) => {
    // Kiểm tra formId hợp lệ trước khi gọi API
    if (!formId || formId === 'undefined' || formId === 'null') {
      return Promise.reject(new Error('ID biểu mẫu không hợp lệ'));
    }
    return axiosInstance.get(`/forms/${formId}`);
  },
  
  // Tạo biểu mẫu mới
  createForm: (formData) => {
    return axiosInstance.post('/forms', formData);
  },
  
  // Cập nhật biểu mẫu
  updateForm: (formId, formData) => {
    return axiosInstance.put(`/forms/${formId}`, formData);
  },
  
  // Xóa biểu mẫu
  deleteForm: (formId) => {
    return axiosInstance.delete(`/forms/${formId}`);
  },
  
  // Lấy các phản hồi của một biểu mẫu
  getFormResponses: (formId) => {
    return axiosInstance.get(`/forms/${formId}/responses`);
  },
  
  // Lấy chi tiết một phản hồi
  getFormResponseById: (formId, responseId) => {
    return axiosInstance.get(`/forms/${formId}/responses/${responseId}`);
  },
  
  // Xuất dữ liệu phản hồi (CSV, Excel,...)
  exportFormResponses: (formId, format = 'csv') => {
    return axiosInstance.get(`/forms/${formId}/export?format=${format}`, { responseType: 'blob' });
  },
  
  // Cập nhật số lượng phản hồi cho biểu mẫu
  updateFormResponseCount: (formId) => {
    return axiosInstance.post(`/forms/${formId}/update-response-count`);
  },
  
  // Lấy biểu mẫu công khai theo slug
  getPublicFormBySlug: (slug) => {
    return axiosInstance.get(`/forms/public/${slug}`);
  },
  
  // Gửi phản hồi cho biểu mẫu
  submitFormResponse: (slug, responseData) => {
    return axiosInstance.post(`/forms/public/${slug}/submit`, responseData);
  }
};

export default axiosInstance; 