import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import { buildFormData } from 'src/utils/formData';

export const useSosialStore = defineStore('sosial', {
  state: () => ({
    fotoByKategori: {},    // { SANTUNAN_ANAK_YATIM: [...] }  — all years (for tabs)
    yearsByKategori: {},   // { SANTUNAN_ANAK_YATIM: [2026, 2025, ...] }
    listAdmin: [],
    meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    loading: false,
  }),

  actions: {
    async fetchByKategori(kategori) {
      this.loading = true;
      try {
        const { data } = await api.get(`/sosial/${kategori}`);
        this.fotoByKategori[kategori] = data.data;
        this.yearsByKategori[kategori] = data.availableYears || [];
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat foto program sosial.' });
      } finally {
        this.loading = false;
      }
    },

    async fetchAdmin(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/sosial/admin/all', { params: { ...params, limit: this.meta.limit } });
        this.listAdmin = data.data;
        this.meta = data.meta;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat data sosial.' });
      } finally {
        this.loading = false;
      }
    },

    async create(payload) {
      try {
        const fd = buildFormData(payload);
        const { data } = await api.post('/sosial', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menambah foto.' });
        return null;
      }
    },

    async update(id, payload) {
      try {
        const fd = buildFormData(payload);
        const { data } = await api.put(`/sosial/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui foto.' });
        return null;
      }
    },

    async remove(id) {
      try {
        await api.delete(`/sosial/${id}`);
        Notify.create({ type: 'positive', message: 'Foto berhasil dihapus.' });
        return true;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal menghapus foto.' });
        return false;
      }
    },
  },
});
