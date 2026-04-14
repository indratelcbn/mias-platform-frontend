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
              <!-- Judul + status + aksi -->
              <div class="row items-start justify-between q-mb-xs">
                <div class="col">
                  <div class="row items-center q-gutter-xs flex-wrap">
                    <div class="text-subtitle2 text-weight-bold">{{ f.judul }}</div>
                    <q-badge :color="f.isActive ? 'positive' : 'grey'" :label="f.isActive ? 'Aktif' : 'Nonaktif'" />
                    <q-badge outline color="grey-7" :label="`${f.foto?.length || 0}/6 foto`" />
                  </div>
                  <p v-if="f.deskripsi" class="text-caption text-grey-7 q-mb-none q-mt-xs" style="white-space: pre-line">{{ f.deskripsi }}</p>
                </div>
                <div class="row q-gutter-xs q-ml-sm">
                  <q-btn flat dense round icon="edit" color="primary" @click="openFasilitasDialog(f)" />
                  <q-btn flat dense round icon="delete" color="negative" @click="confirmDeleteFasilitas(f)" />
                </div>
              </div>

              <!-- Grid Foto -->
              <div class="row q-col-gutter-sm q-mt-md">
                <div v-for="p in f.foto" :key="p.id" class="col-6 col-sm-4 col-md-2">
                  <div class="relative-position fas-foto-wrap">
                    <q-img :src="p.foto" :ratio="4/3" fit="cover" class="rounded" />
                    <q-btn
                      round unelevated dense icon="delete" color="negative" size="xs"
                      class="absolute-top-right q-ma-xs fas-foto-del"
                      @click="deleteFasilitasFoto(f, p)"
                    />
                    <div v-if="p.caption" class="text-caption text-center q-px-xs q-py-xs bg-grey-2" style="border-radius: 0 0 4px 4px; word-break: break-word">
                      {{ p.caption }}
                    </div>
                  </div>
                </div>

                <!-- Slot tambah foto (jika belum 6) -->
                <div v-if="(f.foto?.length || 0) < 6" class="col-6 col-sm-4 col-md-2">
                  <q-file
                    v-model="fasUploadFiles[f.id]"
                    outlined dense
                    accept="image/*"
                    class="full-width"
                    @update:model-value="file => openFotoUploadDialog(f.id, file)"
                  >
                    <template #default>
                      <div class="column items-center justify-center full-width cursor-pointer text-grey-5 q-pa-sm fas-add-box">
                        <q-icon name="add_photo_alternate" size="28px" />
                        <div class="text-caption q-mt-xs">Tambah Foto</div>
                      </div>
                    </template>
                  </q-file>
                </div>
                <div v-else class="col-6 col-sm-4 col-md-2">
                  <div class="column items-center justify-center full-width text-grey-5 q-pa-sm fas-add-box bg-grey-2 rounded">
                    <q-icon name="photo_library" size="24px" />
                    <div class="text-caption q-mt-xs">Maks. 6 foto</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <div v-if="!fasStore.list.length" class="text-center q-py-lg text-grey-6">
            Belum ada fasilitas.
          </div>
        </div>

        <!-- Dialog Tambah/Edit Fasilitas -->
        <q-dialog v-model="fasDialog" persistent>
          <q-card style="min-width: 420px; max-width: 560px">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6">{{ fasEdit ? 'Edit Fasilitas' : 'Tambah Fasilitas' }}</div>
              <q-space />
              <q-btn flat round dense icon="close" v-close-popup @click="resetFasDialog" />
            </q-card-section>
            <q-card-section class="q-gutter-md" style="max-height: 75vh; overflow-y: auto">
              <q-input v-model="fasForm.judul" outlined dense label="Judul Fasilitas *" :rules="[v => !!v || 'Wajib']" />
              <q-input v-model="fasForm.deskripsi" outlined dense label="Deskripsi" type="textarea" rows="3" />
              <q-input v-model.number="fasForm.urutan" outlined dense label="Urutan" type="number" />
              <q-toggle v-model="fasForm.isActive" label="Aktif" color="positive" />

              <!-- Foto awal (hanya saat Tambah baru) -->
              <template v-if="!fasEdit">
                <q-separator />
                <div class="text-caption text-weight-medium text-grey-8">Foto (opsional, maks. 6)</div>
                <div class="row q-col-gutter-sm">
                  <div v-for="(item, idx) in fasInitFotos" :key="idx" class="col-6">
                    <div class="relative-position fas-foto-wrap">
                      <q-img :src="item.preview" :ratio="4/3" fit="cover" class="rounded" />
                      <q-btn
                        round unelevated dense icon="close" color="negative" size="xs"
                        class="absolute-top-right q-ma-xs"
                        @click="removeFasInitFoto(idx)"
                      />
                    </div>
                    <q-input
                      v-model="item.caption"
                      outlined dense
                      label="Caption"
                      class="q-mt-xs"
                    />
                  </div>

                  <!-- Tombol tambah foto -->
                  <div v-if="fasInitFotos.length < 6" class="col-6">
                    <q-file
                      v-model="fasInitFileInput"
                      accept="image/*"
                      class="hidden"
                      ref="fasInitFileRef"
                      @update:model-value="onFasInitFilePicked"
                    />
                    <div
                      class="fas-add-box column items-center justify-center cursor-pointer text-grey-5 q-pa-md"
                      style="min-height: 90px"
                      @click="fasInitFileRef.pickFiles()"
                    >
                      <q-icon name="add_photo_alternate" size="28px" />
                      <div class="text-caption q-mt-xs">Tambah Foto</div>
                    </div>
                  </div>
                </div>
              </template>
            </q-card-section>
            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat no-caps label="Batal" v-close-popup @click="resetFasDialog" />
              <q-btn unelevated color="primary" no-caps :label="fasEdit ? 'Simpan' : 'Tambah'" :loading="fasSaving" @click="saveFasilitas" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Dialog Upload Foto -->
        <q-dialog v-model="fasPhotoDialog" persistent>
          <q-card style="min-width: 340px; max-width: 480px">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6">Tambah Foto Fasilitas</div>
              <q-space />
              <q-btn flat round dense icon="close" @click="closeFotoDialog" />
            </q-card-section>
            <q-card-section class="q-gutter-sm">
              <q-img
                v-if="fasPhotoPreview"
                :src="fasPhotoPreview"
                :ratio="4/3"
                fit="cover"
                class="rounded q-mb-sm"
              />
              <q-input v-model="fasPhotoCaption" outlined dense label="Caption / Keterangan (opsional)" />
            </q-card-section>
            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat no-caps label="Batal" @click="closeFotoDialog" />
              <q-btn unelevated color="primary" no-caps icon="upload" label="Upload" :loading="fasPhotoUploading" @click="confirmFotoUpload" />
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
            <template #body-cell-waktu="props">
              <q-td class="text-center">
                {{ props.row.jenis === 'RUTIN' ? (props.value || '-') : '-' }}
              </q-td>
            </template>
            <template #body-cell-jam="props">
              <q-td class="text-center">
                {{ props.row.jenis === 'RUTIN' ? (props.value || '-') : '-' }}
              </q-td>
            </template>
            <template #body-cell-kitab="props">
              <q-td style="white-space: pre-line; max-width: 200px">
                {{ props.value || '-' }}
              </q-td>
            </template>
            <template #body-cell-keterangan="props">
              <q-td style="white-space: pre-line; max-width: 200px">
                {{ props.value || '-' }}
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
              <template v-if="pmForm.jenis === 'RUTIN'">
                <q-select
                  v-model="pmForm.waktu"
                  outlined dense
                  label="Waktu"
                  :options="waktuOptions"
                  emit-value map-options
                  multiple
                  use-chips
                  clearable
                />
                <q-select
                  v-model="pmForm.jam"
                  outlined dense
                  label="Jam"
                  :options="jamOptions"
                  emit-value map-options
                  clearable
                />
              </template>
              <q-input
                v-model="pmForm.kitab"
                outlined dense
                label="Nama Kitab / Materi"
                type="textarea"
                rows="4"
                hint="Satu kitab per baris (Enter)"
              />
              <q-input v-model="pmForm.keterangan" outlined dense label="Keterangan" type="textarea" rows="2" />
              <q-input v-model="pmForm.youtube" outlined dense label="Link YouTube" placeholder="https://youtube.com/...">
                <template #prepend><q-icon name="fab fa-youtube" color="red" /></template>
              </q-input>
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

// Reactive forms (declared before watches that reference them)
const sejarahForm    = reactive({ konten: '' });
const vmForm         = reactive({ visi: '', misi: '' });
const strukturForm   = reactive({ keterangan: '' });

// Watch store data → populate local forms
watch(() => sejarahStore.data, (v) => { if (v) sejarahForm.konten = v.konten || ''; }, { immediate: true });
watch(() => vmStore.data, (v) => { if (v) { vmForm.visi = v.visi || ''; vmForm.misi = v.misi || ''; } }, { immediate: true });
watch(() => strukturStore.data, (v) => { if (v) strukturForm.keterangan = v.keterangan || ''; }, { immediate: true });

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1: SEJARAH
// ══════════════════════════════════════════════════════════════════════════════
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

// Foto awal saat Tambah baru
const fasInitFotos    = ref([]); // [{ file, preview, caption }]
const fasInitFileInput = ref(null);
const fasInitFileRef   = ref(null);

// Photo upload state
const fasPhotoDialog     = ref(false);
const fasPhotoCaption    = ref('');
const fasPhotoPreview    = ref('');
const fasPhotoUploading  = ref(false);
const fasCurrentUploadId = ref('');
const fasCurrentFile     = ref(null);

function openFasilitasDialog(row = null) {
  fasEdit.value = row;
  fasInitFotos.value = [];
  fasInitFileInput.value = null;
  if (row) {
    Object.assign(fasForm, { judul: row.judul, deskripsi: row.deskripsi || '', urutan: row.urutan || 0, isActive: row.isActive });
  } else {
    Object.assign(fasForm, { judul: '', deskripsi: '', urutan: fasStore.list.length + 1, isActive: true });
  }
  fasDialog.value = true;
}

function resetFasDialog() {
  fasInitFotos.value = [];
  fasInitFileInput.value = null;
}

function onFasInitFilePicked(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    fasInitFotos.value.push({ file, preview: e.target.result, caption: '' });
  };
  reader.readAsDataURL(file);
  fasInitFileInput.value = null;
}

function removeFasInitFoto(idx) {
  fasInitFotos.value.splice(idx, 1);
}

async function saveFasilitas() {
  if (!fasForm.judul) { $q.notify({ type: 'warning', message: 'Judul wajib diisi.' }); return; }
  fasSaving.value = true;
  try {
    if (fasEdit.value) {
      await fasStore.update(fasEdit.value.id, { judul: fasForm.judul, deskripsi: fasForm.deskripsi, urutan: fasForm.urutan, isActive: fasForm.isActive });
    } else {
      const created = await fasStore.create({ judul: fasForm.judul, deskripsi: fasForm.deskripsi, urutan: fasForm.urutan, isActive: fasForm.isActive });
      // Upload foto awal satu per satu
      for (const item of fasInitFotos.value) {
        const fd = new FormData();
        fd.append('foto', item.file);
        if (item.caption) fd.append('caption', item.caption);
        await fasStore.addFoto(created.id, fd);
      }
    }
    fasDialog.value = false;
    fasInitFotos.value = [];
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

function openFotoUploadDialog(fasId, file) {
  if (!file) return;
  fasCurrentUploadId.value = fasId;
  fasCurrentFile.value = file;
  fasPhotoCaption.value = '';
  const reader = new FileReader();
  reader.onload = e => { fasPhotoPreview.value = e.target.result; };
  reader.readAsDataURL(file);
  fasPhotoDialog.value = true;
}

function closeFotoDialog() {
  fasPhotoDialog.value = false;
  fasPhotoPreview.value = '';
  fasPhotoCaption.value = '';
  fasCurrentFile.value = null;
  if (fasCurrentUploadId.value) fasUploadFiles[fasCurrentUploadId.value] = null;
}

async function confirmFotoUpload() {
  if (!fasCurrentFile.value) return;
  fasPhotoUploading.value = true;
  const fd = new FormData();
  fd.append('foto', fasCurrentFile.value);
  if (fasPhotoCaption.value) fd.append('caption', fasPhotoCaption.value);
  try {
    await fasStore.addFoto(fasCurrentUploadId.value, fd);
    fasUploadFiles[fasCurrentUploadId.value] = null;
    fasPhotoDialog.value = false;
    fasPhotoPreview.value = '';
    fasPhotoCaption.value = '';
    $q.notify({ type: 'positive', message: 'Foto ditambahkan.' });
  } catch (e) {
    $q.notify({ type: 'negative', message: e?.response?.data?.message || 'Gagal upload foto.' });
  } finally { fasPhotoUploading.value = false; }
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
  nama: '', jenis: 'RUTIN', waktu: [], jam: null, kitab: '', keterangan: '', youtube: '', urutan: 0, isActive: true, fotoExisting: ''
});

const jenisPemateriOptions = [
  { label: 'Kajian Rutin', value: 'RUTIN' },
  { label: 'Kajian Tematik', value: 'TEMATIK' },
];

const waktuOptions = [
  { label: 'Pekan 1', value: 'Pekan 1' },
  { label: 'Pekan 2', value: 'Pekan 2' },
  { label: 'Pekan 3', value: 'Pekan 3' },
  { label: 'Pekan 4', value: 'Pekan 4' },
  { label: 'Pekan 5', value: 'Pekan 5' },
];

const jamOptions = [
  { label: '09.00 - 12.00 WIB',         value: '09.00 - 12.00 WIB' },
  { label: "Ba'da Shubuh - Selesai",     value: "Ba'da Shubuh - Selesai" },
  { label: "Ba'da Maghrib - Selesai",    value: "Ba'da Maghrib - Selesai" },
];

const pemateriCols = [
  { name: 'foto',       label: 'Foto',       field: 'foto',       align: 'center' },
  { name: 'nama',       label: 'Nama',       field: 'nama',       align: 'left', sortable: true },
  { name: 'jenis',      label: 'Jenis',      field: 'jenis',      align: 'center' },
  { name: 'waktu',      label: 'Waktu',      field: 'waktu',      align: 'center' },
  { name: 'jam',        label: 'Jam',        field: 'jam',        align: 'center' },
  { name: 'kitab',      label: 'Kitab',      field: 'kitab',      align: 'left' },
  { name: 'keterangan', label: 'Keterangan', field: 'keterangan', align: 'left' },
  { name: 'isActive',   label: 'Status',     field: 'isActive',   align: 'center' },
  { name: 'actions',    label: 'Aksi',       field: 'id',         align: 'center' },
];

function openPemateriDialog(row = null) {
  pmEdit.value  = row;
  pmFotoFile.value = null;
  pmPreview.value  = '';
  if (row) {
    Object.assign(pmForm, {
      nama: row.nama, jenis: row.jenis,
      waktu: row.waktu ? row.waktu.split(', ') : [],
      jam: row.jam || null,
      kitab: row.kitab || '', keterangan: row.keterangan || '', youtube: row.youtube || '',
      urutan: row.urutan || 0, isActive: row.isActive, fotoExisting: row.foto || '',
    });
  } else {
    Object.assign(pmForm, {
      nama: '', jenis: 'RUTIN', waktu: [], jam: null, kitab: '', keterangan: '', youtube: '',
      urutan: pemateriStore.list.length + 1, isActive: true, fotoExisting: '',
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
  if (pmForm.jenis === 'RUTIN') {
    if (pmForm.waktu.length) fd.append('waktu', pmForm.waktu.join(', '));
    if (pmForm.jam)   fd.append('jam', pmForm.jam);
  }
  fd.append('kitab', pmForm.kitab);
  fd.append('keterangan', pmForm.keterangan);
  fd.append('youtube', pmForm.youtube);
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

<style scoped>
.fas-foto-wrap { border-radius: 6px; overflow: hidden; }
.fas-foto-del { opacity: 0; transition: opacity .15s; }
.fas-foto-wrap:hover .fas-foto-del { opacity: 1; }
.fas-add-box {
  border: 2px dashed #bdbdbd;
  border-radius: 6px;
  min-height: 80px;
}
</style>
