import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export const useArtikelStore = defineStore('artikel', {
  state: () => ({
    list: [],
    current: null,
    meta: { total: 0, page: 1, limit: 9, totalPages: 1 },
    loading: false,
  }),

  getters: {
    artikelTerbaru: (state) => state.list.slice(0, 3),
  },

  actions: {
    async fetchAll(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/artikel', {
          params: { page: this.meta.page, limit: this.meta.limit, ...params },
        });
        this.list = data.data;
        this.meta = data.meta;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat data artikel.' });
      } finally {
        this.loading = false;
      }
    },

    async fetchBySlug(slug) {
      this.loading = true;
      try {
        const { data } = await api.get(`/artikel/slug/${slug}`);
        this.current = data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Artikel tidak ditemukan.' });
      } finally {
        this.loading = false;
      }
    },

    async create(payload) {
      try {
        const formData = toFormData(payload);
        const { data } = await api.post('/artikel', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        const msg = err.response?.data?.message || 'Gagal menambah artikel.';
        Notify.create({ type: 'negative', message: msg });
        return null;
      }
    },

    async update(id, payload) {
      try {
        const formData = toFormData(payload);
        const { data } = await api.put(`/artikel/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        const msg = err.response?.data?.message || 'Gagal memperbarui artikel.';
        Notify.create({ type: 'negative', message: msg });
        return null;
      }
    },

    async remove(id) {
      try {
        await api.delete(`/artikel/${id}`);
        Notify.create({ type: 'positive', message: 'Artikel berhasil dihapus.' });
        return true;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal menghapus artikel.' });
        return false;
      }
    },

    setPage(page) {
      this.meta.page = page;
      this.fetchAll({ page });
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
