<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <q-icon name="account_balance" size="28px" color="primary" class="q-mr-sm" />
      <div class="text-h5 text-weight-bold">Kelola Profil Masjid</div>
    </div>

    <q-tabs
      v-model="tab"
      dense
      indicator-color="primary"
      active-color="primary"
      align="left"
      class="q-mb-lg"
    >
      <q-tab name="sejarah"  icon="history_edu"   label="Sejarah" />
      <q-tab name="visimisi" icon="verified"       label="Visi & Misi" />
      <q-tab name="fasilitas" icon="apartment"     label="Fasilitas" />
      <q-tab name="struktur" icon="account_tree"   label="Struktur" />
      <q-tab name="pemateri" icon="auto_stories"   label="Pemateri" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <!-- ════════════════════════════════════════════════════════
           TAB 1: SEJARAH
      ════════════════════════════════════════════════════════ -->
      <q-tab-panel name="sejarah" class="q-pa-none">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-md">Konten Sejarah</div>
            <div class="q-gutter-md">
              <q-input
                v-model="sejarahForm.konten"
                outlined
                type="textarea"
                rows="14"
                label="Konten Sejarah"
                hint="Tulis riwayat & sejarah masjid di sini"
              />
              <div>
                <div class="text-caption text-grey-7 q-mb-xs">Foto Header (opsional)</div>
                <div class="row q-gutter-md items-end">
                  <q-img
                    v-if="sejarahPreview || sejarahStore.data?.foto"
                    :src="sejarahPreview || sejarahStore.data.foto"
                    width="200px"
                    height="120px"
                    fit="cover"
                    class="rounded"
                  />
                  <q-file
                    v-model="sejarahFotoFile"
                    outlined
                    dense
                    label="Ganti Foto..."
                    accept="image/*"
                    style="min-width: 220px"
                    @update:model-value="onSejarahFoto"
                  >
                    <template #prepend><q-icon name="image" /></template>
                  </q-file>
                </div>
              </div>
              <div class="row justify-end">
                <q-btn unelevated color="primary" no-caps icon="save" label="Simpan Sejarah"
                  :loading="sejarahStore.loading" @click="saveSejarah" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- ════════════════════════════════════════════════════════
           TAB 2: VISI & MISI
      ════════════════════════════════════════════════════════ -->
      <q-tab-panel name="visimisi" class="q-pa-none">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-md">Visi &amp; Misi</div>
            <div class="q-gutter-md">
              <q-input
                v-model="vmForm.visi"
                outlined
                type="textarea"
                rows="5"
                label="Visi"
              />
              <q-input
                v-model="vmForm.misi"
                outlined
                type="textarea"
                rows="7"
                label="Misi"
                hint="Untuk poin-poin misi, pisahkan dengan Enter"
              />
              <div class="row justify-end">
                <q-btn unelevated color="primary" no-caps icon="save" label="Simpan Visi & Misi"
                  :loading="vmStore.loading" @click="saveVisiMisi" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- ════════════════════════════════════════════════════════
           TAB 3: FASILITAS
      ════════════════════════════════════════════════════════ -->
      <q-tab-panel name="fasilitas" class="q-pa-none">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle1 text-weight-medium">Daftar Fasilitas</div>
          <q-btn unelevated dense color="primary" icon="add" no-caps label="Tambah Fasilitas"
            @click="openFasilitasDialog()" />
        </div>

        <div v-if="fasStore.loading" class="text-center q-py-xl">
          <q-spinner-dots color="primary" size="40px" />
        </div>
        <div v-else class="column q-gutter-md">
          <q-card v-for="f in fasStore.list" :key="f.id" flat bordered>
            <q-card-section>
              <div class="row items-start justify-between q-mb-sm">
                <div class="column">
                  <div class="text-subtitle2 text-weight-bold">{{ f.judul }}</div>
                  <q-badge :color="f.isActive ? 'positive' : 'grey'" :label="f.isActive ? 'Aktif' : 'Nonaktif'" class="q-mt-xs" />
                </div>
                <div class="row q-gutter-xs">
                  <q-btn flat dense round icon="edit" color="primary" @click="openFasilitasDialog(f)" />
                  <q-btn flat dense round icon="delete" color="negative" @click="confirmDeleteFasilitas(f)" />
                </div>
              </div>
              <p v-if="f.deskripsi" class="text-caption text-grey-7 q-mb-md">{{ f.deskripsi }}</p>

              <!-- Foto Gallery -->
              <div class="text-caption text-weight-medium q-mb-xs">Foto Dokumentasi ({{ f.foto?.length || 0 }})</div>
              <div class="row q-gutter-xs q-mb-sm flex-wrap">
                <div v-for="p in f.foto" :key="p.id" class="relative-position">
                  <q-img :src="p.foto" width="80px" height="60px" fit="cover" class="rounded" />
                  <q-btn
                    round unelevated dense icon="close" color="negative" size="xs"
                    class="absolute-top-right"
                    @click="deleteFasilitasFoto(f, p)"
                  />
                </div>
                <!-- Upload new foto -->
                <q-file
                  v-model="fasUploadFiles[f.id]"
                  outlined dense
                  label="+ Foto"
                  accept="image/*"
                  style="width: 80px; height: 60px"
                  @update:model-value="files => uploadFasilitasFoto(f.id, files)"
                >
                  <template #default>
                    <div class="column items-center justify-center full-height cursor-pointer text-grey-6">
                      <q-icon name="add_photo_alternate" size="22px" />
                    </div>
                  </template>
                </q-file>
              </div>
            </q-card-section>
          </q-card>
          <div v-if="!fasStore.list.length" class="text-center q-py-lg text-grey-6">
            Belum ada fasilitas.
          </div>
        </div>

        <!-- Dialog Fasilitas -->
        <q-dialog v-model="fasDialog" persistent>
          <q-card style="min-width: 380px">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6">{{ fasEdit ? 'Edit Fasilitas' : 'Tambah Fasilitas' }}</div>
              <q-space />
              <q-btn flat round dense icon="close" v-close-popup />
            </q-card-section>
            <q-card-section class="q-gutter-md">
              <q-input v-model="fasForm.judul" outlined dense label="Judul Fasilitas *" :rules="[v => !!v || 'Wajib']" />
              <q-input v-model="fasForm.deskripsi" outlined dense label="Deskripsi" type="textarea" rows="3" />
              <q-input v-model.number="fasForm.urutan" outlined dense label="Urutan" type="number" />
              <q-toggle v-model="fasForm.isActive" label="Aktif" color="positive" />
            </q-card-section>
            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn unelevated color="primary" no-caps :label="fasEdit ? 'Simpan' : 'Tambah'" :loading="fasSaving" @click="saveFasilitas" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-tab-panel>

      <!-- ════════════════════════════════════════════════════════
           TAB 4: STRUKTUR
      ════════════════════════════════════════════════════════ -->
      <q-tab-panel name="struktur" class="q-pa-none">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-md">Struktur Organisasi</div>
            <div class="q-gutter-md">
              <div>
                <div class="text-caption text-grey-7 q-mb-xs">Foto Bagan Struktur Organisasi</div>
                <div class="row q-gutter-md items-end">
                  <q-img
                    v-if="strukturPreview || strukturStore.data?.foto"
                    :src="strukturPreview || strukturStore.data.foto"
                    width="300px"
                    class="rounded"
                    fit="contain"
                  />
                  <q-file
                    v-model="strukturFotoFile"
                    outlined
                    dense
                    label="Upload / Ganti Foto..."
                    accept="image/*"
                    style="min-width: 220px"
                    @update:model-value="onStrukturFoto"
                  >
                    <template #prepend><q-icon name="image" /></template>
                  </q-file>
                </div>
              </div>
              <q-input
                v-model="strukturForm.keterangan"
                outlined
                type="textarea"
                rows="4"
                label="Keterangan (opsional)"
              />
              <div class="row justify-end">
                <q-btn unelevated color="primary" no-caps icon="save" label="Simpan Struktur"
                  :loading="strukturStore.loading" @click="saveStruktur" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- ════════════════════════════════════════════════════════
           TAB 5: PEMATERI
      ════════════════════════════════════════════════════════ -->
      <q-tab-panel name="pemateri" class="q-pa-none">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle1 text-weight-medium">Daftar Pemateri</div>
          <q-btn unelevated dense color="primary" icon="add" no-caps label="Tambah Pemateri"
            @click="openPemateriDialog()" />
        </div>

        <q-card flat bordered>
          <q-table
            :rows="pemateriStore.list"
            :columns="pemateriCols"
            row-key="id"
            flat
            :loading="pemateriStore.loading"
          >
            <template #body-cell-foto="props">
              <q-td>
                <q-avatar size="40px">
                  <img v-if="props.value" :src="props.value" />
                  <q-icon v-else name="person" size="24px" color="grey-5" />
                </q-avatar>
              </q-td>
            </template>
            <template #body-cell-jenis="props">
              <q-td>
                <q-badge :color="props.value === 'RUTIN' ? 'primary' : 'deep-orange'" :label="props.value" />
              </q-td>
            </template>
            <template #body-cell-isActive="props">
              <q-td>
                <q-badge :color="props.value ? 'positive' : 'grey'" :label="props.value ? 'Aktif' : 'Nonaktif'" />
              </q-td>
            </template>
            <template #body-cell-actions="props">
              <q-td>
                <q-btn flat round dense icon="edit" color="primary" size="sm" @click="openPemateriDialog(props.row)" />
                <q-btn flat round dense icon="delete" color="negative" size="sm" @click="confirmDeletePemateri(props.row)" />
              </q-td>
            </template>
          </q-table>
        </q-card>

        <!-- Dialog Pemateri -->
        <q-dialog v-model="pmDialog" persistent>
          <q-card style="min-width: 420px; max-width: 560px">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6">{{ pmEdit ? 'Edit Pemateri' : 'Tambah Pemateri' }}</div>
              <q-space />
              <q-btn flat round dense icon="close" v-close-popup />
            </q-card-section>
            <q-card-section class="q-gutter-md" style="max-height: 70vh; overflow-y: auto">
              <q-input v-model="pmForm.nama" outlined dense label="Nama Ustadz *" :rules="[v => !!v || 'Wajib']" />
              <q-select
                v-model="pmForm.jenis"
                outlined dense
                label="Jenis Kajian *"
                :options="jenisPemateriOptions"
                emit-value map-options
                :rules="[v => !!v || 'Wajib']"
              />
              <q-input
                v-model="pmForm.kitab"
                outlined dense
                label="Nama Kitab / Materi"
                type="textarea"
                rows="4"
                hint="Satu kitab per baris (Enter)"
              />
              <q-input v-model="pmForm.keterangan" outlined dense label="Keterangan" type="textarea" rows="2" />
              <q-input v-model.number="pmForm.urutan" outlined dense label="Urutan" type="number" />
              <q-toggle v-model="pmForm.isActive" label="Aktif" color="positive" />
              <div>
                <div class="text-caption text-grey-7 q-mb-xs">Foto (opsional)</div>
                <div class="row q-gutter-md items-end">
                  <q-avatar size="64px" v-if="pmPreview || (pmEdit && pmForm.fotoExisting)">
                    <img :src="pmPreview || pmForm.fotoExisting" />
                  </q-avatar>
                  <q-file
                    v-model="pmFotoFile"
                    outlined dense
                    label="Upload Foto..."
                    accept="image/*"
                    style="min-width: 180px"
                    @update:model-value="onPmFoto"
                  >
                    <template #prepend><q-icon name="person" /></template>
                  </q-file>
                </div>
              </div>
            </q-card-section>
            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn unelevated color="primary" no-caps :label="pmEdit ? 'Simpan' : 'Tambah'" :loading="pmSaving" @click="savePemateri" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import {
  useProfilSejarahStore,
  useProfilVisiMisiStore,
  useProfilFasilitasStore,
  useProfilStrukturStore,
  useProfilPemateriStore,
} from 'src/stores/profil';

const $q = useQuasar();

const sejarahStore  = useProfilSejarahStore();
const vmStore       = useProfilVisiMisiStore();
const fasStore      = useProfilFasilitasStore();
const strukturStore = useProfilStrukturStore();
const pemateriStore = useProfilPemateriStore();

const tab = ref('sejarah');

// ─── Load data when tab becomes active ───────────────────────────────────────
watch(tab, (t) => {
  if (t === 'sejarah'  && !sejarahStore.data) sejarahStore.fetch();
  if (t === 'visimisi' && !vmStore.data)       vmStore.fetch();
  if (t === 'fasilitas')                        fasStore.fetchAdmin();
  if (t === 'struktur' && !strukturStore.data) strukturStore.fetch();
  if (t === 'pemateri')                         pemateriStore.fetchAdmin();
}, { immediate: true });

// Watch store data → populate local forms
watch(() => sejarahStore.data, (v) => { if (v) sejarahForm.konten = v.konten || ''; }, { immediate: true });
watch(() => vmStore.data, (v) => { if (v) { vmForm.visi = v.visi || ''; vmForm.misi = v.misi || ''; } }, { immediate: true });
watch(() => strukturStore.data, (v) => { if (v) strukturForm.keterangan = v.keterangan || ''; }, { immediate: true });

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1: SEJARAH
// ══════════════════════════════════════════════════════════════════════════════
const sejarahForm    = reactive({ konten: '' });
const sejarahFotoFile = ref(null);
const sejarahPreview  = ref('');

function onSejarahFoto(file) {
  if (!file) { sejarahPreview.value = ''; return; }
  const reader = new FileReader();
  reader.onload = e => { sejarahPreview.value = e.target.result; };
  reader.readAsDataURL(file);
}

async function saveSejarah() {
  const fd = new FormData();
  fd.append('konten', sejarahForm.konten);
  if (sejarahFotoFile.value) fd.append('foto', sejarahFotoFile.value);
  try {
    await sejarahStore.save(fd);
    sejarahFotoFile.value = null;
    sejarahPreview.value  = '';
    $q.notify({ type: 'positive', message: 'Sejarah berhasil disimpan.' });
  } catch {
    $q.notify({ type: 'negative', message: 'Gagal menyimpan sejarah.' });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2: VISI MISI
// ══════════════════════════════════════════════════════════════════════════════
const vmForm = reactive({ visi: '', misi: '' });

async function saveVisiMisi() {
  try {
    await vmStore.save({ visi: vmForm.visi, misi: vmForm.misi });
    $q.notify({ type: 'positive', message: 'Visi & Misi berhasil disimpan.' });
  } catch {
    $q.notify({ type: 'negative', message: 'Gagal menyimpan.' });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3: FASILITAS
// ══════════════════════════════════════════════════════════════════════════════
const fasDialog    = ref(false);
const fasEdit      = ref(null); // row or null
const fasSaving    = ref(false);
const fasForm      = reactive({ judul: '', deskripsi: '', urutan: 0, isActive: true });
const fasUploadFiles = reactive({});

function openFasilitasDialog(row = null) {
  fasEdit.value = row;
  if (row) {
    Object.assign(fasForm, { judul: row.judul, deskripsi: row.deskripsi || '', urutan: row.urutan || 0, isActive: row.isActive });
  } else {
    Object.assign(fasForm, { judul: '', deskripsi: '', urutan: fasStore.list.length + 1, isActive: true });
  }
  fasDialog.value = true;
}

async function saveFasilitas() {
  if (!fasForm.judul) { $q.notify({ type: 'warning', message: 'Judul wajib diisi.' }); return; }
  fasSaving.value = true;
  try {
    if (fasEdit.value) {
      await fasStore.update(fasEdit.value.id, { judul: fasForm.judul, deskripsi: fasForm.deskripsi, urutan: fasForm.urutan, isActive: fasForm.isActive });
    } else {
      await fasStore.create({ judul: fasForm.judul, deskripsi: fasForm.deskripsi, urutan: fasForm.urutan, isActive: fasForm.isActive });
    }
    fasDialog.value = false;
    $q.notify({ type: 'positive', message: fasEdit.value ? 'Fasilitas diperbarui.' : 'Fasilitas ditambahkan.' });
  } catch {
    $q.notify({ type: 'negative', message: 'Gagal menyimpan fasilitas.' });
  } finally { fasSaving.value = false; }
}

function confirmDeleteFasilitas(row) {
  $q.dialog({ title: 'Hapus Fasilitas', message: `Hapus fasilitas "${row.judul}" beserta semua fotonya?`, cancel: true, persistent: true })
    .onOk(async () => {
      try {
        await fasStore.remove(row.id);
        $q.notify({ type: 'positive', message: 'Fasilitas dihapus.' });
      } catch {
        $q.notify({ type: 'negative', message: 'Gagal menghapus.' });
      }
    });
}

async function uploadFasilitasFoto(fasId, file) {
  if (!file) return;
  const fd = new FormData();
  fd.append('foto', file);
  try {
    await fasStore.addFoto(fasId, fd);
    fasUploadFiles[fasId] = null;
    $q.notify({ type: 'positive', message: 'Foto ditambahkan.' });
  } catch {
    $q.notify({ type: 'negative', message: 'Gagal upload foto.' });
  }
}

function deleteFasilitasFoto(fasilitas, foto) {
  $q.dialog({ title: 'Hapus Foto', message: 'Hapus foto ini?', cancel: true, persistent: true })
    .onOk(async () => {
      try {
        await fasStore.removeFoto(fasilitas.id, foto.id);
        $q.notify({ type: 'positive', message: 'Foto dihapus.' });
      } catch {
        $q.notify({ type: 'negative', message: 'Gagal menghapus foto.' });
      }
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4: STRUKTUR
// ══════════════════════════════════════════════════════════════════════════════
const strukturForm     = reactive({ keterangan: '' });
const strukturFotoFile = ref(null);
const strukturPreview  = ref('');

function onStrukturFoto(file) {
  if (!file) { strukturPreview.value = ''; return; }
  const reader = new FileReader();
  reader.onload = e => { strukturPreview.value = e.target.result; };
  reader.readAsDataURL(file);
}

async function saveStruktur() {
  const fd = new FormData();
  fd.append('keterangan', strukturForm.keterangan);
  if (strukturFotoFile.value) fd.append('foto', strukturFotoFile.value);
  try {
    await strukturStore.save(fd);
    strukturFotoFile.value = null;
    strukturPreview.value  = '';
    $q.notify({ type: 'positive', message: 'Struktur berhasil disimpan.' });
  } catch {
    $q.notify({ type: 'negative', message: 'Gagal menyimpan struktur.' });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 5: PEMATERI
// ══════════════════════════════════════════════════════════════════════════════
const pmDialog  = ref(false);
const pmEdit    = ref(null);
const pmSaving  = ref(false);
const pmFotoFile = ref(null);
const pmPreview  = ref('');
const pmForm = reactive({
  nama: '', jenis: 'RUTIN', kitab: '', keterangan: '', urutan: 0, isActive: true, fotoExisting: ''
});

const jenisPemateriOptions = [
  { label: 'Kajian Rutin', value: 'RUTIN' },
  { label: 'Kajian Tematik', value: 'TEMATIK' },
];

const pemateriCols = [
  { name: 'foto',      label: 'Foto',     field: 'foto',      align: 'center' },
  { name: 'nama',      label: 'Nama',     field: 'nama',      align: 'left', sortable: true },
  { name: 'jenis',     label: 'Jenis',    field: 'jenis',     align: 'center' },
  { name: 'isActive',  label: 'Status',   field: 'isActive',  align: 'center' },
  { name: 'actions',   label: 'Aksi',     field: 'id',        align: 'center' },
];

function openPemateriDialog(row = null) {
  pmEdit.value  = row;
  pmFotoFile.value = null;
  pmPreview.value  = '';
  if (row) {
    Object.assign(pmForm, {
      nama: row.nama, jenis: row.jenis, kitab: row.kitab || '', keterangan: row.keterangan || '',
      urutan: row.urutan || 0, isActive: row.isActive, fotoExisting: row.foto || '',
    });
  } else {
    Object.assign(pmForm, {
      nama: '', jenis: 'RUTIN', kitab: '', keterangan: '', urutan: pemateriStore.list.length + 1, isActive: true, fotoExisting: '',
    });
  }
  pmDialog.value = true;
}

function onPmFoto(file) {
  if (!file) { pmPreview.value = ''; return; }
  const reader = new FileReader();
  reader.onload = e => { pmPreview.value = e.target.result; };
  reader.readAsDataURL(file);
}

async function savePemateri() {
  if (!pmForm.nama) { $q.notify({ type: 'warning', message: 'Nama wajib diisi.' }); return; }
  pmSaving.value = true;
  const fd = new FormData();
  fd.append('nama', pmForm.nama);
  fd.append('jenis', pmForm.jenis);
  fd.append('kitab', pmForm.kitab);
  fd.append('keterangan', pmForm.keterangan);
  fd.append('urutan', pmForm.urutan);
  fd.append('isActive', pmForm.isActive);
  if (pmFotoFile.value) fd.append('foto', pmFotoFile.value);
  try {
    if (pmEdit.value) {
      await pemateriStore.update(pmEdit.value.id, fd);
    } else {
      await pemateriStore.create(fd);
    }
    pmDialog.value = false;
    $q.notify({ type: 'positive', message: pmEdit.value ? 'Pemateri diperbarui.' : 'Pemateri ditambahkan.' });
  } catch {
    $q.notify({ type: 'negative', message: 'Gagal menyimpan pemateri.' });
  } finally { pmSaving.value = false; }
}

function confirmDeletePemateri(row) {
  $q.dialog({ title: 'Hapus Pemateri', message: `Hapus pemateri "${row.nama}"?`, cancel: true, persistent: true })
    .onOk(async () => {
      try {
        await pemateriStore.remove(row.id);
        $q.notify({ type: 'positive', message: 'Pemateri dihapus.' });
      } catch {
        $q.notify({ type: 'negative', message: 'Gagal menghapus.' });
      }
    });
}

onMounted(() => {
  sejarahStore.fetch();
});
</script>
