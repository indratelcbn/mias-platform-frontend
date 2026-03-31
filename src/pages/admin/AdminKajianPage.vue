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

        <q-card-section class="q-pt-md">
          <q-form @submit="saveKajian" class="q-gutter-md">
            <q-input v-model="form.judul" outlined label="Judul Kajian *" :rules="[v => !!v || 'Wajib diisi']" />
            <q-input v-model="form.ustadz" outlined label="Nama Ustadz *" :rules="[v => !!v || 'Wajib diisi']" />
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input v-model="form.tanggal" outlined label="Tanggal *" type="date" :rules="[v => !!v || 'Wajib diisi']" />
              </div>
              <div class="col-6">
                <q-input v-model="form.waktu" outlined label="Waktu *" placeholder="19:30 - 21:00 WIB" :rules="[v => !!v || 'Wajib diisi']" />
              </div>
            </div>
            <q-input v-model="form.lokasi" outlined label="Lokasi" />
            <q-input v-model="form.deskripsi" outlined label="Deskripsi" type="textarea" rows="4" />
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
import { useKajianStore } from 'src/stores/kajian';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const kajianStore = useKajianStore();

const dialog = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const editId = ref(null);

const emptyForm = () => ({
  judul: '', ustadz: '', tanggal: '', waktu: '', lokasi: '', deskripsi: '',
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
    Object.assign(form, {
      judul: row.judul,
      ustadz: row.ustadz,
      tanggal: row.tanggal?.slice(0, 10),
      waktu: row.waktu,
      lokasi: row.lokasi || '',
      deskripsi: row.deskripsi || '',
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

const saveKajian = async () => {
  saving.value = true;
  const payload = { ...form, thumbnail: form.thumbnailFile };
  delete payload.thumbnailFile;

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
});
</script>
