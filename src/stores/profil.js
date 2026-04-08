import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

// ─── Sejarah ──────────────────────────────────────────────────────────────────
export const useProfilSejarahStore = defineStore('profilSejarah', {
  state: () => ({ data: null, loading: false }),
  actions: {
    async fetch() {
      this.loading = true;
      try { const r = await api.get('/profil/sejarah'); this.data = r.data.data; }
      finally { this.loading = false; }
    },
    async save(formData) {
      this.loading = true;
      try {
        const r = await api.put('/profil/sejarah', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        this.data = r.data.data; return r.data;
      } finally { this.loading = false; }
    },
  },
});

// ─── Visi Misi ────────────────────────────────────────────────────────────────
export const useProfilVisiMisiStore = defineStore('profilVisiMisi', {
  state: () => ({ data: null, loading: false }),
  actions: {
    async fetch() {
      this.loading = true;
      try { const r = await api.get('/profil/visi-misi'); this.data = r.data.data; }
      finally { this.loading = false; }
    },
    async save(payload) {
      this.loading = true;
      try {
        const r = await api.put('/profil/visi-misi', payload);
        this.data = r.data.data; return r.data;
      } finally { this.loading = false; }
    },
  },
});

// ─── Fasilitas ────────────────────────────────────────────────────────────────
export const useProfilFasilitasStore = defineStore('profilFasilitas', {
  state: () => ({ list: [], loading: false }),
  actions: {
    async fetchPublic() {
      this.loading = true;
      try { const r = await api.get('/profil/fasilitas'); this.list = r.data.data; }
      finally { this.loading = false; }
    },
    async fetchAdmin() {
      this.loading = true;
      try { const r = await api.get('/profil/fasilitas/admin'); this.list = r.data.data; }
      finally { this.loading = false; }
    },
    async create(payload) {
      const r = await api.post('/profil/fasilitas', payload);
      this.list.push(r.data.data); return r.data.data;
    },
    async update(id, payload) {
      const r = await api.put(`/profil/fasilitas/${id}`, payload);
      const i = this.list.findIndex(x => x.id === id);
      if (i !== -1) this.list[i] = r.data.data;
      return r.data.data;
    },
    async remove(id) {
      await api.delete(`/profil/fasilitas/${id}`);
      this.list = this.list.filter(x => x.id !== id);
    },
    async addFoto(fasilitasId, formData) {
      const r = await api.post(`/profil/fasilitas/${fasilitasId}/foto`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const f = this.list.find(x => x.id === fasilitasId);
      if (f) f.foto.push(r.data.data);
      return r.data.data;
    },
    async removeFoto(fasilitasId, fotoId) {
      await api.delete(`/profil/fasilitas/foto/${fotoId}`);
      const f = this.list.find(x => x.id === fasilitasId);
      if (f) f.foto = f.foto.filter(p => p.id !== fotoId);
    },
  },
});

// ─── Struktur ─────────────────────────────────────────────────────────────────
export const useProfilStrukturStore = defineStore('profilStruktur', {
  state: () => ({ data: null, loading: false }),
  actions: {
    async fetch() {
      this.loading = true;
      try { const r = await api.get('/profil/struktur'); this.data = r.data.data; }
      finally { this.loading = false; }
    },
    async save(formData) {
      this.loading = true;
      try {
        const r = await api.put('/profil/struktur', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        this.data = r.data.data; return r.data;
      } finally { this.loading = false; }
    },
  },
});

// ─── Pemateri ─────────────────────────────────────────────────────────────────
export const useProfilPemateriStore = defineStore('profilPemateri', {
  state: () => ({ list: [], loading: false }),
  actions: {
    async fetchPublic() {
      this.loading = true;
      try { const r = await api.get('/profil/pemateri'); this.list = r.data.data; }
      finally { this.loading = false; }
    },
    async fetchAdmin() {
      this.loading = true;
      try { const r = await api.get('/profil/pemateri/admin'); this.list = r.data.data; }
      finally { this.loading = false; }
    },
    async create(formData) {
      const r = await api.post('/profil/pemateri', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      this.list.push(r.data.data); return r.data.data;
    },
    async update(id, formData) {
      const r = await api.put(`/profil/pemateri/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const i = this.list.findIndex(x => x.id === id);
      if (i !== -1) this.list[i] = r.data.data;
      return r.data.data;
    },
    async remove(id) {
      await api.delete(`/profil/pemateri/${id}`);
      this.list = this.list.filter(x => x.id !== id);
    },
  },
});
