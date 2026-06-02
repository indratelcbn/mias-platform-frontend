<template>
  <q-page class="q-pa-lg report-page">
    <!-- Header (no print) -->
    <div class="row items-center justify-between q-mb-lg no-print">
      <div>
        <div class="text-h5 text-weight-bold">Laporan Keuangan</div>
        <div class="text-caption text-grey-6">Laporan bulanan komprehensif</div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn unelevated color="primary" icon="print" label="Cetak" no-caps @click="handlePrint" />
        <q-btn unelevated color="red-7" icon="picture_as_pdf" label="Export PDF" no-caps :loading="exportingPdf" @click="exportPDF" />
        <q-btn unelevated color="green-7" icon="download" label="Export Excel" no-caps :loading="exportingExcel" @click="exportExcel" />
      </div>
    </div>

    <!-- Filter (no print) -->
    <q-card flat bordered class="rounded-xl q-mb-md no-print">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.year"
              :options="yearOptions"
              label="Tahun"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.month"
              :options="monthOptions"
              label="Bulan"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.accountId"
              :options="accountOptions"
              label="Akun (Semua jika kosong)"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>
          <div class="col-12 col-md-3">
            <q-btn
              unelevated
              color="primary"
              icon="search"
              label="Tampilkan"
              no-caps
              class="full-width"
              :loading="loading"
              @click="loadReport"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Report Content -->
    <div class="report-content">
      <!-- Print Header (only print) -->
      <div class="print-only print-header q-mb-md">
        <div class="text-h6 text-weight-bold">LAPORAN KEUANGAN</div>
        <div class="text-subtitle2">Masjid Imam Asy Syafi'i - Depok</div>
        <div class="text-caption">Periode: {{ periodLabel }}</div>
        <div class="text-caption">Dicetak: {{ formatDate(new Date()) }}</div>
        <hr />
      </div>

      <!-- Summary Cards -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="rounded-xl summary-card">
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <q-avatar size="40px" color="blue-1" text-color="blue-9" icon="account_balance_wallet" />
                <div class="text-caption text-grey-6 q-ml-sm">Saldo Awal</div>
              </div>
              <div class="text-h6 text-weight-bold text-blue-9">
                {{ formatCurrency(summary.openingBalance) }}
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="rounded-xl summary-card">
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <q-avatar size="40px" color="green-1" text-color="green-9" icon="trending_up" />
                <div class="text-caption text-grey-6 q-ml-sm">Total Pemasukan</div>
              </div>
              <div class="text-h6 text-weight-bold text-green-9">
                {{ formatCurrency(summary.totalIn) }}
              </div>
              <div class="text-caption text-grey-7 q-mt-xs">{{ summary.countIn }} transaksi</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="rounded-xl summary-card">
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <q-avatar size="40px" color="red-1" text-color="red-9" icon="trending_down" />
                <div class="text-caption text-grey-6 q-ml-sm">Total Pengeluaran</div>
              </div>
              <div class="text-h6 text-weight-bold text-red-9">
                {{ formatCurrency(summary.totalOut) }}
              </div>
              <div class="text-caption text-grey-7 q-mt-xs">{{ summary.countOut }} transaksi</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="rounded-xl summary-card gradient-card">
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <q-avatar size="40px" color="white" text-color="primary" icon="savings" />
                <div class="text-caption text-white q-ml-sm">Saldo Akhir</div>
              </div>
              <div class="text-h6 text-weight-bold text-white">
                {{ formatCurrency(summary.closingBalance) }}
              </div>
              <div class="text-caption text-white q-mt-xs">
                Net: {{ formatCurrency(summary.netCashflow) }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Daily Breakdown -->
      <q-card flat bordered class="rounded-xl q-mb-lg">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-md">
            <q-icon name="calendar_view_day" color="primary" class="q-mr-sm" />
            Mutasi Harian
          </div>
          <div v-if="!dailyData.length" class="text-center text-grey-6 q-pa-lg">
            Belum ada transaksi pada periode ini.
          </div>
          <q-markup-table v-else flat dense bordered class="report-table">
            <thead>
              <tr class="bg-grey-2">
                <th class="text-left">Tanggal</th>
                <th class="text-center">Transaksi</th>
                <th class="text-right">Pemasukan</th>
                <th class="text-right">Pengeluaran</th>
                <th class="text-right">Saldo Berjalan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="day in dailyData" :key="day.date">
                <td>{{ formatDateShort(day.date) }}</td>
                <td class="text-center">
                  <q-chip dense color="grey-3" text-color="grey-9" :label="day.count" />
                </td>
                <td class="text-right text-green-7 text-weight-medium">
                  {{ day.totalIn ? formatCurrency(day.totalIn) : '-' }}
                </td>
                <td class="text-right text-red-7 text-weight-medium">
                  {{ day.totalOut ? formatCurrency(day.totalOut) : '-' }}
                </td>
                <td class="text-right text-weight-bold">
                  {{ formatCurrency(day.balance) }}
                </td>
              </tr>
              <tr class="bg-grey-1 text-weight-bold">
                <td>TOTAL</td>
                <td class="text-center">{{ summary.totalTransactions }}</td>
                <td class="text-right text-green-9">{{ formatCurrency(summary.totalIn) }}</td>
                <td class="text-right text-red-9">{{ formatCurrency(summary.totalOut) }}</td>
                <td class="text-right text-primary">{{ formatCurrency(summary.closingBalance) }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card>

      <!-- Account Breakdown -->
      <q-card flat bordered class="rounded-xl q-mb-lg">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-md">
            <q-icon name="account_balance" color="primary" class="q-mr-sm" />
            Rincian per Akun
          </div>
          <div v-if="!accountBreakdown.length" class="text-center text-grey-6 q-pa-md">
            Tidak ada data.
          </div>
          <q-markup-table v-else flat dense bordered class="report-table">
            <thead>
              <tr class="bg-grey-2">
                <th class="text-left">Akun</th>
                <th class="text-center">Tipe</th>
                <th class="text-center">Transaksi</th>
                <th class="text-right">Pemasukan</th>
                <th class="text-right">Pengeluaran</th>
                <th class="text-right">Selisih</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="acc in accountBreakdown" :key="acc.accountId">
                <td>{{ acc.accountName }}</td>
                <td class="text-center">
                  <q-chip dense :color="acc.accountType === 'CASH' ? 'orange-1' : 'blue-1'"
                          :text-color="acc.accountType === 'CASH' ? 'orange-9' : 'blue-9'"
                          :label="acc.accountType === 'CASH' ? 'Kas' : 'Bank'" />
                </td>
                <td class="text-center">{{ acc.count }}</td>
                <td class="text-right text-green-7">{{ formatCurrency(acc.totalIn) }}</td>
                <td class="text-right text-red-7">{{ formatCurrency(acc.totalOut) }}</td>
                <td class="text-right text-weight-bold"
                    :class="acc.balance >= 0 ? 'text-green-9' : 'text-red-9'">
                  {{ formatCurrency(acc.balance) }}
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card>

      <!-- Divisi Breakdown -->
      <q-card flat bordered class="rounded-xl q-mb-lg">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-md">
            <q-icon name="groups" color="primary" class="q-mr-sm" />
            Rincian per Divisi
          </div>
          <q-markup-table flat dense bordered class="report-table">
            <thead>
              <tr class="bg-grey-2">
                <th class="text-left">Divisi</th>
                <th class="text-right">Saldo Awal</th>
                <th class="text-center">Transaksi</th>
                <th class="text-right">Pemasukan</th>
                <th class="text-right">Pengeluaran</th>
                <th class="text-right">Saldo Akhir</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in divisiBreakdown" :key="d.divisiId || d.divisi">
<td>
  <q-badge
    :color="divisiColor(d.divisiNama)"
    :label="divisiLabel(d.divisi, d.divisiNama)"
    text-color="white"
    v-if="divisiColor(d.divisiNama) !== 'grey'"
  />
  <q-badge
    color="grey-3"
    :label="divisiLabel(d.divisi, d.divisiNama)"
    text-color="grey-9"
    v-else
  />
</td>
                <td class="text-right text-weight-medium">
                  {{ formatCurrency(d.openingBalance || 0) }}
                </td>
                <td class="text-center">{{ d.count }}</td>
                <td class="text-right text-green-7">{{ formatCurrency(d.totalIn) }}</td>
                <td class="text-right text-red-7">{{ formatCurrency(d.totalOut) }}</td>
                <td class="text-right text-weight-bold"
                    :class="(d.closingBalance || 0) >= 0 ? 'text-green-9' : 'text-red-9'">
                  {{ formatCurrency(d.closingBalance || 0) }}
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card>

      <!-- Program Breakdown -->
      <q-card v-if="programBreakdown.length" flat bordered class="rounded-xl q-mb-lg">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-md">
            <q-icon name="volunteer_activism" color="primary" class="q-mr-sm" />
            Rincian per Program
          </div>
          <q-markup-table flat dense bordered class="report-table">
            <thead>
              <tr class="bg-grey-2">
                <th class="text-left">Program</th>
                <th class="text-left">Nama Akun</th>
                <th class="text-center">Tipe</th>
                <th class="text-right">Saldo Awal</th>
                <th class="text-center">Transaksi</th>
                <th class="text-right">Pemasukan</th>
                <th class="text-right">Pengeluaran</th>
                <th class="text-right">Saldo Akhir</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in programBreakdown" :key="`${p.programType}-${p.programId}-${p.accountId}`">
                <td>{{ p.programName }}</td>
                <td>{{ p.accountName || '-' }}</td>
                <td class="text-center">
                  <q-badge :color="p.programType === 'INFAQ' ? 'blue' : 'purple'" :label="p.programType" />
                </td>
                <td class="text-right text-weight-medium">
                  {{ formatCurrency(p.openingBalance || 0) }}
                </td>
                <td class="text-center">{{ p.count }}</td>
                <td class="text-right text-green-7">{{ formatCurrency(p.totalIn) }}</td>
                <td class="text-right text-red-7">{{ formatCurrency(p.totalOut) }}</td>
                <td class="text-right text-weight-bold"
                    :class="(p.closingBalance || 0) >= 0 ? 'text-green-9' : 'text-red-9'">
                  {{ formatCurrency(p.closingBalance || 0) }}
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card>

      <!-- Category Breakdown -->
      <q-card v-if="categoryBreakdown.length" flat bordered class="rounded-xl q-mb-lg">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-md">
            <q-icon name="category" color="primary" class="q-mr-sm" />
            Rincian per Kategori
          </div>
          <q-markup-table flat dense bordered class="report-table">
            <thead>
              <tr class="bg-grey-2">
                <th class="text-left">Kategori</th>
                <th class="text-center">Transaksi</th>
                <th class="text-right">Pemasukan</th>
                <th class="text-right">Pengeluaran</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in categoryBreakdown" :key="c.category">
                <td>{{ c.category }}</td>
                <td class="text-center">{{ c.count }}</td>
                <td class="text-right text-green-7">{{ formatCurrency(c.totalIn) }}</td>
                <td class="text-right text-red-7">{{ formatCurrency(c.totalOut) }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card>

      <!-- Detail Transactions (collapsible) -->
      <q-card flat bordered class="rounded-xl q-mb-lg">
        <q-expansion-item
          icon="list_alt"
          label="Detail Semua Transaksi"
          :caption="`${transactions.length} transaksi`"
          header-class="text-weight-bold"
          default-opened
        >
          <q-card-section>
            <div v-if="!transactions.length" class="text-center text-grey-6 q-pa-md">
              Tidak ada transaksi.
            </div>
            <q-markup-table v-else flat dense bordered class="report-table">
              <thead>
                <tr class="bg-grey-2">
                  <th class="text-left">Tanggal</th>
                  <th class="text-left">Akun</th>
                  <th class="text-left">Deskripsi</th>
                  <th class="text-center">Tipe</th>
                  <th class="text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in transactions" :key="t.id">
                  <td>{{ formatDateShort(t.transactionDate) }}</td>
                  <td>{{ t.account?.name || '-' }}</td>
                  <td>
                    <div>{{ t.description || '-' }}</div>
                    <div v-if="t.programName" class="text-caption text-grey-6">
                      {{ t.programType }} - {{ t.programName }}
                    </div>
                  </td>
                  <td class="text-center">
                    <q-chip dense :color="t.type === 'IN' ? 'green-1' : 'red-1'"
                            :text-color="t.type === 'IN' ? 'green-7' : 'red-7'"
                            :label="t.type === 'IN' ? 'Masuk' : 'Keluar'" />
                  </td>
                  <td class="text-right text-weight-medium"
                      :class="t.type === 'IN' ? 'text-green-7' : 'text-red-7'">
                    {{ formatCurrency(t.amount) }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-card-section>
        </q-expansion-item>
      </q-card>

      <!-- Print Footer -->
      <div class="print-only print-footer">
        <hr />
        <div class="row justify-between text-caption">
          <div>Laporan dibuat oleh sistem MIAS</div>
          <div>Halaman terhitung otomatis</div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useFinanceStore } from 'src/stores/finance';
import { formatCurrency, formatDate, formatDateShort } from 'src/utils/format';

const $q = useQuasar();
const financeStore = useFinanceStore();

const loading = ref(false);
const exportingExcel = ref(false);
const exportingPdf = ref(false);
const now = new Date();

const filters = reactive({
  year: now.getFullYear(),
  month: now.getMonth() + 1,
  accountId: null,
});

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const monthOptions = monthNames.map((name, idx) => ({ label: name, value: idx + 1 }));

const yearOptions = computed(() => {
  const arr = [];
  for (let y = now.getFullYear() - 5; y <= now.getFullYear() + 1; y += 1) {
    arr.push({ label: String(y), value: y });
  }
  return arr;
});

const accountOptions = computed(() =>
  financeStore.accountsWithBalance.map((a) => ({
    label: `${a.name} (${a.type === 'CASH' ? 'Kas' : 'Bank'})`,
    value: a.id,
  }))
);

const report = computed(() => financeStore.monthlyReport || {});
const summary = computed(() => report.value.summary || {
  openingBalance: 0, closingBalance: 0, totalIn: 0, totalOut: 0,
  netCashflow: 0, countIn: 0, countOut: 0, totalTransactions: 0,
});
const dailyData = computed(() => report.value.dailyData || []);
const accountBreakdown = computed(() => report.value.accountBreakdown || []);
const categoryBreakdown = computed(() => report.value.categoryBreakdown || []);
const programBreakdown = computed(() => report.value.programBreakdown || []);
const divisiBreakdown = computed(() =>
  (report.value.divisiBreakdown || []).filter((d) => d.divisi !== 'DAKWAH')
);
const transactions = computed(() => report.value.transactions || []);

const periodLabel = computed(
  () => `${monthNames[filters.month - 1]} ${filters.year}`
);

const divisiColor = (divisiNama) => {
  const key = String(divisiNama || '').trim().toLowerCase();
  const map = {
    'sosial': 'green',
    'pendidikan': 'purple',
    'usaha': 'orange',
    'multimedia': 'pink',
    'operasional dan dakwah': 'blue-grey',
    'wakaf': 'teal',
  };
  return map[key] || 'grey';
};


const divisiLabel = (divisi, divisiNama) => {
  return divisiNama || divisi || '-';
};

const loadReport = async () => {
  loading.value = true;
  await financeStore.fetchMonthlyReport({
    year: filters.year,
    month: filters.month,
    accountId: filters.accountId || undefined,
  });
  loading.value = false;
};

const handlePrint = () => {
  window.print();
};

const downloadReport = async (format) => {
  const params = {
    year: filters.year,
    month: filters.month,
  };
  if (filters.accountId) params.accountId = filters.accountId;

  const url = format === 'excel' ? '/finance/reports/monthly/excel' : '/finance/reports/monthly/pdf';
  const ext = format === 'excel' ? 'xlsx' : 'pdf';

  const response = await api.get(url, {
    params,
    responseType: 'blob',
  });

  const blob = new Blob([response.data], {
    type: format === 'excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Laporan-Keuangan-${filters.year}-${String(filters.month).padStart(2, '0')}.${ext}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

const exportExcel = async () => {
  if (!transactions.value.length) {
    $q.notify({ type: 'warning', message: 'Tidak ada data untuk diexport.' });
    return;
  }
  exportingExcel.value = true;
  try {
    await downloadReport('excel');
    $q.notify({ type: 'positive', message: 'Laporan Excel berhasil diunduh.' });
  } catch (err) {
    console.error(err);
    $q.notify({ type: 'negative', message: 'Gagal mengunduh laporan Excel.' });
  } finally {
    exportingExcel.value = false;
  }
};

const exportPDF = async () => {
  if (!transactions.value.length) {
    $q.notify({ type: 'warning', message: 'Tidak ada data untuk diexport.' });
    return;
  }
  exportingPdf.value = true;
  try {
    await downloadReport('pdf');
    $q.notify({ type: 'positive', message: 'Laporan PDF berhasil diunduh.' });
  } catch (err) {
    console.error(err);
    $q.notify({ type: 'negative', message: 'Gagal mengunduh laporan PDF.' });
  } finally {
    exportingPdf.value = false;
  }
};

onMounted(async () => {
  await financeStore.fetchAccountsWithBalance();
  await loadReport();
});
</script>

<style scoped>
.report-page {
  background: #fafafa;
}

.summary-card {
  transition: transform 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.gradient-card {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  border: none !important;
}

.report-table {
  font-size: 13px;
}

.report-table th {
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.print-only {
  display: none;
}

@media print {
  .no-print {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  .report-page {
    background: white !important;
    padding: 0 !important;
  }

  .report-content :deep(.q-card) {
    box-shadow: none !important;
    border: 1px solid #ddd !important;
    page-break-inside: avoid;
    margin-bottom: 12px !important;
  }

  .gradient-card {
    background: #f5f5f5 !important;
    color: #333 !important;
  }

  .gradient-card :deep(.text-white) {
    color: #333 !important;
  }

  .summary-card:hover {
    transform: none;
    box-shadow: none;
  }

  .print-header {
    text-align: center;
    margin-bottom: 16px;
  }

  .print-footer {
    margin-top: 24px;
    color: #666;
  }
}
</style>
