<template>
  <q-layout view="lHh Lpr lFf">
    <!-- ─── Header ──────────────────────────────────────────────────────── -->
    <q-header elevated class="bg-white text-dark" style="box-shadow: 0 2px 8px rgba(0,0,0,0.1)">
      <q-toolbar class="q-px-md" style="min-height: 64px">
        <!-- Logo -->
        <router-link to="/" class="flex items-center no-underline">
          <q-avatar size="42px" class="q-mr-sm">
            <q-icon name="mosque" color="primary" size="32px" />
          </q-avatar>
          <div class="column no-wrap">
            <span class="text-weight-bold text-primary" style="font-size: 13px; line-height: 1.2">
              Masjid Imam Asy Syafi'i
            </span>
            <span class="text-grey-6" style="font-size: 11px">Depok</span>
          </div>
        </router-link>

        <q-space />

        <!-- Desktop Nav -->
        <div class="gt-sm row items-center q-gutter-md">
          <q-btn
            v-for="item in navItems"
            :key="item.name"
            flat
            no-caps
            :label="item.label"
            :to="item.to"
            color="dark"
            class="nav-btn"
            :class="{ 'text-primary text-weight-bold': $route.name === item.name }"
          />
          <q-btn
            unelevated
            no-caps
            label="Donasi"
            to="/donasi"
            color="primary"
            class="q-px-md"
            style="border-radius: 8px"
          />
        </div>

        <!-- Dark Mode Toggle -->
        <q-btn
          flat
          round
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          class="q-ml-sm"
          @click="$q.dark.toggle()"
        />

        <!-- Mobile Hamburger -->
        <q-btn
          flat
          round
          icon="menu"
          class="lt-md q-ml-sm"
          @click="drawer = !drawer"
        />
      </q-toolbar>
    </q-header>

    <!-- ─── Mobile Drawer ──────────────────────────────────────────────── -->
    <q-drawer v-model="drawer" side="right" overlay bordered>
      <q-list padding>
        <q-item class="q-pb-md">
          <q-item-section>
            <div class="text-h6 text-primary text-weight-bold">Menu</div>
          </q-item-section>
          <q-item-section side>
            <q-btn flat round icon="close" @click="drawer = false" />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item
          v-for="item in navItems"
          :key="item.name"
          clickable
          v-ripple
          :to="item.to"
          @click="drawer = false"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" color="primary" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/donasi" @click="drawer = false">
          <q-item-section avatar>
            <q-icon name="volunteer_activism" color="primary" />
          </q-item-section>
          <q-item-section class="text-primary text-weight-bold">Donasi</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- ─── Page Content ───────────────────────────────────────────────── -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- ─── Footer ──────────────────────────────────────────────────────── -->
    <FooterComp />
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import FooterComp from 'src/components/FooterComp.vue';

const drawer = ref(false);

const navItems = [
  { name: 'home', label: 'Beranda', to: '/', icon: 'home' },
  { name: 'kajian', label: 'Kajian', to: '/kajian', icon: 'menu_book' },
  { name: 'artikel', label: 'Artikel', to: '/artikel', icon: 'article' },
  { name: 'kontak', label: 'Kontak', to: '/kontak', icon: 'contact_mail' },
];
</script>

<style scoped>
.nav-btn {
  font-size: 14px;
  letter-spacing: 0.3px;
}
.nav-btn:hover {
  color: var(--q-primary) !important;
}
</style>
