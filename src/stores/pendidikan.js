import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export const usePendidikanStore = defineStore('pendidikan', {
  state: () => ({
    // Public: keyed by kategori
    infoByKategori: {},   // { TAHSIN_IKHWAN: {...} }
    fotosByKategori: {},  // { TAHSIN_IKHWAN: [...] }
    yearsByKategori: {},  // { TAHSIN_IKHWAN: [2026, 2025] }
    // Admin
    allInfo: [],
    listFotoAdmin: [],
    meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    loading: false,
  }),

  actions: {
    // ── Public ──────────────────────────────────────────────────────────────
    async fetchByKategori(kategori) {
      this.loading = true;
      try {
        const { data } = await api.get(`/pendidikan/${kategori}`);
        this.infoByKategori[kategori] = data.info;
        this.fotosByKategori[kategori] = data.fotos || [];
        this.yearsByKategori[kategori] = data.availableYears || [];
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat data pendidikan.' });
      } finally {
        this.loading = false;
      }
    },

    // ── Admin: Info ──────────────────────────────────────────────────────────
    async fetchAllInfo() {
      this.loading = true;
      try {
        const { data } = await api.get('/pendidikan/admin/all-info');
        this.allInfo = data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat info pendidikan.' });
      } finally {
        this.loading = false;
      }
    },

    async upsertInfo(kategori, payload) {
      try {
        const { data } = await api.put(`/pendidikan/admin/info/${kategori}`, payload);
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menyimpan info.' });
        return null;
      }
    },

    // ── Admin: Foto ──────────────────────────────────────────────────────────
    async fetchFotoAdmin(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/pendidikan/admin/fotos', { params: { ...params, limit: this.meta.limit } });
        this.listFotoAdmin = data.data;
        this.meta = data.meta;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat foto pendidikan.' });
      } finally {
        this.loading = false;
      }
    },

    async createFoto(payload) {
      try {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
        const { data } = await api.post('/pendidikan/foto', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menambah foto.' });
        return null;
      }
    },

    async updateFoto(id, payload) {
      try {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
        const { data } = await api.put(`/pendidikan/foto/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui foto.' });
        return null;
      }
    },

    async removeFoto(id) {
      try {
        await api.delete(`/pendidikan/foto/${id}`);
        Notify.create({ type: 'positive', message: 'Foto berhasil dihapus.' });
        return true;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal menghapus foto.' });
        return false;
      }
    },
  },
});
