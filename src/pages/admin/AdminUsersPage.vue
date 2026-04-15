<template>
  <q-page padding>
    <!-- ─── Header ────────────────────────────────────────────────────── -->
    <div class="row items-center q-mb-lg">
      <q-icon name="manage_accounts" size="28px" color="primary" class="q-mr-sm" />
      <div class="text-h5 text-weight-bold">Manajemen Pengguna</div>
      <q-space />
      <q-btn color="primary" icon="person_add" label="Tambah Pengguna" no-caps @click="openCreateDialog" />
    </div>

    <q-tabs v-model="activeTab" class="q-mb-lg text-primary" active-color="primary" indicator-color="primary" align="left" no-caps>
      <q-tab name="users" label="Daftar Pengguna" icon="people" />
      <q-tab name="permissions" label="Hak Akses Role" icon="admin_panel_settings" />
    </q-tabs>

    <!-- ═══ Tab: User List ═══════════════════════════════════════════════ -->
    <q-tab-panels v-model="activeTab" animated>
      <q-tab-panel name="users" class="q-pa-none">
        <q-table
          :rows="userStore.users"
          :columns="columns"
          row-key="id"
          :loading="userStore.loading"
          flat
          bordered
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-role="props">
            <q-td :props="props">
              <q-badge :color="roleColor(props.row.role)" :label="props.row.role" />
            </q-td>
          </template>

          <template #body-cell-createdAt="props">
            <q-td :props="props">
              {{ formatDate(props.row.createdAt) }}
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat round dense icon="edit" color="primary" @click="openEditDialog(props.row)">
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="delete" color="negative" @click="confirmDelete(props.row)" :disable="props.row.id === authStore.currentUser?.id">
                <q-tooltip>Hapus</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- ═══ Tab: Role Permissions ═══════════════════════════════════════ -->
      <q-tab-panel name="permissions" class="q-pa-none">
        <div class="row q-col-gutter-md">
          <div v-for="role in editableRoles" :key="role" class="col-12 col-md-6">
            <q-card flat bordered>
              <q-card-section>
                <div class="row items-center q-mb-md">
                  <q-badge :color="roleColor(role)" :label="role" class="text-body2 q-pa-sm" />
                  <q-space />
                  <q-btn flat dense color="primary" icon="save" label="Simpan" no-caps size="sm" @click="savePermissions(role)" />
                </div>
                <div class="q-gutter-sm">
                  <q-checkbox
                    v-for="menu in allMenuOptions"
                    :key="menu.value"
                    v-model="permForm[role]"
                    :val="menu.value"
                    :label="menu.label"
                    dense
                    class="full-width"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- ─── Create / Edit Dialog ──────────────────────────────────────── -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 420px">
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Edit Pengguna' : 'Tambah Pengguna' }}</div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-gutter-md">
          <q-input v-model="form.nama" label="Nama Lengkap" outlined :rules="[val => !!val || 'Nama diperlukan']" />
          <q-input v-model="form.username" label="Username" outlined :rules="[val => !!val && val.length >= 3 || 'Minimal 3 karakter']" />
          <q-input
            v-model="form.password"
            :label="isEditing ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'"
            outlined
            :type="showPwd ? 'text' : 'password'"
            :rules="isEditing ? [] : [val => !!val && val.length >= 6 || 'Minimal 6 karakter']"
          >
            <template v-slot:append>
              <q-icon :name="showPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPwd = !showPwd" />
            </template>
          </q-input>
          <q-select v-model="form.role" :options="roleOptions" label="Role" outlined emit-value map-options :rules="[val => !!val || 'Role diperlukan']" />
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Batal" color="grey" v-close-popup />
          <q-btn unelevated :label="isEditing ? 'Simpan' : 'Buat'" color="primary" @click="handleSubmit" :loading="submitting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user';
import { useAuthStore } from 'src/stores/auth';

const $q = useQuasar();
const userStore = useUserStore();
const authStore = useAuthStore();

const activeTab = ref('users');
const dialogOpen = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const submitting = ref(false);
const showPwd = ref(false);

const form = reactive({ nama: '', username: '', password: '', role: 'ADMIN' });

const roleOptions = [
  { label: 'SUPERADMIN', value: 'SUPERADMIN' },
  { label: 'ADMIN', value: 'ADMIN' },
  { label: 'SOSIAL', value: 'SOSIAL' },
  { label: 'DAKWAH', value: 'DAKWAH' },
  { label: 'PENDIDIKAN', value: 'PENDIDIKAN' },
  { label: 'USAHA', value: 'USAHA' },
];

const editableRoles = ['ADMIN', 'SOSIAL', 'DAKWAH', 'PENDIDIKAN', 'USAHA'];

const allMenuOptions = [
  { value: 'admin-dashboard', label: 'Dashboard' },
  { value: 'admin-profil', label: 'Profil Masjid' },
  { value: 'admin-kajian', label: 'Kajian Ilmiyyah' },
  { value: 'admin-streaming', label: 'Mias TV' },
  { value: 'admin-galeri', label: 'Ied Mubarok' },
  { value: 'admin-sosial', label: 'Program Sosial' },
  { value: 'admin-mustahik', label: 'Data Mustahik' },
  { value: 'admin-pendidikan', label: 'Pendidikan' },
  { value: 'admin-usaha', label: 'Usaha' },
  { value: 'admin-artikel', label: 'Artikel' },
  { value: 'admin-donasi', label: 'Donasi' },
  { value: 'admin-pesan', label: 'Pesan' },
  { value: 'admin-setting', label: 'Pengaturan' },
  { value: 'admin-qurban', label: 'Qurban' },
];

const permForm = reactive({});

const columns = [
  { name: 'nama', label: 'Nama', field: 'nama', align: 'left', sortable: true },
  { name: 'username', label: 'Username', field: 'username', align: 'left', sortable: true },
  { name: 'role', label: 'Role', field: 'role', align: 'center', sortable: true },
  { name: 'createdAt', label: 'Dibuat', field: 'createdAt', align: 'center', sortable: true },
  { name: 'actions', label: 'Aksi', field: 'actions', align: 'center' },
];

const roleColor = (role) => {
  const map = { SUPERADMIN: 'deep-purple', ADMIN: 'primary', SOSIAL: 'teal', DAKWAH: 'orange', PENDIDIKAN: 'blue', USAHA: 'brown' };
  return map[role] || 'grey';
};

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const openCreateDialog = () => {
  isEditing.value = false;
  editingId.value = null;
  Object.assign(form, { nama: '', username: '', password: '', role: 'ADMIN' });
  showPwd.value = false;
  dialogOpen.value = true;
};

const openEditDialog = (user) => {
  isEditing.value = true;
  editingId.value = user.id;
  Object.assign(form, { nama: user.nama, username: user.username, password: '', role: user.role });
  showPwd.value = false;
  dialogOpen.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    if (isEditing.value) {
      const payload = { nama: form.nama, username: form.username, role: form.role };
      if (form.password) payload.password = form.password;
      const ok = await userStore.updateUser(editingId.value, payload);
      if (ok) dialogOpen.value = false;
    } else {
      const ok = await userStore.createUser({ ...form });
      if (ok) dialogOpen.value = false;
    }
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (user) => {
  $q.dialog({
    title: 'Hapus Pengguna',
    message: `Yakin ingin menghapus <strong>${user.nama}</strong>?`,
    html: true,
    cancel: { flat: true, color: 'grey' },
    ok: { unelevated: true, color: 'negative', label: 'Hapus' },
    persistent: true,
  }).onOk(() => {
    userStore.deleteUser(user.id);
  });
};

const savePermissions = async (role) => {
  await userStore.updateRolePermissions(role, permForm[role] || []);
};

// Initialize permission form whenever rolePermissions change
watch(() => userStore.rolePermissions, (val) => {
  for (const role of editableRoles) {
    permForm[role] = val[role] ? [...val[role]] : [];
  }
}, { immediate: true, deep: true });

onMounted(() => {
  userStore.fetchUsers();
  userStore.fetchRolePermissions();
});
</script>
