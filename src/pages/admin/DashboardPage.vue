<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">Dashboard</div>
      <div class="row q-gutter-sm items-center">
        <q-select
          v-model="filterBulan"
          :options="bulanOptions"
          emit-value
          map-options
          dense
          outlined
          style="min-width: 140px"
          label="Bulan"
        />
        <q-select
          v-model="filterTahun"
          :options="tahunOptions"
          dense
          outlined
          style="min-width: 100px"
          label="Tahun"
        />
        <q-btn unelevated color="primary" icon="search" label="Filter" no-caps @click="fetchDashboard" :loading="loading" />
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div v-for="stat in stats" :key="stat.label" class="col-6 col-md-3">
        <q-card flat bordered class="rounded-xl">
          <q-card-section class="q-pa-lg">
            <div class="row items-center justify-between">
              <div>
                <div class="text-caption text-grey-6 q-mb-xs">{{ stat.label }}</div>
                <div class="text-h4 text-weight-bold" :class="`text-${stat.color}`">
                  <q-skeleton v-if="loading" type="text" width="60px" />
                  <span v-else>{{ stat.value }}</span>
                </div>
                <div v-if="stat.sub" class="text-caption text-grey-6">{{ stat.sub }}</div>
              </div>
              <q-avatar :color="stat.color" text-color="white" size="52px">
                <q-icon :name="stat.icon" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent -->
    <div class="row q-col-gutter-lg">
      <!-- Infaq Pending -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="rounded-xl">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-subtitle1 text-weight-bold">
                <q-icon name="volunteer_activism" color="primary" class="q-mr-sm" />
                Infaq Menunggu Konfirmasi
              </div>
              <q-btn flat no-caps label="Lihat Semua" to="/admin/donasi" color="primary" size="sm" />
            </div>
          </q-card-section>
          <q-separator />
          <q-table
            :rows="pendingDonasi"
            :columns="donasiColumns"
            row-key="id"
            flat
            :loading="loading"
            hide-pagination
            :rows-per-page-options="[5]"
          >
            <template #body-cell-jumlah="props">
              <q-td>{{ formatCurrency(props.value) }}</q-td>
            </template>
            <template #body-cell-status="props">
              <q-td>
                <q-badge :color="statusColor(props.value)" :label="props.value" />
              </q-td>
            </template>
          </q-table>
        </q-card>
      </div>

      <!-- Kajian Mendatang -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="rounded-xl">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-subtitle1 text-weight-bold">
                <q-icon name="menu_book" color="primary" class="q-mr-sm" />
                Kajian Mendatang
              </div>
              <q-btn flat no-caps label="Kelola" to="/admin/kajian" color="primary" size="sm" />
            </div>
          </q-card-section>
          <q-separator />
          <q-list separator>
            <template v-if="loading">
              <q-item v-for="i in 3" :key="i">
                <q-item-section><q-skeleton type="text" /></q-item-section>
              </q-item>
            </template>
            <template v-else-if="upcomingKajian.length">
              <q-item v-for="k in upcomingKajian" :key="k.id">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" size="36px" icon="menu_book" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium ellipsis">{{ k.judul }}</q-item-label>
                  <q-item-label caption>{{ k.ustadz }} · {{ formatDate(k.tanggal) }} · {{ k.waktu }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <q-item v-else>
              <q-item-section class="text-grey-6 text-caption text-center">Tidak ada kajian terjadwal</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from 'src/boot/axios';

const loading = ref(false);
const summary = ref({});
const upcomingKajian = ref([]);
const pendingDonasi = ref([]);

const now = new Date();
const filterBulan = ref(now.getMonth() + 1);
const filterTahun = ref(now.getFullYear());

const bulanOptions = [
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

const currentYear = now.getFullYear();
const tahunOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const stats = computed(() => [
  {
    label: 'Total Kajian',
    value: summary.value.totalKajian || 0,
    sub: `Bulan ini: ${summary.value.kajianBulanIni || 0}`,
    icon: 'menu_book',
    color: 'primary',
  },
  {
    label: 'Total Artikel',
    value: summary.value.totalArtikel || 0,
    sub: `Bulan ini: ${summary.value.artikelBulanIni || 0}`,
    icon: 'article',
    color: 'teal',
  },
  {
    label: 'Total Infaq',
    value: formatCurrency(summary.value.totalInfaq || 0),
    icon: 'volunteer_activism',
    color: 'positive',
  },
  {
    label: 'Infaq Pending',
    value: summary.value.pendingKonfirmasi || 0,
    icon: 'pending',
    color: 'warning',
  },
]);

const donasiColumns = [
  { name: 'nama', label: 'Nama', field: 'nama', align: 'left' },
  { name: 'jumlah', label: 'Jumlah', field: 'jumlah', align: 'right' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
];

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

const statusColor = (status) =>
  ({ VERIFIED: 'positive', PENDING: 'warning', REJECTED: 'negative' }[status] || 'grey');

const fetchDashboard = async () => {
  loading.value = true;
  try {
    const [summaryRes, donasiRes] = await Promise.all([
      api.get('/dashboard/summary', { params: { bulan: filterBulan.value, tahun: filterTahun.value } }),
      api.get('/donasi', { params: { status: 'PENDING', limit: 5 } }),
    ]);
    summary.value = summaryRes.data.data;
    upcomingKajian.value = summaryRes.data.data.upcomingKajian || [];
    pendingDonasi.value = donasiRes.data.data;
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchDashboard());
</script>
