<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold">Rekonsiliasi Bank</div>
        <div class="text-caption text-grey-6">Import mutasi bank dan matching transaksi</div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn unelevated color="primary" icon="upload" label="Import CSV" no-caps @click="openImportDialog" />
        <q-btn unelevated color="secondary" icon="auto_fix_high" label="Auto Match" no-caps @click="openAutoMatchDialog" />
      </div>
    </div>

    <q-dialog v-model="importDialogOpen" persistent>
      <q-card style="min-width: 500px" class="rounded-xl">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Import Mutasi Bank</div>
          <q-space />
          <q-btn flat dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleImportBankCSV" class="q-gutter-md">
            <q-select
              v-model="importForm.accountId"
              :options="bankAccountOptions"
              label="Akun Bank *"
              outlined
              dense
              emit-value
              map-options
              :rules="[val => !!val || 'Akun bank diperlukan']"
            />

            <q-select
              v-model="importForm.bankFormat"
              :options="bankFormatOptions"
              label="Format Bank"
              outlined
              dense
              emit-value
              map-options
            />
            <div class="text-caption text-grey-6 q-mt-xs">
              Untuk format BSI, file tanpa kolom No bisa diproses. Pastikan header mencakup Waktu Transaksi, No Referensi, Nama Pengirim, Bank Pengirim, Nama Penerima, Bank Penerima, Deskripsi, Debet, Kredit, Saldo Riil, dan Kode.
            </div>

            <q-file
              v-model="importForm.file"
              label="File CSV *"
              outlined
              dense
              accept=".csv"
              max-file-size="10485760"
              @rejected="onFileRejected"
              :rules="[val => !!val || 'File CSV diperlukan']"
            >
              <template #prepend>
                <q-icon name="attach_file" />
              </template>
              <template #hint>
                Max 10MB. Format: BCA, Mandiri, BNI, BRI, atau Standard.
              </template>
            </q-file>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Batal" color="grey-7" no-caps v-close-popup />
              <q-btn unelevated type="submit" label="Import" color="primary" no-caps :loading="submitting" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Reconciliation Summary -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card flat bordered class="rounded-xl">
          <q-card-section class="q-pa-lg">
            <div class="text-caption text-grey-6 q-mb-xs">Total Transaksi Bank</div>
            <div class="text-h5 text-weight-bold text-primary">
              {{ summary?.totalBankTransactions || 0 }}
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered class="rounded-xl">
          <q-card-section class="q-pa-lg">
            <div class="text-caption text-grey-6 q-mb-xs">Matched</div>
            <div class="text-h5 text-weight-bold text-green-7">
              {{ summary?.matched || 0 }}
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered class="rounded-xl">
          <q-card-section class="q-pa-lg">
            <div class="text-caption text-grey-6 q-mb-xs">Unmatched</div>
            <div class="text-h5 text-weight-bold text-red-7">
              {{ summary?.unmatched || 0 }}
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered class="rounded-xl">
          <q-card-section class="q-pa-lg">
            <div class="text-caption text-grey-6 q-mb-xs">Pending</div>
            <div class="text-h5 text-weight-bold text-orange-7">
              {{ summary?.pending || 0 }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Bank Imports Table -->
    <q-card flat bordered class="rounded-xl q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-md">
          <q-icon name="cloud_upload" color="primary" class="q-mr-sm" />
          Riwayat Import
        </div>
        <q-table
          :rows="bankImports"
          :columns="importColumns"
          row-key="id"
          :loading="loading"
          flat
          dense
        >
          <template #body-cell-status="props">
            <q-td>
              <div class="text-caption">
                <div class="text-green-7">✓ {{ props.row.insertedRows }} berhasil</div>
                <div v-if="props.row.skippedRows > 0" class="text-orange-7">⊘ {{ props.row.skippedRows }} duplikat</div>
              </div>
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td class="row items-center q-gutter-sm">
              <q-btn flat dense icon="visibility" color="primary" size="sm" @click="viewDetails(props.row)">
                <q-tooltip>Lihat Detail</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.pendingCount > 0"
                flat dense icon="check_circle" color="positive" size="sm"
                @click="confirmImport(props.row)"
              >
                <q-tooltip>Konfirmasi Import</q-tooltip>
              </q-btn>
              <q-btn flat dense icon="delete" color="negative" size="sm" @click="confirmDeleteImport(props.row)">
                <q-tooltip>Hapus</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Reconciliation List -->
    <q-card flat bordered class="rounded-xl">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle1 text-weight-bold">
            <q-icon name="compare_arrows" color="primary" class="q-mr-sm" />
            Daftar Rekonsiliasi
          </div>
          <q-select
            v-model="statusFilter"
            :options="statusOptions"
            label="Filter Status"
            outlined
            dense
            clearable
            emit-value
            map-options
            style="min-width: 150px"
            @update:model-value="loadReconciliations"
          />
        </div>
        <q-table
          :rows="reconciliations"
          :columns="reconColumns"
          row-key="id"
          :loading="loading"
          flat
          dense
        >
          <template #body-cell-debitCredit="props">
            <q-td>
              <q-badge
                :color="props.value === 'Kredit' ? 'green' : 'red'"
                :label="props.value"
              />
            </q-td>
          </template>
          <template #body-cell-status="props">
            <q-td>
              <q-badge
                :color="getStatusColor(props.value)"
                :label="getStatusLabel(props.value)"
              />
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td class="row items-center q-gutter-sm">
              <q-btn flat dense icon="edit" color="primary" size="sm" @click="openAssignProgramDialog(props.row)">
                <q-tooltip>{{ props.row.status === 'MATCHED' ? 'Ubah Program' : 'Masuk Transaksi' }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.status === 'PENDING'"
                flat dense icon="block" color="orange" size="sm"
                @click="confirmMarkAsUnmatched(props.row)"
              >
                <q-tooltip>Tandai Tidak Masuk</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.status === 'MATCHED'"
                flat dense icon="logout" color="orange" size="sm"
                @click="confirmUnmatch(props.row)"
              >
                <q-tooltip>Unmatch</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Auto Match Dialog -->
    <q-dialog v-model="autoMatchDialogOpen" persistent>
      <q-card style="min-width: 500px" class="rounded-xl">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Auto Match Transaksi</div>
          <q-space />
          <q-btn flat dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleAutoMatch" class="q-gutter-md">
            <q-select
              v-model="autoMatchForm.accountId"
              :options="bankAccountOptions"
              label="Akun Bank *"
              outlined
              dense
              emit-value
              map-options
              :rules="[val => !!val || 'Akun bank diperlukan']"
            />

            <q-input
              v-model.number="autoMatchForm.dateTolerance"
              type="number"
              label="Toleransi Tanggal (hari)"
              outlined
              dense
              hint="Selisih tanggal maksimal untuk matching"
            />

            <q-toggle
              v-model="autoMatchForm.autoCreate"
              label="Auto-create transaksi untuk bank yang belum ada pasangan"
              color="primary"
            />

            <q-banner rounded class="bg-amber-1 text-amber-9">
              <template #avatar>
                <q-icon name="warning" color="amber-9" />
              </template>
              <div class="text-caption">
                Auto match akan mencocokkan transaksi bank dengan transaksi internal berdasarkan nominal dan tanggal.
              </div>
            </q-banner>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Batal" color="grey-7" no-caps v-close-popup />
              <q-btn unelevated type="submit" label="Jalankan" color="secondary" no-caps :loading="submitting" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Assign Program Dialog (manual edit for UNMATCHED / PENDING) -->
    <q-dialog v-model="assignDialogOpen" persistent>
      <q-card style="min-width: 500px" class="rounded-xl">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Atur Kode Program Manual</div>
          <q-space />
          <q-btn flat dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section v-if="assignTarget">
          <div class="q-mb-md text-caption text-grey-8">
            <div><strong>Bank:</strong> {{ assignTarget.bankImportDetail?.description || '-' }}</div>
            <div>
              <strong>Nominal:</strong>
              <span>{{ formatCurrency(Number(assignTarget.bankImportDetail?.credit) || Number(assignTarget.bankImportDetail?.debit) || 0) }}</span>
              <q-badge
                class="q-ml-sm"
                :color="Number(assignTarget.bankImportDetail?.credit) > 0 ? 'green' : 'red'"
                :label="Number(assignTarget.bankImportDetail?.credit) > 0 ? 'Pemasukan' : 'Pengeluaran'"
              />
            </div>
            <div><strong>Tanggal:</strong> {{ new Date(assignTarget.bankImportDetail?.transactionDate).toLocaleDateString('id-ID') }}</div>
          </div>

          <q-form @submit="handleAssignProgram" class="q-gutter-md">
            <q-select
              v-model="assignForm.program"
              :options="programOptions"
              label="Pilih Program *"
              outlined
              dense
              emit-value
              map-options
              use-input
              input-debounce="100"
              @filter="filterPrograms"
              :rules="[val => !!val || 'Program wajib dipilih']"
            />

            <q-input
              v-model="assignForm.description"
              label="Deskripsi (opsional)"
              outlined
              dense
              type="textarea"
              autogrow
            />

            <q-input
              v-model="assignForm.notes"
              label="Catatan (opsional)"
              outlined
              dense
            />

            <q-banner rounded class="bg-blue-1 text-blue-9">
              <template #avatar>
                <q-icon name="info" color="blue-9" />
              </template>
              <div class="text-caption">
                Sistem akan membuat / memperbarui transaksi internal dengan kode program di atas dan menandai rekonsiliasi sebagai <strong>MATCHED</strong>.
              </div>
            </q-banner>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Batal" color="grey-7" no-caps v-close-popup />
              <q-btn unelevated type="submit" label="Simpan" color="primary" no-caps :loading="submitting" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useFinanceStore } from 'src/stores/finance';
import { useQuasar } from 'quasar';
import { formatCurrency } from 'src/utils/format';

const $q = useQuasar();
const financeStore = useFinanceStore();

const importDialogOpen = ref(false);
const autoMatchDialogOpen = ref(false);
const assignDialogOpen = ref(false);
const assignTarget = ref(null);
const statusFilter = ref(null);

const assignForm = ref({
  program: null, // value formatted as `${type}:${id}`
  description: '',
  notes: '',
});

const programFilter = ref('');

const importForm = ref({
  accountId: null,
  bankFormat: 'STANDARD',
  file: null,
});

const autoMatchForm = ref({
  accountId: null,
  dateTolerance: 1,
  autoCreate: false,
});

const loading = computed(() => financeStore.loading);
const submitting = computed(() => financeStore.submitting);
const bankImports = computed(() => financeStore.bankImports);
const reconciliations = computed(() => financeStore.reconciliations);
const summary = computed(() => financeStore.reconciliationSummary);
const accounts = computed(() => financeStore.accounts);
const programs = computed(() => financeStore.programs || []);

const programOptions = computed(() => {
  const q = (programFilter.value || '').toLowerCase();
  return programs.value
    .filter((p) => !q || (p.name && p.name.toLowerCase().includes(q)) || (p.code && String(p.code).toLowerCase().includes(q)))
    .map((p) => ({
      label: `${p.type === 'WAKAF' ? '[Wakaf] ' : '[Infaq] '}${p.name}`,
      value: `${p.type}:${p.id}`,
    }));
});

const filterPrograms = (val, update) => {
  update(() => { programFilter.value = val; });
};

const openImportDialog = () => {
  importDialogOpen.value = true;
};

const handleImportBankCSV = async () => {
  if (!importForm.value.accountId || !importForm.value.file) {
    $q.notify({ type: 'negative', message: 'Akun dan file CSV harus dipilih.' });
    return;
  }

  const payload = {
    accountId: importForm.value.accountId,
    bankFormat: importForm.value.bankFormat,
    file: importForm.value.file,
  };

  const result = await financeStore.importBankCSV(payload);
  if (result) {
    importDialogOpen.value = false;
    importForm.value = { accountId: null, bankFormat: 'STANDARD', file: null };
    await Promise.all([financeStore.fetchBankImports(), financeStore.fetchReconciliationSummary(), loadReconciliations()]);
  }
};

const openAutoMatchDialog = () => {
  autoMatchDialogOpen.value = true;
};

const handleAutoMatch = async () => {
  if (!autoMatchForm.value.accountId) {
    $q.notify({ type: 'negative', message: 'Akun bank diperlukan untuk auto match.' });
    return;
  }

  const payload = {
    accountId: autoMatchForm.value.accountId,
    dateTolerance: autoMatchForm.value.dateTolerance,
    autoCreate: autoMatchForm.value.autoCreate,
  };

  const result = await financeStore.autoMatch(payload);
  if (result) {
    autoMatchDialogOpen.value = false;
    await Promise.all([loadReconciliations(), financeStore.fetchBankImports(), financeStore.fetchReconciliationSummary()]);
  }
};

const confirmDeleteImport = async (importRow) => {
  $q.dialog({
    title: 'Konfirmasi',
    message: 'Hapus import ini? Transaksi bank yang sudah diimpor akan tetap ada.',
    cancel: { flat: true, label: 'Batal', color: 'grey-7', noCaps: true },
    ok: { unelevated: true, label: 'Hapus', color: 'negative', noCaps: true },
    persistent: true,
  }).onOk(async () => {
    await financeStore.deleteBankImport(importRow.id);
  });
};

const confirmImport = async (importRow) => {
  $q.dialog({
    title: 'Konfirmasi',
    message: 'Masukkan semua baris hasil import ini ke Transaksi internal?',
    cancel: { flat: true, label: 'Batal', color: 'grey-7', noCaps: true },
    ok: { unelevated: true, label: 'Ya, konfirmasi', color: 'positive', noCaps: true },
    persistent: true,
  }).onOk(async () => {
    const result = await financeStore.confirmBankImport(importRow.id);
    if (result) {
      await Promise.all([financeStore.fetchBankImports(), financeStore.fetchReconciliationSummary(), loadReconciliations()]);
    }
  });
};

const bankAccountOptions = computed(() =>
  accounts.value.filter(a => a.type === 'BANK' && a.isActive).map(a => ({ label: a.name, value: a.id }))
);

const bankFormatOptions = [
  { label: 'Standard (Generic)', value: 'STANDARD' },
  { label: 'BSI (Bank Syariah Indonesia)', value: 'BSI' },
  { label: 'BCA', value: 'BCA' },
  { label: 'Mandiri', value: 'MANDIRI' },
  { label: 'BNI', value: 'BNI' },
  { label: 'BRI', value: 'BRI' },
];

const statusOptions = [
  { label: 'Semua', value: null },
  { label: 'Matched', value: 'MATCHED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Unmatched', value: 'UNMATCHED' },
];

const importColumns = [
  { name: 'uploadedAt', label: 'Tanggal Import', field: 'uploadedAt', align: 'left', format: val => new Date(val).toLocaleString('id-ID') },
  { name: 'fileName', label: 'File', field: 'fileName', align: 'left' },
  { name: 'account', label: 'Akun', field: row => row.account?.name, align: 'left' },
  { name: 'totalRows', label: 'Total', field: 'totalRows', align: 'center' },
  { name: 'pendingCount', label: 'Pending', field: 'pendingCount', align: 'center' },
  { name: 'status', label: 'Status', field: 'id', align: 'left' },
  { name: 'actions', label: 'Aksi', field: 'id', align: 'center' },
];

const reconColumns = [
  { name: 'createdAt', label: 'Tanggal', field: 'createdAt', align: 'left', format: val => new Date(val).toLocaleString('id-ID') },
  { name: 'bankDescription', label: 'Deskripsi Bank', field: row => row.bankImportDetail?.description, align: 'left' },
  // Debet/Kredit column
  {
    name: 'debitCredit',
    label: 'Debet/Kredit',
    field: row => row.bankImportDetail?.credit != null && Number(row.bankImportDetail?.credit) > 0 ? 'Kredit' : 'Debet',
    align: 'center',
    sortable: false,
  },
  {
    name: 'bankAmount',
    label: 'Jumlah Bank',
    field: row => {
      const credit = Number(row.bankImportDetail?.credit) || 0;
      const debit = Number(row.bankImportDetail?.debit) || 0;
      return credit > 0 ? credit : debit;
    },
    align: 'right',
    format: (val) => (val ? formatCurrency(val) : '-'),
  },
  {
    name: 'internalAmount',
    label: 'Jumlah Internal',
    field: row => Number(row.transaction?.amount) || 0,
    align: 'right',
    format: (val) => (val ? formatCurrency(val) : '-'),
  },
  {
    name: 'programName',
    label: 'Program',
    field: row => row.transaction?.programName || row.bankImportDetail?.programName || '-',
    align: 'left',
  },
  {
    name: 'divisiNama',
    label: 'Divisi',
    field: row => row.transaction?.programType ? row.transaction.programType : row.bankImportDetail?.divisiNama || '-',
    align: 'left',
  },
  {
    name: 'programCode',
    label: 'Kode Program',
    field: row => getReconciliationProgramLabel(row),
    align: 'center',
    format: (val) => val || '-',
    sortable: false,
  },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  {
    name: 'matchedBy',
    label: 'Matched By',
    field: 'matchedBy',
    align: 'center',
    format: (val, row) => {
      if (!val) return '-';
      if (val === 'AUTO') return 'Auto Match';
      if (val === 'MANUAL') return 'Manual';
      return row.matchedByName || 'Manual';
    },
  },
  { name: 'actions', label: 'Aksi', field: 'id', align: 'center' },
];

const getStatusColor = (status) => {
  const colors = {
    MATCHED: 'green',
    UNMATCHED: 'red',
    PENDING: 'orange',
  };
  return colors[status] || 'grey';
};

const getStatusLabel = (status) => {
  const labels = {
    MATCHED: 'Matched',
    UNMATCHED: 'Unmatched',
    PENDING: 'Pending',
  };
  return labels[status] || status || '-';
};

const getReconciliationProgramLabel = (row) => {
  if (row?.transaction?.programName) return row.transaction.programName;
  if (row?.bankImportDetail?.programName) return row.bankImportDetail.programName;
  if (row?.transaction?.uniqueCode) return String(row.transaction.uniqueCode).padStart(3, '0');
  if (row?.bankImportDetail?.programCode) return row.bankImportDetail.programCode;
  if (row?.transaction?.programId) return row.transaction.programId;
  return '-';
};

const confirmUnmatch = (recon) => {
  $q.dialog({
    title: 'Konfirmasi',
    message: 'Unmatch rekonsiliasi ini?',
    cancel: { flat: true, label: 'Batal', color: 'grey-7', noCaps: true },
    ok: { unelevated: true, label: 'Unmatch', color: 'orange', noCaps: true },
    persistent: true,
  }).onOk(async () => {
    await financeStore.unmatch(recon.id);
    await loadReconciliations();
  });
};

const confirmMarkAsUnmatched = (recon) => {
  $q.dialog({
    title: 'Konfirmasi',
    message: 'Tandai transaksi ini tidak masuk ke Transaksi internal?',
    cancel: { flat: true, label: 'Batal', color: 'grey-7', noCaps: true },
    ok: { unelevated: true, label: 'Ya, tidak masuk', color: 'negative', noCaps: true },
    persistent: true,
  }).onOk(async () => {
    await financeStore.markAsUnmatched({ bankImportDetailId: recon.bankImportDetail?.id });
    await loadReconciliations();
    await financeStore.fetchReconciliationSummary();
  });
};

const openAssignProgramDialog = (recon) => {
  assignTarget.value = recon;
  // Pre-fill if transaction already has a program
  const existing = recon.transaction;
  let preset = null;
  if (existing?.programType && existing?.programId) {
    preset = `${existing.programType}:${existing.programId}`;
  }
  assignForm.value = {
    program: preset,
    description: existing?.description || recon.bankImportDetail?.description || '',
    notes: existing?.notes || '',
  };
  programFilter.value = '';
  assignDialogOpen.value = true;
};

const handleAssignProgram = async () => {
  if (!assignTarget.value || !assignForm.value.program) return;
  const [programType, programId] = String(assignForm.value.program).split(':');
  const ok = await financeStore.assignReconciliationProgram(assignTarget.value.id, {
    programType,
    programId,
    description: assignForm.value.description || undefined,
    notes: assignForm.value.notes || undefined,
  });
  if (ok) {
    assignDialogOpen.value = false;
    await loadData();
  }
};

// eslint-disable-next-line no-unused-vars
const viewDetails = (importData) => {
  // You can navigate to detail page or show dialog
  $q.notify({ type: 'info', message: 'Detail view coming soon' });
};

const loadReconciliations = async () => {
  const params = { limit: 'all' };
  if (statusFilter.value) params.status = statusFilter.value;
  await financeStore.fetchReconciliations(params);
};

const loadData = async () => {
  await Promise.all([
    financeStore.fetchAccounts(),
    financeStore.fetchBankImports(),
    loadReconciliations(),
    financeStore.fetchReconciliationSummary(),
    financeStore.fetchPrograms(),
  ]);
};

const onFileRejected = () => {
  $q.notify({ type: 'negative', message: 'File terlalu besar atau format tidak valid' });
};

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>
.rounded-xl {
  border-radius: 16px;
}
</style>
