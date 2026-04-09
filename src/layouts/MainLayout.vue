<template>
  <q-layout view="lHh Lpr lFf">
    <!-- ─── Header ──────────────────────────────────────────────────────── -->
    <q-header
  elevated
  class="bg-white text-dark"
  style="position: fixed; top: 0; left: 0; right: 0; z-index: 1000;"
>
    <!-- <q-header elevated class="bg-white text-dark" style="box-shadow: 0 2px 8px rgba(0,0,0,0.1)"> -->
      <q-toolbar class="q-px-md" style="min-height: 50px">
        <!-- Logo -->
        <router-link to="/" class="flex items-center no-underline">
<q-avatar size="62px" class="q-mr-sm">
  <img src="/LOGO MIAS.png" style="width: 62px; height: 62px; object-fit: contain;" />
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

          <!-- Artikel -->
          <q-btn
            flat
            no-caps
            label="Artikel"
            to="/artikel"
            color="dark"
            class="nav-btn"
            :class="{ 'text-primary text-weight-bold': $route.name === 'artikel' }"
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

      <!-- ─── Jadwal Sholat Bar ───────────────────────────────────────── -->
      <div v-if="prayerItems.length" class="jadwal-bar-wrapper gt-xs" :class="{ 'jadwal-bar-hidden': !showJadwalBar }">
        <div class="jadwal-bar">
          <div class="jadwal-bar-inner">
            <div class="jadwal-label">
              <q-icon name="schedule" size="14px" class="q-mr-xs" />
              Jadwal Sholat Hari Ini — {{ prayerDateLabel }}
            </div>
            <div class="jadwal-times">
              <div
                v-for="(item, i) in prayerItems"
                :key="item.name"
                class="prayer-item row items-center no-wrap"
                :class="currentPrayer === item.name ? 'prayer-item--active' : ''"
              >
                <span class="text-caption q-mr-xs" style="opacity: 0.78; font-size: 11px">{{ item.name }}</span>
                <span class="text-weight-bold" style="font-size: 13px; letter-spacing: 0.4px">{{ item.time }}</span>
                <q-icon v-if="currentPrayer === item.name" name="notifications_active" size="12px" class="q-ml-xs" style="opacity: 0.9" />
                <span v-if="i < prayerItems.length - 1" class="q-mx-sm" style="opacity: 0.3; font-size: 16px">|</span>
              </div>
            </div>
          </div>
        </div>
      </div>
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

        <!-- Artikel -->
        <q-item clickable v-ripple to="/artikel" @click="drawer = false">
          <q-item-section avatar>
            <q-icon name="article" color="primary" />
          </q-item-section>
          <q-item-section>Artikel</q-item-section>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import FooterComp from 'src/components/FooterComp.vue';

// ─── Jadwal Sholat Bar ──────────────────────────────────────────────────────
const prayerTimingsRaw = ref(null);
const LAT = -6.4025;
const LON = 106.7942;

const prayerDateRaw = ref(null);

const prayerItems = computed(() => {
  if (!prayerTimingsRaw.value) return [];
  const t = prayerTimingsRaw.value;
  return [
    { name: 'Subuh',   time: t.Fajr?.slice(0, 5) },
    { name: 'Syuruq',  time: t.Sunrise?.slice(0, 5) },
    { name: 'Dzuhur',  time: t.Dhuhr?.slice(0, 5) },
    { name: 'Ashar',   time: t.Asr?.slice(0, 5) },
    { name: 'Maghrib', time: t.Maghrib?.slice(0, 5) },
    { name: 'Isya',    time: t.Isha?.slice(0, 5) },
  ];
});

const prayerDateLabel = computed(() => {
  const hariNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const bulanNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const d = prayerDateRaw.value;
  if (d) {
    const day = parseInt(d.day, 10);
    const month = parseInt(d.month.number, 10);
    const year = parseInt(d.year, 10);
    const dt = new Date(year, month - 1, day);
    return `Depok, Jawa Barat \u00B7 ${hariNames[dt.getDay()]}, ${day} ${bulanNames[month - 1]} ${year}`;
  }
  const now = new Date();
  return `Depok, Jawa Barat \u00B7 ${hariNames[now.getDay()]}, ${now.getDate()} ${bulanNames[now.getMonth()]} ${now.getFullYear()}`;
});

const currentPrayer = computed(() => {
  if (!prayerTimingsRaw.value) return null;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const toMin = (s) => { if (!s) return -1; const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const items = prayerItems.value;
  for (let i = 0; i < items.length; i++) {
    const cur = toMin(items[i].time);
    const nxt = i + 1 < items.length ? toMin(items[i + 1].time) : Infinity;
    if (nowMin >= cur && nowMin < nxt) return items[i].name;
  }
  return null;
});

onMounted(async () => {
  try {
    const today = new Date();
    const { data } = await axios.get(
      `https://api.aladhan.com/v1/timings/${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`,
      { params: { latitude: LAT, longitude: LON, method: 11 } }
    );
    prayerTimingsRaw.value = data.data.timings;
    prayerDateRaw.value = data.data.date?.gregorian || null;
  } catch { /* gagal muat jadwal sholat — bar disembunyikan */ }
});

// ─── Show/Hide Jadwal Bar on Scroll ─────────────────────────────────────────
const showJadwalBar = ref(true);
const onScroll = () => {
  showJadwalBar.value = window.scrollY <= 10;
};
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
});
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});

const drawer = ref(false);
const route = useRoute();

const simpleNavItems = [
  { name: 'home', label: 'Beranda', to: '/', icon: 'home' },
];

const dakwahSubMenu = [
  { name: 'kajian', label: 'Kajian Ilmiyyah', to: '/kajian', icon: 'menu_book' },
  { name: 'mias-tv', label: 'Mias TV', to: '/dakwah/mias-tv', icon: 'live_tv' },
  { name: 'kegiatan-ramadhan', label: 'Kegiatan Ramadhan', to: '/dakwah/kegiatan-ramadhan', icon: 'auto_awesome' },
  { name: 'kegiatan-qurban', label: 'Kegiatan Pemotongan Hewan Qurban', to: '/dakwah/kegiatan-qurban', icon: 'pets' },
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

const dakwahRouteNames = ['kajian', 'kajian-detail', 'mias-tv', 'kegiatan-ramadhan', 'kegiatan-qurban', 'sholat-ied'];
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

/* 🔥 HEADER HARUS RELATIVE */
.q-header {
  position: relative;
  overflow: visible;
}

/* 🔥 JADWAL JADI FLOATING */
.jadwal-bar-wrapper {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -71px;

  display: flex;
  justify-content: center;
  z-index: 10;

  transition: opacity 0.35s ease, transform 0.35s ease;
  opacity: 1;
  transform: translateY(0);
}
.jadwal-bar-hidden {
  opacity: 0;
  transform: translateY(-20px);
  pointer-events: none;
}

/* 🔥 BAR */
.jadwal-bar {
  width: min(62vw, 1020px);
  max-width: calc(100% - 48px);

background: linear-gradient(
  90deg,
  rgba(22, 94, 181, 0.7),
  rgba(30, 99, 183, 0.7)
);
  color: #ffffff;

  border-radius: 0 0 9999px 9999px;

  padding: 8px 40px 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: 0 12px 28px rgba(20, 60, 160, 0.25);
}
.jadwal-bar-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.jadwal-label {
  font-size: 11px;
  opacity: 0.88;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  white-space: nowrap;
}
.jadwal-times {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

/* ITEM */
.prayer-item {
  padding: 0 8px;
}

/* ACTIVE */
.prayer-item--active {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  padding: 3px 12px;
}

/* RESPONSIVE */
@media (max-width: 1023px) {
  .jadwal-bar {
    width: min(86vw, 720px);
    padding: 8px 20px 12px;
  }
}
</style>
