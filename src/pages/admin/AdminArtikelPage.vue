<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">
        <q-icon name="article" color="primary" class="q-mr-sm" />Kelola Artikel
      </div>
      <q-btn unelevated color="primary" icon="add" label="Tambah Artikel" no-caps @click="openDialog()" />
    </div>

    <q-card flat bordered class="rounded-xl">
      <q-table
        :rows="artikelStore.list"
        :columns="columns"
        row-key="id"
        flat
        :loading="artikelStore.loading"
      >
        <template #body-cell-thumbnail="props">
          <q-td>
            <q-img v-if="props.value" :src="props.value" width="60px" height="40px" fit="cover" class="rounded" />
            <q-icon v-else name="image_not_supported" color="grey-5" />
          </q-td>
        </template>
        <template #body-cell-createdAt="props">
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
    <q-dialog v-model="dialog" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ isEdit ? 'Edit Artikel' : 'Tambah Artikel' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section style="max-width: 800px; margin: 0 auto; width: 100%">
          <q-form @submit="saveArtikel" class="q-gutter-md">
            <q-input v-model="form.judul" outlined label="Judul Artikel *" :rules="[v => !!v || 'Wajib diisi']" />
            <q-input v-model="form.ringkasan" outlined label="Ringkasan" type="textarea" rows="2" />
            <div>
              <div class="text-caption text-grey-6 q-mb-xs">Konten Artikel *</div>
              <q-input
                v-model="form.konten"
                outlined
                type="textarea"
                rows="12"
                :rules="[v => !!v || 'Konten wajib diisi']"
                hint="Mendukung HTML dasar: <p>, <h2>, <h3>, <strong>, <em>, <ul>, <li>"
              />
            </div>
            <q-file v-model="form.thumbnailFile" outlined label="Thumbnail (opsional)" accept="image/*">
              <template #prepend><q-icon name="image" /></template>
            </q-file>
            <q-toggle v-model="form.isPublished" label="Tampilkan ke publik" color="primary" />

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
import { useArtikelStore } from 'src/stores/artikel';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const artikelStore = useArtikelStore();

const dialog = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const editId = ref(null);

const emptyForm = () => ({ judul: '', ringkasan: '', konten: '', thumbnailFile: null, isPublished: true });
const form = reactive(emptyForm());

const columns = [
  { name: 'thumbnail', label: 'Thumbnail', field: 'thumbnail', align: 'center' },
  { name: 'judul', label: 'Judul', field: 'judul', align: 'left', sortable: true },
  { name: 'createdAt', label: 'Tanggal', field: 'createdAt', align: 'left', sortable: true },
  { name: 'isPublished', label: 'Status', field: 'isPublished', align: 'center' },
  { name: 'actions', label: 'Aksi', field: 'actions', align: 'center' },
];

const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

const openDialog = (row = null) => {
  if (row) {
    isEdit.value = true;
    editId.value = row.id;
    Object.assign(form, {
      judul: row.judul,
      ringkasan: row.ringkasan || '',
      konten: row.konten,
      thumbnailFile: null,
      isPublished: row.isPublished,
    });
  } else {
    isEdit.value = false;
    editId.value = null;
    Object.assign(form, emptyForm());
  }
  dialog.value = true;
};

const saveArtikel = async () => {
  saving.value = true;
  const payload = { ...form, thumbnail: form.thumbnailFile };
  delete payload.thumbnailFile;

  const result = isEdit.value
    ? await artikelStore.update(editId.value, payload)
    : await artikelStore.create(payload);

  saving.value = false;
  if (result) {
    dialog.value = false;
    artikelStore.fetchAll({ page: 1, limit: 100 });
  }
};

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Hapus Artikel',
    message: `Yakin ingin menghapus artikel "${row.judul}"?`,
    cancel: { flat: true, label: 'Batal' },
    ok: { unelevated: true, color: 'negative', label: 'Hapus' },
  }).onOk(async () => {
    await artikelStore.remove(row.id);
    artikelStore.fetchAll({ page: 1, limit: 100 });
  });
};

onMounted(() => {
  artikelStore.fetchAll({ page: 1, limit: 100 });
});
</script>
