import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    rolePermissions: {},
    loading: false,
  }),

  actions: {
    // ─── User CRUD ─────────────────────────────────────────────────────────
    async fetchUsers() {
      this.loading = true;
      try {
        const { data } = await api.get('/users');
        this.users = data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memuat data pengguna.' });
      } finally {
        this.loading = false;
      }
    },

    async createUser(payload) {
      try {
        const { data } = await api.post('/users', payload);
        this.users.unshift(data.data);
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal membuat pengguna.' });
        return false;
      }
    },

    async updateUser(id, payload) {
      try {
        const { data } = await api.put(`/users/${id}`, payload);
        const idx = this.users.findIndex((u) => u.id === id);
        if (idx !== -1) this.users[idx] = data.data;
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui pengguna.' });
        return false;
      }
    },

    async deleteUser(id) {
      try {
        const { data } = await api.delete(`/users/${id}`);
        this.users = this.users.filter((u) => u.id !== id);
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menghapus pengguna.' });
        return false;
      }
    },

    // ─── Role Permissions ──────────────────────────────────────────────────
    async fetchRolePermissions() {
      try {
        const { data } = await api.get('/users/role-permissions/all');
        this.rolePermissions = data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memuat permission.' });
      }
    },

    async updateRolePermissions(role, menuKeys) {
      try {
        const { data } = await api.put('/users/role-permissions/update', { role, menuKeys });
        this.rolePermissions[role] = data.data;
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui permission.' });
        return false;
      }
    },
  },
});
