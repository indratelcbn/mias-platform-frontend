import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export const useGaleriStore = defineStore('galeri', {
  state: () => ({
    ramadhan: [],
    sholatIed: [],
    listAdmin: [],
    meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    loading: false,
  }),

  actions: {
    async fetchByKategori(kategori) {
      this.loading = true;
      try {
        const { data } = await api.get('/galeri', { params: { kategori } });
        if (kategori === 'RAMADHAN') this.ramadhan = data.data;
        else if (kategori === 'SHOLAT_IED') this.sholatIed = data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat galeri foto.' });
      } finally {
        this.loading = false;
      }
    },

    async fetchAdmin(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/galeri/admin/all', { params: { ...params, limit: this.meta.limit } });
        this.listAdmin = data.data;
        this.meta = data.meta;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat data galeri.' });
      } finally {
        this.loading = false;
      }
    },

    async create(payload) {
      try {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
        const { data } = await api.post('/galeri', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menambah foto.' });
        return null;
      }
    },

    async update(id, payload) {
      try {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
        const { data } = await api.put(`/galeri/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui foto.' });
        return null;
      }
    },

    async remove(id) {
      try {
        await api.delete(`/galeri/${id}`);
        Notify.create({ type: 'positive', message: 'Foto berhasil dihapus.' });
        return true;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal menghapus foto.' });
        return false;
      }
    },
  },
});
