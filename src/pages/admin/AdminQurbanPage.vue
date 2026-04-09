<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">
        <q-icon name="pets" color="primary" class="q-mr-sm" />Kelola Dokumentasi Qurban
      </div>
      <q-btn unelevated color="primary" icon="add" label="Tambah Foto" no-caps @click="openDialog()" />
    </div>

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
          @update:model-value="setFilter"
        />
      </div>
    </div>

    <div v-if="qurbanStore.loading" class="row q-col-gutter-md">
      <div v-for="n in 8" :key="n" class="col-12 col-sm-6 col-md-3">
        <q-skeleton height="190px" style="border-radius: 12px" />
      </div>
    </div>

    <div v-else-if="qurbanStore.listAdmin.length" class="row q-col-gutter-md">
      <div v-for="item in qurbanStore.listAdmin" :key="item.id" class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="qurban-card">
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
                <q-btn flat round icon="edit" color="primary" size="xs" @click="openDialog(item)" />
                <q-btn flat round icon="delete" color="negative" size="xs" @click="confirmDelete(item)" />
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
      <q-pagination v-model="currentPage" :max="qurbanStore.meta.totalPages" boundary-numbers @update:model-value="loadData" />
    </div>

    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 540px; max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ isEdit ? 'Edit Foto Qurban' : 'Tambah Foto Qurban' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="save" class="q-gutter-md">
            <q-input v-model="form.judul" outlined label="Judul Foto *" :rules="[v => !!v || 'Wajib diisi']" />
            <q-select v-model="form.tahun" outlined emit-value map-options label="Tahun *" :options="yearOptions" :rules="[v => !!v || 'Wajib dipilih']" />
            <q-input v-model="form.keterangan" outlined label="Keterangan (opsional)" type="textarea" rows="3" />
            <q-input v-model.number="form.urutan" outlined type="number" label="Urutan Tampil" hint="Angka lebih kecil tampil lebih dulu" />
            <q-file v-model="form.fotoFile" outlined :label="isEdit ? 'Ganti Foto (opsional)' : 'File Foto *'" accept="image/*" :rules="isEdit ? [] : [v => !!v || 'Foto wajib diunggah']">
              <template #prepend><q-icon name="photo_camera" /></template>
            </q-file>

            <div v-if="previewUrl" class="q-mt-sm">
              <q-img :src="previewUrl" :ratio="16/9" fit="cover" style="border-radius: 10px; max-height: 180px" />
            </div>

            <div class="row justify-end q-gutter-sm q-mt-sm">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn unelevated color="primary" no-caps type="submit" :label="isEdit ? 'Simpan' : 'Tambah'" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useQurbanStore } from 'src/stores/qurban';

const $q = useQuasar();
const qurbanStore = useQurbanStore();

const dialog = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const editId = ref(null);
const filterTahun = ref('');
const currentPage = ref(1);

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, idx) => {
  const year = currentYear - idx;
  return { label: `Tahun ${year}`, value: year };
});
const filterYearOptions = [{ label: 'Semua Tahun', value: '' }, ...yearOptions];

const emptyForm = () => ({ judul: '', tahun: currentYear, keterangan: '', urutan: 0, fotoFile: null });
const form = reactive(emptyForm());

const previewUrl = computed(() => (form.fotoFile instanceof File ? URL.createObjectURL(form.fotoFile) : null));

function loadData() {
  qurbanStore.fetchAdmin({ tahun: filterTahun.value || undefined, page: currentPage.value });
}

function setFilter() {
  currentPage.value = 1;
  loadData();
}

function openDialog(row = null) {
  if (row) {
    isEdit.value = true;
    editId.value = row.id;
    Object.assign(form, {
      judul: row.judul,
      tahun: row.tahun,
      keterangan: row.keterangan || '',
      urutan: row.urutan ?? 0,
      fotoFile: null,
    });
  } else {
    isEdit.value = false;
    editId.value = null;
    Object.assign(form, emptyForm());
  }
  dialog.value = true;
}

async function save() {
  saving.value = true;
  const payload = {
    judul: form.judul,
    tahun: form.tahun,
    keterangan: form.keterangan,
    urutan: form.urutan,
  };
  if (form.fotoFile) payload.foto = form.fotoFile;

  const result = isEdit.value ? await qurbanStore.update(editId.value, payload) : await qurbanStore.create(payload);
  saving.value = false;

  if (result) {
    dialog.value = false;
    loadData();
  }
}

function confirmDelete(row) {
  $q.dialog({
    title: 'Hapus Foto Qurban',
    message: `Yakin ingin menghapus foto "${row.judul}"?`,
    cancel: { flat: true, label: 'Batal' },
    ok: { unelevated: true, color: 'negative', label: 'Hapus' },
    persistent: true,
  }).onOk(async () => {
    const ok = await qurbanStore.remove(row.id);
    if (ok) loadData();
  });
}

onMounted(loadData);
</script>

<style scoped>
.qurban-card {
  border-radius: 12px;
  overflow: hidden;
}
</style>