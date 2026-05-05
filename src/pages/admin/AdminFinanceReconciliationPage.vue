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
            <q-td>
              <q-btn flat dense icon="visibility" color="primary" size="sm" @click="viewDetails(props.row)">
                <q-tooltip>Lihat Detail</q-tooltip>
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
          <template #body-cell-status="props">
            <q-td>
              <q-badge
                :color="getStatusColor(props.value)"
                :label="getStatusLabel(props.value)"
              />
            </q-td>
          </template>
          <template #body-cell-bankAmount="props">
            <q-td>
              {{ formatCurrency(props.row.bankImportDetail?.credit || props.row.bankImportDetail?.debit || 0) }}
            </q-td>
          </template>
          <template #body-cell-internalAmount="props">
            <q-td>
              {{ props.row.transaction ? formatCurrency(props.row.transaction.amount) : '-' }}
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td>
              <q-btn
                v-if="props.row.status === 'MATCHED'"
                flat
                dense
                icon="link_off"
                color="orange"
                size="sm"
                @click="confirmUnmatch(props.row)"
              >
                <q-tooltip>Unmatch</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Import CSV Dialog -->
    <q-dialog v-model="importDialogOpen" persistent>
      <q-card style="min-width: 500px" class="rounded-xl">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Import CSV Mutasi Bank</div>
          <q-space />
          <q-btn flat dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleImport" class="q-gutter-md">
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
              label="Format Bank *"
              outlined
              dense
              emit-value
              map-options
            />

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

            <q-banner rounded class="bg-blue-1 text-blue-9">
              <template #avatar>
                <q-icon name="info" color="blue-9" />
              </template>
              <div class="text-caption">
                <strong>Anti Duplicate:</strong> Sistem akan otomatis melewati transaksi yang sudah pernah diimport berdasarkan ID transaksi bank.
              </div>
            </q-banner>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Batal" color="grey-7" no-caps v-close-popup />
              <q-btn unelevated type="submit" label="Import" color="primary" no-caps :loading="submitting" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

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
const statusFilter = ref(null);

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

const bankAccountOptions = computed(() =>
  accounts.value.filter(a => a.type === 'BANK' && a.isActive).map(a => ({ label: a.name, value: a.id }))
);

const bankFormatOptions = [
  { label: 'Standard (Generic)', value: 'STANDARD' },
  { label: 'BCA', value: 'BCA' },
  { label: 'Mandiri', value: 'MANDIRI' },
  { label: 'BNI', value: 'BNI' },
  { label: 'BRI', value: 'BRI' },
];

const statusOptions = [
  { label: 'Semua', value: null },
  { label: 'Matched', value: 'MATCHED' },
  { label: 'Unmatched', value: 'UNMATCHED' },
  { label: 'Pending', value: 'PENDING' },
];

const importColumns = [
  { name: 'uploadedAt', label: 'Tanggal Import', field: 'uploadedAt', align: 'left', format: val => new Date(val).toLocaleString('id-ID') },
  { name: 'fileName', label: 'File', field: 'fileName', align: 'left' },
  { name: 'account', label: 'Akun', field: row => row.account?.name, align: 'left' },
  { name: 'totalRows', label: 'Total', field: 'totalRows', align: 'center' },
  { name: 'status', label: 'Status', field: 'id', align: 'left' },
  { name: 'actions', label: 'Aksi', field: 'id', align: 'center' },
];

const reconColumns = [
  { name: 'createdAt', label: 'Tanggal', field: 'createdAt', align: 'left', format: val => new Date(val).toLocaleString('id-ID') },
  { name: 'bankDescription', label: 'Deskripsi Bank', field: row => row.bankImportDetail?.description, align: 'left' },
  { name: 'bankAmount', label: 'Jumlah Bank', field: 'id', align: 'right' },
  { name: 'internalAmount', label: 'Jumlah Internal', field: 'id', align: 'right' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'matchedBy', label: 'Matched By', field: 'matchedBy', align: 'center' },
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
  return labels[status] || status;
};

const openImportDialog = () => {
  importForm.value = {
    accountId: null,
    bankFormat: 'STANDARD',
    file: null,
  };
  importDialogOpen.value = true;
};

const openAutoMatchDialog = () => {
  autoMatchForm.value = {
    accountId: null,
    dateTolerance: 1,
    autoCreate: false,
  };
  autoMatchDialogOpen.value = true;
};

const handleImport = async () => {
  const result = await financeStore.importBankCSV(importForm.value);
  if (result) {
    importDialogOpen.value = false;
    await loadData();
  }
};

const handleAutoMatch = async () => {
  const result = await financeStore.autoMatch(autoMatchForm.value);
  if (result) {
    autoMatchDialogOpen.value = false;
    $q.notify({
      type: 'positive',
      message: `Auto match selesai! ${result.matched} matched, ${result.created} created, ${result.unmatched} unmatched.`,
      timeout: 5000,
    });
    await loadData();
  }
};

const confirmDeleteImport = (importData) => {
  $q.dialog({
    title: 'Konfirmasi',
    message: `Hapus import "${importData.fileName}"? Semua data detail akan ikut terhapus.`,
    cancel: { flat: true, label: 'Batal', color: 'grey-7', noCaps: true },
    ok: { unelevated: true, label: 'Hapus', color: 'negative', noCaps: true },
    persistent: true,
  }).onOk(async () => {
    await financeStore.deleteBankImport(importData.id);
    await loadData();
  });
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

// eslint-disable-next-line no-unused-vars
const viewDetails = (importData) => {
  // You can navigate to detail page or show dialog
  $q.notify({ type: 'info', message: 'Detail view coming soon' });
};

const loadReconciliations = async () => {
  const params = {};
  if (statusFilter.value) params.status = statusFilter.value;
  await financeStore.fetchReconciliations(params);
};

const loadData = async () => {
  await Promise.all([
    financeStore.fetchAccounts(),
    financeStore.fetchBankImports(),
    loadReconciliations(),
    financeStore.fetchReconciliationSummary(),
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
