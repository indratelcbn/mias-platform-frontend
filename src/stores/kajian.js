import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export const useKajianStore = defineStore('kajian', {
  state: () => ({
    list: [],
    current: null,
    meta: { total: 0, page: 1, limit: 9, totalPages: 1 },
    loading: false,
    filters: { ustadz: '', tanggalDari: '', tanggalSampai: '' },
  }),

  getters: {
    kajianTerdekat: (state) => state.list.slice(0, 3),
  },

  actions: {
    async fetchAll(params = {}) {
      this.loading = true;
      try {
        const query = { ...this.filters, ...params, limit: this.meta.limit };
        const { data } = await api.get('/kajian', { params: query });
        this.list = data.data;
        this.meta = data.meta;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Gagal memuat data kajian.' });
      } finally {
        this.loading = false;
      }
    },

    async fetchById(id) {
      this.loading = true;
      try {
        const { data } = await api.get(`/kajian/${id}`);
        this.current = data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Kajian tidak ditemukan.' });
      } finally {
        this.loading = false;
      }
    },

    async create(payload) {
      try {
        const formData = toFormData(payload);
        const { data } = await api.post('/kajian', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        const msg = err.response?.data?.message || 'Gagal menambah kajian.';
        Notify.create({ type: 'negative', message: msg });
        return null;
      }
    },

    async update(id, payload) {
      try {
        const formData = toFormData(payload);
        const { data } = await api.put(`/kajian/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        const msg = err.response?.data?.message || 'Gagal memperbarui kajian.';
        Notify.create({ type: 'negative', message: msg });
        return null;
      }
    },

    async remove(id) {
      try {
        await api.delete(`/kajian/${id}`);
        Notify.create({ type: 'positive', message: 'Kajian berhasil dihapus.' });
        return true;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal menghapus kajian.' });
        return false;
      }
    },

    setPage(page) {
      this.meta.page = page;
      this.fetchAll({ page });
    },

    resetFilters() {
      this.filters = { ustadz: '', tanggalDari: '', tanggalSampai: '' };
    },
  },
});

function toFormData(obj) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== null && v !== undefined) fd.append(k, v);
  });
  return fd;
}
