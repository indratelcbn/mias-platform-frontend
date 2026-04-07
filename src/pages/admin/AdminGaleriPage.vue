<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">
        <q-icon name="photo_library" color="primary" class="q-mr-sm" />Kelola Galeri Foto
      </div>
      <q-btn unelevated color="primary" icon="add" label="Tambah Foto" no-caps @click="openDialog()" />
    </div>

    <!-- Filter Kategori -->
    <div class="q-mb-md row q-gutter-sm">
      <q-btn
        v-for="opt in kategoriOpts"
        :key="opt.value"
        :label="opt.label"
        :color="filterKategori === opt.value ? 'primary' : 'grey-3'"
        :text-color="filterKategori === opt.value ? 'white' : 'dark'"
        no-caps
        unelevated
        @click="setFilter(opt.value)"
      />
    </div>

    <!-- Grid Foto -->
    <div v-if="galeriStore.loading" class="row q-col-gutter-md">
      <div v-for="n in 6" :key="n" class="col-12 col-sm-6 col-md-4">
        <q-skeleton height="180px" style="border-radius: 12px" />
      </div>
    </div>

    <div v-else-if="galeriStore.listAdmin.length" class="row q-col-gutter-md">
      <div
        v-for="item in galeriStore.listAdmin"
        :key="item.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card flat bordered style="border-radius: 12px; overflow: hidden">
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
                <q-badge
                  :color="item.kategori === 'RAMADHAN' ? 'purple' : 'positive'"
                  :label="item.kategori === 'RAMADHAN' ? 'Ramadhan' : 'Sholat Ied'"
                  class="q-mt-xs"
                />
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
      <q-icon name="photo_library" size="64px" color="grey-4" />
      <div class="text-grey-6 q-mt-md">Belum ada foto untuk kategori ini</div>
    </div>

    <!-- Dialog Form -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 520px; max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ isEdit ? 'Edit Foto' : 'Tambah Foto' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="save" class="q-gutter-md">
            <q-input v-model="form.judul" outlined label="Judul Foto *" :rules="[v => !!v || 'Wajib diisi']" />
            <q-select
              v-model="form.kategori"
              outlined
              label="Kategori *"
              :options="kategoriOpts.filter(o => o.value !== null)"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              :rules="[v => !!v || 'Wajib dipilih']"
            />
            <q-input v-model="form.keterangan" outlined label="Keterangan (opsional)" type="textarea" rows="3" />
            <q-file v-model="form.fotoFile" outlined :label="isEdit ? 'Ganti Foto (opsional)' : 'File Foto *'" accept="image/*" :rules="isEdit ? [] : [v => !!v || 'Foto wajib diunggah']">
              <template #prepend><q-icon name="photo_camera" /></template>
            </q-file>

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
import { ref, reactive, onMounted } from 'vue';
import { useGaleriStore } from 'src/stores/galeri';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const galeriStore = useGaleriStore();

const dialog = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const editId = ref(null);
const filterKategori = ref(null);

const kategoriOpts = [
  { label: 'Semua', value: null },
  { label: 'Ramadhan', value: 'RAMADHAN' },
  { label: 'Sholat Ied', value: 'SHOLAT_IED' },
];

const emptyForm = () => ({ judul: '', kategori: 'RAMADHAN', keterangan: '', fotoFile: null });
const form = reactive(emptyForm());

const imgUrl = (path) => path;

const setFilter = (val) => {
  filterKategori.value = val;
  galeriStore.fetchAdmin({ kategori: val || undefined });
};

const openDialog = (row = null) => {
  if (row) {
    isEdit.value = true;
    editId.value = row.id;
    Object.assign(form, { judul: row.judul, kategori: row.kategori, keterangan: row.keterangan || '', fotoFile: null });
  } else {
    isEdit.value = false;
    editId.value = null;
    Object.assign(form, emptyForm());
  }
  dialog.value = true;
};

const save = async () => {
  saving.value = true;
  const payload = { judul: form.judul, kategori: form.kategori, keterangan: form.keterangan };
  if (form.fotoFile) payload.foto = form.fotoFile;

  const result = isEdit.value
    ? await galeriStore.update(editId.value, payload)
    : await galeriStore.create(payload);

  saving.value = false;
  if (result) {
    dialog.value = false;
    galeriStore.fetchAdmin({ kategori: filterKategori.value || undefined });
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
    galeriStore.fetchAdmin({ kategori: filterKategori.value || undefined });
  });
};

onMounted(() => {
  galeriStore.fetchAdmin();
});
</script>
