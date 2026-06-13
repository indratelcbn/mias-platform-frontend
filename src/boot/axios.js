import { boot } from 'quasar/wrappers';
import axios from 'axios';
import { Notify } from 'quasar';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mias_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ───────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mias_token');
      localStorage.removeItem('mias_user');
      window.location.href = '/admin/login';
    }
    if (error.response?.status === 403) {
      Notify.create({
        type: 'negative',
        icon: 'block',
        message: error.response?.data?.message || 'Anda tidak bisa melakukan tindakan ini. Role tidak sesuai.',
        position: 'top',
        timeout: 4000,
      });
    }
    return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
