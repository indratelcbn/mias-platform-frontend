<template>
  <q-layout view="lhh LpR lff">
    <!-- ─── Left Drawer ──────────────────────────────────────────────────── -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :mini="miniMode"
      :width="240"
      :mini-width="64"
      class="admin-drawer"
    >
      <!-- Logo -->
      <div class="drawer-header flex items-center q-pa-md">
        <img src="/LOGO MIAS.png" style="width: 32px; height: 32px; object-fit: contain;" />
        <transition name="fade">
          <div v-if="!miniMode" class="q-ml-sm">
            <div class="text-weight-bold text-primary" style="font-size: 13px; line-height: 1.2">
              Halaman Admin
            </div>
            <div class="text-grey-6 text-caption">Masjid Asy Syafi'i</div>
          </div>
        </transition>
      </div>

      <q-separator />

      <q-list padding>
        <template v-for="item in menuItems" :key="item.name">
          <!-- Menu dengan submenu (expansion) -->
          <q-expansion-item
            v-if="item.children"
            :icon="item.icon"
            :label="item.label"
            :default-opened="$route.path.startsWith(item.basePath)"
            expand-separator
            style="border-radius: 8px; margin-bottom: 4px"
            header-class="text-weight-medium"
          >
            <q-list padding dense>
              <q-item
                v-for="child in item.children"
                :key="child.name"
                clickable
                v-ripple
                :to="child.to"
                :active="$route.name === child.name"
                active-class="active-menu-item"
                style="border-radius: 8px; padding-left: 48px"
              >
                <q-item-section avatar>
                  <q-icon :name="child.icon" size="20px" />
                </q-item-section>
                <q-item-section>{{ child.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>

          <!-- Menu biasa (tanpa submenu) -->
          <q-item
            v-else
            clickable
            v-ripple
            :to="item.to"
            :active="$route.name === item.name"
            active-class="active-menu-item"
            style="border-radius: 8px; margin-bottom: 4px"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
            <q-item-section v-if="item.name === 'admin-pesan' && unresolvedPesanCount > 0" side>
              <q-badge color="negative" rounded :label="unresolvedPesanCount" />
            </q-item-section>
            <q-tooltip v-if="miniMode" anchor="center right" self="center left">
              {{ item.label }}
            </q-tooltip>
          </q-item>
        </template>
      </q-list>

      <div class="absolute-bottom q-pb-md q-px-md">
        <q-btn
          flat
          :icon="miniMode ? 'chevron_right' : 'chevron_left'"
          :label="miniMode ? '' : 'Perkecil'"
          no-caps
          class="full-width"
          @click="miniMode = !miniMode"
        />
      </div>
    </q-drawer>

    <!-- ─── Header ──────────────────────────────────────────────────────── -->
    <q-header elevated class="bg-white text-dark" style="box-shadow: 0 1px 8px rgba(0,0,0,0.08)">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-toolbar-title>
          <span class="text-weight-medium" style="font-size: 16px">Admin Dashboard</span>
        </q-toolbar-title>

        <q-space />

        <!-- Dark mode -->
        <q-btn
          flat
          round
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          @click="$q.dark.toggle()"
          class="q-mr-sm"
        />

        <!-- User menu -->
        <q-btn flat round padding="xs">
          <q-avatar color="primary" text-color="white" size="36px" class="text-weight-bold">
            {{ userInitial }}
          </q-avatar>
          <q-tooltip>{{ authStore.currentUser?.nama }}</q-tooltip>
          <q-menu>
            <q-list style="min-width: 180px">
              <q-item-label header class="text-weight-bold">
                {{ authStore.currentUser?.nama }}
              </q-item-label>
              <q-item-label caption class="q-px-md q-pb-sm text-grey">
                {{ authStore.currentUser?.role }}
              </q-item-label>
              <q-separator />
              <q-item clickable v-close-popup to="/" target="_blank">
                <q-item-section avatar><q-icon name="open_in_new" /></q-item-section>
                <q-item-section>Lihat Website</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="pwdDialog = true">
                <q-item-section avatar><q-icon name="lock" /></q-item-section>
                <q-item-section>Ganti Password</q-item-section>
              </q-item>
              <q-item clickable v-close-popup class="text-negative" @click="handleLogout">
                <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
                <q-item-section>Keluar</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- ─── Page Content ───────────────────────────────────────────────── -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Dialog Ganti Password -->
    <q-dialog v-model="pwdDialog" persistent>
      <q-card style="min-width: 360px; max-width: 440px; width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6"><q-icon name="lock" class="q-mr-sm" />Ganti Password</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form @submit="submitChangePassword" class="q-gutter-md">
            <q-input
              v-model="pwdForm.oldPassword"
              outlined
              label="Password Lama *"
              :type="showOldPwd ? 'text' : 'password'"
              :rules="[v => !!v || 'Password lama wajib diisi']"
            >
              <template #prepend><q-icon name="lock_outline" /></template>
              <template #append>
                <q-icon :name="showOldPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showOldPwd = !showOldPwd" />
              </template>
            </q-input>

            <q-input
              v-model="pwdForm.newPassword"
              outlined
              label="Password Baru *"
              :type="showNewPwd ? 'text' : 'password'"
              :rules="passwordRules"
            >
              <template #prepend><q-icon name="lock" /></template>
              <template #append>
                <q-icon :name="showNewPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showNewPwd = !showNewPwd" />
              </template>
            </q-input>

            <q-input
              v-model="pwdForm.confirmPassword"
              outlined
              label="Konfirmasi Password Baru *"
              :type="showConfirmPwd ? 'text' : 'password'"
              :rules="[v => !!v || 'Konfirmasi password wajib diisi', v => v === pwdForm.newPassword || 'Password tidak cocok']"
            >
              <template #prepend><q-icon name="lock_outline" /></template>
              <template #append>
                <q-icon :name="showConfirmPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showConfirmPwd = !showConfirmPwd" />
              </template>
            </q-input>

            <!-- Password strength hints -->
            <div class="text-caption q-mt-none">
              <div :class="pwdForm.newPassword?.length >= 8 ? 'text-positive' : 'text-grey-5'"><q-icon :name="pwdForm.newPassword?.length >= 8 ? 'check_circle' : 'radio_button_unchecked'" size="16px" class="q-mr-xs" />Minimal 8 karakter</div>
              <div :class="/[a-z]/.test(pwdForm.newPassword) ? 'text-positive' : 'text-grey-5'"><q-icon :name="/[a-z]/.test(pwdForm.newPassword) ? 'check_circle' : 'radio_button_unchecked'" size="16px" class="q-mr-xs" />Huruf kecil (a-z)</div>
              <div :class="/[A-Z]/.test(pwdForm.newPassword) ? 'text-positive' : 'text-grey-5'"><q-icon :name="/[A-Z]/.test(pwdForm.newPassword) ? 'check_circle' : 'radio_button_unchecked'" size="16px" class="q-mr-xs" />Huruf besar (A-Z)</div>
              <div :class="/[0-9]/.test(pwdForm.newPassword) ? 'text-positive' : 'text-grey-5'"><q-icon :name="/[0-9]/.test(pwdForm.newPassword) ? 'check_circle' : 'radio_button_unchecked'" size="16px" class="q-mr-xs" />Angka (0-9)</div>
              <div :class="/[^a-zA-Z0-9]/.test(pwdForm.newPassword) ? 'text-positive' : 'text-grey-5'"><q-icon :name="/[^a-zA-Z0-9]/.test(pwdForm.newPassword) ? 'check_circle' : 'radio_button_unchecked'" size="16px" class="q-mr-xs" />Simbol (!@#$%...)</div>
            </div>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat no-caps label="Batal" v-close-popup />
              <q-btn unelevated color="primary" no-caps label="Simpan" type="submit" :loading="pwdLoading" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import { usePesanStore } from 'src/stores/pesan';
import { useInactivityTimer } from 'src/composables/useInactivityTimer';
import { api } from 'src/boot/axios';

const authStore = useAuthStore();
const pesanStore = usePesanStore();
const router = useRouter();

const leftDrawerOpen = ref(true);
const miniMode = ref(false);

const userInitial = computed(() => {
  const name = authStore.currentUser?.nama || 'A';
  return name.charAt(0).toUpperCase();
});

const unresolvedPesanCount = computed(() => pesanStore.summary?.belumDitindaklanjuti || 0);

const allMenuItems = [
  { name: 'admin-dashboard', label: 'Dashboard', to: '/admin/dashboard', icon: 'dashboard' },
  { name: 'admin-profil', label: 'Profil Masjid', to: '/admin/profil', icon: 'account_balance' },
  { name: 'admin-kajian', label: 'Kajian Ilmiyyah', to: '/admin/kajian', icon: 'menu_book' },
  { name: 'admin-streaming', label: 'Mias TV', to: '/admin/streaming', icon: 'live_tv' },
  { name: 'admin-galeri', label: 'Ied Mubarok', to: '/admin/galeri', icon: 'celebration' },
  { name: 'admin-sosial', label: 'Program Sosial', to: '/admin/sosial', icon: 'diversity_3' },
  { name: 'admin-mustahik', label: 'Data Mustahik', to: '/admin/mustahik', icon: 'people_alt' },
  { name: 'admin-pendidikan', label: 'Pendidikan', to: '/admin/pendidikan', icon: 'school' },
  { name: 'admin-usaha', label: 'Usaha', to: '/admin/usaha', icon: 'storefront' },
  { name: 'admin-artikel', label: 'Artikel', to: '/admin/artikel', icon: 'article' },
  { name: 'admin-donasi', label: 'Infaq', to: '/admin/donasi', icon: 'volunteer_activism' },
  { 
    name: 'admin-finance', 
    label: 'Keuangan', 
    icon: 'account_balance_wallet',
    basePath: '/admin/finance',
    children: [
      { name: 'admin-finance-dashboard', label: 'Dashboard', to: '/admin/finance/dashboard', icon: 'dashboard' },
      { name: 'admin-finance-accounts', label: 'Akun', to: '/admin/finance/accounts', icon: 'account_balance' },
      { name: 'admin-finance-transactions', label: 'Transaksi', to: '/admin/finance/transactions', icon: 'receipt_long' },
      { name: 'admin-finance-reconciliation', label: 'Rekonsiliasi', to: '/admin/finance/reconciliation', icon: 'rule' },
      { name: 'admin-finance-report', label: 'Laporan', to: '/admin/finance/report', icon: 'assessment' },
    ]
  },
  { name: 'admin-pesan', label: 'Pesan', to: '/admin/pesan', icon: 'mark_email_unread' },
  { name: 'admin-divisi', label: 'Divisi', to: '/admin/divisi', icon: 'category' },
  { name: 'admin-setting', label: 'Pengaturan', to: '/admin/setting', icon: 'settings' },
  { name: 'admin-users', label: 'Pengguna', to: '/admin/users', icon: 'manage_accounts', superadminOnly: true },
];

const menuItems = computed(() => {
  return allMenuItems.filter((item) => {
    if (item.superadminOnly) return authStore.isSuperadmin;
    if (item.parent) return authStore.hasPermission(item.parent);
    return authStore.hasPermission(item.name);
  });
});

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'admin-login' });
};

// ─── Ganti Password ──────────────────────────────────────────────────────────
const pwdDialog = ref(false);
const pwdLoading = ref(false);
const showOldPwd = ref(false);
const showNewPwd = ref(false);
const showConfirmPwd = ref(false);

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const passwordRules = [
  v => !!v || 'Password baru wajib diisi',
  v => v.length >= 8 || 'Minimal 8 karakter',
  v => /[a-z]/.test(v) || 'Harus mengandung huruf kecil',
  v => /[A-Z]/.test(v) || 'Harus mengandung huruf besar',
  v => /[0-9]/.test(v) || 'Harus mengandung angka',
  v => /[^a-zA-Z0-9]/.test(v) || 'Harus mengandung simbol',
];

const submitChangePassword = async () => {
  pwdLoading.value = true;
  try {
    const { data } = await api.put('/auth/change-password', {
      oldPassword: pwdForm.oldPassword,
      newPassword: pwdForm.newPassword,
    });
    Notify.create({ type: 'positive', message: data.message });
    pwdDialog.value = false;
    pwdForm.oldPassword = '';
    pwdForm.newPassword = '';
    pwdForm.confirmPassword = '';
  } catch (err) {
    Notify.create({ type: 'negative', message: err.response?.data?.message || 'Gagal mengubah password.' });
  } finally {
    pwdLoading.value = false;
  }
};

// Auto-logout setelah 30 menit tidak ada aktivitas
useInactivityTimer(() => {
  Notify.create({
    type: 'warning',
    message: 'Sesi Anda berakhir karena tidak ada aktivitas selama 30 menit.',
    timeout: 5000,
  });
  handleLogout();
});

onMounted(() => {
  pesanStore.fetchSummary();
});
</script>

<style scoped>
.admin-drawer {
  background: #fafafa;
}
.body--dark .admin-drawer {
  background: #1e1e1e;
}
.drawer-header {
  min-height: 64px;
}
.active-menu-item {
  background: rgba(27, 122, 74, 0.1);
  color: #1B7A4A !important;
  font-weight: 600;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
