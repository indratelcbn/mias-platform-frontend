<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">
        <q-icon name="menu_book" color="primary" class="q-mr-sm" />Kelola Kajian
      </div>
      <q-btn unelevated color="primary" icon="add" label="Tambah Kajian" no-caps @click="openDialog()" />
    </div>

    <!-- Table -->
    <q-card flat bordered class="rounded-xl">
      <q-table
        :rows="kajianStore.list"
        :columns="columns"
        row-key="id"
        flat
        :loading="kajianStore.loading"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template #body-cell-tanggal="props">
          <q-td>{{ formatDate(props.value) }}</q-td>
        </template>
        <template #body-cell-isPublished="props">
          <q-td>
            <q-badge :color="props.value ? 'positive' : 'grey'" :label="props.value ? 'Aktif' : 'Draft'" />
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td>
            <q-btn flat round icon="edit" color="primary" size="sm" @click="openDialog(props.row)" />
            <q-btn flat round icon="delete" color="negative" size="sm" @click="confirmDelete(props.row)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Form -->
    <q-dialog v-model="dialog" persistent maximized-mobile>
      <q-card style="width: 600px; max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ isEdit ? 'Edit Kajian' : 'Tambah Kajian' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md q-pb-lg q-px-lg">
          <q-form @submit="saveKajian">
            <!-- Judul -->
            <q-input
              v-model="form.judul"
              outlined dense
              label="Judul Kajian *"
              :rules="[v => !!v || 'Wajib diisi']"
            />

            <!-- Ustadz -->
            <div class="row q-col-gutter-sm q-mt-sm">
              <div :class="selectedUstadz === 'Lainnya' ? 'col-6' : 'col-12'">
                <q-select
                  v-model="selectedUstadz"
                  outlined dense
                  label="Nama Ustadz *"
                  :options="filteredUstadzOptions"
                  :loading="loadingPemateri"
                  use-input
                  input-debounce="200"
                  @filter="filterUstadz"
                  @update:model-value="onUstadzChange"
                  :rules="[() => !!form.ustadz || 'Wajib diisi']"
                >
                  <template #no-option>
                    <q-item><q-item-section class="text-grey">Tidak ditemukan</q-item-section></q-item>
                  </template>
                </q-select>
              </div>
              <div v-if="selectedUstadz === 'Lainnya'" class="col-6">
                <q-input
                  v-model="form.ustadz"
                  outlined dense
                  label="Ketik Nama Ustadz *"
                  :rules="[v => !!v || 'Wajib diisi']"
                />
              </div>
            </div>

            <!-- Tanggal & Waktu -->
            <div class="row q-col-gutter-sm q-mt-sm">
              <div class="col-6">
                <q-input
                  v-model="form.tanggal"
                  outlined dense
                  label="Tanggal *"
                  type="date"
                  :rules="[v => !!v || 'Wajib diisi']"
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="selectedWaktu"
                  outlined dense
                  label="Waktu *"
                  :options="waktuOptions"
                  :rules="[() => !!form.waktu || 'Wajib diisi']"
                  @update:model-value="onWaktuChange"
                />
              </div>
            </div>

            <!-- Waktu manual -->
            <q-input
              v-if="selectedWaktu === 'Lainnya'"
              v-model="form.waktu"
              outlined dense
              label="Isi Waktu Manual *"
              placeholder="Contoh: 19:30 - 21:00 WIB"
              :rules="[v => !!v || 'Wajib diisi']"
              class="q-mt-sm"
            />

            <!-- Deskripsi -->
            <q-input
              v-model="form.deskripsi"
              outlined dense
              label="Deskripsi"
              type="textarea"
              rows="12"
              class="q-mt-sm"
            />

            <!-- ── Kitab ───────────────────────────────────────────── -->
            <!-- RUTIN: tampilkan kitab dari profil pemateri (read-only) -->
            <div v-if="isRutinPemateri" class="q-mt-sm rounded-borders bg-blue-1 q-pa-sm">
              <div class="row items-center justify-between q-mb-xs">
                <div class="row items-center q-gutter-xs">
                  <q-icon name="menu_book" color="primary" size="16px" />
                  <span class="text-caption text-weight-medium text-primary">Kitab (dari profil pemateri)</span>
                </div>
                <a
                  v-if="selectedPemateri?.kitabFile"
                  :href="selectedPemateri.kitabFile"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  @click.stop
                >
                  <q-btn flat dense no-caps icon="picture_as_pdf" color="red-7" size="sm" label="Unduh PDF" />
                </a>
              </div>
              <template v-if="selectedPemateri?.kitab">
                <div v-for="k in kitabList(selectedPemateri.kitab)" :key="k" class="row items-center q-gutter-xs">
                  <q-icon name="auto_stories" size="13px" color="blue-7" />
                  <span class="text-caption text-grey-8">{{ k }}</span>
                </div>
              </template>
              <span v-else class="text-caption text-grey-6">Belum ada kitab pada profil pemateri ini.</span>
            </div>

            <!-- TEMATIK / manual: tombol opsional untuk tambah kitab -->
            <template v-else-if="form.ustadz">
              <div v-if="!showKitabInput" class="q-mt-sm">
                <q-btn
                  flat dense no-caps size="sm"
                  icon="add_circle_outline"
                  label="Tambah Kitab / Materi"
                  color="primary"
                  @click="showKitabInput = true"
                />
              </div>
              <template v-else>
                <div class="row items-center justify-between q-mt-sm q-mb-xs">
                  <span class="text-caption text-weight-medium text-grey-8">Kitab / Materi</span>
                  <q-btn flat dense no-caps size="xs" icon="close" color="grey-6" label="Hapus" @click="clearKitab" />
                </div>
                <q-input
                  v-model="form.kitab"
                  outlined dense
                  label="Nama Kitab / Materi"
                  type="textarea"
                  rows="3"
                  hint="Satu kitab per baris (Enter)"
                />
                <div class="q-mt-xs">
                  <a
                    v-if="!form.kitabFile && form.kitabFileExisting"
                    :href="form.kitabFileExisting"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary text-caption row items-center q-gutter-xs q-mb-xs"
                  >
                    <q-icon name="picture_as_pdf" color="red" size="16px" />
                    <span>File PDF saat ini (klik untuk lihat)</span>
                  </a>
                  <q-file
                    v-model="form.kitabFile"
                    outlined dense
                    label="Upload PDF Kitab (opsional)"
                    accept=".pdf,application/pdf"
                  >
                    <template #prepend><q-icon name="picture_as_pdf" color="red-7" /></template>
                    <template #append>
                      <q-icon v-if="form.kitabFile" name="cancel" class="cursor-pointer" @click.stop="form.kitabFile = null" />
                    </template>
                  </q-file>
                </div>
              </template>
            </template>

            <!-- Thumbnail -->
            <q-file
              v-model="form.thumbnailFile"
              outlined dense
              label="Thumbnail (opsional)"
              accept="image/*"
              class="q-mt-sm"
            >
              <template #prepend><q-icon name="image" /></template>
            </q-file>

            <!-- Toggle -->
            <q-toggle v-model="form.isPublished" label="Tampilkan ke publik" color="primary" class="q-mt-xs" />

            <!-- Actions -->
            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn unelevated color="primary" no-caps type="submit" :label="isEdit ? 'Simpan Perubahan' : 'Tambah'" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useKajianStore } from 'src/stores/kajian';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const kajianStore = useKajianStore();

const dialog = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const editId = ref(null);

const ustadzRaw = ref([]);           // raw pemateri from API
const filteredUstadzOptions = ref([]); // filtered for q-select
const loadingPemateri = ref(false);
const selectedUstadz = ref(null);
const selectedPemateri = ref(null); // full pemateri object for selected ustadz
const showKitabInput = ref(false);
const selectedWaktu = ref(null);
const waktuOptions = [ '08.30-11.00 WIB','09.00-11.00 WIB','09.00-12.00 WIB', "Ba'da Maghrib - Selesai", "Ba'da Shubuh - Selesai", 'Lainnya'];

const isRutinPemateri = computed(() => selectedPemateri.value?.jenis === 'RUTIN');

function kitabList(kitab) {
  return kitab ? kitab.split('\n').map(k => k.trim()).filter(Boolean) : [];
}

const buildUstadzList = () => ustadzRaw.value.map(p => p.nama).concat('Lainnya');

const fetchPemateri = async () => {
  loadingPemateri.value = true;
  try {
    const { data } = await api.get('/profil/pemateri');
    ustadzRaw.value = data.data || [];
  } catch { ustadzRaw.value = []; }
  finally { loadingPemateri.value = false; }
};

const filterUstadz = (val, update) => {
  update(() => {
    const list = buildUstadzList();
    if (!val) { filteredUstadzOptions.value = list; return; }
    const q = val.toLowerCase();
    filteredUstadzOptions.value = list.filter(n => n.toLowerCase().includes(q));
  });
};

const onUstadzChange = (val) => {
  showKitabInput.value = false;
  form.kitab = '';
  form.kitabFile = null;
  form.kitabFileExisting = '';
  if (val !== 'Lainnya') {
    form.ustadz = val;
    const pemateri = ustadzRaw.value.find(p => p.nama === val);
    selectedPemateri.value = pemateri || null;
    if (pemateri?.jenis === 'RUTIN') {
      // RUTIN: auto-load kitab from pemateri profile; store into form for saving
      form.kitab = pemateri.kitab || '';
      form.kitabFileExisting = pemateri.kitabFile || '';
    }
  } else {
    form.ustadz = '';
    selectedPemateri.value = null;
  }
};

function clearKitab() {
  form.kitab = '';
  form.kitabFile = null;
  form.kitabFileExisting = '';
  showKitabInput.value = false;
}

const onWaktuChange = (val) => {
  if (val !== 'Lainnya') {
    form.waktu = val;
  } else {
    form.waktu = '';
  }
};

const emptyForm = () => ({
  judul: '', ustadz: '', tanggal: '', waktu: '', deskripsi: '',
  kitab: '', kitabFile: null, kitabFileExisting: '',
  thumbnailFile: null, isPublished: true,
});
const form = reactive(emptyForm());

const columns = [
  { name: 'judul', label: 'Judul', field: 'judul', align: 'left', sortable: true },
  { name: 'ustadz', label: 'Ustadz', field: 'ustadz', align: 'left' },
  { name: 'tanggal', label: 'Tanggal', field: 'tanggal', align: 'left', sortable: true },
  { name: 'waktu', label: 'Waktu', field: 'waktu', align: 'left' },
  { name: 'isPublished', label: 'Status', field: 'isPublished', align: 'center' },
  { name: 'actions', label: 'Aksi', field: 'actions', align: 'center' },
];

const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

const openDialog = (row = null) => {
  if (row) {
    isEdit.value = true;
    editId.value = row.id;
    const pemateri = ustadzRaw.value.find(p => p.nama === row.ustadz) || null;
    selectedPemateri.value = pemateri;
    // For RUTIN: show pemateri's current kitab; for TEMATIK/Lainnya: show stored kajian kitab
    const isRutin = pemateri?.jenis === 'RUTIN';
    showKitabInput.value = !isRutin && !!(row.kitab || row.kitabFile);
    Object.assign(form, {
      judul: row.judul,
      ustadz: row.ustadz,
      tanggal: row.tanggal?.slice(0, 10),
      waktu: row.waktu,
      deskripsi: row.deskripsi || '',
      kitab: isRutin ? (pemateri.kitab || '') : (row.kitab || ''),
      kitabFile: null,
      kitabFileExisting: isRutin ? (pemateri.kitabFile || '') : (row.kitabFile || ''),
      thumbnailFile: null,
      isPublished: row.isPublished,
    });
  } else {
    isEdit.value = false;
    editId.value = null;
    selectedPemateri.value = null;
    showKitabInput.value = false;
    Object.assign(form, emptyForm());
    selectedWaktu.value = null;
    selectedUstadz.value = null;
  }
  // set selectedWaktu
  if (form.waktu && waktuOptions.includes(form.waktu)) {
    selectedWaktu.value = form.waktu;
  } else if (form.waktu) {
    selectedWaktu.value = 'Lainnya';
  }
  // set selectedUstadz
  const names = buildUstadzList();
  if (form.ustadz && names.includes(form.ustadz)) {
    selectedUstadz.value = form.ustadz;
  } else if (form.ustadz) {
    selectedUstadz.value = 'Lainnya';
  }
  dialog.value = true;
};

const saveKajian = async () => {
  saving.value = true;
  const payload = {
    ...form,
    thumbnail: form.thumbnailFile,
    kitabFile: form.kitabFile || null,
    // Pass existing URL when no new file (covers RUTIN pemateri & edit-without-new-upload)
    kitabFileUrl: !form.kitabFile && form.kitabFileExisting ? form.kitabFileExisting : undefined,
  };
  delete payload.thumbnailFile;
  delete payload.kitabFileExisting;

  const result = isEdit.value
    ? await kajianStore.update(editId.value, payload)
    : await kajianStore.create(payload);

  saving.value = false;
  if (result) {
    dialog.value = false;
    kajianStore.fetchAll({ page: 1, limit: 10 });
  }
};

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Hapus Kajian',
    message: `Yakin ingin menghapus kajian "${row.judul}"?`,
    cancel: { flat: true, label: 'Batal' },
    ok: { unelevated: true, color: 'negative', label: 'Hapus' },
    persistent: true,
  }).onOk(async () => {
    await kajianStore.remove(row.id);
    kajianStore.fetchAll({ page: 1, limit: 10 });
  });
};

onMounted(() => {
  kajianStore.fetchAll({ page: 1, limit: 100 });
  fetchPemateri();
});
</script>
