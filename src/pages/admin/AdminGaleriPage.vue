<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">
        <q-icon name="celebration" color="primary" class="q-mr-sm" />Kelola Ied Mubarok
      </div>
      <q-btn unelevated color="primary" icon="add" label="Tambah Foto" no-caps @click="openActiveDialog()" />
    </div>

    <q-tabs v-model="activeTab" align="left" active-color="primary" indicator-color="primary" class="q-mb-md" no-caps>
      <q-tab name="ramadhan" icon="auto_awesome" label="Kegiatan Ramadhan" />
      <q-tab name="sholat-ied" icon="star" label="Sholat Ied" />
      <q-tab name="qurban" icon="pets" label="Qurban" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated>
      <q-tab-panel name="ramadhan" class="q-pa-none">
        <div class="text-subtitle2 text-weight-medium q-mb-md text-grey-7">Dokumentasi khusus kegiatan Ramadhan</div>

        <div class="row items-center q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-4">
            <q-select
              v-model="filterRamadhanTahun"
              outlined
              dense
              emit-value
              map-options
              label="Filter Tahun"
              :options="filterYearOptions"
            />
          </div>
        </div>

        <div v-if="galeriStore.loading" class="row q-col-gutter-md">
          <div v-for="n in 6" :key="`ramadhan-${n}`" class="col-12 col-sm-6 col-md-4">
            <q-skeleton height="180px" style="border-radius: 12px" />
          </div>
        </div>

        <div v-else-if="filteredRamadhan.length" class="row q-col-gutter-md">
          <div v-for="item in filteredRamadhan" :key="item.id" class="col-12 col-sm-6 col-md-4">
            <q-card flat bordered class="media-card">
              <q-img :src="imgUrl(item.foto)" :ratio="4/3" fit="cover">
                <template #error>
                  <div class="absolute-full flex flex-center bg-grey-2 text-grey-5">
                    <q-icon name="broken_image" size="48px" />
                  </div>
                </template>
              </q-img>
              <q-card-section class="q-py-sm">
                <div class="row items-start justify-between">
                  <div class="col">
                    <div class="text-subtitle2 text-weight-bold ellipsis">{{ item.judul }}</div>
                    <div class="row items-center q-gutter-xs q-mt-xs">
                      <q-badge color="purple" label="Ramadhan" />
                      <q-badge outline color="grey-7" :label="`Tahun ${item.tahun}`" />
                      <q-badge outline color="deep-purple" :label="`Urutan ${item.urutan ?? 0}`" />
                    </div>
                  </div>
                  <div class="row q-gutter-xs">
                    <q-btn flat round icon="edit" color="primary" size="sm" @click="openDialog(item)" />
                    <q-btn flat round icon="delete" color="negative" size="sm" @click="confirmDelete(item)" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div v-else class="text-center q-py-xl">
          <q-icon name="auto_awesome" size="64px" color="grey-4" />
          <div class="text-grey-6 q-mt-md">Belum ada foto kegiatan Ramadhan</div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="sholat-ied" class="q-pa-none">
        <div class="text-subtitle2 text-weight-medium q-mb-md text-grey-7">Dokumentasi khusus Sholat Ied</div>

        <div class="row items-center q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-4">
            <q-select
              v-model="filterSholatIedTahun"
              outlined
              dense
              emit-value
              map-options
              label="Filter Tahun"
              :options="filterYearOptions"
            />
          </div>
        </div>

        <div v-if="galeriStore.loading" class="row q-col-gutter-md">
          <div v-for="n in 6" :key="`ied-${n}`" class="col-12 col-sm-6 col-md-4">
            <q-skeleton height="180px" style="border-radius: 12px" />
          </div>
        </div>

        <div v-else-if="filteredSholatIed.length" class="row q-col-gutter-md">
          <div v-for="item in filteredSholatIed" :key="item.id" class="col-12 col-sm-6 col-md-4">
            <q-card flat bordered class="media-card">
              <q-img :src="imgUrl(item.foto)" :ratio="4/3" fit="cover">
                <template #error>
                  <div class="absolute-full flex flex-center bg-grey-2 text-grey-5">
                    <q-icon name="broken_image" size="48px" />
                  </div>
                </template>
              </q-img>
              <q-card-section class="q-py-sm">
                <div class="row items-start justify-between">
                  <div class="col">
                    <div class="text-subtitle2 text-weight-bold ellipsis">{{ item.judul }}</div>
                    <div class="row items-center q-gutter-xs q-mt-xs">
                      <q-badge color="positive" label="Sholat Ied" />
                      <q-badge outline color="grey-7" :label="`Tahun ${item.tahun}`" />
                      <q-badge outline color="teal" :label="`Urutan ${item.urutan ?? 0}`" />
                    </div>
                  </div>
                  <div class="row q-gutter-xs">
                    <q-btn flat round icon="edit" color="primary" size="sm" @click="openDialog(item)" />
                    <q-btn flat round icon="delete" color="negative" size="sm" @click="confirmDelete(item)" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div v-else class="text-center q-py-xl">
          <q-icon name="star" size="64px" color="grey-4" />
          <div class="text-grey-6 q-mt-md">Belum ada foto Sholat Ied</div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="qurban" class="q-pa-none">
        <div class="row items-center q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-4">
            <q-select
              v-model="filterTahun"
              outlined
              dense
              emit-value
              map-options
              label="Filter Tahun"
              :options="filterYearOptions"
              @update:model-value="setQurbanFilter"
            />
          </div>
        </div>

        <div v-if="qurbanStore.loading" class="row q-col-gutter-md">
          <div v-for="n in 8" :key="`qurban-${n}`" class="col-12 col-sm-6 col-md-3">
            <q-skeleton height="190px" style="border-radius: 12px" />
          </div>
        </div>

        <div v-else-if="qurbanStore.listAdmin.length" class="row q-col-gutter-md">
          <div v-for="item in qurbanStore.listAdmin" :key="item.id" class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="media-card">
              <q-img :src="item.foto" :ratio="4/3" fit="cover" />
              <q-card-section class="q-py-sm q-px-md">
                <div class="row items-start justify-between no-wrap">
                  <div class="col ellipsis">
                    <div class="text-caption text-weight-bold ellipsis">{{ item.judul }}</div>
                    <div class="row items-center q-gutter-xs q-mt-xs">
                      <q-badge color="brown-7" :label="`Tahun ${item.tahun}`" />
                      <q-badge outline color="grey-7" :label="`Urutan ${item.urutan}`" />
                    </div>
                  </div>
                  <div class="row no-wrap q-gutter-xs q-ml-xs">
                    <q-btn flat round icon="edit" color="primary" size="xs" @click="openQurbanDialog(item)" />
                    <q-btn flat round icon="delete" color="negative" size="xs" @click="confirmDeleteQurban(item)" />
                  </div>
                </div>
                <div v-if="item.keterangan" class="text-caption text-grey-6 q-mt-sm ellipsis-2-lines">{{ item.keterangan }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div v-else class="text-center q-py-xl">
          <q-icon name="pets" size="64px" color="grey-4" />
          <div class="text-grey-6 q-mt-md">Belum ada dokumentasi qurban untuk filter ini</div>
        </div>

        <div v-if="qurbanStore.meta.totalPages > 1" class="row justify-center q-mt-lg">
          <q-pagination v-model="currentPage" :max="qurbanStore.meta.totalPages" boundary-numbers @update:model-value="loadQurbanData" />
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 520px; max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ isEdit ? 'Edit Foto' : 'Tambah Foto' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="save" class="q-gutter-md">
            <q-input v-model="form.judul" outlined :label="galeriIsBatchCreate ? 'Judul Dasar (opsional untuk batch)' : 'Judul Foto *'" :rules="[v => galeriIsBatchCreate || !!v || 'Wajib diisi']" />
            <q-select
              v-model="form.kategori"
              outlined
              label="Kategori *"
              :options="kategoriOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              :rules="[v => !!v || 'Wajib dipilih']"
            />
            <q-select v-model="form.tahun" outlined emit-value map-options label="Tahun *" :options="yearOptions" :rules="[v => !!v || 'Wajib dipilih']" />
            <q-input v-model.number="form.urutan" outlined type="number" min="0" label="Urutan Tampil" hint="Angka lebih kecil tampil lebih dulu" />
            <q-input v-model="form.keterangan" outlined label="Keterangan (opsional)" type="textarea" rows="3" />
            <q-file v-model="form.fotoFile" outlined :multiple="!isEdit" use-chips :label="isEdit ? 'Ganti Foto (opsional)' : 'Pilih Satu / Banyak Foto *'" accept="image/*" :rules="isEdit ? [] : [v => normalizeFiles(v).length > 0 || 'Foto wajib diunggah']">
              <template #prepend><q-icon name="photo_camera" /></template>
            </q-file>
            <div v-if="galeriIsBatchCreate" class="text-caption text-grey-6">Jika judul dasar dikosongkan, judul setiap foto akan otomatis mengikuti nama file. Urutan tampil akan bertambah otomatis.</div>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn unelevated color="primary" no-caps type="submit" :label="isEdit ? 'Simpan Perubahan' : 'Tambah'" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="qurbanDialog" persistent>
      <q-card style="width: 540px; max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ qurbanEdit ? 'Edit Foto Qurban' : 'Tambah Foto Qurban' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveQurban" class="q-gutter-md">
            <q-input v-model="qurbanForm.judul" outlined :label="qurbanIsBatchCreate ? 'Judul Dasar (opsional untuk batch)' : 'Judul Foto *'" :rules="[v => qurbanIsBatchCreate || !!v || 'Wajib diisi']" />
            <q-select v-model="qurbanForm.tahun" outlined emit-value map-options label="Tahun *" :options="yearOptions" :rules="[v => !!v || 'Wajib dipilih']" />
            <q-input v-model="qurbanForm.keterangan" outlined label="Keterangan (opsional)" type="textarea" rows="3" />
            <q-input v-model.number="qurbanForm.urutan" outlined type="number" label="Urutan Tampil" hint="Angka lebih kecil tampil lebih dulu" />
            <q-file v-model="qurbanForm.fotoFile" outlined :multiple="!qurbanEdit" use-chips :label="qurbanEdit ? 'Ganti Foto (opsional)' : 'Pilih Satu / Banyak Foto *'" accept="image/*" :rules="qurbanEdit ? [] : [v => normalizeFiles(v).length > 0 || 'Foto wajib diunggah']">
              <template #prepend><q-icon name="photo_camera" /></template>
            </q-file>
            <div v-if="qurbanIsBatchCreate" class="text-caption text-grey-6">Jika judul dasar dikosongkan, judul tiap foto qurban akan otomatis mengikuti nama file.</div>

            <div class="row justify-end q-gutter-sm q-mt-sm">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn unelevated color="primary" no-caps type="submit" :label="qurbanEdit ? 'Simpan' : 'Tambah'" :loading="qurbanSaving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useGaleriStore } from 'src/stores/galeri';
import { useQurbanStore } from 'src/stores/qurban';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const galeriStore = useGaleriStore();
const qurbanStore = useQurbanStore();

const activeTab = ref('ramadhan');
const dialog = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const editId = ref(null);

const qurbanDialog = ref(false);
const qurbanEdit = ref(false);
const qurbanSaving = ref(false);
const qurbanEditId = ref(null);
const filterRamadhanTahun = ref('');
const filterSholatIedTahun = ref('');
const filterTahun = ref('');
const currentPage = ref(1);

const kategoriOptions = [
  { label: 'Ramadhan', value: 'RAMADHAN' },
  { label: 'Sholat Ied', value: 'SHOLAT_IED' },
];

const kategoriByTab = {
  ramadhan: 'RAMADHAN',
  'sholat-ied': 'SHOLAT_IED',
};

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 8 }, (_, idx) => {
  const year = currentYear - idx;
  return { label: `Tahun ${year}`, value: year };
});
const filterYearOptions = [{ label: 'Semua Tahun', value: '' }, ...yearOptions];

const emptyForm = () => ({ judul: '', kategori: 'RAMADHAN', tahun: currentYear, urutan: 0, keterangan: '', fotoFile: null });
const form = reactive(emptyForm());

const emptyQurbanForm = () => ({ judul: '', tahun: currentYear, keterangan: '', urutan: 0, fotoFile: null });
const qurbanForm = reactive(emptyQurbanForm());

const imgUrl = (path) => path;
const normalizeFiles = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};
const galeriIsBatchCreate = computed(() => !isEdit.value && normalizeFiles(form.fotoFile).length > 1);
const qurbanIsBatchCreate = computed(() => !qurbanEdit.value && normalizeFiles(qurbanForm.fotoFile).length > 1);

const filteredRamadhan = computed(() => galeriStore.listAdmin.filter((item) => item.kategori === 'RAMADHAN' && (!filterRamadhanTahun.value || item.tahun === filterRamadhanTahun.value)));
const filteredSholatIed = computed(() => galeriStore.listAdmin.filter((item) => item.kategori === 'SHOLAT_IED' && (!filterSholatIedTahun.value || item.tahun === filterSholatIedTahun.value)));

const loadGaleriData = () => {
  galeriStore.fetchAdmin();
};

const loadQurbanData = () => {
  qurbanStore.fetchAdmin({ tahun: filterTahun.value || undefined, page: currentPage.value });
};

const setQurbanFilter = () => {
  currentPage.value = 1;
  loadQurbanData();
};

const openDialog = (row = null) => {
  if (row) {
    isEdit.value = true;
    editId.value = row.id;
    Object.assign(form, { judul: row.judul, kategori: row.kategori, tahun: row.tahun || currentYear, urutan: row.urutan ?? 0, keterangan: row.keterangan || '', fotoFile: null });
  } else {
    isEdit.value = false;
    editId.value = null;
    Object.assign(form, emptyForm());
    form.kategori = kategoriByTab[activeTab.value] || 'RAMADHAN';
  }
  dialog.value = true;
};

const openQurbanDialog = (row = null) => {
  if (row) {
    qurbanEdit.value = true;
    qurbanEditId.value = row.id;
    Object.assign(qurbanForm, { judul: row.judul, tahun: row.tahun, keterangan: row.keterangan || '', urutan: row.urutan ?? 0, fotoFile: null });
  } else {
    qurbanEdit.value = false;
    qurbanEditId.value = null;
    Object.assign(qurbanForm, emptyQurbanForm());
  }
  qurbanDialog.value = true;
};

const openActiveDialog = () => {
  if (activeTab.value === 'qurban') {
    openQurbanDialog();
    return;
  }
  openDialog();
};

const save = async () => {
  saving.value = true;
  const payload = { judul: form.judul, kategori: form.kategori, tahun: form.tahun, urutan: form.urutan, keterangan: form.keterangan };
  if (normalizeFiles(form.fotoFile).length) payload.foto = normalizeFiles(form.fotoFile);

  const result = isEdit.value ? await galeriStore.update(editId.value, payload) : await galeriStore.create(payload);

  saving.value = false;
  if (result) {
    dialog.value = false;
    loadGaleriData();
  }
};

const saveQurban = async () => {
  qurbanSaving.value = true;
  const payload = { judul: qurbanForm.judul, tahun: qurbanForm.tahun, keterangan: qurbanForm.keterangan, urutan: qurbanForm.urutan };
  if (normalizeFiles(qurbanForm.fotoFile).length) payload.foto = normalizeFiles(qurbanForm.fotoFile);

  const result = qurbanEdit.value ? await qurbanStore.update(qurbanEditId.value, payload) : await qurbanStore.create(payload);

  qurbanSaving.value = false;
  if (result) {
    qurbanDialog.value = false;
    loadQurbanData();
  }
};

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Hapus Foto',
    message: `Yakin ingin menghapus foto "${row.judul}"?`,
    cancel: { flat: true, label: 'Batal' },
    ok: { unelevated: true, color: 'negative', label: 'Hapus' },
    persistent: true,
  }).onOk(async () => {
    await galeriStore.remove(row.id);
    loadGaleriData();
  });
};

const confirmDeleteQurban = (row) => {
  $q.dialog({
    title: 'Hapus Foto Qurban',
    message: `Yakin ingin menghapus foto "${row.judul}"?`,
    cancel: { flat: true, label: 'Batal' },
    ok: { unelevated: true, color: 'negative', label: 'Hapus' },
    persistent: true,
  }).onOk(async () => {
    const ok = await qurbanStore.remove(row.id);
    if (ok) loadQurbanData();
  });
};

onMounted(() => {
  loadGaleriData();
  loadQurbanData();
});
</script>

<style scoped>
.media-card {
  border-radius: 12px;
  overflow: hidden;
}
</style>
