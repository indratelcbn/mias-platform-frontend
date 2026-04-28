import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

const FORM_FIELDS = [
  'judul', 'konten', 'ringkasan', 'kategori',
  'tanggalPublish', 'isHighlight', 'isPublished',
  'metaTitle', 'metaDescription',
];

function toFormData(obj) {
  const fd = new FormData();
  for (const k of FORM_FIELDS) {
    const v = obj[k];
    if (v === null || v === undefined || v === '') continue;
    if (v instanceof Date) fd.append(k, v.toISOString());
    else fd.append(k, typeof v === 'boolean' ? String(v) : v);
  }
  if (obj.thumbnail instanceof File) fd.append('thumbnail', obj.thumbnail);
  return fd;
}

export const useArtikelStore = defineStore('artikel', {
  state: () => ({
    list: [],
    adminList: [],
    current: null,
    meta: { total: 0, page: 1, limit: 9, totalPages: 1 },
    adminMeta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    loading: false,
  }),

  getters: {
    artikelTerbaru: (state) => state.list.slice(0, 3),
    headlines: (state) => state.list.filter((a) => a.isHighlight),
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

    async fetchAllAdmin(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/artikel/admin/all', {
          params: { page: this.adminMeta.page, limit: this.adminMeta.limit, ...params },
        });
        this.adminList = data.data;
        this.adminMeta = data.meta;
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
        this.current = null;
      } finally {
        this.loading = false;
      }
    },

    async create(payload) {
      try {
        const fd = toFormData(payload);
        const { data } = await api.post('/artikel', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menambah artikel.' });
        return null;
      }
    },

    async update(id, payload) {
      try {
        const fd = toFormData(payload);
        const { data } = await api.put(`/artikel/${id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui artikel.' });
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
