<template>
  <div>
    <!-- Loading Skeleton -->
    <div v-if="loading" class="row q-col-gutter-sm">
      <div v-for="i in 6" :key="i" class="col-4">
        <q-skeleton type="rect" height="80px" class="rounded-xl" />
      </div>
    </div>

    <!-- Jadwal Grid -->
    <div v-else-if="jadwal" class="row q-col-gutter-sm">
      <div
        v-for="(waktu, name) in jadwalDisplay"
        :key="name"
        class="col-6 col-sm-4 col-md-2"
      >
        <q-card
          flat
          :class="[
            'rounded-xl text-center q-pa-xs cursor-pointer jadwal-card',
            isCurrentPrayer(name) ? 'bg-primary text-white' : 
            isNextPrayer(name) ? 'bg-orange-1 border-orange' : 'bg-white'
          ]"
        >
          <q-card-section class="q-pa-md">
            <div class="text-caption text-weight-bold" :class="isCurrentPrayer(name) ? 'text-white' : isNextPrayer(name) ? 'text-orange-9' : 'text-grey-6'">
              {{ name }}
            </div>
            <div class="text-h6 text-weight-bold q-mt-xs">{{ waktu }}</div>
            <q-badge
              v-if="isCurrentPrayer(name)"
              color="white"
              text-color="primary"
              label="Sekarang"
              class="q-mt-sm"
            />
            <q-badge
              v-if="isNextPrayer(name)"
              color="orange"
              text-color="white"
              label="Selanjutnya"
              class="q-mt-sm"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Info Lokasi & Tanggal -->
    <div v-if="jadwal" class="row items-center justify-between q-mt-md text-caption text-grey-6">
      <div>
        <q-icon name="location_on" size="14px" class="q-mr-xs" />
        Depok, Jawa Barat · {{ todayDate }}
      </div>
      <div>
        Sumber: Aladhan API
        <q-btn flat dense no-caps icon="refresh" size="xs" @click="fetchJadwal" class="q-ml-xs" />
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="text-center q-py-md">
      <q-icon name="wifi_off" color="grey-5" size="40px" />
      <p class="text-grey-6 text-caption q-mt-sm">Gagal memuat jadwal sholat</p>
      <q-btn flat no-caps label="Coba lagi" @click="fetchJadwal" color="primary" size="sm" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const jadwal = ref(null);
const loading = ref(false);
const error = ref(false);

// Depok coordinates (approximate)
const LAT = -6.4025;
const LON = 106.7942;

const prayerOrder = ['Subuh', 'Syuruq', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];

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

const todayDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
});

const isCurrentPrayer = (name) => {
  if (!jadwal.value) return false;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const times = jadwalDisplay.value;

  const getMinutes = (timeStr) => {
    if (!timeStr) return -1;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const prayers = prayerOrder.map((p) => ({ name: p, minutes: getMinutes(times[p]) }));

  for (let i = 0; i < prayers.length; i++) {
    const current = prayers[i];
    const next = prayers[i + 1];
    if (nowMinutes >= current.minutes && (!next || nowMinutes < next.minutes)) {
      return name === current.name;
    }
  }
  return false;
};

const isNextPrayer = (name) => {
  if (!jadwal.value) return false;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const times = jadwalDisplay.value;

  const getMinutes = (timeStr) => {
    if (!timeStr) return -1;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const prayers = prayerOrder.map((p) => ({ name: p, minutes: getMinutes(times[p]) }));

  for (let i = 0; i < prayers.length; i++) {
    const current = prayers[i];
    const next = prayers[i + 1];
    if (nowMinutes >= current.minutes && (!next || nowMinutes < next.minutes)) {
      // Return true if this is the next prayer after current
      return next && name === next.name;
    }
  }
  
  // If we're past all prayers, the next one is Subuh tomorrow
  if (nowMinutes >= prayers[prayers.length - 1].minutes) {
    return name === 'Subuh';
  }
  
  return false;
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

onMounted(fetchJadwal);
</script>

<style scoped>
.jadwal-card {
  transition: all 0.2s ease;
}
.jadwal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(27, 122, 74, 0.15);
}
.border-orange {
  border: 2px solid #f2711c;
}
</style>
