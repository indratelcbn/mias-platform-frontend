<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold">Manajemen Akun Keuangan</div>
        <div class="text-caption text-grey-6">Kelola akun kas dan bank</div>
      </div>
      <q-btn unelevated color="primary" icon="add" label="Tambah Akun" no-caps @click="openDialog()" />
    </div>

    <!-- Accounts Table -->
    <q-card flat bordered class="rounded-xl">
      <q-table
        :rows="accounts"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        :rows-per-page-options="[10, 20, 50]"
      >
        <template #body-cell-type="props">
          <q-td>
            <q-chip :color="props.value === 'CASH' ? 'blue-1' : 'green-1'" :text-color="props.value === 'CASH' ? 'primary' : 'green-7'" dense>
              <q-icon :name="props.value === 'CASH' ? 'payments' : 'account_balance'" class="q-mr-xs" size="16px" />
              {{ props.value === 'CASH' ? 'Kas' : 'Bank' }}
            </q-chip>
          </q-td>
        </template>
        <template #body-cell-balance="props">
          <q-td>
            <span class="text-weight-bold text-primary">{{ formatCurrency(props.value || 0) }}</span>
          </q-td>
        </template>
        <template #body-cell-isActive="props">
          <q-td>
            <q-badge :color="props.value ? 'green' : 'grey'" :label="props.value ? 'Aktif' : 'Nonaktif'" />
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td>
            <q-btn flat dense icon="edit" color="primary" size="sm" @click="openDialog(props.row)">
              <q-tooltip>Edit</q-tooltip>
            </q-btn>
            <q-btn flat dense icon="delete" color="negative" size="sm" @click="confirmDelete(props.row)">
              <q-tooltip>Hapus</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Form -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 500px" class="rounded-xl">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">{{ isEdit ? 'Edit Akun' : 'Tambah Akun' }}</div>
          <q-space />
          <q-btn flat dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleSubmit" class="q-gutter-md">
            <q-input v-model="form.name" label="Nama Akun *" outlined dense :rules="[val => !!val || 'Nama akun diperlukan']" />
            
            <q-select
              v-model="form.type"
              :options="typeOptions"
              label="Tipe Akun *"
              outlined
              dense
              emit-value
              map-options
              :rules="[val => !!val || 'Tipe akun diperlukan']"
            />

            <q-input v-model="form.accountNumber" label="Nomor Rekening" outlined dense />
            
            <q-input v-model="form.description" label="Keterangan" outlined dense type="textarea" rows="3" />
            
            <q-toggle v-model="form.isActive" label="Aktif" color="primary" />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Batal" color="grey-7" no-caps v-close-popup />
              <q-btn unelevated type="submit" label="Simpan" color="primary" no-caps :loading="submitting" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useFinanceStore } from 'src/stores/finance';
import { useQuasar } from 'quasar';
import { formatCurrency } from 'src/utils/format';

const $q = useQuasar();
const financeStore = useFinanceStore();

const dialogOpen = ref(false);
const isEdit = ref(false);
const editId = ref(null);

const form = ref({
  name: '',
  type: 'CASH',
  accountNumber: '',
  description: '',
  isActive: true,
});

const loading = computed(() => financeStore.loading);
const submitting = computed(() => financeStore.submitting);
const accounts = computed(() => financeStore.accountsWithBalance);

const typeOptions = [
  { label: 'Kas', value: 'CASH' },
  { label: 'Bank', value: 'BANK' },
];

const columns = [
  { name: 'name', label: 'Nama Akun', field: 'name', align: 'left', sortable: true },
  { name: 'type', label: 'Tipe', field: 'type', align: 'center', sortable: true },
  { name: 'accountNumber', label: 'Nomor Rekening', field: 'accountNumber', align: 'left' },
  { name: 'balance', label: 'Saldo', field: 'balance', align: 'right', sortable: true },
  { name: 'isActive', label: 'Status', field: 'isActive', align: 'center', sortable: true },
  { name: 'actions', label: 'Aksi', field: 'id', align: 'center' },
];

const openDialog = (account = null) => {
  if (account) {
    isEdit.value = true;
    editId.value = account.id;
    form.value = {
      name: account.name,
      type: account.type,
      accountNumber: account.accountNumber || '',
      description: account.description || '',
      isActive: account.isActive,
    };
  } else {
    isEdit.value = false;
    editId.value = null;
    form.value = {
      name: '',
      type: 'CASH',
      accountNumber: '',
      description: '',
      isActive: true,
    };
  }
  dialogOpen.value = true;
};

const handleSubmit = async () => {
  const success = isEdit.value
    ? await financeStore.updateAccount(editId.value, form.value)
    : await financeStore.createAccount(form.value);

  if (success) {
    dialogOpen.value = false;
    await financeStore.fetchAccountsWithBalance();
  }
};

const confirmDelete = (account) => {
  $q.dialog({
    title: 'Konfirmasi',
    message: `Hapus akun "${account.name}"?`,
    cancel: { flat: true, label: 'Batal', color: 'grey-7', noCaps: true },
    ok: { unelevated: true, label: 'Hapus', color: 'negative', noCaps: true },
    persistent: true,
  }).onOk(async () => {
    const success = await financeStore.deleteAccount(account.id);
    if (success) {
      await financeStore.fetchAccountsWithBalance();
    }
  });
};

onMounted(async () => {
  await financeStore.fetchAccountsWithBalance();
});
</script>

<style scoped>
.rounded-xl {
  border-radius: 16px;
}
</style>
