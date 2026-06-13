<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold">Dashboard Keuangan</div>
        <div class="text-caption text-grey-6">Overview saldo dan cashflow</div>
      </div>
      <div class="row q-gutter-sm items-center">
        <q-input
          v-model="startDate"
          type="date"
          outlined
          dense
          label="Dari Tanggal"
          style="min-width: 160px"
        />
        <q-input
          v-model="endDate"
          type="date"
          outlined
          dense
          label="Sampai Tanggal"
          style="min-width: 160px"
        />
        <q-btn
          unelevated
          color="primary"
          icon="search"
          label="Filter"
          no-caps
          @click="loadDashboard"
          :loading="loading"
        />
        <q-btn
          flat
          color="grey-7"
          icon="refresh"
          label="Reset"
          no-caps
          @click="resetFilter"
        />
      </div>
    </div>

    <!-- Balance Cards -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-md-3">
        <q-card flat bordered class="rounded-xl bg-gradient-primary text-white">
          <q-card-section class="q-pa-lg">
            <div class="row items-start justify-between">
              <div>
                <div class="text-caption opacity-80 q-mb-xs">Total Saldo</div>
                <div class="text-h4 text-weight-bold">
                  <q-skeleton v-if="loading" type="text" width="120px" dark />
                  <span v-else>{{ formatCurrency(dashboardSummary?.totalBalance || 0) }}</span>
                </div>
                <div class="text-caption opacity-70 q-mt-sm">
                  Kas + Bank
                </div>
              </div>
              <q-icon name="account_balance_wallet" size="42px" class="opacity-40" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered class="rounded-xl">
          <q-card-section class="q-pa-lg">
            <div class="row items-start justify-between">
              <div>
                <div class="text-caption text-grey-6 q-mb-xs">Saldo Kas</div>
                <div class="text-h5 text-weight-bold text-primary">
                  <q-skeleton v-if="loading" type="text" width="100px" />
                  <span v-else>{{ formatCurrency(dashboardSummary?.totalCash || 0) }}</span>
                </div>
              </div>
              <q-avatar color="blue-1" text-color="primary" size="48px">
                <q-icon name="payments" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered class="rounded-xl">
          <q-card-section class="q-pa-lg">
            <div class="row items-start justify-between">
              <div>
                <div class="text-caption text-grey-6 q-mb-xs">Saldo Bank</div>
                <div class="text-h5 text-weight-bold text-primary">
                  <q-skeleton v-if="loading" type="text" width="100px" />
                  <span v-else>{{ formatCurrency(dashboardSummary?.totalBank || 0) }}</span>
                </div>
              </div>
              <q-avatar color="green-1" text-color="green-7" size="48px">
                <q-icon name="account_balance" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered class="rounded-xl">
          <q-card-section class="q-pa-lg">
            <div class="row items-start justify-between">
              <div>
                <div class="text-caption text-grey-6 q-mb-xs">Cashflow</div>
                <div class="text-h5 text-weight-bold" :class="cashflowColor">
                  <q-skeleton v-if="loading" type="text" width="100px" />
                  <span v-else>{{ formatCurrency(dashboardSummary?.cashflow || 0) }}</span>
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  Masuk - Keluar
                </div>
              </div>
              <q-avatar :color="cashflowBgColor" :text-color="cashflowColor.replace('text-', '')" size="48px">
                <q-icon :name="cashflowIcon" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Transaction Summary -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-md-6">
        <q-card flat bordered class="rounded-xl">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-subtitle1 text-weight-bold">
                <q-icon name="trending_up" color="green-7" class="q-mr-sm" />
                Total Pemasukan
              </div>
            </div>
            <div class="text-h4 text-weight-bold text-green-7 q-mt-md">
              <q-skeleton v-if="loading" type="text" width="150px" />
              <span v-else>{{ formatCurrency(dashboardSummary?.totalIn || 0) }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered class="rounded-xl">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-subtitle1 text-weight-bold">
                <q-icon name="trending_down" color="red-7" class="q-mr-sm" />
                Total Pengeluaran
              </div>
            </div>
            <div class="text-h4 text-weight-bold text-red-7 q-mt-md">
              <q-skeleton v-if="loading" type="text" width="150px" />
              <span v-else>{{ formatCurrency(dashboardSummary?.totalOut || 0) }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Saldo Per Divisi -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12">
        <q-card flat bordered class="rounded-xl">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">
              <q-icon name="groups" color="primary" class="q-mr-sm" />
              Saldo Per Divisi
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">
              Total dana per divisi (Pemasukan - Pengeluaran) berdasarkan program terkait
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section v-if="loading">
            <q-skeleton type="rect" height="120px" />
          </q-card-section>
          <q-card-section v-else>
            <div class="row q-col-gutter-md">
              <div
                v-for="d in dashboardSummary?.divisiBalances || []"
                :key="d.divisiId || d.divisi"
                class="col-12 col-sm-6 col-md-4 col-lg-3"
              >
                <q-card flat bordered class="rounded-lg q-pa-md full-height">
                  <div class="row items-center justify-between q-mb-sm">
                    <q-chip dense :color="divisiColor(d.divisi || d.divisiId).bg" :text-color="divisiColor(d.divisi || d.divisiId).text" class="q-pl-sm">
                      <q-icon :name="divisiColor(d.divisi || d.divisiId).icon" class="q-mr-xs" />
                      {{ divisiLabel(d.divisiNama || d.divisi || d.divisiId) }}
                    </q-chip>
                    <q-icon :name="d.balance >= 0 ? 'arrow_upward' : 'arrow_downward'" :color="d.balance >= 0 ? 'green-7' : 'red-7'" />
                  </div>
                  <div class="text-h6 text-weight-bold" :class="d.balance >= 0 ? 'text-primary' : 'text-red-7'">
                    {{ formatCurrency(d.balance || 0) }}
                  </div>
                  <div class="row q-gutter-xs q-mt-sm">
                    <div class="col">
                      <div class="text-caption text-grey-6">Masuk</div>
                      <div class="text-caption text-weight-medium text-green-7">{{ formatCurrency(d.totalIn || 0) }}</div>
                    </div>
                    <div class="col">
                      <div class="text-caption text-grey-6">Keluar</div>
                      <div class="text-caption text-weight-medium text-red-7">{{ formatCurrency(d.totalOut || 0) }}</div>
                    </div>
                  </div>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Grafik Tren Keuangan -->
    <div class="row q-col-gutter-md q-mb-xl q-mt-md">
      <div class="col-12">
        <q-card flat bordered class="rounded-xl">
          <q-card-section>
            <div class="row items-center justify-between q-mb-lg">
              <div class="text-subtitle1 text-weight-bold">
                <q-icon name="trending_up" color="primary" class="q-mr-sm" />
                Filter Grafik Tren
              </div>
            </div>

            <!-- Filter Controls -->
            <div class="row q-col-gutter-md q-mb-md">
              <!-- Divisi Filter -->
              <div class="col-12 col-sm-6 col-md-3">
                <q-select
                  v-model="chartFilters.divisiId"
                  :options="divisiOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  outlined
                  dense
                  label="Pilih Divisi"
                  @update:model-value="loadChartData"
                >
                  <template v-slot:prepend>
                    <q-icon name="groups" />
                  </template>
                </q-select>
              </div>

              <!-- Period Filter -->
              <div class="col-12 col-sm-6 col-md-2">
                <q-select
                  v-model="chartFilters.period"
                  :options="periodOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  outlined
                  dense
                  label="Periode"
                  @update:model-value="onPeriodChange"
                >
                  <template v-slot:prepend>
                    <q-icon name="date_range" />
                  </template>
                </q-select>
              </div>

              <!-- Year Filter (hidden for YEARLY — uses startYear/endYear instead) -->
              <div v-if="chartFilters.period !== 'YEARLY'" class="col-12 col-sm-6 col-md-2">
                <q-input
                  v-model.number="chartFilters.year"
                  type="number"
                  outlined
                  dense
                  label="Tahun"
                  :min="2020"
                  :max="2030"
                  @update:model-value="loadChartData"
                />
              </div>

              <!-- Start Month Filter (for MONTHLY) -->
              <div v-if="chartFilters.period === 'MONTHLY'" class="col-12 col-sm-6 col-md-2">
                <q-select
                  v-model.number="chartFilters.startMonth"
                  :options="monthOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  outlined
                  dense
                  label="Dari Bulan"
                  @update:model-value="loadChartData"
                />
              </div>

              <!-- End Month Filter (for MONTHLY) -->
              <div v-if="chartFilters.period === 'MONTHLY'" class="col-12 col-sm-6 col-md-2">
                <q-select
                  v-model.number="chartFilters.endMonth"
                  :options="monthOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  outlined
                  dense
                  label="Sampai Bulan"
                  @update:model-value="loadChartData"
                />
              </div>

              <!-- Semester Filter (for SEMESTER) -->
              <div v-if="chartFilters.period === 'SEMESTER'" class="col-12 col-sm-6 col-md-2">
                <q-select
                  v-model.number="chartFilters.semester"
                  :options="semesterOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  outlined
                  dense
                  label="Semester"
                  @update:model-value="loadChartData"
                />
              </div>

              <!-- Year Range (for YEARLY) -->
              <div v-if="chartFilters.period === 'YEARLY'" class="col-12 col-sm-6 col-md-2">
                <q-input
                  v-model.number="chartFilters.startYear"
                  type="number"
                  outlined
                  dense
                  label="Tahun Awal"
                  :min="2020"
                  :max="chartFilters.endYear"
                  @update:model-value="loadChartData"
                />
              </div>
              <div v-if="chartFilters.period === 'YEARLY'" class="col-12 col-sm-6 col-md-2">
                <q-input
                  v-model.number="chartFilters.endYear"
                  type="number"
                  outlined
                  dense
                  label="Tahun Akhir"
                  :min="chartFilters.startYear"
                  :max="2030"
                  @update:model-value="loadChartData"
                />
              </div>

              <!-- Refresh Button -->
              <div class="col-12 col-sm-12 col-md-auto">
                <q-btn
                  unelevated
                  color="primary"
                  icon="refresh"
                  label="Muat Ulang"
                  no-caps
                  class="full-width"
                  @click="loadChartData"
                  :loading="chartLoading"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Chart Component -->
      <div class="col-12">
        <FinanceTrendChart
          :data="trendsData"
          :loading="chartLoading"
          :divisi-name="selectedDivisiName"
          :period="chartFilters.period"
        />
      </div>
    </div>

    <!-- Accounts with Balance -->
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card flat bordered class="rounded-xl">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-subtitle1 text-weight-bold">
                <q-icon name="account_balance" color="primary" class="q-mr-sm" />
                Saldo Per Akun
              </div>
              <q-btn flat no-caps label="Kelola Akun" to="/admin/finance/accounts" color="primary" size="sm" />
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section v-if="loading">
            <q-skeleton type="rect" height="200px" />
          </q-card-section>
          <q-card-section v-else-if="!dashboardSummary?.accounts?.length">
            <div class="text-center text-grey-6 q-py-lg">
              <q-icon name="info" size="48px" class="q-mb-sm" />
              <div>Belum ada akun keuangan</div>
            </div>
          </q-card-section>
          <q-list v-else separator>
            <q-item v-for="account in dashboardSummary.accounts" :key="account.id">
              <q-item-section avatar>
                <q-avatar :color="account.type === 'CASH' ? 'blue-1' : 'green-1'" :text-color="account.type === 'CASH' ? 'primary' : 'green-7'">
                  <q-icon :name="account.type === 'CASH' ? 'payments' : 'account_balance'" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ account.name }}</q-item-label>
                <q-item-label caption>
                  {{ account.type === 'CASH' ? 'Kas' : 'Bank' }}
                  <span v-if="account.accountNumber"> • {{ account.accountNumber }}</span>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-h6 text-weight-bold text-primary">
                  {{ formatCurrency(account.balance || 0) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useFinanceStore } from 'src/stores/finance';
import { formatCurrency } from 'src/utils/format';
import FinanceTrendChart from 'src/components/finance/FinanceTrendChart.vue';

const financeStore = useFinanceStore();

const startDate = ref('');
const endDate = ref('');

// Chart Filters
const chartLoading = ref(false);
const currentDate = new Date();
const chartFilters = ref({
  divisiId: null,
  period: 'MONTHLY',
  year: currentDate.getFullYear(),
  startMonth: 1,
  endMonth: currentDate.getMonth() + 1,
  semester: currentDate.getMonth() < 6 ? 1 : 2,
  startYear: currentDate.getFullYear() - 2,
  endYear: currentDate.getFullYear(),
});

const loading = computed(() => financeStore.loading);
const dashboardSummary = computed(() => financeStore.dashboardSummary);
const trendsData = computed(() => financeStore.trendsData);

// Divisi Options
const divisiOptions = computed(() => {
  const options = [{ label: 'Semua Divisi', value: null }];
  const divisiBalances = dashboardSummary.value?.divisiBalances || [];
  
  divisiBalances.forEach((d) => {
    options.push({
      label: divisiLabel(d.divisiNama || d.divisi || d.divisiId),
      value: d.divisi || d.divisiId,
    });
  });
  
  return options;
});

const selectedDivisiName = computed(() => {
  if (!chartFilters.value.divisiId) return 'Semua Divisi';
  const selected = divisiOptions.value.find((d) => d.value === chartFilters.value.divisiId);
  return selected?.label || 'Semua Divisi';
});

// Period Options
const periodOptions = [
  { label: 'Bulanan', value: 'MONTHLY' },
  { label: 'Semester', value: 'SEMESTER' },
  { label: 'Tahunan', value: 'YEARLY' },
];

const monthOptions = [
  { label: 'Januari', value: 1 },
  { label: 'Februari', value: 2 },
  { label: 'Maret', value: 3 },
  { label: 'April', value: 4 },
  { label: 'Mei', value: 5 },
  { label: 'Juni', value: 6 },
  { label: 'Juli', value: 7 },
  { label: 'Agustus', value: 8 },
  { label: 'September', value: 9 },
  { label: 'Oktober', value: 10 },
  { label: 'November', value: 11 },
  { label: 'Desember', value: 12 },
];

const semesterOptions = [
  { label: 'Semester 1 (Jan-Jun)', value: 1 },
  { label: 'Semester 2 (Jul-Des)', value: 2 },
];

const cashflowColor = computed(() => {
  const cashflow = dashboardSummary.value?.cashflow || 0;
  if (cashflow > 0) return 'text-green-7';
  if (cashflow < 0) return 'text-red-7';
  return 'text-grey-7';
});

const cashflowBgColor = computed(() => {
  const cashflow = dashboardSummary.value?.cashflow || 0;
  if (cashflow > 0) return 'green-1';
  if (cashflow < 0) return 'red-1';
  return 'grey-2';
});

const cashflowIcon = computed(() => {
  const cashflow = dashboardSummary.value?.cashflow || 0;
  if (cashflow > 0) return 'arrow_upward';
  if (cashflow < 0) return 'arrow_downward';
  return 'remove';
});

const DIVISI_META = {
  SOSIAL:      { label: 'Sosial',      icon: 'volunteer_activism', bg: 'red-1',    text: 'red-8' },
  PENDIDIKAN:  { label: 'Pendidikan',  icon: 'school',         bg: 'blue-1',   text: 'blue-8' },
  USAHA:       { label: 'Usaha',       icon: 'storefront',     bg: 'amber-1',  text: 'amber-9' },
  MULTIMEDIA:  { label: 'Multimedia',  icon: 'videocam',       bg: 'purple-1', text: 'purple-8' },
  OPERASIONAL: { label: 'Operasional dan Dakwah', icon: 'settings',       bg: 'grey-3',   text: 'grey-9' },
  WAKAF:       { label: 'Wakaf',       icon: 'account_balance', bg: 'teal-1',  text: 'teal-8' },
};
const divisiLabel = (key) => {
  if (!key) return '';
  return DIVISI_META[key]?.label || key;
};
const divisiColor = (key) => {
  if (!key) return { icon: 'category', bg: 'grey-2', text: 'grey-8' };
  return DIVISI_META[key] || { icon: 'category', bg: 'grey-2', text: 'grey-8' };
};

const loadDashboard = async () => {
  const params = {};
  if (startDate.value) params.startDate = startDate.value;
  if (endDate.value) params.endDate = endDate.value;
  await financeStore.fetchDashboardSummary(params);
};

const resetFilter = () => {
  startDate.value = '';
  endDate.value = '';
  loadDashboard();
};

// Chart Methods
const loadChartData = async () => {
  chartLoading.value = true;
  try {
    const params = {
      period: chartFilters.value.period,
      year: chartFilters.value.year,
    };

    if (chartFilters.value.divisiId) {
      params.divisiId = chartFilters.value.divisiId;
    }

    if (chartFilters.value.period === 'MONTHLY') {
      params.startMonth = chartFilters.value.startMonth;
      params.endMonth = chartFilters.value.endMonth;
    } else if (chartFilters.value.period === 'SEMESTER') {
      params.semester = chartFilters.value.semester;
    } else if (chartFilters.value.period === 'YEARLY') {
      params.startYear = chartFilters.value.startYear;
      params.endYear = chartFilters.value.endYear;
    }

    await financeStore.fetchTrendsData(params);
  } finally {
    chartLoading.value = false;
  }
};

const onPeriodChange = () => {
  // Reset specific filters based on period
  if (chartFilters.value.period === 'MONTHLY') {
    chartFilters.value.startMonth = 1;
    chartFilters.value.endMonth = currentDate.getMonth() + 1;
  } else if (chartFilters.value.period === 'SEMESTER') {
    chartFilters.value.semester = currentDate.getMonth() < 6 ? 1 : 2;
  } else if (chartFilters.value.period === 'YEARLY') {
    chartFilters.value.startYear = currentDate.getFullYear() - 2;
    chartFilters.value.endYear = currentDate.getFullYear();
  }
  loadChartData();
};

onMounted(() => {
  loadDashboard();
  loadChartData();
});
</script>

<style scoped>
.rounded-xl {
  border-radius: 16px;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.opacity-80 {
  opacity: 0.8;
}

.opacity-70 {
  opacity: 0.7;
}

.opacity-40 {
  opacity: 0.4;
}
</style>
