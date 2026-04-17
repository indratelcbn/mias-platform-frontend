import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export const useDonasiStore = defineStore('donasi', {
  state: () => ({
    list: [],
    rekeningList: [],
    programList: [],
    wakafList: [],
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

    async createRekening(payload) {
      try {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== null && v !== undefined) formData.append(k, v);
        });
        const { data } = await api.post('/donasi/rekening', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menyimpan rekening.' });
        return false;
      }
    },

    async updateRekening(id, payload) {
      try {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== null && v !== undefined) formData.append(k, v);
        });
        const { data } = await api.put(`/donasi/rekening/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui rekening.' });
        return false;
      }
    },

    async deleteRekening(id) {
      try {
        const { data } = await api.delete(`/donasi/rekening/${id}`);
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal menghapus rekening.' });
        return false;
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
        Notify.create({ type: 'negative', message: 'Gagal memuat data infaq.' });
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
        Notify.create({ type: 'positive', message: 'Status infaq diperbarui.' });
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

    // ─── Program Infaq ─────────────────────────────────────────────────────
    async fetchActiveProgram() {
      try {
        const { data } = await api.get('/donasi/program');
        this.programList = data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat program infaq.' });
      }
    },

    async fetchAllProgram() {
      this.loading = true;
      try {
        const { data } = await api.get('/donasi/program/all');
        this.programList = data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat program infaq.' });
      } finally {
        this.loading = false;
      }
    },

    async createProgram(payload) {
      try {
        const { data } = await api.post('/donasi/program', payload);
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menyimpan program.' });
        return false;
      }
    },

    async updateProgram(id, payload) {
      try {
        const { data } = await api.put(`/donasi/program/${id}`, payload);
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui program.' });
        return false;
      }
    },

    async deleteProgram(id) {
      try {
        const { data } = await api.delete(`/donasi/program/${id}`);
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal menghapus program.' });
        return false;
      }
    },

    // ─── Program Wakaf ─────────────────────────────────────────────────────
    async fetchActiveWakaf() {
      try {
        const { data } = await api.get('/donasi/wakaf');
        this.wakafList = data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat program wakaf.' });
      }
    },

    async fetchAllWakaf() {
      this.loading = true;
      try {
        const { data } = await api.get('/donasi/wakaf/all');
        this.wakafList = data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat program wakaf.' });
      } finally {
        this.loading = false;
      }
    },

    async createWakaf(payload) {
      try {
        const { data } = await api.post('/donasi/wakaf', payload);
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menyimpan program wakaf.' });
        return false;
      }
    },

    async updateWakaf(id, payload) {
      try {
        const { data } = await api.put(`/donasi/wakaf/${id}`, payload);
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui program wakaf.' });
        return false;
      }
    },

    async deleteWakaf(id) {
      try {
        const { data } = await api.delete(`/donasi/wakaf/${id}`);
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal menghapus program wakaf.' });
        return false;
      }
    },

    // ─── Recalculate Terkumpul ──────────────────────────────────────────────
    async recalcTerkumpul() {
      try {
        const { data } = await api.post('/donasi/recalc-terkumpul');
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal menghitung ulang terkumpul.' });
        return false;
      }
    },
  },
});

