import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('mias_token') || null,
    user: JSON.parse(localStorage.getItem('mias_user') || 'null'),
    loading: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    currentUser: (state) => state.user,
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      try {
        const { data } = await api.post('/auth/login', credentials);
        this.token = data.data.token;
        this.user = data.data.user;
        localStorage.setItem('mias_token', this.token);
        localStorage.setItem('mias_user', JSON.stringify(this.user));
        Notify.create({ type: 'positive', message: 'Login berhasil! Selamat datang.' });
        return true;
      } catch (err) {
        const msg = err.response?.data?.message || 'Login gagal.';
        Notify.create({ type: 'negative', message: msg });
        return false;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('mias_token');
      localStorage.removeItem('mias_user');
      Notify.create({ type: 'info', message: 'Anda telah keluar.' });
    },

    async fetchProfile() {
      try {
        const { data } = await api.get('/auth/profile');
        this.user = data.data;
        localStorage.setItem('mias_user', JSON.stringify(this.user));
      } catch {
        this.logout();
      }
    },
  },
});
