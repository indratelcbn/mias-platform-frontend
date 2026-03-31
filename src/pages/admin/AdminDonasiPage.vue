<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">
        <q-icon name="volunteer_activism" color="primary" class="q-mr-sm" />Data Donasi
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-4">
        <q-card flat bordered class="rounded-xl text-center q-pa-md">
          <div class="text-caption text-grey-6">Total Donasi Masuk</div>
          <div class="text-h5 text-weight-bold text-positive q-mt-xs">
            {{ formatCurrency(donasiStore.summary?.totalDonasi || 0) }}
          </div>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card flat bordered class="rounded-xl text-center q-pa-md">
          <div class="text-caption text-grey-6">Terverifikasi</div>
          <div class="text-h5 text-weight-bold text-primary q-mt-xs">
            {{ formatCurrency(donasiStore.summary?.terverifikasi || 0) }}
          </div>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card flat bordered class="rounded-xl text-center q-pa-md">
          <div class="text-caption text-grey-6">Menunggu Konfirmasi</div>
          <div class="text-h5 text-weight-bold text-warning q-mt-xs">
            {{ donasiStore.summary?.pendingKonfirmasi || 0 }} donatur
          </div>
        </q-card>
      </div>
    </div>

    <!-- Filter Status -->
    <div class="row q-col-gutter-sm q-mb-md">
      <q-btn
        v-for="s in statusFilter"
        :key="s.value"
        :unelevated="activeStatus === s.value"
        :flat="activeStatus !== s.value"
        :color="s.color"
        :label="s.label"
        no-caps
        size="sm"
        @click="filterByStatus(s.value)"
      />
    </div>

    <!-- Table -->
    <q-card flat bordered class="rounded-xl">
      <q-table
        :rows="donasiStore.list"
        :columns="columns"
        row-key="id"
        flat
        :loading="donasiStore.loading"
      >
        <template #body-cell-jumlah="props">
          <q-td class="text-weight-bold">{{ formatCurrency(props.value) }}</q-td>
        </template>
        <template #body-cell-createdAt="props">
          <q-td>{{ formatDate(props.value) }}</q-td>
        </template>
        <template #body-cell-buktiTransfer="props">
          <q-td>
            <q-btn
              v-if="props.value"
              flat
              dense
              no-caps
              label="Lihat"
              icon="image"
              color="primary"
              size="sm"
              @click="showBukti(props.value)"
            />
            <span v-else class="text-grey-5 text-caption">-</span>
          </q-td>
        </template>
        <template #body-cell-status="props">
          <q-td>
            <q-badge :color="statusColor(props.value)" :label="props.value" />
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td>
            <q-btn-dropdown
              v-if="props.row.status === 'PENDING'"
              flat
              dense
              no-caps
              label="Update"
              color="primary"
              size="sm"
            >
              <q-list>
                <q-item clickable v-close-popup @click="updateStatus(props.row.id, 'VERIFIED')">
                  <q-item-section avatar><q-icon name="check_circle" color="positive" /></q-item-section>
                  <q-item-section>Verifikasi</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="updateStatus(props.row.id, 'REJECTED')">
                  <q-item-section avatar><q-icon name="cancel" color="negative" /></q-item-section>
                  <q-item-section>Tolak</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Bukti Transfer Dialog -->
    <q-dialog v-model="buktiDialog">
      <q-card style="max-width: 500px; width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Bukti Transfer</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-img :src="buktiUrl" fit="contain" style="max-height: 400px" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useDonasiStore } from 'src/stores/donasi';

const donasiStore = useDonasiStore();

const activeStatus = ref('');
const buktiDialog = ref(false);
const buktiUrl = ref('');

const statusFilter = [
  { value: '', label: 'Semua', color: 'grey' },
  { value: 'PENDING', label: 'Pending', color: 'warning' },
  { value: 'VERIFIED', label: 'Terverifikasi', color: 'positive' },
  { value: 'REJECTED', label: 'Ditolak', color: 'negative' },
];

const columns = [
  { name: 'nama', label: 'Nama', field: 'nama', align: 'left', sortable: true },
  { name: 'jumlah', label: 'Jumlah', field: 'jumlah', align: 'right', sortable: true },
  { name: 'telepon', label: 'Telepon', field: 'telepon', align: 'left' },
  { name: 'buktiTransfer', label: 'Bukti', field: 'buktiTransfer', align: 'center' },
  { name: 'createdAt', label: 'Tanggal', field: 'createdAt', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'actions', label: 'Aksi', field: 'actions', align: 'center' },
];

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const statusColor = (status) =>
  ({ VERIFIED: 'positive', PENDING: 'warning', REJECTED: 'negative' }[status] || 'grey');

const filterByStatus = (status) => {
  activeStatus.value = status;
  donasiStore.fetchAll({ status: status || undefined, page: 1 });
};

const updateStatus = async (id, status) => {
  const ok = await donasiStore.updateStatus(id, status);
  if (ok) {
    donasiStore.fetchAll({ page: 1 });
    donasiStore.fetchSummary();
  }
};

const showBukti = (url) => {
  buktiUrl.value = url;
  buktiDialog.value = true;
};

onMounted(async () => {
  await Promise.all([donasiStore.fetchAll(), donasiStore.fetchSummary()]);
});
</script>
