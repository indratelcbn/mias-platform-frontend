import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('mias_token') || null,
    user: JSON.parse(localStorage.getItem('mias_user') || 'null'),
    permissions: JSON.parse(localStorage.getItem('mias_permissions') || '[]'),
    loading: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    currentUser: (state) => state.user,
    isSuperadmin: (state) => state.user?.role === 'SUPERADMIN',
    hasPermission: (state) => (menuKey) => {
      if (state.user?.role === 'SUPERADMIN') return true;
      return state.permissions.includes(menuKey);
    },
    // First admin route the current user is allowed to land on.
    landingRoute: (state) => {
      if (state.user?.role === 'SUPERADMIN') return 'admin-dashboard';
      // Priority: dashboard > analytics > finance > donasi > kajian > artikel > pesan > divisi
      // > galeri > streaming > sosial > mustahik > pendidikan > usaha > profil > setting > hero-banner > users
      const order = [
        ['admin-dashboard',  'admin-dashboard'],
        ['admin-analytics',  'admin-analytics'],
        ['admin-finance',    'admin-finance-dashboard'],
        ['admin-donasi',     'admin-donasi'],
        ['admin-kajian',     'admin-kajian'],
        ['admin-artikel',    'admin-artikel'],
        ['admin-pesan',      'admin-pesan'],
        ['admin-divisi',     'admin-divisi'],
        ['admin-galeri',     'admin-galeri'],
        ['admin-streaming',  'admin-streaming'],
        ['admin-sosial',     'admin-sosial'],
        ['admin-mustahik',   'admin-mustahik'],
        ['admin-pendidikan', 'admin-pendidikan'],
        ['admin-usaha',      'admin-usaha'],
        ['admin-profil',     'admin-profil'],
        ['admin-setting',    'admin-setting'],
        ['admin-users',      'admin-users'],
      ];
      for (const [perm, name] of order) {
        if (state.permissions.includes(perm)) return name;
      }
      return null;
    },
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      try {
        const { data } = await api.post('/auth/login', credentials);
        this.token = data.data.token;
        this.user = data.data.user;
        this.permissions = data.data.user.permissions || [];
        localStorage.setItem('mias_token', this.token);
        localStorage.setItem('mias_user', JSON.stringify(this.user));
        localStorage.setItem('mias_permissions', JSON.stringify(this.permissions));
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
      this.permissions = [];
      localStorage.removeItem('mias_token');
      localStorage.removeItem('mias_user');
      localStorage.removeItem('mias_permissions');
      Notify.create({ type: 'info', message: 'Anda telah keluar.' });
    },

    async fetchProfile() {
      try {
        const { data } = await api.get('/auth/profile');
        this.user = data.data;
        this.permissions = data.data.permissions || [];
        localStorage.setItem('mias_user', JSON.stringify(this.user));
        localStorage.setItem('mias_permissions', JSON.stringify(this.permissions));
      } catch {
        this.logout();
      }
    },
  },
});
