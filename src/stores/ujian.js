import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export const useUjianStore = defineStore('ujian', {
  state: () => ({
    // Admin
    daftarUjian: [],
    metaUjian: { total: 0, page: 1, limit: 20, totalPages: 1 },
    currentUjian: null,
    soalList: [],
    pesertaList: [],
    metaPeserta: { total: 0, page: 1, limit: 50, totalPages: 1 },
    rekapData: null,
    loading: false,
    loadingSoal: false,
    loadingPeserta: false,
  }),

  actions: {
    // ── Admin: Ujian CRUD ───────────────────────────────────────────────────
    async fetchDaftar(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/ujian/admin', { params });
        this.daftarUjian = data.data;
        this.metaUjian = { total: data.total, page: data.page, limit: data.limit, totalPages: data.totalPages };
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat daftar ujian.' });
      } finally {
        this.loading = false;
      }
    },

    async createUjian(payload) {
      try {
        const { data } = await api.post('/ujian/admin', payload);
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal membuat ujian.' });
        return null;
      }
    },

    async fetchDetail(id) {
      this.loading = true;
      try {
        const { data } = await api.get(`/ujian/admin/${id}`);
        this.currentUjian = data.data;
        return data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat detail ujian.' });
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateUjian(id, payload) {
      try {
        const { data } = await api.put(`/ujian/admin/${id}`, payload);
        Notify.create({ type: 'positive', message: data.message });
        this.currentUjian = data.data;
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui ujian.' });
        return null;
      }
    },

    async deleteUjian(id) {
      try {
        await api.delete(`/ujian/admin/${id}`);
        Notify.create({ type: 'positive', message: 'Ujian berhasil dihapus.' });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menghapus ujian.' });
        return false;
      }
    },

    async updateStatus(id, status) {
      try {
        const { data } = await api.patch(`/ujian/admin/${id}/status`, { status });
        Notify.create({ type: 'positive', message: data.message });
        if (this.currentUjian?.id === id) this.currentUjian.status = status;
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal mengubah status.' });
        return false;
      }
    },

    // ── Admin: Soal ─────────────────────────────────────────────────────────
    async fetchSoal(ujianId) {
      this.loadingSoal = true;
      try {
        const { data } = await api.get(`/ujian/admin/${ujianId}/soal`);
        this.soalList = data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat soal.' });
      } finally {
        this.loadingSoal = false;
      }
    },

    async createSoal(ujianId, payload) {
      try {
        const { data } = await api.post(`/ujian/admin/${ujianId}/soal`, payload);
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menambahkan soal.' });
        return null;
      }
    },

    async updateSoal(soalId, payload) {
      try {
        const { data } = await api.put(`/ujian/admin/soal/${soalId}`, payload);
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui soal.' });
        return null;
      }
    },

    async deleteSoal(soalId) {
      try {
        await api.delete(`/ujian/admin/soal/${soalId}`);
        Notify.create({ type: 'positive', message: 'Soal berhasil dihapus.' });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menghapus soal.' });
        return false;
      }
    },

    // ── Admin: Import Soal ──────────────────────────────────────────────────
    async previewImport(ujianId, soal) {
      try {
        const { data } = await api.post(`/ujian/admin/${ujianId}/import-soal/preview`, { soal });
        return data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memvalidasi soal.' });
        return null;
      }
    },

    async confirmImport(ujianId, soal) {
      try {
        const { data } = await api.post(`/ujian/admin/${ujianId}/import-soal/confirm`, { soal });
        Notify.create({ type: 'positive', message: data.message });
        return data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal mengimport soal.' });
        return null;
      }
    },

    // ── Admin: Peserta & Rekap ──────────────────────────────────────────────
    async fetchPeserta(ujianId, params = {}) {
      this.loadingPeserta = true;
      try {
        const { data } = await api.get(`/ujian/admin/${ujianId}/peserta`, { params });
        this.pesertaList = data.data;
        this.metaPeserta = { total: data.total, page: data.page, limit: data.limit, totalPages: data.totalPages };
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat data peserta.' });
      } finally {
        this.loadingPeserta = false;
      }
    },

    async fetchRekap(ujianId) {
      try {
        const { data } = await api.get(`/ujian/admin/${ujianId}/rekap`);
        this.rekapData = data.data;
        return data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat rekap nilai.' });
        return null;
      }
    },
  },
});
