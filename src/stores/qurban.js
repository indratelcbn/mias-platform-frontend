import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import { api } from 'src/boot/axios';
import { buildFormData } from 'src/utils/formData';

export const useQurbanStore = defineStore('qurban', {
  state: () => ({
    list: [],
    listAdmin: [],
    meta: { total: 0, page: 1, limit: 24, totalPages: 1 },
    loading: false,
  }),

  actions: {
    async fetchPublic(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/qurban', { params });
        this.list = data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat dokumentasi qurban.' });
      } finally {
        this.loading = false;
      }
    },

    async fetchAdmin(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/qurban/admin/all', { params: { ...params, limit: this.meta.limit } });
        this.listAdmin = data.data;
        this.meta = data.meta;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat data qurban.' });
      } finally {
        this.loading = false;
      }
    },

    async create(payload) {
      try {
        const fd = buildFormData(payload);
        const { data } = await api.post('/qurban', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menambah foto qurban.' });
        return null;
      }
    },

    async update(id, payload) {
      try {
        const fd = buildFormData(payload);
        const { data } = await api.put(`/qurban/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui foto qurban.' });
        return null;
      }
    },

    async remove(id) {
      try {
        await api.delete(`/qurban/${id}`);
        Notify.create({ type: 'positive', message: 'Foto qurban berhasil dihapus.' });
        return true;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal menghapus foto qurban.' });
        return false;
      }
    },
  },
});