import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  updatePreferences: (prefsData) => api.put('/auth/preferences', prefsData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  getAchievements: () => api.get('/auth/achievements')
};

// Habit Services
export const habitAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/habits?${params}`);
  },
  getById: (id) => api.get(`/habits/${id}`),
  create: (habitData) => api.post('/habits', habitData),
  update: (id, habitData) => api.put(`/habits/${id}`, habitData),
  delete: (id) => api.delete(`/habits/${id}`),
  toggle: (id, note) => api.post(`/habits/${id}/toggle`, { note }),
  archive: (id) => api.patch(`/habits/${id}/archive`),
  addNote: (id, date, note) => api.post(`/habits/${id}/note`, { date, note }),
  getStats: () => api.get('/habits/stats/overview'),
  getTemplates: () => api.get('/habits/templates/list')
};

// Todo Services
export const todoAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/todos?${params}`);
  },
  create: (todoData) => api.post('/todos', todoData),
  update: (id, todoData) => api.put(`/todos/${id}`, todoData),
  delete: (id) => api.delete(`/todos/${id}`),
  toggle: (id) => api.patch(`/todos/${id}/toggle`),
  getStats: () => api.get('/todos/stats/overview'),
  bulkComplete: (ids) => api.post('/todos/bulk/complete', { ids }),
  bulkDelete: (ids) => api.post('/todos/bulk/delete', { ids })
};

// Health Check
export const healthAPI = {
  check: () => api.get('/health')
};

export default api;
