import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    // Accounts
    accounts: [],
    accountsWithBalance: [],
    currentAccount: null,

    // Transactions
    transactions: [],
    currentTransaction: null,
    transactionMeta: { total: 0, page: 1, limit: 20, totalPages: 1 },

    // Dashboard
    dashboardSummary: null,
    fundTracking: [],
    monthlyReport: null,

    // Programs
    programs: [],
    programStatistics: [],

    // Bank Imports
    bankImports: [],
    bankImportMeta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    currentBankImport: null,
    bankImportDetails: [],
    bankImportDetailMeta: { total: 0, page: 1, limit: 50, totalPages: 1 },
    unmatchedBankTransactions: [],

    // Reconciliation
    reconciliations: [],
    reconciliationMeta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    reconciliationSummary: null,
    suggestions: [],

    // UI State
    loading: false,
    submitting: false,
  }),

  getters: {
    activeAccounts: (state) => state.accounts.filter((a) => a.isActive),
    cashAccounts: (state) => state.accountsWithBalance.filter((a) => a.type === 'CASH'),
    bankAccounts: (state) => state.accountsWithBalance.filter((a) => a.type === 'BANK'),
    totalBalance: (state) => state.accountsWithBalance.reduce((sum, a) => sum + Number(a.balance || 0), 0),
  },

  actions: {
    // ═══════════════════════════════════════════════════════════════════════════
    // ─── ACCOUNTS ──────────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    async fetchAccounts(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/finance/accounts', { params });
        this.accounts = data.data;
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Gagal memuat akun.' });
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchAccountsWithBalance() {
      this.loading = true;
      try {
        const { data } = await api.get('/finance/accounts/with-balance');
        this.accountsWithBalance = data.data;
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Gagal memuat akun dengan saldo.' });
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchAccountById(id) {
      this.loading = true;
      try {
        const { data } = await api.get(`/finance/accounts/${id}`);
        this.currentAccount = data.data;
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Gagal memuat detail akun.' });
        return false;
      } finally {
        this.loading = false;
      }
    },

    async createAccount(payload) {
      this.submitting = true;
      try {
        const { data } = await api.post('/finance/accounts', payload);
        Notify.create({ type: 'positive', message: data.message });
        await this.fetchAccounts();
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menambahkan akun.' });
        return false;
      } finally {
        this.submitting = false;
      }
    },

    async updateAccount(id, payload) {
      this.submitting = true;
      try {
        const { data } = await api.put(`/finance/accounts/${id}`, payload);
        Notify.create({ type: 'positive', message: data.message });
        await this.fetchAccounts();
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui akun.' });
        return false;
      } finally {
        this.submitting = false;
      }
    },

    async deleteAccount(id) {
      this.submitting = true;
      try {
        const { data } = await api.delete(`/finance/accounts/${id}`);
        Notify.create({ type: 'positive', message: data.message });
        await this.fetchAccounts();
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menghapus akun.' });
        return false;
      } finally {
        this.submitting = false;
      }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ─── TRANSACTIONS ──────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    async fetchTransactions(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/finance/transactions', {
          params: { page: this.transactionMeta.page, limit: this.transactionMeta.limit, ...params },
        });
        this.transactions = data.data;
        this.transactionMeta = data.meta;
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Gagal memuat transaksi.' });
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchTransactionById(id) {
      this.loading = true;
      try {
        const { data } = await api.get(`/finance/transactions/${id}`);
        this.currentTransaction = data.data;
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Gagal memuat detail transaksi.' });
        return false;
      } finally {
        this.loading = false;
      }
    },

    async createTransaction(payload) {
      this.submitting = true;
      try {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== null && v !== undefined) formData.append(k, v);
        });

        const { data } = await api.post('/finance/transactions', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Notify.create({ type: 'positive', message: data.message });
        await this.fetchTransactions();
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menambahkan transaksi.' });
        return false;
      } finally {
        this.submitting = false;
      }
    },

    async updateTransaction(id, payload) {
      this.submitting = true;
      try {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== null && v !== undefined) formData.append(k, v);
        });

        const { data } = await api.put(`/finance/transactions/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Notify.create({ type: 'positive', message: data.message });
        await this.fetchTransactions();
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal memperbarui transaksi.' });
        return false;
      } finally {
        this.submitting = false;
      }
    },

    async deleteTransaction(id) {
      this.submitting = true;
      try {
        const { data } = await api.delete(`/finance/transactions/${id}`);
        Notify.create({ type: 'positive', message: data.message });
        await this.fetchTransactions();
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menghapus transaksi.' });
        return false;
      } finally {
        this.submitting = false;
      }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ─── DASHBOARD & REPORTS ───────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    async fetchDashboardSummary(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/finance/dashboard', { params });
        this.dashboardSummary = data.data;
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Gagal memuat dashboard.' });
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchFundTracking() {
      this.loading = true;
      try {
        const { data } = await api.get('/finance/fund-tracking');
        this.fundTracking = data.data;
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Gagal memuat fund tracking.' });
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchMonthlyReport(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/finance/reports/monthly', { params });
        this.monthlyReport = data.data;
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Gagal memuat laporan bulanan.' });
        return false;
      } finally {
        this.loading = false;
      }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ─── PROGRAMS ──────────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    async fetchPrograms() {
      try {
        const { data } = await api.get('/finance/programs');
        this.programs = data.data;
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Gagal memuat program.' });
        return false;
      }
    },

    async parseAmountWithUniqueCode(amount) {
      try {
        const { data } = await api.post('/finance/programs/parse-unique-code', { amount });
        return data.data;
      } catch (err) {
        return null;
      }
    },

    async fetchProgramStatistics() {
      this.loading = true;
      try {
        const { data } = await api.get('/finance/programs/statistics');
        this.programStatistics = data.data;
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Gagal memuat statistik program.' });
        return false;
      } finally {
        this.loading = false;
      }
    },

    async syncAllPrograms() {
      this.submitting = true;
      try {
        const { data } = await api.post('/finance/programs/sync');
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal sinkronisasi.' });
        return false;
      } finally {
        this.submitting = false;
      }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ─── BANK IMPORTS ──────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    async fetchBankImports(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/finance/bank-imports', {
          params: { page: this.bankImportMeta.page, limit: this.bankImportMeta.limit, ...params },
        });
        this.bankImports = data.data;
        this.bankImportMeta = data.meta;
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Gagal memuat import bank.' });
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchBankImportDetails(importId, params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get(`/finance/bank-imports/${importId}`, {
          params: { page: this.bankImportDetailMeta.page, limit: this.bankImportDetailMeta.limit, ...params },
        });
        this.currentBankImport = data.header;
        this.bankImportDetails = data.details;
        this.bankImportDetailMeta = data.meta;
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Gagal memuat detail import.' });
        return false;
      } finally {
        this.loading = false;
      }
    },

    async importBankCSV(payload) {
      this.submitting = true;
      try {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== null && v !== undefined) formData.append(k, v);
        });

        const { data } = await api.post('/finance/bank-imports', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const result = data.data;
        if (result.skippedRows > 0) {
          Notify.create({
            type: 'warning',
            message: `Import selesai. ${result.insertedRows} baris ditambahkan, ${result.skippedRows} baris duplikat dilewati.`,
            timeout: 5000,
          });
        } else {
          Notify.create({ type: 'positive', message: data.message });
        }

        await this.fetchBankImports();
        return result;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal import CSV.' });
        return false;
      } finally {
        this.submitting = false;
      }
    },

    async confirmBankImport(importId) {
      this.submitting = true;
      try {
        const { data } = await api.post(`/finance/bank-imports/${importId}/confirm`);
        Notify.create({ type: 'positive', message: data.message });
        await Promise.all([this.fetchBankImports(), this.fetchReconciliationSummary(), this.fetchReconciliations()]);
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal konfirmasi import.' });
        return false;
      } finally {
        this.submitting = false;
      }
    },

    async deleteBankImport(id) {
      this.submitting = true;
      try {
        const { data } = await api.delete(`/finance/bank-imports/${id}`);
        Notify.create({ type: 'positive', message: data.message });
        await this.fetchBankImports();
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal menghapus import.' });
        return false;
      } finally {
        this.submitting = false;
      }
    },

    async fetchUnmatchedBankTransactions(accountId) {
      this.loading = true;
      try {
        const { data } = await api.get('/finance/bank-imports/unmatched', { params: { accountId } });
        this.unmatchedBankTransactions = data.data;
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Gagal memuat transaksi unmatched.' });
        return false;
      } finally {
        this.loading = false;
      }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ─── RECONCILIATION ────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    async fetchReconciliations(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/finance/reconciliation', {
          params: { page: this.reconciliationMeta.page, limit: this.reconciliationMeta.limit, ...params },
        });
        this.reconciliations = data.data;
        this.reconciliationMeta = data.meta;
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: 'Gagal memuat rekonsiliasi.' });
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchReconciliationSummary(accountId) {
      try {
        const { data } = await api.get('/finance/reconciliation/summary', { params: { accountId } });
        this.reconciliationSummary = data.data;
        return true;
      } catch (err) {
        return false;
      }
    },

    async autoMatch(payload) {
      this.submitting = true;
      try {
        const { data } = await api.post('/finance/reconciliation/auto-match', payload);
        Notify.create({
          type: 'positive',
          message: `Auto-match selesai. ${data.data.matched} transaksi berhasil di-match.`,
          timeout: 3000,
        });
        return data.data;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal auto-match.' });
        return false;
      } finally {
        this.submitting = false;
      }
    },

    async manualMatch(payload) {
      this.submitting = true;
      try {
        const { data } = await api.post('/finance/reconciliation/manual-match', payload);
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal manual match.' });
        return false;
      } finally {
        this.submitting = false;
      }
    },

    async unmatch(id) {
      this.submitting = true;
      try {
        const { data } = await api.put(`/finance/reconciliation/${id}/unmatch`);
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal unmatch.' });
        return false;
      } finally {
        this.submitting = false;
      }
    },

    async markAsUnmatched(payload) {
      this.submitting = true;
      try {
        const { data } = await api.post('/finance/reconciliation/mark-unmatched', payload);
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal mark as unmatched.' });
        return false;
      } finally {
        this.submitting = false;
      }
    },

    async fetchSuggestions(bankImportDetailId) {
      try {
        const { data } = await api.get(`/finance/reconciliation/suggestions/${bankImportDetailId}`);
        this.suggestions = data.data;
        return true;
      } catch (err) {
        return false;
      }
    },

    async assignReconciliationProgram(id, payload) {
      this.submitting = true;
      try {
        const { data } = await api.put(`/finance/reconciliation/${id}/assign-program`, payload);
        Notify.create({ type: 'positive', message: data.message });
        return true;
      } catch (err) {
        Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal mengatur program.' });
        return false;
      } finally {
        this.submitting = false;
      }
    },
  },
});
