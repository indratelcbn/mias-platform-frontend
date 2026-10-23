<template>
  <q-card flat class="js-card">
    <!-- ── Header ─────────────────────────────────────────── -->
    <div class="js-head">
      <div class="js-head__loc">
        <q-icon name="place" size="18px" class="text-primary" />
        <div class="js-head__loc-text">
          <div class="js-head__city">Depok, Jawa Barat</div>
          <div class="js-head__date">{{ dateLine }}</div>
        </div>
      </div>
      <div class="js-head__clock">
        <div class="js-head__time-label">Jam saat ini</div>
        <div class="js-head__time">{{ clockText }} WIB</div>
        <q-btn
          flat
          round
          dense
          size="sm"
          color="primary"
          icon="refresh"
          :loading="loading"
          @click="refreshAll"
          Label="Perbaruixxx"
        >
          <q-tooltip>Perbarui jadwal</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- ── Error ──────────────────────────────────────────── -->
    <div v-if="error" class="js-error">
      <q-icon name="wifi_off" size="34px" class="text-grey-5" />
      <p class="text-grey-6 text-caption q-mt-sm q-mb-sm">Gagal memuat jadwal sholat</p>
      <q-btn flat no-caps dense label="Coba lagi" color="primary" size="sm" @click="refreshAll" />
    </div>

    <template v-else>
      <!-- ── Next prayer + countdown ──────────────────────── -->
      <q-skeleton v-if="loading" type="rect" height="64px" class="js-skeleton js-next-skeleton" />
      <div v-else-if="nextPrayer" class="js-next">
        <div class="js-next__left">
          <span class="js-next__dot"></span>
          <div class="js-next__meta">
            <div class="js-next__label">Menuju {{ nextPrayer.name }}</div>
            <div class="js-next__at">pukul {{ nextPrayer.time }} WIB</div>
          </div>
        </div>
        <div class="js-next__count">
          <div class="js-next__val">{{ countdown.text }}</div>
          <div class="js-next__unit">jam&nbsp;·&nbsp;menit&nbsp;·&nbsp;detik</div>
        </div>
      </div>

      <!-- ── Prayer grid ──────────────────────────────────── -->
      <div class="prayer-grid">
        <template v-if="loading">
          <q-skeleton v-for="i in 6" :key="i" type="rect" height="92px" class="js-skeleton" />
        </template>
        <template v-else>
          <div
            v-for="p in prayerCells"
            :key="p.name"
            class="prayer-cell"
            :class="{
              'prayer-cell--now': p.name === currentPrayerName,
              'prayer-cell--next': p.name === nextPrayerName,
            }"
          >
            <q-icon :name="p.icon" size="20px" class="prayer-cell__icon" />
            <div class="prayer-cell__name">{{ p.name }}</div>
            <div class="prayer-cell__time">{{ p.time ? `${p.time} WIB` : '--:--' }}</div>
            <span v-if="p.name === currentPrayerName" class="prayer-cell__tag">Sekarang</span>
            <span v-else-if="p.name === nextPrayerName" class="prayer-cell__tag prayer-cell__tag--next">Berikutnya</span>
          </div>
        </template>
      </div>
    </template>

    <!-- ── Kalender Sunnah ──────────────────────────────────── -->
    <div v-if="sunnahLoading || sunnah" class="js-sunnah">
      <div class="js-sunnah__head">
        <q-icon name="auto_awesome" size="16px" class="text-primary" />
        <span class="js-sunnah__title">Kalender Sunnah Hari Ini</span>
        <span v-if="hijriShort" class="js-sunnah__hijri">{{ hijriShort }}</span>
      </div>

      <div v-if="sunnahLoading" class="js-sunnah__list">
        <q-skeleton type="rect" height="40px" class="js-skeleton" />
      </div>

      <div v-else-if="sunnahEvents.length" class="js-sunnah__list">
        <div v-for="(ev, i) in sunnahEvents" :key="i" class="js-sunnah__item">
          <span class="js-sunnah__chip" :class="'js-sunnah__chip--' + ev.type">
            <q-icon :name="eventMeta(ev.type).icon" size="13px" />
            {{ eventMeta(ev.type).text }}
          </span>
          <div class="js-sunnah__body">
            <div class="js-sunnah__label">{{ ev.label }}</div>
            <div v-if="ev.dalil" class="js-sunnah__dalil">
              <q-icon name="menu_book" size="12px" />{{ ev.dalil }}
            </div>
          </div>
        </div>
      </div>

      <div v-else class="js-sunnah__empty">Tidak ada amalan khusus untuk hari ini.</div>
    </div>

    <!-- ── Footer ───────────────────────────────────────────── -->
    <div class="js-foot">Sumber: Aladhan API &amp; https://sunnah.amanahagent.cloud</div>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const jadwal = ref(null);
const loading = ref(false);
const error = ref(false);

const sunnah = ref(null);
const sunnahLoading = ref(false);

const now = ref(new Date());
let clockTimer = null;

const SUNNAH_API_KEY = import.meta.env.VITE_SUNNAH_API_KEY;

// Koordinat Depok (perkiraan)
const LAT = -6.4025;
const LON = 106.7942;

const prayerOrder = ['Subuh', 'Syuruq', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];
const prayerIcons = {
  Subuh: 'wb_twilight',
  Syuruq: 'wb_sunny',
  Dzuhur: 'light_mode',
  Ashar: 'wb_cloudy',
  Maghrib: 'wb_twilight',
  Isya: 'dark_mode',
};

const pad = (n) => String(n).padStart(2, '0');

const toMinutes = (timeStr) => {
  if (!timeStr) return -1;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const jadwalDisplay = computed(() => {
  if (!jadwal.value) return {};
  const t = jadwal.value.timings;
  return {
    Subuh: t.Fajr?.slice(0, 5),
    Syuruq: t.Sunrise?.slice(0, 5),
    Dzuhur: t.Dhuhr?.slice(0, 5),
    Ashar: t.Asr?.slice(0, 5),
    Maghrib: t.Maghrib?.slice(0, 5),
    Isya: t.Isha?.slice(0, 5),
  };
});

const prayerList = computed(() =>
  prayerOrder.map((name) => {
    const time = jadwalDisplay.value[name];
    return { name, time, minutes: toMinutes(time) };
  })
);

const prayerCells = computed(() =>
  prayerList.value.map((p) => ({ ...p, icon: prayerIcons[p.name] }))
);

const nowMinutes = computed(() => now.value.getHours() * 60 + now.value.getMinutes());

const currentPrayerName = computed(() => {
  if (!jadwal.value) return null;
  const prayers = prayerList.value;
  const nm = nowMinutes.value;
  for (let i = 0; i < prayers.length; i++) {
    const cur = prayers[i];
    const next = prayers[i + 1];
    if (cur.minutes < 0) continue;
    if (nm >= cur.minutes && (!next || nm < next.minutes)) return cur.name;
  }
  return null;
});

const nextPrayer = computed(() => {
  if (!jadwal.value) return null;
  const prayers = prayerList.value.filter((p) => p.minutes >= 0);
  if (!prayers.length) return null;
  const nm = nowMinutes.value;
  const upcoming = prayers.find((p) => p.minutes > nm);
  if (upcoming) return { ...upcoming, tomorrow: false };
  return { ...prayers[0], tomorrow: true };
});

const nextPrayerName = computed(() => nextPrayer.value?.name ?? null);

const countdown = computed(() => {
  const np = nextPrayer.value;
  if (!np || !np.time) return { text: '--:--:--', hrs: 0, mins: 0, secs: 0 };
  const target = new Date(now.value);
  const [h, m] = np.time.split(':').map(Number);
  target.setHours(h, m, 0, 0);
  if (np.tomorrow) target.setDate(target.getDate() + 1);
  const diff = Math.max(0, target - now.value);
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { text: `${pad(hrs)}:${pad(mins)}:${pad(secs)}`, hrs, mins, secs };
});

const clockText = computed(() => `${pad(now.value.getHours())}:${pad(now.value.getMinutes())}`);

const gregorianText = computed(() =>
  now.value.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
);

const hijriShort = computed(() =>
  sunnah.value
    ? `${sunnah.value.hijri.day} ${sunnah.value.hijri.monthName} ${sunnah.value.hijri.year} H`
    : ''
);

const dateLine = computed(() =>
  hijriShort.value ? `${gregorianText.value} · ${hijriShort.value}` : gregorianText.value
);

const sunnahEvents = computed(() => sunnah.value?.events ?? []);

const eventMeta = (type) => {
  const map = {
    puasa_wajib: { icon: 'event_available', text: 'Puasa Wajib' },
    puasa_sunnah: { icon: 'nights_stay', text: 'Puasa Sunnah' },
    larangan: { icon: 'block', text: 'Larangan' },
    amalan: { icon: 'volunteer_activism', text: 'Amalan' },
  };
  return map[type] ?? { icon: 'star', text: 'Sunnah' };
};

const fetchJadwal = async () => {
  loading.value = true;
  error.value = false;
  try {
    const today = new Date();
    const { data } = await axios.get(
      `https://api.aladhan.com/v1/timings/${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`,
      { params: { latitude: LAT, longitude: LON, method: 11 } }
    );
    jadwal.value = data.data;
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const fetchSunnah = async () => {
  if (!SUNNAH_API_KEY) return;
  sunnahLoading.value = true;
  try {
    const today = new Date();
    const date = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const { data } = await axios.get(
      'https://sunnah.amanahagent.cloud/api/v1/sunnah-calendar',
      { params: { date }, headers: { 'X-API-Key': SUNNAH_API_KEY } }
    );
    sunnah.value = data;
  } catch {
    sunnah.value = null;
  } finally {
    sunnahLoading.value = false;
  }
};

const refreshAll = () => {
  fetchJadwal();
  fetchSunnah();
};

onMounted(() => {
  refreshAll();
  clockTimer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
});
</script>

<style scoped>
/* ── Emerald & Ivory palette ─────────────────────────────── */
.js-card {
  --emerald: #1b7a4a;
  --emerald-2: #26a65b;
  --gold: #d4af37;
  --ivory: #fbf9f1;
  --ink: #233027;
  --muted: #728078;
  --line: rgba(27, 122, 74, 0.12);

  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: clamp(14px, 3vw, 20px);
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, var(--ivory) 100%);
  border: 1px solid var(--line);
  box-shadow: 0 8px 28px rgba(27, 122, 74, 0.08);
  overflow: hidden;
}

/* ── Header ──────────────────────────────────────────────── */
.js-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.js-head__loc {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.js-head__loc-text {
  min-width: 0;
}
.js-head__city {
  font-weight: 700;
  color: var(--ink);
  font-size: 0.95rem;
  line-height: 1.2;
}
.js-head__date {
  font-size: 0.72rem;
  color: var(--muted);
  line-height: 1.3;
}
.js-head__clock {
  display: flex;
  align-items: center;
  gap: 4px;
}
.js-head__time {
  font-weight: 700;
  font-size: 1rem;
  color: var(--emerald);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
}

/* ── Next prayer + countdown ─────────────────────────────── */
.js-next {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;
  margin-bottom: 14px;
  border-radius: 16px;
  color: #fff;
  background: linear-gradient(120deg, var(--emerald) 0%, var(--emerald-2) 100%);
  box-shadow: 0 6px 18px rgba(27, 122, 74, 0.25);
}
.js-next__left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.js-next__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.6);
  animation: js-pulse 2s infinite;
  flex-shrink: 0;
}
.js-next__label {
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.2;
}
.js-next__at {
  font-size: 0.72rem;
  opacity: 0.85;
}
.js-next__count {
  text-align: right;
  min-width: 0;
}
.js-next__val {
  font-weight: 800;
  font-size: clamp(1.35rem, 5vw, 1.7rem);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
}
.js-next__unit {
  font-size: 0.6rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.8;
  margin-top: 3px;
}

/* ── Prayer grid ─────────────────────────────────────────── */
.prayer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(84px, 1fr));
  gap: 8px;
}
.prayer-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 6px;
  min-width: 0;
  border-radius: 14px;
  background: #fff;
  border: 1px solid var(--line);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.prayer-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(27, 122, 74, 0.12);
}
.prayer-cell__icon {
  color: var(--emerald);
}
.prayer-cell__name {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: var(--muted);
  text-transform: uppercase;
}
.prayer-cell__time {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.prayer-cell__tag {
  margin-top: 2px;
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  color: var(--emerald);
}
.prayer-cell__tag--next {
  background: rgba(212, 175, 55, 0.18);
  color: #8a6d12;
}

/* current prayer */
.prayer-cell--now {
  background: linear-gradient(135deg, var(--emerald) 0%, var(--emerald-2) 100%);
  border-color: transparent;
  box-shadow: 0 8px 20px rgba(27, 122, 74, 0.28);
}
.prayer-cell--now .prayer-cell__icon,
.prayer-cell--now .prayer-cell__name,
.prayer-cell--now .prayer-cell__time {
  color: #fff;
}
.prayer-cell--now .prayer-cell__name {
  opacity: 0.9;
}

/* next prayer */
.prayer-cell--next {
  border: 1.5px solid var(--gold);
  background: rgba(212, 175, 55, 0.07);
}

/* ── Kalender Sunnah ─────────────────────────────────────── */
.js-sunnah {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed var(--line);
}
.js-sunnah__head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.js-sunnah__title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ink);
}
.js-sunnah__hijri {
  margin-left: auto;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--emerald);
  background: rgba(27, 122, 74, 0.08);
  padding: 2px 8px;
  border-radius: 999px;
}
.js-sunnah__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.js-sunnah__item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid var(--line);
}
.js-sunnah__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(27, 122, 74, 0.1);
  color: var(--emerald);
}
.js-sunnah__chip--puasa_sunnah {
  background: rgba(38, 166, 91, 0.12);
  color: #1f8f4f;
}
.js-sunnah__chip--puasa_wajib {
  background: rgba(212, 175, 55, 0.16);
  color: #8a6d12;
}
.js-sunnah__chip--larangan {
  background: rgba(193, 0, 21, 0.1);
  color: #c10015;
}
.js-sunnah__body {
  min-width: 0;
}
.js-sunnah__label {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.35;
}
.js-sunnah__dalil {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
  font-size: 0.7rem;
  color: var(--muted);
}
.js-sunnah__empty {
  font-size: 0.78rem;
  color: var(--muted);
}

/* ── Footer & states ─────────────────────────────────────── */
.js-foot {
  margin-top: 14px;
  text-align: center;
  font-size: 0.66rem;
  color: var(--muted);
}
.js-error {
  text-align: center;
  padding: 18px 0;
}
.js-skeleton {
  border-radius: 14px;
}
.js-next-skeleton {
  margin-bottom: 14px;
}

@keyframes js-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.55);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(212, 175, 55, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(212, 175, 55, 0);
  }
}

/* ── Compact breakpoints ─────────────────────────────────── */
@media (max-width: 420px) {
  .js-next {
    padding: 10px 12px;
  }
  .js-next__count {
    text-align: left;
  }
  .prayer-cell__time {
    font-size: 0.98rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .js-next__dot {
    animation: none;
  }
  .prayer-cell {
    transition: none;
  }
}
</style>
