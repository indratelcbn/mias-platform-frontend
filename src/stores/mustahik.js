import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export const useMustahikStore = defineStore('mustahik', {
  state: () => ({
    list: [],
    meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    loading: false,
  }),

  actions: {
    async fetchAll(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/mustahik', {
          params: { page: this.meta.page, limit: this.meta.limit, ...params },
        });
        this.list = data.data;
        this.meta = data.meta;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat data mustahik.' });
      } finally {
        this.loading = false;
      }
    },

    async create(payload) {
      try {
        const { data } = await api.post('/mustahik', payload);
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menyimpan data.' });
        return false;
      }
    },

    async update(id, payload) {
      try {
        const { data } = await api.put(`/mustahik/${id}`, payload);
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui data.' });
        return false;
      }
    },

    async remove(id) {
      try {
        const { data } = await api.delete(`/mustahik/${id}`);
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal menghapus data.' });
        return false;
      }
    },

    async importData(records) {
      try {
        const { data } = await api.post('/mustahik/import', { records });
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal mengimpor data.' });
        return false;
      }
    },

    async exportData(params = {}) {
      try {
        const { data } = await api.get('/mustahik/export', { params });
        return data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal mengekspor data.' });
        return null;
      }
    },

    async downloadExport(format = 'excel', params = {}) {
      try {
        const url = format === 'pdf' ? '/mustahik/export/pdf' : '/mustahik/export/excel';
        const ext = format === 'pdf' ? 'pdf' : 'xlsx';
        const mime = format === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        const response = await api.get(url, { params, responseType: 'blob' });
        const blob = new Blob([response.data], { type: mime });
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `Data-Mustahik-${new Date().toISOString().slice(0, 10)}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
        return true;
      } catch {
        Notify.create({ type: 'negative', message: `Gagal mengunduh ${format.toUpperCase()}.` });
        return false;
      }
    },

    setPage(page) {
      this.meta.page = page;
    },
  },
});
