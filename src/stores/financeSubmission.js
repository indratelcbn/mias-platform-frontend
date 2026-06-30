import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export const useFinanceSubmissionStore = defineStore('financeSubmission', {
  state: () => ({
    submissions: [],
    currentSubmission: null,
    meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    summary: null,
    loading: false,
    submitting: false,
  }),

  getters: {
    draftSubmissions: (state) => state.submissions.filter(s => s.status === 'DRAFT'),
    pendingSubmissions: (state) => state.submissions.filter(s => s.status === 'SUBMITTED'),
    approvedSubmissions: (state) => state.submissions.filter(s => s.status === 'APPROVED'),
    rejectedSubmissions: (state) => state.submissions.filter(s => s.status === 'REJECTED'),
  },

  actions: {
    async fetchSubmissions(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/finance/submissions', {
          params: { page: this.meta.page, limit: this.meta.limit, ...params },
        });
        this.submissions = data.data;
        this.meta = data.meta;
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Gagal memuat pengajuan.' });
        return false;
      } finally { this.loading = false; }
    },

    async fetchSubmissionById(id) {
      this.loading = true;
      try {
        const { data } = await api.get('/finance/submissions/' + id);
        this.currentSubmission = data.data;
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Gagal memuat detail pengajuan.' });
        return null;
      } finally { this.loading = false; }
    },

    async fetchSummary() {
      try {
        const { data } = await api.get('/finance/submissions/summary');
        this.summary = data.data;
        return true;
      } catch (err) { return false; }
    },

    async createSubmission(payload) {
      this.submitting = true;
      try {
        const { data } = await api.post('/finance/submissions', payload);
        Notify.create({ type: 'positive', message: 'Pengajuan berhasil dibuat.' });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal membuat pengajuan.' });
        return false;
      } finally { this.submitting = false; }
    },

    async updateSubmission(id, payload) {
      this.submitting = true;
      try {
        const { data } = await api.put('/finance/submissions/' + id, payload);
        Notify.create({ type: 'positive', message: 'Pengajuan berhasil diubah.' });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal mengubah pengajuan.' });
        return false;
      } finally { this.submitting = false; }
    },

    async deleteSubmission(id) {
      this.submitting = true;
      try {
        await api.delete('/finance/submissions/' + id);
        Notify.create({ type: 'positive', message: 'Pengajuan berhasil dihapus.' });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menghapus pengajuan.' });
        return false;
      } finally { this.submitting = false; }
    },

    async submitSubmission(id) {
      this.submitting = true;
      try {
        const { data } = await api.post('/finance/submissions/' + id + '/submit');
        Notify.create({ type: 'positive', message: 'Pengajuan berhasil diajukan.' });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal mengajukan pengajuan.' });
        return false;
      } finally { this.submitting = false; }
    },

    async approveSubmission(id, notes) {
      this.submitting = true;
      try {
        const { data } = await api.post('/finance/submissions/' + id + '/approve', { notes });
        Notify.create({ type: 'positive', message: 'Pengajuan berhasil disetujui.' });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menyetujui pengajuan.' });
        return false;
      } finally { this.submitting = false; }
    },

    async rejectSubmission(id, rejectionNote) {
      this.submitting = true;
      try {
        const { data } = await api.post('/finance/submissions/' + id + '/reject', { rejectionNote });
        Notify.create({ type: 'positive', message: 'Pengajuan berhasil ditolak.' });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menolak pengajuan.' });
        return false;
      } finally { this.submitting = false; }
    },

    async disburseSubmission(id, disbursementRef) {
      this.submitting = true;
      try {
        const { data } = await api.post('/finance/submissions/' + id + '/disburse', { disbursementRef });
        Notify.create({ type: 'positive', message: 'Dana berhasil dicairkan.' });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal mencairkan dana.' });
        return false;
      } finally { this.submitting = false; }
    },

    getSubmissionPdfUrl(id) {
      return api.defaults.baseURL + '/finance/submissions/' + id + '/pdf';
    },

    getSubmissionsListPdfUrl(params = {}) {
      const qs = new URLSearchParams(params).toString();
      return api.defaults.baseURL + '/finance/submissions/export/pdf/list' + (qs ? '?' + qs : '');
    },
  },
});
