import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export const useHeroBannerStore = defineStore('heroBanner', {
  state: () => ({
    items: [],
    loading: false,
  }),
  actions: {
    async fetch() {
      this.loading = true;
      try {
        const res = await api.get('/hero-banner');
        this.items = res.data.data || [];
      } finally {
        this.loading = false;
      }
    },
    async create(formData) {
      const res = await api.post('/hero-banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await this.fetch();
      return res.data;
    },
    async update(id, formData) {
      const res = await api.put(`/hero-banner/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await this.fetch();
      return res.data;
    },
    async remove(id) {
      const res = await api.delete(`/hero-banner/${id}`);
      await this.fetch();
      return res.data;
    },
  },
});
