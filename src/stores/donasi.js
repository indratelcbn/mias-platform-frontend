import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export const useDonasiStore = defineStore('donasi', {
  state: () => ({
    list: [],
    rekeningList: [],
    summary: null,
    meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
    loading: false,
    submitting: false,
  }),

  actions: {
    async fetchRekening() {
      try {
        const { data } = await api.get('/donasi/rekening');
        this.rekeningList = data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat info rekening.' });
      }
    },

    async fetchAll(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/donasi', {
          params: { page: this.meta.page, limit: this.meta.limit, ...params },
        });
        this.list = data.data;
        this.meta = data.meta;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat data donasi.' });
      } finally {
        this.loading = false;
      }
    },

    async fetchSummary() {
      try {
        const { data } = await api.get('/donasi/summary');
        this.summary = data.data;
      } catch {
        // summary is optional
      }
    },

    async konfirmasi(payload) {
      this.submitting = true;
      try {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== null && v !== undefined) formData.append(k, v);
        });

        const { data } = await api.post('/donasi', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Notify.create({ type: 'positive', message: data.message, timeout: 5000 });
        return true;
      } catch (err) {
        const msg = err.response?.data?.message || 'Gagal mengirim konfirmasi.';
        Notify.create({ type: 'negative', message: msg });
        return false;
      } finally {
        this.submitting = false;
      }
    },

    async updateStatus(id, status) {
      try {
        await api.put(`/donasi/${id}/status`, { status });
        Notify.create({ type: 'positive', message: 'Status donasi diperbarui.' });
        return true;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memperbarui status.' });
        return false;
      }
    },

    setPage(page) {
      this.meta.page = page;
      this.fetchAll({ page });
    },
  },
});
