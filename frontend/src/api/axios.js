import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: adjunta JWT ────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: maneja 401 ────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('vc_token');
      localStorage.removeItem('vc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
