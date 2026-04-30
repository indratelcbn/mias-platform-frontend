<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">
        <q-icon name="people_alt" color="primary" class="q-mr-sm" />Data Mustahik
      </div>
      <div class="row q-gutter-sm">
        <q-btn outline color="teal" icon="upload_file" label="Import CSV" no-caps @click="triggerImport" />
        <q-btn outline color="secondary" icon="download" label="Export CSV" no-caps @click="exportCsv" />
        <q-btn unelevated color="primary" icon="add" label="Tambah Mustahik" no-caps @click="openDialog()" />
      </div>
    </div>

    <!-- Filter & Search -->
    <div class="row q-col-gutter-sm q-mb-md items-center">
      <div class="col-12 col-sm-4">
        <q-input v-model="search" outlined dense placeholder="Cari nama / alamat..." clearable debounce="400" @update:model-value="loadData">
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </div>
      <div class="col-6 col-sm-3">
        <q-select v-model="filterKategori" outlined dense :options="kategoriFilterOpts" emit-value map-options clearable label="Kategori" @update:model-value="loadData" />
      </div>
      <div class="col-6 col-sm-3">
        <q-select v-model="filterBerhak" outlined dense :options="berhakFilterOpts" emit-value map-options clearable label="Berhak" @update:model-value="loadData" />
      </div>
      <div class="col-6 col-sm-2">
        <q-select v-model="filterRt" outlined dense :options="rtFilterOpts" emit-value map-options clearable label="RT" @update:model-value="loadData" />
      </div>
      <div class="col-6 col-sm-2">
        <q-select v-model="filterRw" outlined dense :options="rwFilterOpts" emit-value map-options clearable label="RW" @update:model-value="loadData" />
      </div>
      <div class="col-6 col-sm-3">
        <q-select v-model="filterStatus" outlined dense :options="statusFilterOpts" emit-value map-options clearable label="Status" @update:model-value="loadData" />
      </div>
      <div class="col-6 col-sm-3">
        <q-select v-model="filterPrioritas" outlined dense :options="prioritasFilterOpts" emit-value map-options clearable label="Prioritas" @update:model-value="loadData" />
      </div>
    </div>

    <!-- Table -->
    <q-card flat bordered class="rounded-xl">
      <q-table
        :rows="mustahikStore.list"
        :columns="columns"
        row-key="id"
        flat
        :loading="mustahikStore.loading"
        :pagination="{ rowsPerPage: 0 }"
        hide-pagination
      >
        <template #body-cell-no="props">
          <q-td class="text-center text-weight-medium text-grey-8">
            {{ ((mustahikStore.meta.page - 1) * mustahikStore.meta.limit) + props.rowIndex + 1 }}
          </q-td>
        </template>
        <template #body-cell-kategori="props">
          <q-td><q-badge :color="kategoriColor(props.value)" :label="kategoriLabel(props.value)" /></q-td>
        </template>
        <template #body-cell-berhak="props">
          <q-td><q-badge color="blue-grey" :label="berhakLabel(props.value)" /></q-td>
        </template>
        <template #body-cell-status="props">
          <q-td class="text-center">
            <q-badge v-if="props.value" :color="statusColor(props.value)" :label="statusLabel(props.value)" />
            <span v-else class="text-grey-5">—</span>
          </q-td>
        </template>
        <template #body-cell-prioritas="props">
          <q-td class="text-center">
            <q-badge v-if="props.value" :color="prioritasColor(props.value)" :label="prioritasLabel(props.value)" />
            <span v-else class="text-grey-5">—</span>
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td>
            <q-btn flat dense round icon="edit" color="primary" size="sm" @click="openDialog(props.row)" />
            <q-btn flat dense round icon="delete" color="negative" size="sm" class="q-ml-xs" @click="confirmDelete(props.row)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Pagination -->
    <div v-if="mustahikStore.meta.totalPages > 1" class="row justify-center q-mt-lg">
      <q-pagination
        v-model="currentPage"
        :max="mustahikStore.meta.totalPages"
        boundary-numbers
        @update:model-value="onPageChange"
      />
    </div>

    <!-- ─── Dialog Form ──────────────────────────────────────────────── -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 580px; max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ form.id ? 'Edit' : 'Tambah' }} Mustahik</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="save" class="q-gutter-md">
            <q-input v-model="form.nama" outlined label="Nama *" :rules="[v => !!v || 'Wajib diisi']" />

            <q-input v-model="form.alamat" outlined label="Alamat" />

            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-select v-model="form.rt" outlined label="RT" :options="rtOpts" emit-value map-options clearable />
              </div>
              <div class="col-6">
                <q-select v-model="form.rw" outlined label="RW" :options="rwOpts" emit-value map-options clearable />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input v-model="form.kabKota" outlined label="Kab/Kota" />
              </div>
              <div class="col-6">
                <q-input v-model="form.provinsi" outlined label="Provinsi" />
              </div>
            </div>

            <q-input v-model="form.telepon" outlined label="No. Telepon" />

            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-select v-model="form.status" outlined label="Status" :options="statusOpts" emit-value map-options clearable />
              </div>
              <div class="col-6">
                <q-select v-model="form.prioritas" outlined label="Prioritas" :options="prioritasOpts" emit-value map-options clearable />
              </div>
            </div>

            <q-select
              v-model="form.kategori"
              outlined
              label="Kategori *"
              :options="kategoriOpts"
              emit-value
              map-options
              :rules="[v => !!v || 'Wajib dipilih']"
            />

            <q-select
              v-model="form.berhak"
              outlined
              label="Berhak Menerima *"
              :options="berhakOpts"
              emit-value
              map-options
              :rules="[v => !!v || 'Wajib dipilih']"
            />

            <div class="row justify-end q-gutter-sm q-mt-sm">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn unelevated color="primary" no-caps :label="form.id ? 'Simpan' : 'Tambah'" type="submit" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Hidden file input for CSV import -->
    <input ref="fileInput" type="file" accept=".csv" style="display:none" @change="handleImportFile" />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useMustahikStore } from 'src/stores/mustahik';

const $q = useQuasar();
const mustahikStore = useMustahikStore();

const dialog = ref(false);
const saving = ref(false);
const search = ref('');
const filterKategori = ref(null);
const filterBerhak = ref(null);
const filterStatus = ref(null);
const filterPrioritas = ref(null);
const filterRt = ref(null);
const filterRw = ref(null);
const currentPage = ref(1);
const fileInput = ref(null);

const kategoriOpts = [
  { label: 'Yatim', value: 'YATIM' },
  { label: 'Janda', value: 'JANDA' },
  { label: 'Fakir', value: 'FAKIR' },
  { label: 'Miskin', value: 'MISKIN' },
  { label: 'Gharim', value: 'GHARIM' },
  { label: 'Fii Sabilillah', value: 'FII_SABILILLAH' },
  { label: 'Musafir', value: 'MUSAFIR' },
];

const berhakOpts = [
  { label: 'Penerima Zakat Mal', value: 'PENERIMA_ZAKAT_MAL' },
  { label: 'Penerima Zakat Fitri', value: 'PENERIMA_ZAKAT_FITRI' },
  { label: 'Penerima Bantuan MIAS', value: 'PENERIMA_BANTUAN_MIAS' },
  { label: 'Semua', value: 'SEMUA' },
];

const rtOpts = Array.from({ length: 7 }, (_, i) => {
  const v = `RT-${String(i + 1).padStart(2, '0')}`;
  return { label: v, value: v };
});
const rwOpts = Array.from({ length: 4 }, (_, i) => {
  const v = `RW-${String(i + 1).padStart(2, '0')}`;
  return { label: v, value: v };
});

const statusOpts = [
  { label: "Jama'ah", value: 'JAMAAH' },
  { label: 'Warga', value: 'WARGA' },
  { label: 'Warga Luar', value: 'WARGA_LUAR' },
];

const prioritasOpts = [
  { label: 'Prioritas 1', value: 'PRIORITAS_1' },
  { label: 'Prioritas 2', value: 'PRIORITAS_2' },
  { label: 'Prioritas 3', value: 'PRIORITAS_3' },
];

const kategoriFilterOpts = [{ label: 'Semua Kategori', value: null }, ...kategoriOpts];
const berhakFilterOpts = [{ label: 'Semua Hak', value: null }, ...berhakOpts];
const statusFilterOpts = [{ label: 'Semua Status', value: null }, ...statusOpts];
const prioritasFilterOpts = [{ label: 'Semua Prioritas', value: null }, ...prioritasOpts];
const rtFilterOpts = [{ label: 'Semua RT', value: null }, ...rtOpts];
const rwFilterOpts = [{ label: 'Semua RW', value: null }, ...rwOpts];

const KATEGORI_COLORS = {
  YATIM: 'indigo', JANDA: 'purple', FAKIR: 'red-8', MISKIN: 'orange-9',
  GHARIM: 'cyan-8', FII_SABILILLAH: 'green-8', MUSAFIR: 'teal',
};
const STATUS_COLORS = { JAMAAH: 'green-7', WARGA: 'blue-7', WARGA_LUAR: 'grey-7' };
const PRIORITAS_COLORS = { PRIORITAS_1: 'red-7', PRIORITAS_2: 'orange-8', PRIORITAS_3: 'amber-8' };

const kategoriColor = (k) => KATEGORI_COLORS[k] || 'grey';
const kategoriLabel = (k) => kategoriOpts.find(o => o.value === k)?.label ?? k;
const berhakLabel = (k) => berhakOpts.find(o => o.value === k)?.label ?? k;
const statusColor = (k) => STATUS_COLORS[k] || 'grey';
const statusLabel = (k) => statusOpts.find(o => o.value === k)?.label ?? k;
const prioritasColor = (k) => PRIORITAS_COLORS[k] || 'grey';
const prioritasLabel = (k) => prioritasOpts.find(o => o.value === k)?.label ?? k;

const columns = [
  { name: 'no', label: 'No', field: 'no', align: 'center', style: 'width: 56px' },
  { name: 'nama', label: 'Nama', field: 'nama', align: 'left', sortable: true },
  { name: 'alamat', label: 'Alamat', field: 'alamat', align: 'left' },
  { name: 'rt', label: 'RT', field: 'rt', align: 'center' },
  { name: 'rw', label: 'RW', field: 'rw', align: 'center' },
  { name: 'kabKota', label: 'Kab/Kota', field: 'kabKota', align: 'left' },
  { name: 'provinsi', label: 'Provinsi', field: 'provinsi', align: 'left' },
  { name: 'telepon', label: 'No. Telp', field: 'telepon', align: 'left' },
  { name: 'kategori', label: 'Kategori', field: 'kategori', align: 'center' },
  { name: 'berhak', label: 'Berhak', field: 'berhak', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'prioritas', label: 'Prioritas', field: 'prioritas', align: 'center' },
  { name: 'actions', label: 'Aksi', field: 'actions', align: 'center' },
];

const emptyForm = () => ({
  id: null, nama: '', alamat: '', rt: null, rw: null, kabKota: '', provinsi: '', telepon: '',
  kategori: 'FAKIR', berhak: 'SEMUA', status: null, prioritas: null,
});
const form = ref(emptyForm());

const filterParams = () => ({
  search: search.value || undefined,
  kategori: filterKategori.value || undefined,
  berhak: filterBerhak.value || undefined,
  status: filterStatus.value || undefined,
  prioritas: filterPrioritas.value || undefined,
  rt: filterRt.value || undefined,
  rw: filterRw.value || undefined,
});

const loadData = () => {
  currentPage.value = 1;
  mustahikStore.setPage(1);
  mustahikStore.fetchAll(filterParams());
};

const onPageChange = (page) => {
  currentPage.value = page;
  mustahikStore.setPage(page);
  mustahikStore.fetchAll({ page, ...filterParams() });
};

const openDialog = (row = null) => {
  if (row) {
    form.value = { ...row };
  } else {
    form.value = emptyForm();
  }
  dialog.value = true;
};

const save = async () => {
  saving.value = true;
  const payload = { ...form.value };
  delete payload.id;
  delete payload.createdAt;
  delete payload.updatedAt;

  const ok = form.value.id
    ? await mustahikStore.update(form.value.id, payload)
    : await mustahikStore.create(payload);
  saving.value = false;
  if (ok) {
    dialog.value = false;
    loadData();
  }
};

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Hapus Mustahik',
    message: `Hapus data "${row.nama}"?`,
    cancel: true,
    ok: { label: 'Hapus', color: 'negative', unelevated: true },
  }).onOk(async () => {
    const ok = await mustahikStore.remove(row.id);
    if (ok) loadData();
  });
};

// ─── Import CSV ──────────────────────────────────────────────────────────────
const triggerImport = () => {
  fileInput.value.click();
};

const handleImportFile = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const text = await file.text();
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 2) {
    $q.notify({ type: 'warning', message: 'File CSV kosong atau hanya header.' });
    fileInput.value.value = '';
    return;
  }

  // Parse header
  const header = lines[0].split(';').map(h => h.trim().toLowerCase());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(';').map(c => c.trim());
    const row = {};
    header.forEach((h, idx) => {
      const val = cols[idx] || '';
      if (h === 'nama') row.nama = val;
      else if (h === 'alamat') row.alamat = val;
      else if (h.includes('kab') || h.includes('kota')) row.kabKota = val;
      else if (h.includes('provinsi')) row.provinsi = val;
      else if (h.includes('telp') || h.includes('telepon') || h.includes('hp')) row.telepon = val;
      else if (h === 'kategori') row.kategori = val.toUpperCase().replace(/ /g, '_');
      else if (h === 'berhak') row.berhak = val.toUpperCase().replace(/ /g, '_');
      else if (h === 'rt') row.rt = val;
      else if (h === 'rw') row.rw = val;
      else if (h === 'status') {
        const s = val.toUpperCase().replace(/[' ]/g, '').replace('JAMAAH', 'JAMAAH');
        if (s.includes('LUAR')) row.status = 'WARGA_LUAR';
        else if (s.includes('WARGA')) row.status = 'WARGA';
        else if (s.includes('JAMA')) row.status = 'JAMAAH';
      }
      else if (h === 'prioritas') {
        const m = val.match(/[1-3]/);
        if (m) row.prioritas = `PRIORITAS_${m[0]}`;
      }
    });
    if (row.nama) records.push(row);
  }

  if (!records.length) {
    $q.notify({ type: 'warning', message: 'Tidak ada data valid dalam CSV.' });
    fileInput.value.value = '';
    return;
  }

  $q.dialog({
    title: 'Konfirmasi Import',
    message: `Import ${records.length} data mustahik?`,
    cancel: true,
    ok: { label: 'Import', color: 'primary', unelevated: true },
  }).onOk(async () => {
    const ok = await mustahikStore.importData(records);
    if (ok) loadData();
  });

  fileInput.value.value = '';
};

// ─── Export CSV ──────────────────────────────────────────────────────────────
const exportCsv = async () => {
  const data = await mustahikStore.exportData({
    kategori: filterKategori.value || undefined,
    berhak: filterBerhak.value || undefined,
    status: filterStatus.value || undefined,
    prioritas: filterPrioritas.value || undefined,
    rt: filterRt.value || undefined,
    rw: filterRw.value || undefined,
  });
  if (!data || !data.length) {
    $q.notify({ type: 'warning', message: 'Tidak ada data untuk diekspor.' });
    return;
  }

  const headers = ['Nama', 'Alamat', 'RT', 'RW', 'Kab/Kota', 'Provinsi', 'Telepon', 'Kategori', 'Berhak', 'Status', 'Prioritas'];
  const rows = data.map(d => [
    d.nama, d.alamat || '', d.rt || '', d.rw || '', d.kabKota || '', d.provinsi || '', d.telepon || '',
    kategoriLabel(d.kategori), berhakLabel(d.berhak),
    d.status ? statusLabel(d.status) : '', d.prioritas ? prioritasLabel(d.prioritas) : '',
  ]);

  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `mustahik_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  window.URL.revokeObjectURL(blobUrl);
};

onMounted(loadData);
</script>
