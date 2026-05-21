<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold">Transaksi Keuangan</div>
        <div class="text-caption text-grey-6">Kelola pemasukan dan pengeluaran</div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn unelevated color="positive" icon="trending_up" label="Tambah Pemasukan" no-caps @click="openDialog(null, 'IN')" />
        <q-btn unelevated color="negative" icon="trending_down" label="Tambah Pengeluaran" no-caps @click="openDialog(null, 'OUT')" />
      </div>
    </div>

    <!-- Filters & Actions -->
<q-card flat bordered class="rounded-xl q-mb-md">
  <q-card-section>
    <div class="row q-col-gutter-md items-end">

      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.accountId"
          :options="accountOptions"
          label="Akun"
          outlined
          dense
          clearable
          emit-value
          map-options
        />
      </div>

      <div class="col-12 col-md-2">
        <q-select
          v-model="filters.type"
          :options="typeOptions"
          label="Tipe"
          outlined
          dense
          clearable
          emit-value
          map-options
        />
      </div>

      <div class="col-12 col-md-2">
        <q-input
          v-model="filters.startDate"
          type="date"
          label="Dari Tanggal"
          outlined
          dense
        />
      </div>

      <div class="col-12 col-md-2">
        <q-input
          v-model="filters.endDate"
          type="date"
          label="Sampai Tanggal"
          outlined
          dense
        />

        
      </div>

        <div class="row q-gutter-sm q-mt-sm justify-md-end">
          <q-btn
            flat
            color="teal"
            icon="download"
            label="Export Excel"
            no-caps
            @click="exportExcel"
            :loading="exporting"
          />
          <q-btn
            flat
            color="deep-orange"
            icon="picture_as_pdf"
            label="Cetak PDF"
            no-caps
            @click="exportPDF"
            :loading="exporting"
          />

      </div>

      <!-- SEARCH BAR: Selalu di kiri, full width di mobile, di atas filter/export di desktop -->
      <div class="col-12 order-md-1 q-mb-sm q-mb-md-none">
        <div class="row items-center q-col-gutter-sm">
          <div class="col">
            <q-input
              v-model="filters.search"
              label="Cari"
              outlined
              dense
              clearable
              debounce="300"
              @keyup.enter="loadTransactions"
              @clear="loadTransactions"
              
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-auto">
            <q-btn
              unelevated
              color="primary"
              icon="search"
              label="Filter"
              no-caps
              @click="loadTransactions"
              :loading="loading"
            />
          </div>
          <div class="col-auto">
            <q-btn
              flat
              color="grey-7"
              icon="refresh"
              label="Reset"
              no-caps
              @click="resetFilters"
            />
          </div>
        </div>
      </div>

      <!-- EXPORT BUTTONS: Selalu di kanan bawah search di desktop, full width di mobile -->
      

    </div>
  </q-card-section>
</q-card>

    <!-- Transactions Table -->
    <q-card flat bordered class="rounded-xl">
      <q-table
        :rows="transactions"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        v-model:pagination="pagination"
        @request="onRequest"
        :rows-per-page-options="[10, 20, 50]"
      >
        <template #body-cell-no="props">
          <q-td class="text-center">{{ props.rowIndex + 1 + ((pagination.page - 1) * pagination.rowsPerPage) }}</q-td>
        </template>
        <template #body-cell-type="props">
          <q-td>
            <q-chip :color="props.value === 'IN' ? 'green-1' : 'red-1'" :text-color="props.value === 'IN' ? 'green-7' : 'red-7'" dense>
              <q-icon :name="props.value === 'IN' ? 'trending_up' : 'trending_down'" class="q-mr-xs" size="16px" />
              {{ props.value === 'IN' ? 'Masuk' : 'Keluar' }}
            </q-chip>
          </q-td>
        </template>
        <template #body-cell-amount="props">
          <q-td>
            <div class="text-weight-bold" :class="props.row.type === 'IN' ? 'text-green-7' : 'text-red-7'">
              {{ formatCurrency(props.value) }}
            </div>
            <div v-if="props.row.uniqueCode" class="text-caption text-grey-6">
              Kode: {{ String(props.row.uniqueCode).padStart(3, '0') }} • Aktual: {{ formatCurrency(props.row.actualAmount) }}
            </div>
          </q-td>
        </template>
        <template #body-cell-program="props">
          <q-td>
            <div v-if="props.row.programName" class="text-caption">
              <q-badge :color="props.row.programType === 'INFAQ' ? 'blue' : 'purple'" :label="props.row.programType" class="q-mr-xs" />
              {{ props.row.programName }}
            </div>
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td>
            <q-btn flat dense icon="edit" color="primary" size="sm" @click="openDialog(props.row)">
              <q-tooltip>Edit</q-tooltip>
            </q-btn>
            <q-btn flat dense icon="delete" color="negative" size="sm" @click="confirmDelete(props.row)">
              <q-tooltip>Hapus</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Form -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 600px" class="rounded-xl">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">{{ dialogTitle }}</div>
          <q-space />
          <q-btn flat dense icon="close" v-close-popup />
        </q-card-section>

<q-card-section>
  <q-form @submit="handleSubmit">
    <div class="row q-col-gutter-md">
      <div class="col-6">
        <q-select
          v-model="form.accountId"
          :options="accountOptions"
          label="Akun *"
          outlined
          dense
          emit-value
          map-options
          :rules="[val => !!val || 'Akun diperlukan']"
        />
      </div>
      <div class="col-6">
        <q-input
          v-model="form.transactionDate"
          type="date"
          label="Tanggal *"
          outlined
          dense
          :rules="[val => !!val || 'Tanggal diperlukan']"
        />
      </div>

      <div class="col-12">
        <q-input
          v-model="displayAmount"
          label="Jumlah *"
          type="text"
          inputmode="numeric"
          outlined
          dense
          prefix="Rp"
          placeholder="0"
          :rules="[() => Number(form.amount) > 0 || 'Jumlah harus lebih dari 0']"
          @blur="checkUniqueCode"
        >
          <template #hint>
            <span v-if="amountTerbilang" class="text-italic text-capitalize">
              {{ amountTerbilang }}
            </span>
          </template>
        </q-input>
      </div>

      <div v-if="detectedProgram" class="col-12">
        <q-banner rounded class="bg-blue-1 text-blue-9">
          <template #avatar>
            <q-icon name="info" color="blue-9" />
          </template>
          <div class="row items-center">
            <div class="col">
              <div class="text-weight-medium">Kode Unik Terdeteksi!</div>
              <div class="text-caption">
                Kode: {{ String(detectedProgram.uniqueCode).padStart(3, '0') }} •
                Program: {{ detectedProgram.program?.name || 'Tidak ditemukan' }} •
                Nominal Aktual: {{ formatCurrency(detectedProgram.actualAmount) }}
              </div>
            </div>
            <div class="col-auto">
              <q-toggle v-model="applyDetectedProgram" label="Gunakan" color="blue" dense />
            </div>
          </div>
        </q-banner>
      </div>

      <div class="col-12">
        <q-select
          v-model="form.divisi"
          :options="divisiOptions"
          label="Divisi"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="onDivisiChange"
        />
      </div>

      <div v-if="form.divisi" class="col-12">
        <q-select
          v-model="form.programId"
          :options="filteredPrograms"
          option-value="id"
          option-label="name"
          label="Program"
          outlined
          dense
          clearable
          emit-value
          map-options
        />
      </div>

      <div class="col-12">
        <q-input
          v-model="form.description"
          label="Keterangan"
          outlined
          dense
          type="textarea"
          rows="2"
        />
      </div>

      <div class="col-12">
        <q-file
          v-model="form.attachment"
          label="Bukti Dukung"
          outlined
          dense
          accept="image/*"
          max-file-size="5242880"
          @rejected="onFileRejected"
        >
          <template #prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>
      </div>

      <div class="col-12 row justify-end q-gutter-sm q-mt-sm">
        <q-btn flat label="Batal" color="grey-7" no-caps v-close-popup />
        <q-btn
          unelevated
          type="submit"
          label="Simpan"
          :color="form.type === 'IN' ? 'positive' : 'negative'"
          no-caps
          :loading="submitting"
        />
      </div>
    </div>
  </q-form>
</q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from 'src/boot/axios';
import { useFinanceStore } from 'src/stores/finance';
import { useDonasiStore } from 'src/stores/donasi';
import { useQuasar } from 'quasar';
import { formatCurrency, terbilang } from 'src/utils/format';

const $q = useQuasar();
const financeStore = useFinanceStore();
const donasiStore = useDonasiStore();

const dialogOpen = ref(false);
const isEdit = ref(false);
const editId = ref(null);
const detectedProgram = ref(null);
const applyDetectedProgram = ref(true);

const filters = ref({
  accountId: null,
  type: null,
  startDate: '',
  endDate: '',
  search: '',
});
const exporting = ref(false);


const exportExcel = async () => {
  exporting.value = true;
  try {
    const params = { ...filters.value };
    const res = await api.get('/finance/transactions/export/excel', { params, responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Transaksi-Keuangan.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Gagal export Excel.' });
  } finally {
    exporting.value = false;
  }
};


const exportPDF = async () => {
  exporting.value = true;
  try {
    const params = { ...filters.value };
    const res = await api.get('/finance/transactions/export/pdf', { params, responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Transaksi-Keuangan.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Gagal export PDF.' });
  } finally {
    exporting.value = false;
  }
};

const form = ref({
  accountId: null,
  transactionDate: new Date().toISOString().split('T')[0],
  type: 'IN',
  amount: 0,
  divisi: null,
  programType: null,
  programId: null,
  programName: null,
  description: '',
  attachment: null,
});

const pagination = ref({
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
});

const loading = computed(() => financeStore.loading);
const submitting = computed(() => financeStore.submitting);
const transactions = computed(() => financeStore.transactions);
const accounts = computed(() => financeStore.accounts);
const programs = computed(() => financeStore.programs);

const accountOptions = computed(() => 
  accounts.value.filter(a => a.isActive).map(a => ({ label: a.name, value: a.id }))
);

const typeOptions = [
  { label: 'Pemasukan', value: 'IN' },
  { label: 'Pengeluaran', value: 'OUT' },
];

const divisiOptions = ref([]);

const getProgramDivisiValue = (program) => {
  if (!program) return null;
  if (program.divisiId) return program.divisiId;
  if (program.divisi && typeof program.divisi === 'string') return program.divisi;
  if (program.divisi && typeof program.divisi === 'object') return program.divisi.id || null;
  return null;
};

const filteredPrograms = computed(() => {
  if (!form.value.divisi) return programs.value;

  const selectedDivisi = String(form.value.divisi);
  return programs.value.filter((p) => getProgramDivisiValue(p) === selectedDivisi);
});

const loadDivisiOptions = async () => {
  await donasiStore.fetchDivisiOptions();
  divisiOptions.value = donasiStore.divisiOptions;
};

const displayAmount = computed({
  get() {
    const num = Number(form.value.amount) || 0;
    return num > 0 ? new Intl.NumberFormat('id-ID').format(num) : '';
  },
  set(val) {
    const numOnly = String(val ?? '').replace(/\D/g, '');
    form.value.amount = numOnly ? parseInt(numOnly, 10) : 0;
  },
});

const amountTerbilang = computed(() => {
  const num = Number(form.value.amount) || 0;
  if (num <= 0) return '';
  return `${terbilang(num)} rupiah`;
});

const dialogTitle = computed(() => {
  if (isEdit.value) return 'Edit Transaksi';
  return form.value.type === 'IN' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran';
});

const onDivisiChange = () => {
  form.value.programId = null;
  form.value.programType = null;
  form.value.programName = null;
};

const columns = [
  { name: 'no', label: 'No.', align: 'center', style: 'width: 60px' },
  { name: 'transactionDate', label: 'Tanggal', field: 'transactionDate', align: 'left', sortable: true, format: val => new Date(val).toLocaleDateString('id-ID') },
  { name: 'Waktu', label: 'Waktu', field: row => row.Waktu || row.waktu || '-', align: 'center', sortable: false },
  { name: 'transactionCode', label: 'Kode Transaksi', field: row => row.transactionCode || '-', align: 'left', sortable: true },
  { name: 'account', label: 'Akun', field: row => row.account?.name, align: 'left' },
  { name: 'type', label: 'Tipe', field: 'type', align: 'center', sortable: true },
  { name: 'amount', label: 'Jumlah', field: 'amount', align: 'left', sortable: true },
  { name: 'program', label: 'Program', field: 'programName', align: 'left' },
  { name: 'description', label: 'Deskripsi', field: 'description', align: 'left' },
  { name: 'actions', label: 'Aksi', field: 'id', align: 'center' },
];

const checkUniqueCode = async () => {
  if (form.value.type === 'IN' && form.value.amount) {
    const result = await financeStore.parseAmountWithUniqueCode(form.value.amount);
    if (result?.hasUniqueCode) {
      detectedProgram.value = result;
      if (applyDetectedProgram.value && result.program) {
        form.value.programType = result.program.type;
        form.value.programId = result.program.id;
        form.value.programName = result.program.name;
        // Sync divisi from matched program
        const matched = programs.value.find((p) => p.id === result.program.id);
        if (matched?.divisi) form.value.divisi = matched.divisi;
        else if (matched?.divisiId) form.value.divisi = matched.divisiId;
        else if (result.program.divisi) form.value.divisi = result.program.divisi;
        else if (result.program.divisiId) form.value.divisi = result.program.divisiId;
      }
    } else {
      detectedProgram.value = null;
    }
  }
};

const openDialog = (transaction = null, presetType = 'IN') => {
  detectedProgram.value = null;
  if (transaction) {
    isEdit.value = true;
    editId.value = transaction.id;
    // Try to derive divisi from selected program (if available)
    const matched = programs.value.find((p) => p.id === transaction.programId);
    form.value = {
      accountId: transaction.accountId,
      transactionDate: new Date(transaction.transactionDate).toISOString().split('T')[0],
      type: transaction.type,
      amount: Number(transaction.amount),
      divisi: matched?.divisi || matched?.divisiId || null,
      programType: transaction.programType,
      programId: transaction.programId,
      programName: transaction.programName,
      description: transaction.description || '',
      attachment: null,
    };
  } else {
    isEdit.value = false;
    editId.value = null;
    form.value = {
      accountId: null,
      transactionDate: new Date().toISOString().split('T')[0],
      type: presetType,
      amount: 0,
      divisi: null,
      programType: null,
      programId: null,
      programName: null,
      description: '',
      attachment: null,
    };
  }
  dialogOpen.value = true;
};

const handleSubmit = async () => {
  // Sync programType / programName from selected program
  if (form.value.programId) {
    const sel = programs.value.find((p) => p.id === form.value.programId);
    if (sel) {
      form.value.programType = sel.type;
      form.value.programName = sel.name;
    }
  } else {
    form.value.programType = null;
    form.value.programName = null;
  }

  const payload = { ...form.value };
  delete payload.divisi; // backend tidak menyimpan divisi pada transaksi

  const success = isEdit.value
    ? await financeStore.updateTransaction(editId.value, payload)
    : await financeStore.createTransaction(payload);

  if (success) {
    dialogOpen.value = false;
    await loadTransactions();
  }
};

const confirmDelete = (transaction) => {
  $q.dialog({
    title: 'Konfirmasi',
    message: 'Hapus transaksi ini?',
    cancel: { flat: true, label: 'Batal', color: 'grey-7', noCaps: true },
    ok: { unelevated: true, label: 'Hapus', color: 'negative', noCaps: true },
    persistent: true,
  }).onOk(async () => {
    await financeStore.deleteTransaction(transaction.id);
    await loadTransactions();
  });
};

const onRequest = (props) => {
  pagination.value = props.pagination;
  loadTransactions();
};

const loadTransactions = async () => {
  const params = { ...filters.value, page: pagination.value.page, limit: pagination.value.rowsPerPage };
  await financeStore.fetchTransactions(params);
  pagination.value.rowsNumber = financeStore.transactionMeta.total;
};


const resetFilters = () => {
  filters.value = {
    accountId: null,
    type: null,
    startDate: '',
    endDate: '',
    search: '',
  };
  loadTransactions();
};

// Watcher: pencarian langsung saat user mengetik
import { watch } from 'vue';
watch(() => filters.value.search, (val, oldVal) => {
  if (val !== oldVal) {
    pagination.value.page = 1;
    loadTransactions();
  }
});

const onFileRejected = () => {
  $q.notify({ type: 'negative', message: 'File terlalu besar (max 5MB)' });
};

onMounted(async () => {
  await financeStore.fetchAccounts();
  await financeStore.fetchPrograms();
  await loadDivisiOptions();
  await loadTransactions();
});
</script>

<style scoped>
.rounded-xl {
  border-radius: 16px;
}
</style>
