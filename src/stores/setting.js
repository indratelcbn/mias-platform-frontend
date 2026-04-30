import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export const useSettingStore = defineStore('setting', {
  state: () => ({
    data: {
      facebook: '', instagram: '', youtube: '', whatsapp: '',
      alamat: '', telepon: '', email: '', jamOperasional: '',
      popupImage: '', popupUrl: '', popupIsActive: false,
    },
    loading: false,
  }),
  actions: {
    async fetch() {
      this.loading = true;
      try {
        const res = await api.get('/setting');
        this.data = res.data.data || this.data;
      } finally {
        this.loading = false;
      }
    },
    async save(payload) {
      this.loading = true;
      try {
        const config = payload instanceof FormData
          ? { headers: { 'Content-Type': 'multipart/form-data' } }
          : undefined;
        const res = await api.put('/setting', payload, config);
        this.data = res.data.data;
        return res.data;
      } finally {
        this.loading = false;
      }
    },
  },
});
