import axios from 'axios';

const api = axios.create({
  baseURL: 'https://apex-tech-academy-lms.onrender.com/api',
  timeout: 60000, // 60 seconds — email sending can take time
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ───────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ata_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: normalise errors ────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';

    // Auto-logout on 401 (token expired / invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('ata_token');
      window.location.href = '/login';
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
