import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

const notifyErr = (err, fallback) =>
  Notify.create({ type: 'negative', message: err?.response?.data?.message || fallback });

export const useMurojaahStore = defineStore('murojaah', {
  state: () => ({
    daftarKajian: [],
    meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    currentKajian: null,
    loading: false,
  }),

  actions: {
    // ── Kajian ────────────────────────────────────────────────────────────
    async fetchDaftar(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/murojaah', { params });
        this.daftarKajian = data.data;
        this.meta = { total: data.total, page: data.page, limit: data.limit, totalPages: data.totalPages };
      } catch (err) {
        notifyErr(err, 'Gagal memuat daftar kajian.');
      } finally {
        this.loading = false;
      }
    },

    async fetchKajianOptions() {
      try {
        const { data } = await api.get('/murojaah/kajian-options');
        return data.data;
      } catch (err) { notifyErr(err, 'Gagal memuat daftar kajian.'); return []; }
    },

    async fetchDetail(id) {
      this.loading = true;
      try {
        const { data } = await api.get(`/murojaah/${id}`);
        this.currentKajian = data.data;
        return data.data;
      } catch (err) {
        notifyErr(err, 'Gagal memuat detail kajian.');
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createKajian(payload) {
      try {
        const { data } = await api.post('/murojaah', payload);
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) { notifyErr(err, 'Gagal membuat kajian.'); return null; }
    },

    async updateKajian(id, payload) {
      try {
        const { data } = await api.put(`/murojaah/${id}`, payload);
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) { notifyErr(err, 'Gagal memperbarui kajian.'); return null; }
    },

    async deleteKajian(id) {
      try {
        await api.delete(`/murojaah/${id}`);
        Notify.create({ type: 'positive', message: 'Kajian berhasil dihapus.' });
        return true;
      } catch (err) { notifyErr(err, 'Gagal menghapus kajian.'); return false; }
    },

    async updateStatus(id, status) {
      try {
        const { data } = await api.patch(`/murojaah/${id}/status`, { status });
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) { notifyErr(err, 'Gagal mengubah status.'); return false; }
    },

    // ── Sesi ──────────────────────────────────────────────────────────────
    async fetchSesi(kajianId) {
      try {
        const { data } = await api.get(`/murojaah/${kajianId}/sesi`);
        return data.data;
      } catch (err) { notifyErr(err, 'Gagal memuat sesi.'); return []; }
    },

    async fetchSesiDetail(sesiId) {
      try {
        const { data } = await api.get(`/murojaah/sesi/${sesiId}`);
        return data.data;
      } catch (err) { notifyErr(err, 'Gagal memuat detail sesi.'); return null; }
    },

    async createSesi(kajianId, payload) {
      try {
        const { data } = await api.post(`/murojaah/${kajianId}/sesi`, payload);
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) { notifyErr(err, 'Gagal menambah sesi.'); return null; }
    },

    async updateSesi(sesiId, payload) {
      try {
        const { data } = await api.put(`/murojaah/sesi/${sesiId}`, payload);
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) { notifyErr(err, 'Gagal memperbarui sesi.'); return null; }
    },

    async deleteSesi(sesiId) {
      try {
        await api.delete(`/murojaah/sesi/${sesiId}`);
        Notify.create({ type: 'positive', message: 'Sesi berhasil dihapus.' });
        return true;
      } catch (err) { notifyErr(err, 'Gagal menghapus sesi.'); return false; }
    },

    async reorderSesi(kajianId, orderedIds) {
      try {
        const { data } = await api.patch(`/murojaah/${kajianId}/sesi/reorder`, { orderedIds });
        return data.data;
      } catch (err) { notifyErr(err, 'Gagal mengurutkan sesi.'); return null; }
    },

    // ── Materi ────────────────────────────────────────────────────────────
    async createMateri(sesiId, payload) {
      try {
        const isForm = typeof FormData !== 'undefined' && payload instanceof FormData;
        const { data } = await api.post(`/murojaah/sesi/${sesiId}/materi`, payload,
          isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) { notifyErr(err, 'Gagal menambah materi.'); return null; }
    },

    async updateMateri(materiId, payload) {
      try {
        const isForm = typeof FormData !== 'undefined' && payload instanceof FormData;
        const { data } = await api.put(`/murojaah/materi/${materiId}`, payload,
          isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) { notifyErr(err, 'Gagal memperbarui materi.'); return null; }
    },

    async deleteMateri(materiId) {
      try {
        await api.delete(`/murojaah/materi/${materiId}`);
        Notify.create({ type: 'positive', message: 'Materi berhasil dihapus.' });
        return true;
      } catch (err) { notifyErr(err, 'Gagal menghapus materi.'); return false; }
    },

    async reorderMateri(sesiId, orderedIds) {
      try {
        const { data } = await api.patch(`/murojaah/sesi/${sesiId}/materi/reorder`, { orderedIds });
        return data.data;
      } catch (err) { notifyErr(err, 'Gagal mengurutkan materi.'); return null; }
    },

    // ── Soal ──────────────────────────────────────────────────────────────
    async createSoal(sesiId, payload) {
      try {
        const { data } = await api.post(`/murojaah/sesi/${sesiId}/soal`, payload);
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) { notifyErr(err, 'Gagal menambah soal.'); return null; }
    },

    async updateSoal(soalId, payload) {
      try {
        const { data } = await api.put(`/murojaah/soal/${soalId}`, payload);
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) { notifyErr(err, 'Gagal memperbarui soal.'); return null; }
    },

    async deleteSoal(soalId) {
      try {
        await api.delete(`/murojaah/soal/${soalId}`);
        Notify.create({ type: 'positive', message: 'Soal berhasil dihapus.' });
        return true;
      } catch (err) { notifyErr(err, 'Gagal menghapus soal.'); return false; }
    },

    async previewImport(sesiId, soal) {
      try {
        const { data } = await api.post(`/murojaah/sesi/${sesiId}/import-soal/preview`, { soal });
        return data;
      } catch (err) { notifyErr(err, 'Gagal memvalidasi soal.'); return null; }
    },

    async confirmImport(sesiId, soal) {
      try {
        const { data } = await api.post(`/murojaah/sesi/${sesiId}/import-soal/confirm`, { soal });
        Notify.create({ type: 'positive', message: data.message });
        return data;
      } catch (err) { notifyErr(err, 'Gagal mengimport soal.'); return null; }
    },

    // ── Peserta & Rekap ───────────────────────────────────────────────────
    async fetchPeserta(sesiId) {
      try {
        const { data } = await api.get(`/murojaah/sesi/${sesiId}/peserta`);
        return data.data;
      } catch (err) { notifyErr(err, 'Gagal memuat peserta.'); return []; }
    },

    async fetchRekap(kajianId) {
      try {
        const { data } = await api.get(`/murojaah/${kajianId}/rekap`);
        return data.data;
      } catch (err) { notifyErr(err, 'Gagal memuat rekap nilai.'); return []; }
    },

    // ── Publik ────────────────────────────────────────────────────────────
    async publicList(params = {}) {
      try {
        const { data } = await api.get('/murojaah/public', { params });
        return data;
      } catch (err) { notifyErr(err, 'Gagal memuat kajian.'); return null; }
    },

    async publicDetail(slug) {
      try {
        const { data } = await api.get(`/murojaah/public/${slug}`);
        return data.data;
      } catch (err) {
        if (err?.response?.status !== 404) notifyErr(err, 'Gagal memuat kajian.');
        return null;
      }
    },

    async publicSubmit(sesiId, payload) {
      try {
        const { data } = await api.post(`/murojaah/public/sesi/${sesiId}/submit`, payload);
        return { ok: true, data: data.data };
      } catch (err) {
        return { ok: false, message: err?.response?.data?.message || 'Gagal mengirim jawaban.' };
      }
    },

    async publicLeaderboard(slug) {
      try {
        const { data } = await api.get('/murojaah/public/leaderboard', { params: slug ? { slug } : {} });
        return data.data;
      } catch (err) { notifyErr(err, 'Gagal memuat peringkat.'); return null; }
    },
  },
});
