<template>
  <q-page padding>
    <q-card>
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">Manajemen Divisi</div>
        <q-btn label="Tambah Divisi" color="primary" @click="openCreateDialog" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="pagination"
          @request="onRequest"
        >
          <template v-slot:body-cell-is_active="props">
            <q-td :props="props">
              <q-toggle
                :model-value="props.row.is_active"
                @update:model-value="updateStatus(props.row)"
                color="green"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn dense round flat icon="edit" @click="openEditDialog(props.row)"></q-btn>
              <q-btn dense round flat icon="delete" color="negative" @click="confirmDelete(props.row)"></q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog Create/Edit -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ editing ? 'Edit Divisi' : 'Tambah Divisi' }}</div>
        </q-card-section>

        <q-form @submit.prevent="save">
          <q-card-section class="q-pt-none">
            <q-input
              dense
              v-model="form.nama"
              label="Nama Divisi"
              autofocus
              :rules="[val => !!val || 'Nama divisi harus diisi']"
            />
            <q-input
              dense
              v-model="form.deskripsi"
              label="Deskripsi"
              type="textarea"
              autogrow
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Batal" v-close-popup />
            <q-btn type="submit" flat :label="editing ? 'Simpan' : 'Tambah'" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const rows = ref([]);
const loading = ref(false);
const dialog = ref(false);
const editing = ref(false);
const form = ref({
  id: null,
  nama: '',
  deskripsi: '',
});

const pagination = ref({
  sortBy: 'urutan',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

const columns = [
  { name: 'nama', required: true, label: 'Nama Divisi', align: 'left', field: 'nama', sortable: true },
  { name: 'deskripsi', label: 'Deskripsi', align: 'left', field: 'deskripsi', sortable: false },
  { name: 'is_active', label: 'Aktif', align: 'center', field: 'is_active', sortable: true },
  { name: 'actions', label: 'Aksi', align: 'right' }
];

async function fetchData(props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  loading.value = true;

  try {
    const response = await api.get('/divisi', {
      params: {
        page,
        limit: rowsPerPage,
        sortBy,
        descending,
      }
    });
    rows.value = response.data.data;
    pagination.value.rowsNumber = response.data.meta.total;
    pagination.value.page = response.data.meta.page;
    pagination.value.rowsPerPage = response.data.meta.limit;
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Gagal memuat data divisi.',
      icon: 'report_problem'
    });
  } finally {
    loading.value = false;
  }
}

function onRequest(props) {
  pagination.value = props.pagination;
  fetchData(props);
}

onMounted(() => {
  fetchData({ pagination: pagination.value });
});

function openCreateDialog() {
  editing.value = false;
  form.value = { id: null, nama: '', deskripsi: '' };
  dialog.value = true;
}

function openEditDialog(row) {
  editing.value = true;
  form.value = { ...row };
  dialog.value = true;
}

async function save() {
  try {
    if (editing.value) {
      await api.put(`/divisi/${form.value.id}`, form.value);
      $q.notify({ color: 'positive', message: 'Divisi berhasil diperbarui.' });
    } else {
      await api.post('/divisi', form.value);
      $q.notify({ color: 'positive', message: 'Divisi berhasil ditambahkan.' });
    }
    dialog.value = false;
    fetchData({ pagination: pagination.value });
  } catch (error) {
    const message = error.response?.data?.message || 'Gagal menyimpan data.';
    $q.notify({ color: 'negative', message });
  }
}

function confirmDelete(row) {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Apakah Anda yakin ingin menghapus divisi "${row.nama}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/divisi/${row.id}`);
      $q.notify({ color: 'positive', message: 'Divisi berhasil dihapus.' });
      fetchData({ pagination: pagination.value });
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menghapus divisi.';
      $q.notify({ color: 'negative', message });
    }
  });
}

async function updateStatus(row) {
  try {
    await api.put(`/divisi/${row.id}`, { is_active: !row.is_active });
    $q.notify({ color: 'positive', message: 'Status divisi berhasil diperbarui.' });
    fetchData({ pagination: pagination.value });
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Gagal memperbarui status.' });
  }
}

</script>
