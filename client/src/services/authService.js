import api from './api';

const authService = {
  register: (data) => api.post('/auth/register', data),
  login:    (email, password) => api.post('/auth/login', { email, password }),
  logout:   () => api.post('/auth/logout'),
  getMe:    () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export default authService;
