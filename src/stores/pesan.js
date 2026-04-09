import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import { api } from 'src/boot/axios';

export const usePesanStore = defineStore('pesan', {
  state: () => ({
    list: [],
    summary: null,
    loading: false,
    submitting: false,
  }),

  actions: {
    async createPublic(payload) {
      this.submitting = true;
      try {
        const { data } = await api.post('/pesan', payload);
        Notify.create({ type: 'positive', message: data.message, timeout: 5000 });
        return true;
      } catch (err) {
        const firstError = err.response?.data?.errors?.[0]?.message;
        const msg = firstError || err.response?.data?.message || 'Gagal mengirim pesan.';
        Notify.create({ type: 'negative', message: msg });
        return false;
      } finally {
        this.submitting = false;
      }
    },

    async fetchAll(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/pesan', { params });
        this.list = data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat data pesan.' });
      } finally {
        this.loading = false;
      }
    },

    async fetchSummary() {
      try {
        const { data } = await api.get('/pesan/summary');
        this.summary = data.data;
      } catch {
        this.summary = null;
      }
    },

    async updateStatus(id, status) {
      try {
        const { data } = await api.put(`/pesan/${id}/status`, { status });
        const index = this.list.findIndex((item) => item.id === id);
        if (index !== -1) {
          this.list[index] = data.data;
        }
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memperbarui status pesan.' });
        return false;
      }
    },
  },
});
