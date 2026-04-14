<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">
        <q-icon name="volunteer_activism" color="primary" class="q-mr-sm" />Manajemen Donasi
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

    <!-- Tabs -->
    <q-tabs v-model="tab" align="left" class="q-mb-md" active-color="primary" indicator-color="primary">
      <q-tab name="donasi" label="Data Donasi" icon="list_alt" no-caps />
      <q-tab name="program" label="Program Donasi" icon="flag" no-caps />
      <q-tab name="wakaf" label="Program Wakaf" icon="mosque" no-caps />
      <q-tab name="rekening" label="Rekening" icon="account_balance" no-caps />
    </q-tabs>

    <q-tab-panels v-model="tab" animated>

      <!-- ══════════════════════ TAB DATA DONASI ══════════════════════════ -->
      <q-tab-panel name="donasi" class="q-pa-none">
        <div class="row q-col-gutter-sm q-mb-md">
          <q-btn
            v-for="s in statusFilter" :key="s.value"
            :unelevated="activeStatus === s.value" :flat="activeStatus !== s.value"
            :color="s.color" :label="s.label" no-caps size="sm"
            @click="filterByStatus(s.value)"
          />
        </div>
        <q-card flat bordered class="rounded-xl">
          <q-table :rows="donasiStore.list" :columns="columns" row-key="id" flat :loading="donasiStore.loading">
            <template #body-cell-jumlah="props">
              <q-td class="text-weight-bold">{{ formatCurrency(props.value) }}</q-td>
            </template>
            <template #body-cell-createdAt="props">
              <q-td>{{ formatDate(props.value) }}</q-td>
            </template>
            <template #body-cell-buktiTransfer="props">
              <q-td>
                <q-btn v-if="props.value" flat dense no-caps label="Lihat" icon="image" color="primary" size="sm" @click="showBukti(props.value)" />
                <span v-else class="text-grey-5 text-caption">-</span>
              </q-td>
            </template>
            <template #body-cell-status="props">
              <q-td><q-badge :color="statusColor(props.value)" :label="props.value" /></q-td>
            </template>
            <template #body-cell-actions="props">
              <q-td>
                <q-btn-dropdown v-if="props.row.status === 'PENDING'" flat dense no-caps label="Update" color="primary" size="sm">
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
      </q-tab-panel>

      <!-- ══════════════════════ TAB PROGRAM DONASI ═══════════════════════ -->
      <q-tab-panel name="program" class="q-pa-none">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle1 text-weight-bold">Daftar Program Donasi</div>
          <div class="row q-gutter-sm">
            <q-btn outline color="secondary" icon="sync" label="Hitung Ulang Terkumpul" no-caps size="sm" @click="recalcTerkumpul" :loading="recalcLoading" />
            <q-btn unelevated color="primary" icon="add" label="Tambah Program" no-caps @click="openProgramDialog()" />
          </div>
        </div>
        <q-card flat bordered class="rounded-xl">
          <q-table :rows="donasiStore.programList" :columns="programColumns" row-key="id" flat :loading="donasiStore.loading">
            <template #body-cell-target="props">
              <q-td>{{ formatCurrency(props.value) }}</q-td>
            </template>
            <template #body-cell-terkumpul="props">
              <q-td>
                <div>{{ formatCurrency(props.value) }}</div>
                <q-linear-progress rounded size="6px"
                  :value="props.row.target > 0 ? Math.min(props.row.terkumpul / props.row.target, 1) : 0"
                  color="primary" track-color="grey-3" class="q-mt-xs" />
              </q-td>
            </template>
            <template #body-cell-isActive="props">
              <q-td><q-badge :color="props.value ? 'positive' : 'grey'" :label="props.value ? 'Aktif' : 'Nonaktif'" /></q-td>
            </template>
            <template #body-cell-actions="props">
              <q-td>
                <q-btn flat dense round icon="edit" color="primary" size="sm" @click="openProgramDialog(props.row)" />
                <q-btn flat dense round icon="delete" color="negative" size="sm" class="q-ml-xs" @click="confirmDeleteProgram(props.row)" />
              </q-td>
            </template>
          </q-table>
        </q-card>
      </q-tab-panel>

      <!-- ══════════════════════ TAB PROGRAM WAKAF ═══════════════════════ -->
      <q-tab-panel name="wakaf" class="q-pa-none">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle1 text-weight-bold">Daftar Program Wakaf</div>
          <div class="row q-gutter-sm">
            <q-btn outline color="secondary" icon="sync" label="Hitung Ulang Terkumpul" no-caps size="sm" @click="recalcTerkumpul" :loading="recalcLoading" />
            <q-btn unelevated color="primary" icon="add" label="Tambah Program Wakaf" no-caps @click="openWakafDialog()" />
          </div>
        </div>
        <q-card flat bordered class="rounded-xl">
          <q-table :rows="donasiStore.wakafList" :columns="wakafColumns" row-key="id" flat :loading="donasiStore.loading">
            <template #body-cell-target="props">
              <q-td>{{ formatCurrency(props.value) }}</q-td>
            </template>
            <template #body-cell-terkumpul="props">
              <q-td>
                <div>{{ formatCurrency(props.value) }}</div>
                <q-linear-progress rounded size="6px"
                  :value="props.row.target > 0 ? Math.min(Number(props.row.terkumpul) / Number(props.row.target), 1) : 0"
                  color="primary" track-color="grey-3" class="q-mt-xs" />
              </q-td>
            </template>
            <template #body-cell-isActive="props">
              <q-td><q-badge :color="props.value ? 'positive' : 'grey'" :label="props.value ? 'Aktif' : 'Nonaktif'" /></q-td>
            </template>
            <template #body-cell-actions="props">
              <q-td>
                <q-btn flat dense round icon="edit" color="primary" size="sm" @click="openWakafDialog(props.row)" />
                <q-btn flat dense round icon="delete" color="negative" size="sm" class="q-ml-xs" @click="confirmDeleteWakaf(props.row)" />
              </q-td>
            </template>
          </q-table>
        </q-card>
      </q-tab-panel>

      <!-- ══════════════════════ TAB REKENING ════════════════════════════ -->
      <q-tab-panel name="rekening" class="q-pa-none">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle1 text-weight-bold">Rekening Donasi</div>
          <q-btn unelevated color="primary" icon="add" label="Tambah Rekening" no-caps @click="openRekeningDialog()" />
        </div>
        <div class="row q-col-gutter-md">
          <div v-for="rek in donasiStore.rekeningList" :key="rek.id" class="col-12 col-sm-6 col-md-4">
            <q-card flat bordered class="rounded-xl">
              <q-card-section>
                <div class="text-weight-bold text-primary">{{ rek.namaBank }}</div>
                <div class="text-h6 q-my-xs">{{ rek.noRekening }}</div>
                <div class="text-grey-7">a.n. {{ rek.atasNama }}</div>
                <div v-if="rek.keterangan" class="text-caption text-grey-6 q-mt-xs">{{ rek.keterangan }}</div>
                <q-badge :color="rek.isActive ? 'positive' : 'grey'" :label="rek.isActive ? 'Aktif' : 'Nonaktif'" class="q-mt-sm" />
              </q-card-section>
              <q-separator />
              <!-- QRIS Preview -->
              <q-card-section v-if="rek.qrisImage" class="text-center q-pa-sm">
                <div class="text-caption text-grey-6 q-mb-xs">QRIS</div>
                <q-img :src="rek.qrisImage" fit="contain" style="max-height: 160px; max-width: 160px; margin: 0 auto" />
              </q-card-section>
              <q-card-section v-else class="text-center q-pa-sm">
                <q-icon name="qr_code_2" size="48px" color="grey-4" />
                <div class="text-caption text-grey-5">Belum ada QRIS</div>
              </q-card-section>
              <q-separator />
              <q-card-actions class="q-px-md">
                <q-btn flat no-caps icon="edit" label="Edit" color="primary" size="sm" @click="openRekeningDialog(rek)" />
                <q-space />
                <q-btn flat no-caps icon="delete" label="Hapus" color="negative" size="sm" @click="confirmDeleteRekening(rek)" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Bukti Transfer Dialog -->
    <q-dialog v-model="buktiDialog">
      <q-card style="max-width: 500px; width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Bukti Transfer</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-img :src="buktiUrl" fit="contain" style="max-height: 400px" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog Program Donasi -->
    <q-dialog v-model="programDialog" persistent>
      <q-card style="min-width: 360px; width: 90vw; max-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editProgram.id ? 'Edit' : 'Tambah' }} Program Donasi</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveProgram" class="q-gutter-md">
            <q-input v-model="editProgram.judul" outlined label="Judul Program *" :rules="[v => !!v || 'Judul wajib diisi']" />
            <q-input v-model="editProgram.kode" outlined label="Kode Program" />
            <q-input v-model="editProgram.deskripsi" outlined label="Deskripsi" type="textarea" rows="10" />
            <q-input v-model="editProgram.target" outlined label="Target Donasi (Rp)" type="number" min="0" />
            <q-input v-model="editProgram.urutan" outlined label="Urutan Tampil" type="number" min="0" />
            <q-toggle v-model="editProgram.isActive" label="Tampilkan di website" color="primary" />
            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn unelevated color="primary" no-caps :label="editProgram.id ? 'Simpan' : 'Tambah'" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog Program Wakaf -->
    <q-dialog v-model="wakafDialog" persistent>
      <q-card style="min-width: 360px; width: 90vw; max-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editWakaf.id ? 'Edit' : 'Tambah' }} Program Wakaf</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveWakaf" class="q-gutter-md">
            <q-input v-model="editWakaf.kegiatan" outlined label="Kegiatan *" :rules="[v => !!v || 'Kegiatan wajib diisi']" />
            <q-input v-model="editWakaf.kode" outlined label="Kode Program" />
            <q-input v-model="editWakaf.deskripsi" outlined label="Deskripsi" type="textarea" rows="10" />
            <q-input v-model="editWakaf.target" outlined label="Target Wakaf (Rp)" type="number" min="0" />
            <q-input v-model="editWakaf.urutan" outlined label="Urutan Tampil" type="number" min="0" />
            <q-toggle v-model="editWakaf.isActive" label="Tampilkan di website" color="primary" />
            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn unelevated color="primary" no-caps :label="editWakaf.id ? 'Simpan' : 'Tambah'" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog Rekening -->
    <q-dialog v-model="rekeningDialog" persistent>
      <q-card style="min-width: 360px; width: 90vw; max-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editRekening.id ? 'Edit' : 'Tambah' }} Rekening</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveRekening" class="q-gutter-md">
            <q-input v-model="editRekening.namaBank" outlined label="Nama Bank *" :rules="[v => !!v || 'Nama bank wajib diisi']" />
            <q-input v-model="editRekening.noRekening" outlined label="Nomor Rekening *" :rules="[v => !!v || 'Nomor rekening wajib diisi']" />
            <q-input v-model="editRekening.atasNama" outlined label="Atas Nama *" :rules="[v => !!v || 'Atas nama wajib diisi']" />
            <q-input v-model="editRekening.keterangan" outlined label="Keterangan" />
            <q-toggle v-model="editRekening.isActive" label="Aktif" color="primary" />

            <!-- QRIS Upload -->
            <div>
              <div class="text-caption text-grey-7 q-mb-xs">Gambar QRIS (opsional, max 2MB)</div>
              <q-file
                v-model="qrisFile"
                outlined
                label="Upload Gambar QRIS"
                accept="image/jpeg,image/png,image/webp"
                max-file-size="2097152"
                clearable
              >
                <template #prepend><q-icon name="qr_code_2" /></template>
              </q-file>
              <!-- Preview gambar yang sudah ada -->
              <div v-if="editRekening.qrisImage && !qrisFile" class="q-mt-sm text-center">
                <div class="text-caption text-grey-6 q-mb-xs">QRIS saat ini:</div>
                <q-img :src="editRekening.qrisImage" fit="contain" style="max-height: 120px; max-width: 120px; margin: 0 auto" />
              </div>
              <!-- Preview file baru -->
              <div v-if="qrisPreviewUrl" class="q-mt-sm text-center">
                <div class="text-caption text-grey-6 q-mb-xs">Preview baru:</div>
                <q-img :src="qrisPreviewUrl" fit="contain" style="max-height: 120px; max-width: 120px; margin: 0 auto" />
              </div>
            </div>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn unelevated color="primary" no-caps :label="editRekening.id ? 'Simpan' : 'Tambah'" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useDonasiStore } from 'src/stores/donasi';

const $q = useQuasar();
const donasiStore = useDonasiStore();

const tab = ref('donasi');
const activeStatus = ref('');
const buktiDialog = ref(false);
const buktiUrl = ref('');

// ─── Program Donasi ──────────────────────────────────────────────────────────
const programDialog = ref(false);
const editProgram = ref({});

const openProgramDialog = (row = null) => {
  editProgram.value = row
    ? { ...row, target: Number(row.target), terkumpul: Number(row.terkumpul) }
    : { judul: '', kode: '', deskripsi: '', target: '', terkumpul: 0, urutan: 0, isActive: true };
  programDialog.value = true;
};

const saveProgram = async () => {
  const ok = editProgram.value.id
    ? await donasiStore.updateProgram(editProgram.value.id, editProgram.value)
    : await donasiStore.createProgram(editProgram.value);
  if (ok) { programDialog.value = false; donasiStore.fetchAllProgram(); }
};

const confirmDeleteProgram = (row) => {
  $q.dialog({
    title: 'Hapus Program',
    message: `Hapus program "${row.judul}"?`,
    cancel: true,
    ok: { label: 'Hapus', color: 'negative', unelevated: true },
  }).onOk(async () => {
    const ok = await donasiStore.deleteProgram(row.id);
    if (ok) donasiStore.fetchAllProgram();
  });
};

// ─── Rekening ────────────────────────────────────────────────────────────────
const rekeningDialog = ref(false);
const editRekening = ref({});
const qrisFile = ref(null);
const qrisPreviewUrl = ref(null);

watch(qrisFile, (file) => {
  if (file) {
    qrisPreviewUrl.value = URL.createObjectURL(file);
  } else {
    qrisPreviewUrl.value = null;
  }
});

const openRekeningDialog = (row = null) => {
  qrisFile.value = null;
  qrisPreviewUrl.value = null;
  editRekening.value = row
    ? { ...row }
    : { namaBank: '', noRekening: '', atasNama: '', keterangan: '', isActive: true };
  rekeningDialog.value = true;
};

const saveRekening = async () => {
  const payload = { ...editRekening.value };
  if (qrisFile.value) payload.qrisImage = qrisFile.value;
  const ok = editRekening.value.id
    ? await donasiStore.updateRekening(editRekening.value.id, payload)
    : await donasiStore.createRekening(payload);
  if (ok) { rekeningDialog.value = false; donasiStore.fetchRekening(); }
};

const confirmDeleteRekening = (row) => {
  $q.dialog({
    title: 'Hapus Rekening',
    message: `Hapus rekening ${row.namaBank} - ${row.noRekening}?`,
    cancel: true,
    ok: { label: 'Hapus', color: 'negative', unelevated: true },
  }).onOk(async () => {
    const ok = await donasiStore.deleteRekening(row.id);
    if (ok) donasiStore.fetchRekening();
  });
};

// ─── Data Donasi ─────────────────────────────────────────────────────────────
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
  { name: 'jenisProgram', label: 'Jenis', field: 'jenisProgram', align: 'center' },
  { name: 'namaProgram', label: 'Program', field: 'namaProgram', align: 'left' },
  { name: 'buktiTransfer', label: 'Bukti', field: 'buktiTransfer', align: 'center' },
  { name: 'createdAt', label: 'Tanggal', field: 'createdAt', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'actions', label: 'Aksi', field: 'actions', align: 'center' },
];

const programColumns = [
  { name: 'kode', label: 'Kode', field: 'kode', align: 'left' },
  { name: 'judul', label: 'Kegiatan', field: 'judul', align: 'left', sortable: true },
  { name: 'target', label: 'Target', field: 'target', align: 'right' },
  { name: 'terkumpul', label: 'Terkumpul', field: 'terkumpul', align: 'left' },
  { name: 'urutan', label: 'Urutan', field: 'urutan', align: 'center' },
  { name: 'isActive', label: 'Status', field: 'isActive', align: 'center' },
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

// ─── Program Wakaf ───────────────────────────────────────────────────────────
const wakafDialog = ref(false);
const editWakaf = ref({});

const wakafColumns = [
  { name: 'kode', label: 'Kode', field: 'kode', align: 'left' },
  { name: 'kegiatan', label: 'Kegiatan', field: 'kegiatan', align: 'left', sortable: true },
  { name: 'target', label: 'Target', field: 'target', align: 'right' },
  { name: 'terkumpul', label: 'Terkumpul', field: 'terkumpul', align: 'left' },
  { name: 'urutan', label: 'Urutan', field: 'urutan', align: 'center' },
  { name: 'isActive', label: 'Status', field: 'isActive', align: 'center' },
  { name: 'actions', label: 'Aksi', field: 'actions', align: 'center' },
];

const openWakafDialog = (row = null) => {
  editWakaf.value = row
    ? { ...row, target: Number(row.target || 0) }
    : { kode: '', kegiatan: '', deskripsi: '', target: '', urutan: 0, isActive: true };
  wakafDialog.value = true;
};

const saveWakaf = async () => {
  const ok = editWakaf.value.id
    ? await donasiStore.updateWakaf(editWakaf.value.id, editWakaf.value)
    : await donasiStore.createWakaf(editWakaf.value);
  if (ok) { wakafDialog.value = false; donasiStore.fetchAllWakaf(); }
};

const confirmDeleteWakaf = (row) => {
  $q.dialog({
    title: 'Hapus Program Wakaf',
    message: `Hapus program wakaf "${row.kegiatan}"?`,
    cancel: true,
    ok: { label: 'Hapus', color: 'negative', unelevated: true },
  }).onOk(async () => {
    const ok = await donasiStore.deleteWakaf(row.id);
    if (ok) donasiStore.fetchAllWakaf();
  });
};

const recalcLoading = ref(false);
const recalcTerkumpul = async () => {
  recalcLoading.value = true;
  const ok = await donasiStore.recalcTerkumpul();
  if (ok) {
    await Promise.all([donasiStore.fetchAllProgram(), donasiStore.fetchAllWakaf()]);
  }
  recalcLoading.value = false;
};

const updateStatus = async (id, status) => {
  const ok = await donasiStore.updateStatus(id, status);
  if (ok) {
    donasiStore.fetchAll({ page: 1 });
    donasiStore.fetchSummary();
    donasiStore.fetchAllProgram();
    donasiStore.fetchAllWakaf();
  }
};

const showBukti = (url) => {
  buktiUrl.value = url;
  buktiDialog.value = true;
};

onMounted(async () => {
  await Promise.all([
    donasiStore.fetchAll(),
    donasiStore.fetchSummary(),
    donasiStore.fetchAllProgram(),
    donasiStore.fetchAllWakaf(),
    donasiStore.fetchRekening(),
  ]);
});
</script>
