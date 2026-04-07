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
        <q-item
          v-for="item in menuItems"
          :key="item.name"
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
          <q-tooltip v-if="miniMode" anchor="center right" self="center left">
            {{ item.label }}
          </q-tooltip>
        </q-item>
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
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const leftDrawerOpen = ref(true);
const miniMode = ref(false);

const userInitial = computed(() => {
  const name = authStore.currentUser?.nama || 'A';
  return name.charAt(0).toUpperCase();
});

const menuItems = [
  { name: 'admin-dashboard', label: 'Dashboard', to: '/admin/dashboard', icon: 'dashboard' },
  { name: 'admin-kajian', label: 'Kajian Ilmiyyah', to: '/admin/kajian', icon: 'menu_book' },
  { name: 'admin-streaming', label: 'Mias TV', to: '/admin/streaming', icon: 'live_tv' },
  { name: 'admin-galeri', label: 'Galeri Foto', to: '/admin/galeri', icon: 'photo_library' },
  { name: 'admin-sosial', label: 'Program Sosial', to: '/admin/sosial', icon: 'diversity_3' },
  { name: 'admin-artikel', label: 'Artikel', to: '/admin/artikel', icon: 'article' },
  { name: 'admin-donasi', label: 'Donasi', to: '/admin/donasi', icon: 'volunteer_activism' },
];

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'admin-login' });
};
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
