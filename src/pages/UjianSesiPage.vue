<template>
  <q-page class="bg-grey-1 ujian-sesi">
    <!-- ─── Loading ──────────────────────────────────────────────────────── -->
    <div v-if="loading" class="flex flex-center" style="height:100vh">
      <q-spinner size="48px" color="primary" />
    </div>

    <!-- ─── Error ────────────────────────────────────────────────────────── -->
    <div v-else-if="sesiError" class="flex flex-center q-pa-md" style="height:100vh">
      <q-card flat bordered class="q-pa-lg text-center full-width" style="max-width:400px">
        <q-icon name="error" color="negative" size="48px" />
        <div class="text-h6 q-mt-md">{{ sesiError }}</div>
        <q-btn unelevated color="primary" label="Kembali" class="q-mt-lg" :to="{ name: 'ujian' }" />
      </q-card>
    </div>

    <!-- ─── Ujian Sudah Selesai ───────────────────────────────────────────── -->
    <div v-else-if="sesiData?.status === 'SELESAI'" class="flex flex-center q-pa-md" style="height:100vh">
      <q-card flat bordered class="q-pa-lg text-center full-width" style="max-width:400px">
        <q-icon name="check_circle" color="positive" size="48px" />
        <div class="text-h6 q-mt-md">Ujian telah dikumpulkan</div>
        <q-btn unelevated color="primary" label="Lihat Hasil" class="q-mt-lg"
          :to="{ name: 'ujian-hasil', params: { pesertaId: route.params.pesertaId } }" />
      </q-card>
    </div>

    <!-- ─── Ujian Aktif ───────────────────────────────────────────────────── -->
    <template v-else-if="sesiData">
      <!-- Top Bar (sticky) -->
      <div class="ujian-topbar row items-center bg-primary text-white q-px-md q-py-sm shadow-2">
        <div class="col ellipsis">
          <div class="text-weight-bold text-body1 ellipsis">{{ sesiData.ujian.judul }}</div>
          <div class="text-caption" style="opacity:.85">{{ sesiData.namaLengkap }}</div>
        </div>
        <div class="row items-center q-gutter-xs timer-chip" :class="timerClass">
          <q-icon name="timer" size="22px" />
          <div class="text-weight-bold">{{ timerDisplay }}</div>
        </div>
      </div>

      <!-- Progress bar (sticky, tepat di bawah topbar) -->
      <div class="ujian-progress bg-white q-px-md q-py-xs row items-center">
        <div class="text-caption text-grey-7">Soal {{ currentIndex + 1 }} / {{ sesiData.soal.length }}</div>
        <q-space />
        <q-linear-progress
          :value="answeredCount / sesiData.soal.length"
          color="positive"
          track-color="grey-3"
          style="width:40%; max-width:160px; border-radius:4px"
          size="8px"
        />
        <div class="text-caption text-grey-7 q-ml-sm">{{ answeredCount }}/{{ sesiData.soal.length }}</div>
      </div>

      <div class="row q-pa-md q-col-gutter-md ujian-content">
        <!-- ─ Kolom Soal ───────────────────────────────────────────────── -->
        <div class="col-12 col-md-8">
          <q-card flat bordered class="q-pa-md q-pa-md-lg">
            <!-- Nomor soal + bobot -->
            <div class="row items-center q-mb-md">
              <q-badge color="primary" class="q-px-sm q-py-xs">Soal {{ currentIndex + 1 }}</q-badge>
              <q-space />
              <span class="text-caption text-grey-6">Bobot: {{ currentSoal.bobot }}</span>
            </div>

            <!-- Teks Soal -->
            <div class="soal-teks q-mb-lg">
              <arabic-text :text="currentSoal.teks" />
            </div>

            <!-- Pilihan Jawaban (touch target besar) -->
            <div class="q-gutter-sm">
              <q-card
                v-for="opt in pilihanOptions(currentSoal)"
                :key="opt.value"
                flat
                bordered
                clickable
                class="pilihan-card"
                :class="{ 'pilihan-selected': jawabanSaat[currentSoal.id] === opt.value }"
                @click="pilih(currentSoal.id, opt.value)"
              >
                <div class="row items-center no-wrap q-pa-md">
                  <div class="pilihan-key" :class="{ 'pilihan-key-active': jawabanSaat[currentSoal.id] === opt.value }">
                    {{ opt.value }}
                  </div>
                  <div class="col pilihan-teks">
                    <arabic-text :text="opt.text" />
                  </div>
                  <q-icon
                    v-if="jawabanSaat[currentSoal.id] === opt.value"
                    name="check_circle"
                    color="primary"
                    size="24px"
                  />
                </div>
              </q-card>
            </div>

            <!-- Navigasi (desktop/tablet) -->
            <div class="row justify-between q-mt-xl gt-xs">
              <q-btn flat icon="arrow_back" label="Sebelumnya" :disable="currentIndex === 0" @click="prev" />
              <q-btn
                v-if="currentIndex < sesiData.soal.length - 1"
                unelevated color="primary" icon-right="arrow_forward" label="Berikutnya"
                @click="next"
              />
              <q-btn
                v-else
                unelevated color="positive" icon="check" label="Kumpulkan"
                @click="confirmSubmit"
              />
            </div>
          </q-card>
        </div>

        <!-- ─ Navigasi Grid (desktop sidebar) ──────────────────────────── -->
        <div class="col-md-4 gt-sm">
          <q-card flat bordered class="q-pa-md" style="position:sticky; top:120px">
            <div class="text-caption text-grey-7 q-mb-sm text-weight-bold">Navigasi Soal</div>
            <div class="nav-grid">
              <q-btn
                v-for="(soal, idx) in sesiData.soal"
                :key="soal.id"
                :label="String(idx + 1)"
                size="md"
                :unelevated="currentIndex === idx"
                :flat="currentIndex !== idx"
                :color="navBtnColor(soal.id, idx)"
                :text-color="navBtnTextColor(soal.id, idx)"
                @click="currentIndex = idx"
                class="nav-grid-btn"
              />
            </div>
            <div class="row q-gutter-sm q-mt-md text-caption">
              <div><q-badge color="positive" class="q-mr-xs" />Dijawab</div>
              <div><q-badge color="grey-4" class="q-mr-xs" />Belum</div>
              <div><q-badge color="primary" class="q-mr-xs" />Aktif</div>
            </div>
            <q-separator class="q-my-md" />
            <q-btn unelevated color="positive" icon="check" label="Kumpulkan Jawaban" class="full-width" @click="confirmSubmit" />
          </q-card>
        </div>
      </div>

      <!-- ─ Bottom Nav Bar (mobile, sticky) ──────────────────────────────── -->
      <div class="ujian-bottombar lt-md row items-center bg-white shadow-up q-px-sm q-py-sm">
        <q-btn
          flat round dense
          icon="chevron_left"
          color="primary"
          size="lg"
          :disable="currentIndex === 0"
          @click="prev"
        />
        <q-btn
          flat no-caps
          icon="grid_view"
          label="Daftar Soal"
          color="primary"
          class="col"
          @click="navSheet = true"
        />
        <q-btn
          v-if="currentIndex < sesiData.soal.length - 1"
          flat round dense
          icon="chevron_right"
          color="primary"
          size="lg"
          @click="next"
        />
        <q-btn
          v-else
          unelevated no-caps
          icon="check"
          label="Kumpulkan"
          color="positive"
          @click="confirmSubmit"
        />
      </div>

      <!-- ─ Bottom Sheet Navigasi (mobile) ───────────────────────────────── -->
      <q-dialog v-model="navSheet" position="bottom">
        <q-card class="full-width" style="border-radius:16px 16px 0 0">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-subtitle1 text-weight-bold">Navigasi Soal</div>
            <q-space />
            <q-btn flat round dense icon="close" v-close-popup />
          </q-card-section>
          <q-card-section>
            <div class="nav-grid-mobile">
              <q-btn
                v-for="(soal, idx) in sesiData.soal"
                :key="soal.id"
                :label="String(idx + 1)"
                :unelevated="currentIndex === idx"
                :flat="currentIndex !== idx"
                :color="navBtnColor(soal.id, idx)"
                :text-color="navBtnTextColor(soal.id, idx)"
                @click="currentIndex = idx; navSheet = false"
                class="nav-grid-btn"
              />
            </div>
            <div class="row q-gutter-md q-mt-md text-caption">
              <div><q-badge color="positive" class="q-mr-xs" />Dijawab</div>
              <div><q-badge color="grey-4" class="q-mr-xs" />Belum</div>
              <div><q-badge color="primary" class="q-mr-xs" />Aktif</div>
            </div>
            <q-btn unelevated color="positive" icon="check" label="Kumpulkan Jawaban" class="full-width q-mt-md" @click="navSheet = false; confirmSubmit()" />
          </q-card-section>
        </q-card>
      </q-dialog>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import ArabicText from 'components/ArabicText.vue';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const loading = ref(true);
const sesiData = ref(null);
const sesiError = ref('');
const currentIndex = ref(0);
const jawabanSaat = ref({}); // { soalId: 'A' }
const navSheet = ref(false);
let timerInterval = null;
let sisaDetik = ref(0);
let autosaveTimeout = null;

// ─── Timer ─────────────────────────────────────────────────────────────────
const timerDisplay = computed(() => {
  const s = sisaDetik.value;
  if (s <= 0) return '00:00';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
});

const timerClass = computed(() => sisaDetik.value <= 300 ? 'timer-danger' : '');

const startTimer = () => {
  timerInterval = setInterval(() => {
    if (sisaDetik.value > 0) {
      sisaDetik.value--;
    } else {
      clearInterval(timerInterval);
      doSubmit(true);
    }
  }, 1000);
};

// ─── Soal ──────────────────────────────────────────────────────────────────
const currentSoal = computed(() => sesiData.value?.soal[currentIndex.value] || {});

const pilihanOptions = (soal) => [
  { text: soal.pilihanA, value: 'A' },
  { text: soal.pilihanB, value: 'B' },
  { text: soal.pilihanC, value: 'C' },
  { text: soal.pilihanD, value: 'D' },
];

const answeredCount = computed(() => Object.keys(jawabanSaat.value).length);

const navBtnColor = (soalId, idx) => {
  if (idx === currentIndex.value) return 'primary';
  return jawabanSaat.value[soalId] ? 'positive' : 'grey-4';
};
const navBtnTextColor = (soalId, idx) => {
  if (idx === currentIndex.value) return 'white';
  return jawabanSaat.value[soalId] ? 'white' : 'grey-9';
};

const prev = () => { if (currentIndex.value > 0) currentIndex.value--; };
const next = () => { if (currentIndex.value < sesiData.value.soal.length - 1) currentIndex.value++; };

// ─── Pilih jawaban + Autosave ───────────────────────────────────────────────
const pilih = (soalId, jawaban) => {
  jawabanSaat.value[soalId] = jawaban;
  autosave(soalId, jawaban);
};

const autosave = (soalId, jawaban) => {
  clearTimeout(autosaveTimeout);
  autosaveTimeout = setTimeout(async () => {
    try {
      await api.put(`/ujian/sesi/${route.params.pesertaId}/jawab`, { soalId, jawaban });
    } catch { /* silent */ }
  }, 500);
};

// ─── Submit ────────────────────────────────────────────────────────────────
const confirmSubmit = () => {
  const belum = sesiData.value.soal.length - answeredCount.value;
  $q.dialog({
    title: 'Kumpulkan Jawaban',
    message: belum > 0
      ? `Masih ada ${belum} soal yang belum dijawab. Yakin ingin mengumpulkan?`
      : 'Yakin ingin mengumpulkan semua jawaban?',
    cancel: { flat: true, label: 'Kembali' },
    ok: { unelevated: true, color: 'positive', label: 'Kumpulkan' },
    persistent: true,
  }).onOk(() => doSubmit(false));
};

const doSubmit = async (autoTime = false) => {
  if (autoTime) {
    $q.notify({ type: 'warning', message: 'Waktu habis! Jawaban dikumpulkan otomatis.' });
  }
  clearInterval(timerInterval);
  try {
    const { data } = await api.post(`/ujian/sesi/${route.params.pesertaId}/submit`);
    if (data.success) {
      router.push({ name: 'ujian-hasil', params: { pesertaId: route.params.pesertaId } });
    }
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.message || 'Gagal mengumpulkan.' });
  }
};

// ─── Load sesi ────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const { data } = await api.get(`/ujian/sesi/${route.params.pesertaId}`);
    if (!data.success) { sesiError.value = 'Sesi tidak valid.'; return; }
    sesiData.value = data.data;
    sisaDetik.value = data.data.sisaDetik;

    // restore jawaban tersimpan
    Object.assign(jawabanSaat.value, data.data.jawabanMap);

    if (sesiData.value.status === 'AKTIF') startTimer();
  } catch (err) {
    sesiError.value = err.response?.data?.message || 'Gagal memuat sesi ujian.';
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  clearInterval(timerInterval);
  clearTimeout(autosaveTimeout);
});
</script>

<style scoped>
.ujian-sesi {
  min-height: 100vh;
  padding-bottom: 80px; /* ruang untuk bottom bar mobile */
}

/* Top bar & progress sticky */
.ujian-topbar {
  position: sticky;
  top: 0;
  z-index: 100;
}
.ujian-progress {
  position: sticky;
  top: 56px;
  z-index: 99;
  border-bottom: 1px solid #e0e0e0;
}

.ujian-content {
  max-width: 1100px;
  margin: 0 auto;
}

/* Timer */
.timer-chip {
  font-size: 20px;
  padding: 2px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
}
.timer-chip.timer-danger {
  background: #c10015;
  animation: pulse 1s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Teks soal */
.soal-teks {
  font-size: 17px;
  line-height: 1.7;
  color: #1c1c1e;
}

/* Kartu pilihan jawaban */
.pilihan-card {
  border-radius: 12px;
  transition: all 0.15s ease;
  border-width: 2px;
}
.pilihan-card:hover {
  border-color: #1B7A4A;
}
.pilihan-selected {
  border-color: #1B7A4A !important;
  background: #e8f5ee;
}
.pilihan-key {
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #eceff1;
  color: #37474f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  margin-right: 14px;
}
.pilihan-key-active {
  background: #1B7A4A;
  color: #fff;
}
.pilihan-teks {
  font-size: 16px;
  line-height: 1.6;
  word-break: break-word;
}

/* Grid navigasi */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 6px;
}
.nav-grid-mobile {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
  gap: 8px;
}
.nav-grid-btn {
  min-width: 0;
  padding: 0;
  height: 44px;
  font-weight: 600;
}

/* Bottom bar mobile */
.ujian-bottombar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  border-top: 1px solid #e0e0e0;
  gap: 4px;
}
.shadow-up {
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
}

/* Penyesuaian layar kecil */
@media (max-width: 599px) {
  .soal-teks { font-size: 18px; }
  .pilihan-teks { font-size: 17px; }
  .pilihan-key {
    width: 42px;
    height: 42px;
    font-size: 17px;
  }
  .timer-chip { font-size: 22px; }
}
</style>
