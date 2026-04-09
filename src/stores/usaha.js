import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import { buildFormData } from 'src/utils/formData';

// ── Umroh Store ───────────────────────────────────────────────────────────────
export const useUmrohStore = defineStore('umroh', {
  state: () => ({
    list: [],           // public
    listAdmin: [],
    meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    loading: false,
  }),

  actions: {
    async fetchPublic() {
      this.loading = true;
      try {
        const { data } = await api.get('/usaha/umroh');
        this.list = data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat program umroh.' });
      } finally {
        this.loading = false;
      }
    },

    async fetchAdmin(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/usaha/umroh/admin', { params: { ...params, limit: this.meta.limit } });
        this.listAdmin = data.data;
        this.meta = data.meta;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat data umroh.' });
      } finally {
        this.loading = false;
      }
    },

    async create(payload) {
      try {
        const fd = buildFormData(payload);
        const { data } = await api.post('/usaha/umroh', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menambah program.' });
        return null;
      }
    },

    async update(id, payload) {
      try {
        const fd = buildFormData(payload);
        const { data } = await api.put(`/usaha/umroh/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui program.' });
        return null;
      }
    },

    async remove(id) {
      try {
        await api.delete(`/usaha/umroh/${id}`);
        Notify.create({ type: 'positive', message: 'Program umroh berhasil dihapus.' });
        return true;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal menghapus program.' });
        return false;
      }
    },
  },
});

// ── Mias Mart Store ───────────────────────────────────────────────────────────
export const useMartStore = defineStore('mart', {
  state: () => ({
    list: [],           // public
    listAdmin: [],
    meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    loading: false,
  }),

  actions: {
    async fetchPublic() {
      this.loading = true;
      try {
        const { data } = await api.get('/usaha/mart');
        this.list = data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat produk Mias Mart.' });
      } finally {
        this.loading = false;
      }
    },

    async fetchAdmin(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/usaha/mart/admin', { params: { ...params, limit: this.meta.limit } });
        this.listAdmin = data.data;
        this.meta = data.meta;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat data produk.' });
      } finally {
        this.loading = false;
      }
    },

    async create(payload) {
      try {
        const fd = buildFormData(payload);
        const { data } = await api.post('/usaha/mart', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menambah produk.' });
        return null;
      }
    },

    async update(id, payload) {
      try {
        const fd = buildFormData(payload);
        const { data } = await api.put(`/usaha/mart/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui produk.' });
        return null;
      }
    },

    async remove(id) {
      try {
        await api.delete(`/usaha/mart/${id}`);
        Notify.create({ type: 'positive', message: 'Produk berhasil dihapus.' });
        return true;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal menghapus produk.' });
        return false;
      }
    },
  },
});
