<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">
        <q-icon name="mark_email_unread" color="primary" class="q-mr-sm" />Manajemen Pesan
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-4">
        <q-card flat bordered class="rounded-xl text-center q-pa-md">
          <div class="text-caption text-grey-6">Total Pesan</div>
          <div class="text-h5 text-weight-bold text-primary q-mt-xs">{{ pesanStore.summary?.total || 0 }}</div>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card flat bordered class="rounded-xl text-center q-pa-md">
          <div class="text-caption text-grey-6">Belum Ditindaklanjuti</div>
          <div class="text-h5 text-weight-bold text-warning q-mt-xs">{{ pesanStore.summary?.belumDitindaklanjuti || 0 }}</div>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card flat bordered class="rounded-xl text-center q-pa-md">
          <div class="text-caption text-grey-6">Sudah Ditindaklanjuti</div>
          <div class="text-h5 text-weight-bold text-positive q-mt-xs">{{ pesanStore.summary?.sudahDitindaklanjuti || 0 }}</div>
        </q-card>
      </div>
    </div>

    <div class="row items-center q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="search"
          outlined
          dense
          clearable
          debounce="350"
          label="Cari nama, email, no. HP, subjek, atau pesan"
          @update:model-value="refreshData"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </div>
      <div class="col-12 col-md-4">
        <q-select
          v-model="statusFilter"
          outlined
          dense
          emit-value
          map-options
          label="Filter Status"
          :options="statusOptions"
          @update:model-value="refreshData"
        />
      </div>
      <div class="col-12 col-md-4">
        <q-select
          v-model="kategoriFilter"
          outlined
          dense
          emit-value
          map-options
          label="Filter Tujuan"
          :options="kategoriOptions"
          @update:model-value="refreshData"
        />
      </div>
    </div>

    <q-card flat bordered class="rounded-xl">
      <q-table :rows="pesanStore.list" :columns="columns" row-key="id" flat :loading="pesanStore.loading" wrap-cells>
        <template #body-cell-kategori="props">
          <q-td>
            <q-badge color="blue-grey-7" outline :label="kategoriLabel(props.value)" />
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td>
            <q-badge :color="props.value === 'SUDAH_DITINDAKLANJUTI' ? 'positive' : 'warning'" :label="statusLabel(props.value)" />
          </q-td>
        </template>

        <template #body-cell-createdAt="props">
          <q-td>{{ formatDate(props.value) }}</q-td>
        </template>

        <template #body-cell-pesan="props">
          <q-td>
            <div class="pesan-preview">{{ props.value }}</div>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td>
            <q-btn flat dense round icon="visibility" color="primary" @click="openDetail(props.row)" />
            <q-btn
              flat
              dense
              round
              :icon="props.row.status === 'SUDAH_DITINDAKLANJUTI' ? 'undo' : 'check_circle'"
              :color="props.row.status === 'SUDAH_DITINDAKLANJUTI' ? 'warning' : 'positive'"
              class="q-ml-xs"
              @click="toggleStatus(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="detailDialog">
      <q-card style="width: 92vw; max-width: 760px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Detail Pesan</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedPesan" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6"><strong>Nama:</strong> {{ selectedPesan.nama }}</div>
            <div class="col-12 col-md-6"><strong>Email:</strong> {{ selectedPesan.email }}</div>
            <div class="col-12 col-md-6"><strong>No. HP:</strong> {{ selectedPesan.noHp }}</div>
            <div class="col-12 col-md-6"><strong>Tujuan:</strong> {{ kategoriLabel(selectedPesan.kategori) }}</div>
            <div class="col-12 col-md-6"><strong>Status:</strong> {{ statusLabel(selectedPesan.status) }}</div>
            <div class="col-12 col-md-6"><strong>Tanggal:</strong> {{ formatDate(selectedPesan.createdAt) }}</div>
            <div class="col-12"><strong>Subjek:</strong> {{ selectedPesan.subjek || '-' }}</div>
          </div>

          <q-separator />

          <div>
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Isi Pesan</div>
            <div class="pesan-box">{{ selectedPesan.pesan }}</div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            v-if="selectedPesan && selectedPesan.noHp"
            no-caps
            flat
            color="green"
            icon="fab fa-whatsapp"
            label="Hubungi via WhatsApp"
            type="a"
            target="_blank"
            :href="whatsAppLink(selectedPesan)"
          />
          <q-btn
            v-if="selectedPesan"
            :label="selectedPesan.status === 'SUDAH_DITINDAKLANJUTI' ? 'Tandai Belum Ditindaklanjuti' : 'Tandai Sudah Ditindaklanjuti'"
            :color="selectedPesan.status === 'SUDAH_DITINDAKLANJUTI' ? 'warning' : 'positive'"
            unelevated
            no-caps
            @click="toggleStatus(selectedPesan, true)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { usePesanStore } from 'src/stores/pesan';

const pesanStore = usePesanStore();

const detailDialog = ref(false);
const selectedPesan = ref(null);
const search = ref('');
const statusFilter = ref('');
const kategoriFilter = ref('');

const statusOptions = [
  { label: 'Semua Status', value: '' },
  { label: 'Belum Ditindaklanjuti', value: 'BELUM_DITINDAKLANJUTI' },
  { label: 'Sudah Ditindaklanjuti', value: 'SUDAH_DITINDAKLANJUTI' },
];

const kategoriOptions = [
  { label: 'Semua Tujuan', value: '' },
  { label: 'Fasilitas', value: 'FASILITAS' },
  { label: 'Divisi Dakwah', value: 'DIVISI_DAKWAH' },
  { label: 'Divisi Pendidikan', value: 'DIVISI_PENDIDIKAN' },
  { label: 'Divisi Sosial', value: 'DIVISI_SOSIAL' },
  { label: 'Umroh', value: 'UMROH' },
  { label: 'Pembelian Produk MIAS Mart', value: 'PEMBELIAN_PRODUK_MIAS_MART' },
  { label: 'Lain-Lain', value: 'LAIN_LAIN' },
];

const columns = [
  { name: 'nama', label: 'Nama', field: 'nama', align: 'left', sortable: true },
  { name: 'noHp', label: 'No. HP', field: 'noHp', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'kategori', label: 'Tujuan', field: 'kategori', align: 'left' },
  { name: 'subjek', label: 'Subjek', field: 'subjek', align: 'left' },
  { name: 'pesan', label: 'Pesan', field: 'pesan', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'createdAt', label: 'Tanggal', field: 'createdAt', align: 'left', sortable: true },
  { name: 'actions', label: 'Aksi', field: 'actions', align: 'left' },
];

function kategoriLabel(value) {
  return kategoriOptions.find((item) => item.value === value)?.label || value || '-';
}

function statusLabel(value) {
  return value === 'SUDAH_DITINDAKLANJUTI' ? 'Sudah Ditindaklanjuti' : 'Belum Ditindaklanjuti';
}

function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

async function refreshData() {
  await Promise.all([
    pesanStore.fetchAll({ status: statusFilter.value, kategori: kategoriFilter.value, q: search.value }),
    pesanStore.fetchSummary(),
  ]);
}

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  return digits;
}

function whatsAppLink(row) {
  const phone = normalizePhone(row.noHp);
  const text = encodeURIComponent(
    `Assalamu'alaikum ${row.nama}, kami menindaklanjuti pesan Anda untuk ${kategoriLabel(row.kategori)}.`
  );
  return `https://wa.me/${phone}?text=${text}`;
}

function openDetail(row) {
  selectedPesan.value = row;
  detailDialog.value = true;
}

async function toggleStatus(row, keepDialogOpen = false) {
  const nextStatus = row.status === 'SUDAH_DITINDAKLANJUTI' ? 'BELUM_DITINDAKLANJUTI' : 'SUDAH_DITINDAKLANJUTI';
  const ok = await pesanStore.updateStatus(row.id, nextStatus);
  if (!ok) return;

  row.status = nextStatus;
  row.isRead = nextStatus === 'SUDAH_DITINDAKLANJUTI';
  if (selectedPesan.value?.id === row.id) {
    selectedPesan.value = { ...row };
  }

  await pesanStore.fetchSummary();

  if (!keepDialogOpen) {
    detailDialog.value = false;
  }
}

onMounted(refreshData);
</script>

<style scoped>
.pesan-preview {
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pesan-box {
  white-space: pre-line;
  line-height: 1.7;
  background: #f8faf9;
  border-radius: 10px;
  padding: 14px 16px;
}
</style>
