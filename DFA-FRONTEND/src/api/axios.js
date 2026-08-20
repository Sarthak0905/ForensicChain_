import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dfa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dfa_token');
      localStorage.removeItem('dfa_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  requestPasswordReset: (data) => api.post('/auth/request-password-reset', data),
};

// Evidence API
export const evidenceAPI = {
  upload: (data) => api.post('/evidence/upload', data),
  list: (params) => api.get('/evidence/list', { params }),
  getById: (evidenceId) => api.get(`/evidence/${evidenceId}`),
  decrypt: (evidenceId, data) => api.post(`/evidence/${evidenceId}/decrypt`, data || {}),
  verify: (evidenceId) => api.post(`/evidence/${evidenceId}/verify`),
};

// Blockchain API
export const blockchainAPI = {
  getStats: () => api.get('/blockchain/stats'),
  verifyIntegrity: () => api.get('/blockchain/verify'),
};

// System API
export const systemAPI = {
  health: () => api.get('/evidence/health') // Placeholder for real health check
};

export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data)
};

export default api;
