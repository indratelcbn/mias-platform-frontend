<template>
  <q-layout view="lHh Lpr lFf">
    <!-- ─── Header ──────────────────────────────────────────────────────── -->
    <q-header elevated class="bg-white text-dark" style="box-shadow: 0 2px 8px rgba(0,0,0,0.1)">
      <q-toolbar class="q-px-md" style="min-height: 64px">
        <!-- Logo -->
        <router-link to="/" class="flex items-center no-underline">
<q-avatar size="42px" class="q-mr-sm">
  <img src="/LOGO MIAS.png" style="width: 42px; height: 42px; object-fit: contain;" />
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
            v-for="item in simpleNavItems"
            :key="item.name"
            flat
            no-caps
            :label="item.label"
            :to="item.to"
            color="dark"
            class="nav-btn"
            :class="{ 'text-primary text-weight-bold': $route.name === item.name }"
          />

          <!-- Dakwah Dropdown -->
          <q-btn
            flat
            no-caps
            label="Dakwah"
            color="dark"
            class="nav-btn"
            :class="{ 'text-primary text-weight-bold': isDakwahActive }"
          >
            <q-icon name="arrow_drop_down" size="20px" class="q-ml-xs" />
            <q-menu anchor="bottom left" self="top left" class="dakwah-menu">
              <q-list dense style="min-width: 200px">
                <q-item
                  v-for="sub in dakwahSubMenu"
                  :key="sub.name"
                  clickable
                  v-close-popup
                  :to="sub.to"
                  active-class="text-primary"
                >
                  <q-item-section avatar>
                    <q-icon :name="sub.icon" color="primary" size="20px" />
                  </q-item-section>
                  <q-item-section>{{ sub.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Pendidikan Dropdown -->
          <q-btn
            flat
            no-caps
            label="Pendidikan"
            color="dark"
            class="nav-btn"
            :class="{ 'text-primary text-weight-bold': isPendidikanActive }"
          >
            <q-icon name="arrow_drop_down" size="20px" class="q-ml-xs" />
            <q-menu anchor="bottom left" self="top left">
              <q-list dense style="min-width: 220px">
                <q-item
                  v-for="sub in pendidikanSubMenu"
                  :key="sub.to"
                  clickable
                  v-close-popup
                  :to="sub.to"
                  active-class="text-primary"
                >
                  <q-item-section avatar>
                    <q-icon :name="sub.icon" :color="sub.color" size="20px" />
                  </q-item-section>
                  <q-item-section>{{ sub.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Sosial Dropdown -->
          <q-btn
            flat
            no-caps
            label="Sosial"
            color="dark"
            class="nav-btn"
            :class="{ 'text-primary text-weight-bold': isSosialActive }"
          >
            <q-icon name="arrow_drop_down" size="20px" class="q-ml-xs" />
            <q-menu anchor="bottom left" self="top left">
              <q-list dense style="min-width: 230px">
                <q-item
                  v-for="sub in sosialSubMenu"
                  :key="sub.to"
                  clickable
                  v-close-popup
                  :to="sub.to"
                  active-class="text-primary"
                >
                  <q-item-section avatar>
                    <q-icon :name="sub.icon" :color="sub.color" size="20px" />
                  </q-item-section>
                  <q-item-section>{{ sub.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Profil Dropdown -->
          <q-btn
            flat
            no-caps
            label="Profil"
            color="dark"
            class="nav-btn"
            :class="{ 'text-primary text-weight-bold': isProfilActive }"
          >
            <q-icon name="arrow_drop_down" size="20px" class="q-ml-xs" />
            <q-menu anchor="bottom left" self="top left">
              <q-list dense style="min-width: 220px">
                <q-item
                  v-for="sub in profilSubMenu"
                  :key="sub.to"
                  clickable
                  v-close-popup
                  :to="sub.to"
                  active-class="text-primary"
                >
                  <q-item-section avatar>
                    <q-icon :name="sub.icon" :color="sub.color" size="20px" />
                  </q-item-section>
                  <q-item-section>{{ sub.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Usaha Dropdown -->
          <q-btn
            flat
            no-caps
            label="Usaha"
            color="dark"
            class="nav-btn"
            :class="{ 'text-primary text-weight-bold': isUsahaActive }"
          >
            <q-icon name="arrow_drop_down" size="20px" class="q-ml-xs" />
            <q-menu anchor="bottom left" self="top left">
              <q-list dense style="min-width: 200px">
                <q-item
                  v-for="sub in usahaSubMenu"
                  :key="sub.to"
                  clickable
                  v-close-popup
                  :to="sub.to"
                  active-class="text-primary"
                >
                  <q-item-section avatar>
                    <q-icon :name="sub.icon" :color="sub.color" size="20px" />
                  </q-item-section>
                  <q-item-section>{{ sub.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

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
          v-for="item in simpleNavItems"
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

        <!-- Dakwah sub-menu in mobile -->
        <q-expansion-item
          icon="mosque"
          label="Dakwah"
          expand-separator
          :header-class="isDakwahActive ? 'text-primary text-weight-bold' : ''"
        >
          <q-item
            v-for="sub in dakwahSubMenu"
            :key="sub.name"
            clickable
            v-ripple
            :to="sub.to"
            class="q-pl-xl"
            @click="drawer = false"
          >
            <q-item-section avatar>
              <q-icon :name="sub.icon" color="primary" size="20px" />
            </q-item-section>
            <q-item-section>{{ sub.label }}</q-item-section>
          </q-item>
        </q-expansion-item>

        <!-- Pendidikan sub-menu in mobile -->
        <q-expansion-item
          icon="school"
          label="Pendidikan"
          expand-separator
          :header-class="isPendidikanActive ? 'text-primary text-weight-bold' : ''"
        >
          <q-item
            v-for="sub in pendidikanSubMenu"
            :key="sub.to"
            clickable
            v-ripple
            :to="sub.to"
            class="q-pl-xl"
            @click="drawer = false"
          >
            <q-item-section avatar>
              <q-icon :name="sub.icon" :color="sub.color" size="20px" />
            </q-item-section>
            <q-item-section>{{ sub.label }}</q-item-section>
          </q-item>
        </q-expansion-item>

        <!-- Sosial sub-menu in mobile -->
        <q-expansion-item
          icon="diversity_3"
          label="Sosial"
          expand-separator
          :header-class="isSosialActive ? 'text-primary text-weight-bold' : ''"
        >
          <q-item
            v-for="sub in sosialSubMenu"
            :key="sub.to"
            clickable
            v-ripple
            :to="sub.to"
            class="q-pl-xl"
            @click="drawer = false"
          >
            <q-item-section avatar>
              <q-icon :name="sub.icon" :color="sub.color" size="20px" />
            </q-item-section>
            <q-item-section>{{ sub.label }}</q-item-section>
          </q-item>
        </q-expansion-item>

        <!-- Profil sub-menu in mobile -->
        <q-expansion-item
          icon="account_balance"
          label="Profil"
          expand-separator
          :header-class="isProfilActive ? 'text-primary text-weight-bold' : ''"
        >
          <q-item
            v-for="sub in profilSubMenu"
            :key="sub.to"
            clickable
            v-ripple
            :to="sub.to"
            class="q-pl-xl"
            @click="drawer = false"
          >
            <q-item-section avatar>
              <q-icon :name="sub.icon" :color="sub.color" size="20px" />
            </q-item-section>
            <q-item-section>{{ sub.label }}</q-item-section>
          </q-item>
        </q-expansion-item>

        <!-- Usaha sub-menu in mobile -->
        <q-expansion-item
          icon="storefront"
          label="Usaha"
          expand-separator
          :header-class="isUsahaActive ? 'text-primary text-weight-bold' : ''"
        >
          <q-item
            v-for="sub in usahaSubMenu"
            :key="sub.to"
            clickable
            v-ripple
            :to="sub.to"
            class="q-pl-xl"
            @click="drawer = false"
          >
            <q-item-section avatar>
              <q-icon :name="sub.icon" :color="sub.color" size="20px" />
            </q-item-section>
            <q-item-section>{{ sub.label }}</q-item-section>
          </q-item>
        </q-expansion-item>

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
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import FooterComp from 'src/components/FooterComp.vue';

const drawer = ref(false);
const route = useRoute();

const simpleNavItems = [
  { name: 'home', label: 'Beranda', to: '/', icon: 'home' },
  { name: 'artikel', label: 'Artikel', to: '/artikel', icon: 'article' },
  { name: 'kontak', label: 'Kontak', to: '/kontak', icon: 'contact_mail' },
];

const dakwahSubMenu = [
  { name: 'kajian', label: 'Kajian Ilmiyyah', to: '/kajian', icon: 'menu_book' },
  { name: 'mias-tv', label: 'Mias TV', to: '/dakwah/mias-tv', icon: 'live_tv' },
  { name: 'kegiatan-ramadhan', label: 'Kegiatan Ramadhan', to: '/dakwah/kegiatan-ramadhan', icon: 'auto_awesome' },
  { name: 'sholat-ied', label: 'Sholat Ied', to: '/dakwah/sholat-ied', icon: 'star' },
];

const sosialSubMenu = [
  { label: 'Santunan Anak Yatim',    to: '/sosial/santunan-anak-yatim', icon: 'child_care',        color: 'indigo' },
  { label: 'Air Galon Gratis',        to: '/sosial/air-galon-gratis',    icon: 'water_drop',        color: 'cyan-8' },
  { label: 'Layanan Kes. Ibu & Anak', to: '/sosial/layanan-kesehatan',   icon: 'health_and_safety', color: 'green-8' },
  { label: 'Armalah & Al Miskin',     to: '/sosial/armalah-miskin',      icon: 'handshake',         color: 'purple' },
  { label: 'Bantuan Pengobatan',      to: '/sosial/bantuan-pengobatan',  icon: 'medication',        color: 'red-8' },
  { label: 'Zakat Maal',              to: '/sosial/zakat-maal',          icon: 'paid',              color: 'orange-9' },
];

const pendidikanSubMenu = [
  { label: 'Tahsin Ikhwan',      to: '/pendidikan/tahsin-ikhwan',      icon: 'auto_stories', color: 'blue-9'   },
  { label: 'Tahsin Akhwat',      to: '/pendidikan/tahsin-akhwat',      icon: 'auto_stories', color: 'purple-9' },
  { label: 'Bahasa Arab Ikhwan', to: '/pendidikan/bahasa-arab-ikhwan', icon: 'translate',    color: 'green-8'  },
  { label: 'Bahasa Arab Akhwat', to: '/pendidikan/bahasa-arab-akhwat', icon: 'translate',    color: 'red-8'    },
  { label: 'TPQ',                to: '/pendidikan/tpq',                icon: 'child_care',   color: 'orange-9' },
];

const usahaSubMenu = [
  { label: 'Umroh',     to: '/usaha/umroh',     icon: 'flight',     color: 'green-8'  },
  { label: 'Mias Mart', to: '/usaha/mias-mart', icon: 'storefront', color: 'blue-grey-8' },
];

const profilSubMenu = [
  { label: 'Sejarah',             to: '/profil/sejarah',   icon: 'history_edu',  color: 'brown-7'  },
  { label: 'Visi & Misi',         to: '/profil/visi-misi', icon: 'verified',     color: 'blue-8'   },
  { label: 'Fasilitas',           to: '/profil/fasilitas', icon: 'apartment',    color: 'blue-grey-7' },
  { label: 'Struktur Organisasi', to: '/profil/struktur',  icon: 'account_tree', color: 'purple-8' },
  { label: 'Pemateri',            to: '/profil/pemateri',  icon: 'auto_stories', color: 'deep-orange-8' },
];

const dakwahRouteNames = ['kajian', 'kajian-detail', 'mias-tv', 'kegiatan-ramadhan', 'sholat-ied'];
const isDakwahActive = computed(() => dakwahRouteNames.includes(route.name));
const isPendidikanActive = computed(() => route.name === 'pendidikan');
const isUsahaActive   = computed(() => ['umroh', 'mias-mart'].includes(route.name));
const isSosialActive  = computed(() => route.name === 'sosial-program');
const isProfilActive  = computed(() => ['profil-sejarah','profil-visi-misi','profil-fasilitas','profil-struktur','profil-pemateri'].includes(route.name));
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
