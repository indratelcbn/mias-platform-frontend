import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export const useStreamingStore = defineStore('streaming', {
  state: () => ({
    active: null,
    list: [],
    loading: false,
  }),

  actions: {
    async fetchActive() {
      this.loading = true;
      try {
        const { data } = await api.get('/streaming/active');
        this.active = data.data;
      } catch {
        this.active = null;
      } finally {
        this.loading = false;
      }
    },

    async fetchAll() {
      this.loading = true;
      try {
        const { data } = await api.get('/streaming');
        this.list = data.data;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal memuat data streaming.' });
      } finally {
        this.loading = false;
      }
    },

    async create(payload) {
      try {
        const { data } = await api.post('/streaming', payload);
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menambah streaming.' });
        return null;
      }
    },

    async update(id, payload) {
      try {
        const { data } = await api.put(`/streaming/${id}`, payload);
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui streaming.' });
        return null;
      }
    },

    async setLive(id) {
      try {
        const { data } = await api.patch(`/streaming/${id}/set-live`);
        Notify.create({ type: 'positive', message: data.message });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal mengaktifkan live.' });
        return null;
      }
    },

    async remove(id) {
      try {
        await api.delete(`/streaming/${id}`);
        Notify.create({ type: 'positive', message: 'Streaming berhasil dihapus.' });
        return true;
      } catch {
        Notify.create({ type: 'negative', message: 'Gagal menghapus streaming.' });
        return false;
      }
    },
  },
});
