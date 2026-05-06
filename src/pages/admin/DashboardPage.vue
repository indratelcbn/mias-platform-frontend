<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold">Dashboard</div>
        <div class="text-caption text-grey-6">Ringkasan aktivitas masjid · {{ periodLabel }}</div>
      </div>
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
        <q-btn unelevated color="primary" icon="refresh" label="Refresh" no-caps @click="fetchDashboard" :loading="loading" />
      </div>
    </div>

    <!-- Primary Stats -->
    <div class="row q-col-gutter-md q-mb-md">
      <div v-for="stat in primaryStats" :key="stat.label" class="col-6 col-md-3">
        <q-card flat bordered class="rounded-xl stat-card">
          <q-card-section class="q-pa-lg">
            <div class="row items-center justify-between no-wrap">
              <div class="col">
                <div class="text-caption text-grey-6 q-mb-xs">{{ stat.label }}</div>
                <div class="text-h5 text-weight-bold ellipsis" :class="`text-${stat.color}`">
                  <q-skeleton v-if="loading" type="text" width="80px" />
                  <span v-else>{{ stat.value }}</span>
                </div>
                <div v-if="stat.sub" class="text-caption text-grey-7 q-mt-xs">{{ stat.sub }}</div>
              </div>
              <q-avatar :color="stat.color" text-color="white" size="52px">
                <q-icon :name="stat.icon" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Finance Stats -->
    <div class="row q-col-gutter-md q-mb-md">
      <div v-for="stat in financeStats" :key="stat.label" class="col-6 col-md-3">
        <q-card flat bordered class="rounded-xl stat-card">
          <q-card-section class="q-pa-lg">
            <div class="row items-center justify-between no-wrap">
              <div class="col">
                <div class="text-caption text-grey-6 q-mb-xs">{{ stat.label }}</div>
                <div class="text-subtitle1 text-weight-bold ellipsis" :class="`text-${stat.color}`">
                  <q-skeleton v-if="loading" type="text" width="80px" />
                  <span v-else>{{ stat.value }}</span>
                </div>
                <div v-if="stat.sub" class="text-caption text-grey-7 q-mt-xs">{{ stat.sub }}</div>
              </div>
              <q-avatar :color="stat.color" text-color="white" size="52px">
                <q-icon :name="stat.icon" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Mini Stats -->
    <div class="row q-col-gutter-sm q-mb-lg">
      <div v-for="m in miniStats" :key="m.label" class="col-6 col-sm-4 col-md-2">
        <q-card flat bordered class="rounded-xl">
          <q-card-section class="q-pa-md text-center">
            <q-icon :name="m.icon" :color="m.color" size="22px" />
            <div class="text-h6 text-weight-bold q-mt-xs">
              <q-skeleton v-if="loading" type="text" width="40px" class="q-mx-auto" />
              <span v-else>{{ m.value }}</span>
            </div>
            <div class="text-caption text-grey-6">{{ m.label }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Donasi Tren Chart -->
    <q-card flat bordered class="rounded-xl q-mb-lg">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle1 text-weight-bold">
            <q-icon name="show_chart" color="primary" class="q-mr-sm" />
            Tren Infaq Terverifikasi (6 Bulan)
          </div>
        </div>
        <div v-if="loading" class="q-pa-md">
          <q-skeleton type="rect" height="160px" />
        </div>
        <div v-else-if="!donasiTren.length || donasiTrenMax === 0" class="text-grey-6 text-center q-pa-md">
          Belum ada data tren.
        </div>
        <div v-else class="tren-chart row items-end no-wrap q-gutter-sm q-pa-sm">
          <div v-for="t in donasiTren" :key="t.period" class="col text-center">
            <div class="text-caption text-grey-7 q-mb-xs">{{ formatCurrencyShort(t.total) }}</div>
            <div class="tren-bar"
                 :style="{ height: barHeight(t.total) + 'px', background: t.total > 0 ? '#1976d2' : '#e0e0e0' }">
            </div>
            <div class="text-caption q-mt-xs">{{ formatPeriodLabel(t.period) }}</div>
            <div class="text-caption text-grey-6">{{ t.count }} trx</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Recent Section -->
    <div class="row q-col-gutter-lg">
      <!-- Infaq Pending -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="rounded-xl">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-subtitle1 text-weight-bold">
                <q-icon name="volunteer_activism" color="primary" class="q-mr-sm" />
                Infaq Menunggu Konfirmasi
                <q-badge v-if="summary.pendingKonfirmasi" color="warning" :label="summary.pendingKonfirmasi" class="q-ml-sm" />
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
            no-data-label="Tidak ada infaq pending."
          >
            <template #body-cell-jumlah="props">
              <q-td class="text-right">{{ formatCurrency(props.value) }}</q-td>
            </template>
            <template #body-cell-status="props">
              <q-td class="text-center">
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

      <!-- Top Programs -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="rounded-xl">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-subtitle1 text-weight-bold">
                <q-icon name="campaign" color="primary" class="q-mr-sm" />
                Program Infaq Terkumpul
              </div>
              <q-btn flat no-caps label="Kelola" to="/admin/program-donasi" color="primary" size="sm" />
            </div>
          </q-card-section>
          <q-separator />
          <q-list separator>
            <template v-if="loading">
              <q-item v-for="i in 3" :key="i">
                <q-item-section><q-skeleton type="text" /></q-item-section>
              </q-item>
            </template>
            <template v-else-if="topPrograms.length">
              <q-item v-for="p in topPrograms" :key="p.id">
                <q-item-section>
                  <q-item-label class="text-weight-medium ellipsis">{{ p.judul }}</q-item-label>
                  <q-item-label caption>
                    <q-badge v-if="p.divisi" :color="divisiColor(p.divisi)" :label="p.divisi" class="q-mr-xs" />
                    {{ formatCurrency(p.terkumpul) }} / {{ formatCurrency(p.target) }}
                  </q-item-label>
                  <q-linear-progress
                    :value="p.progress / 100"
                    :color="p.progress >= 100 ? 'positive' : 'primary'"
                    rounded
                    size="6px"
                    class="q-mt-xs"
                  />
                </q-item-section>
                <q-item-section side>
                  <div class="text-weight-bold text-primary">{{ p.progress }}%</div>
                </q-item-section>
              </q-item>
            </template>
            <q-item v-else>
              <q-item-section class="text-grey-6 text-caption text-center">Belum ada program aktif.</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Recent Pesan -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="rounded-xl">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-subtitle1 text-weight-bold">
                <q-icon name="mail" color="primary" class="q-mr-sm" />
                Pesan Terbaru
                <q-badge v-if="summary.pesanBelumDibaca" color="negative" :label="summary.pesanBelumDibaca + ' baru'" class="q-ml-sm" />
              </div>
              <q-btn flat no-caps label="Kelola" to="/admin/pesan" color="primary" size="sm" />
            </div>
          </q-card-section>
          <q-separator />
          <q-list separator>
            <template v-if="loading">
              <q-item v-for="i in 3" :key="i">
                <q-item-section><q-skeleton type="text" /></q-item-section>
              </q-item>
            </template>
            <template v-else-if="recentPesan.length">
              <q-item v-for="p in recentPesan" :key="p.id">
                <q-item-section avatar>
                  <q-avatar :color="p.isRead ? 'grey-4' : 'primary'" text-color="white" size="36px" icon="mail" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium ellipsis">
                    {{ p.nama }}
                    <q-badge v-if="!p.isRead" color="negative" label="BARU" class="q-ml-xs" />
                  </q-item-label>
                  <q-item-label caption>
                    {{ p.subjek || formatKategori(p.kategori) }} · {{ formatDate(p.createdAt) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="p.status === 'SUDAH_DITINDAKLANJUTI' ? 'positive' : 'warning'"
                           :label="p.status === 'SUDAH_DITINDAKLANJUTI' ? 'Selesai' : 'Pending'" />
                </q-item-section>
              </q-item>
            </template>
            <q-item v-else>
              <q-item-section class="text-grey-6 text-caption text-center">Belum ada pesan.</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { api } from 'src/boot/axios';
import { formatCurrency, formatDate } from 'src/utils/format';

const loading = ref(false);
const summary = ref({});
const upcomingKajian = ref([]);
const pendingDonasi = ref([]);
const recentPesan = ref([]);
const topPrograms = ref([]);
const donasiTren = ref([]);

const now = new Date();
const filterBulan = ref(now.getMonth() + 1);
const filterTahun = ref(now.getFullYear());

const bulanOptions = [
  { label: 'Januari', value: 1 }, { label: 'Februari', value: 2 }, { label: 'Maret', value: 3 },
  { label: 'April', value: 4 }, { label: 'Mei', value: 5 }, { label: 'Juni', value: 6 },
  { label: 'Juli', value: 7 }, { label: 'Agustus', value: 8 }, { label: 'September', value: 9 },
  { label: 'Oktober', value: 10 }, { label: 'November', value: 11 }, { label: 'Desember', value: 12 },
];

const currentYear = now.getFullYear();
const tahunOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const periodLabel = computed(() => {
  const m = bulanOptions.find((b) => b.value === filterBulan.value);
  return `${m ? m.label : ''} ${filterTahun.value}`;
});

const finance = computed(() => summary.value.finance || {});

const formatCurrencyShort = (val) => {
  const n = Number(val) || 0;
  if (n >= 1000000000) return `Rp ${(n / 1000000000).toFixed(1)} M`;
  if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1)} Jt`;
  if (n >= 1000) return `Rp ${(n / 1000).toFixed(0)} Rb`;
  return `Rp ${n.toLocaleString('id-ID')}`;
};

const primaryStats = computed(() => [
  {
    label: 'Total Kajian',
    value: summary.value.totalKajian || 0,
    sub: `Bulan ini: ${summary.value.kajianBulanIni || 0} · Mendatang: ${summary.value.kajianMendatang || 0}`,
    icon: 'menu_book',
    color: 'primary',
  },
  {
    label: 'Artikel Published',
    value: summary.value.artikelPublished || 0,
    sub: `Total: ${summary.value.totalArtikel || 0} · Bulan ini: ${summary.value.artikelBulanIni || 0}`,
    icon: 'article',
    color: 'teal',
  },
  {
    label: 'Infaq Bulan Ini',
    value: formatCurrencyShort(summary.value.terverifikasiBulan || 0),
    sub: `${summary.value.donasiCountBulan || 0} transaksi · Total: ${formatCurrencyShort(summary.value.terverifikasi || 0)}`,
    icon: 'volunteer_activism',
    color: 'positive',
  },
  {
    label: 'Infaq Pending',
    value: summary.value.pendingKonfirmasi || 0,
    sub: 'Menunggu konfirmasi admin',
    icon: 'pending_actions',
    color: 'warning',
  },
]);

const financeStats = computed(() => [
  {
    label: 'Saldo Keuangan',
    value: formatCurrencyShort(finance.value.totalSaldo || 0),
    sub: `${finance.value.accountsAktif || 0} akun aktif`,
    icon: 'account_balance',
    color: 'indigo',
  },
  {
    label: 'Pemasukan Bulan Ini',
    value: formatCurrencyShort(finance.value.pemasukanBulan || 0),
    sub: `${finance.value.countPemasukan || 0} transaksi masuk`,
    icon: 'trending_up',
    color: 'green-7',
  },
  {
    label: 'Pengeluaran Bulan Ini',
    value: formatCurrencyShort(finance.value.pengeluaranBulan || 0),
    sub: `${finance.value.countPengeluaran || 0} transaksi keluar`,
    icon: 'trending_down',
    color: 'red-7',
  },
  {
    label: 'Net Cashflow Bulan Ini',
    value: formatCurrencyShort(finance.value.netCashflowBulan || 0),
    sub: (finance.value.netCashflowBulan || 0) >= 0 ? 'Surplus' : 'Defisit',
    icon: 'swap_vert',
    color: (finance.value.netCashflowBulan || 0) >= 0 ? 'positive' : 'negative',
  },
]);

const miniStats = computed(() => [
  { label: 'Program Infaq', value: summary.value.programInfaqAktif || 0, icon: 'campaign', color: 'blue' },
  { label: 'Program Wakaf', value: summary.value.programWakafAktif || 0, icon: 'mosque', color: 'teal' },
  { label: 'Mustahik', value: summary.value.mustahikTotal || 0, icon: 'groups', color: 'orange' },
  { label: 'Pemateri', value: summary.value.pemateriAktif || 0, icon: 'school', color: 'purple' },
  { label: 'Galeri', value: summary.value.galeriTotal || 0, icon: 'photo_library', color: 'pink' },
  { label: 'Pesan Pending', value: summary.value.pesanBelumDitindaklanjuti || 0, icon: 'mark_email_unread', color: 'red' },
]);

const donasiTrenMax = computed(() =>
  donasiTren.value.reduce((max, t) => Math.max(max, Number(t.total) || 0), 0)
);

const barHeight = (val) => {
  const max = donasiTrenMax.value || 1;
  const h = (Number(val) / max) * 120;
  return Math.max(4, Math.round(h));
};

const formatPeriodLabel = (period) => {
  if (!period) return '';
  const [, m] = period.split('-');
  return bulanOptions[Number(m) - 1]?.label.slice(0, 3) || period;
};

const donasiColumns = [
  { name: 'nama', label: 'Nama', field: 'nama', align: 'left' },
  { name: 'jumlah', label: 'Jumlah', field: 'jumlah', align: 'right' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
];

const statusColor = (status) =>
  ({ VERIFIED: 'positive', PENDING: 'warning', REJECTED: 'negative' }[status] || 'grey');

const divisiColor = (divisi) => ({
  DAKWAH: 'blue', SOSIAL: 'green', PENDIDIKAN: 'purple',
  USAHA: 'orange', MULTIMEDIA: 'pink', OPERASIONAL: 'grey', WAKAF: 'teal',
}[divisi] || 'grey');

const formatKategori = (k) => (k || '').replace(/_/g, ' ');

const fetchDashboard = async () => {
  loading.value = true;
  try {
    const [summaryRes, donasiRes] = await Promise.all([
      api.get('/dashboard/summary', { params: { bulan: filterBulan.value, tahun: filterTahun.value } }),
      api.get('/donasi', { params: { status: 'PENDING', limit: 5 } }),
    ]);
    const data = summaryRes.data.data || {};
    summary.value = data;
    upcomingKajian.value = data.upcomingKajian || [];
    recentPesan.value = data.recentPesan || [];
    topPrograms.value = data.topPrograms || [];
    donasiTren.value = data.donasiTren || [];
    pendingDonasi.value = donasiRes.data.data || [];
  } finally {
    loading.value = false;
  }
};

watch([filterBulan, filterTahun], () => fetchDashboard());

onMounted(() => fetchDashboard());
</script>

<style scoped>
.stat-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
.tren-chart {
  min-height: 180px;
}
.tren-bar {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  min-height: 4px;
}
</style>
