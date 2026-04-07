<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">
        <q-icon name="live_tv" color="primary" class="q-mr-sm" />Kelola Mias TV
      </div>
      <q-btn unelevated color="primary" icon="add" label="Tambah Streaming" no-caps @click="openDialog()" />
    </div>

    <!-- Table -->
    <q-card flat bordered class="rounded-xl">
      <q-table
        :rows="streamingStore.list"
        :columns="columns"
        row-key="id"
        flat
        :loading="streamingStore.loading"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template #body-cell-isLive="props">
          <q-td class="text-center">
            <q-badge :color="props.value ? 'red' : 'grey-5'" :label="props.value ? '● LIVE' : 'Tidak Aktif'" />
          </q-td>
        </template>
        <template #body-cell-url="props">
          <q-td>
            <a :href="props.value" target="_blank" class="text-primary" style="font-size: 12px; word-break: break-all">
              {{ props.value.length > 50 ? props.value.slice(0, 50) + '…' : props.value }}
            </a>
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td class="text-center">
            <q-btn
              v-if="!props.row.isLive"
              flat
              dense
              icon="play_circle"
              color="positive"
              size="sm"
              label="Set Live"
              no-caps
              class="q-mr-xs"
              @click="confirmSetLive(props.row)"
            />
            <q-btn flat round icon="edit" color="primary" size="sm" @click="openDialog(props.row)" />
            <q-btn flat round icon="delete" color="negative" size="sm" @click="confirmDelete(props.row)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Form -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 580px; max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ isEdit ? 'Edit Streaming' : 'Tambah Streaming' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="save" class="q-gutter-md">
            <q-input
              v-model="form.judul"
              outlined
              label="Judul Siaran *"
              :rules="[v => !!v || 'Wajib diisi']"
            />
            <q-input
              v-model="form.url"
              outlined
              label="URL Streaming *"
              hint="Contoh: https://www.youtube.com/watch?v=xxxxx atau embed URL"
              :rules="[v => !!v || 'Wajib diisi']"
            />
            <q-input
              v-model="form.deskripsi"
              outlined
              label="Deskripsi (opsional)"
              type="textarea"
              rows="3"
            />
            <q-toggle v-model="form.isLive" label="Aktifkan sebagai siaran LIVE sekarang" color="red" />

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
import { useStreamingStore } from 'src/stores/streaming';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const streamingStore = useStreamingStore();

const dialog = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const editId = ref(null);

const emptyForm = () => ({ judul: '', url: '', deskripsi: '', isLive: false });
const form = reactive(emptyForm());

const columns = [
  { name: 'judul', label: 'Judul', field: 'judul', align: 'left', sortable: true },
  { name: 'url', label: 'URL', field: 'url', align: 'left' },
  { name: 'isLive', label: 'Status', field: 'isLive', align: 'center' },
  { name: 'actions', label: 'Aksi', field: 'actions', align: 'center' },
];

const openDialog = (row = null) => {
  if (row) {
    isEdit.value = true;
    editId.value = row.id;
    Object.assign(form, { judul: row.judul, url: row.url, deskripsi: row.deskripsi || '', isLive: row.isLive });
  } else {
    isEdit.value = false;
    editId.value = null;
    Object.assign(form, emptyForm());
  }
  dialog.value = true;
};

const save = async () => {
  saving.value = true;
  const payload = { judul: form.judul, url: form.url, deskripsi: form.deskripsi, isLive: form.isLive };
  const result = isEdit.value
    ? await streamingStore.update(editId.value, payload)
    : await streamingStore.create(payload);
  saving.value = false;
  if (result) {
    dialog.value = false;
    streamingStore.fetchAll();
  }
};

const confirmSetLive = (row) => {
  $q.dialog({
    title: 'Aktifkan Live',
    message: `Aktifkan "${row.judul}" sebagai siaran live? Siaran lain akan dinonaktifkan.`,
    cancel: { flat: true, label: 'Batal' },
    ok: { unelevated: true, color: 'positive', label: 'Aktifkan' },
    persistent: true,
  }).onOk(async () => {
    await streamingStore.setLive(row.id);
    streamingStore.fetchAll();
  });
};

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Hapus Streaming',
    message: `Yakin ingin menghapus "${row.judul}"?`,
    cancel: { flat: true, label: 'Batal' },
    ok: { unelevated: true, color: 'negative', label: 'Hapus' },
    persistent: true,
  }).onOk(async () => {
    await streamingStore.remove(row.id);
    streamingStore.fetchAll();
  });
};

onMounted(() => {
  streamingStore.fetchAll();
});
</script>
