<template>
  <q-page class="q-pa-lg">
    <div class="text-h5 text-weight-bold q-mb-lg">Dashboard</div>

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
      <!-- Donasi Pending -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="rounded-xl">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-subtitle1 text-weight-bold">
                <q-icon name="volunteer_activism" color="primary" class="q-mr-sm" />
                Donasi Menunggu Konfirmasi
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

      <!-- Kajian Terbaru -->
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
                  <q-item-label caption>{{ k.ustadz }} · {{ formatDate(k.tanggal) }}</q-item-label>
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
import { useDonasiStore } from 'src/stores/donasi';
import { useKajianStore } from 'src/stores/kajian';

const donasiStore = useDonasiStore();
const kajianStore = useKajianStore();
const loading = ref(false);

const stats = computed(() => [
  {
    label: 'Total Kajian',
    value: kajianStore.meta.total || 0,
    icon: 'menu_book',
    color: 'primary',
  },
  {
    label: 'Total Artikel',
    value: totalArtikel.value,
    icon: 'article',
    color: 'teal',
  },
  {
    label: 'Total Donasi',
    value: formatCurrency(donasiStore.summary?.totalDonasi || 0),
    icon: 'volunteer_activism',
    color: 'positive',
  },
  {
    label: 'Donasi Pending',
    value: donasiStore.summary?.pendingKonfirmasi || 0,
    icon: 'pending',
    color: 'warning',
  },
]);

const totalArtikel = ref(0);
const upcomingKajian = ref([]);
const pendingDonasi = ref([]);

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

onMounted(async () => {
  loading.value = true;
  try {
    const [kajianRes, artikelRes, donasiRes] = await Promise.all([
      api.get('/kajian/admin/all', { params: { limit: 5 } }),
      api.get('/artikel/admin/all', { params: { limit: 1 } }),
      api.get('/donasi', { params: { status: 'PENDING', limit: 5 } }),
    ]);
    upcomingKajian.value = kajianRes.data.data;
    totalArtikel.value = artikelRes.data.meta?.total || 0;
    pendingDonasi.value = donasiRes.data.data;
    await donasiStore.fetchSummary();
    kajianStore.meta.total = kajianRes.data.meta?.total || 0;
  } finally {
    loading.value = false;
  }
});
</script>
