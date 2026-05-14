<template>
  <section
    ref="heroRef"
    class="hero-section flex items-center"
    :style="{ minHeight: '100vh' }"
  >
    <!-- Parallax sliding backgrounds -->
    <div class="hero-bg-layers">
      <div
        v-for="(banner, i) in banners"
        :key="banner.id"
        class="hero-bg-slide"
        :class="{ active: i === current, prev: i === prev }"
        :style="{
          backgroundImage: `url(/uploads/hero_banner/${banner.gambar})`,
          transform: `translateY(${parallaxY}px)`,
        }"
      />
      <!-- Fallback if no banners uploaded -->
      <div
        v-if="!banners.length"
        class="hero-bg-slide active"
        :style="{
          backgroundImage: `url(/images/hero-masjid.jpg)`,
          transform: `translateY(${parallaxY}px)`,
        }"
      />
    </div>

    <!-- Multi-layer gradient overlay -->
    <div class="hero-overlay" />
    <div class="hero-overlay-vignette" />

    <!-- Slide indicators -->
    <div v-if="banners.length > 1" class="hero-indicators">
      <button
        v-for="(_, i) in banners"
        :key="i"
        class="hero-dot"
        :class="{ active: i === current }"
        @click="goTo(i)"
      />
    </div>

    <div class="hero-content q-px-md text-white" style="max-width: 900px; margin: 0 auto; position: relative; z-index: 3">
      <!-- Bismillah -->
      <div class="bismillah text-center q-mb-lg animate-fade-down" style="font-size: clamp(20px, 4vw, 32px); font-family: 'Amiri', serif; opacity: 0.9">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </div>

      <h1
        class="text-weight-bold q-mb-md animate-fade-up"
        style="font-size: clamp(28px, 5vw, 56px); line-height: 1.2; text-shadow: 0 4px 20px rgba(0,0,0,0.5)"
      >
        Masjid Imam Asy Syafi'i
      </h1>

      <p
        class="q-mb-xl opacity-85 animate-fade-up delay-1"
        style="font-size: clamp(14px, 2vw, 20px); max-width: 600px; line-height: 1.8"
      >
        Pusat Kajian Islam Ilmiyyah sesuai Al-Qur'an dan As-Sunnah dengan Pemahaman para Sahabat yang memakmurkan umat
        di Kota Depok, Jawa Barat.
      </p>

      <div class="row q-gutter-md animate-fade-up delay-2">
        <q-btn
          unelevated
          size="lg"
          no-caps
          label="Lihat Kajian"
          to="/kajian"
          color="white"
          text-color="primary"
          class="q-px-xl hero-btn"
          style="border-radius: 10px; font-weight: 600"
        />
        <q-btn
          outline
          size="lg"
          no-caps
          label="Infaq"
          to="/donasi"
          color="white"
          class="q-px-xl hero-btn"
          style="border-radius: 10px; font-weight: 600"
        />
      </div>

      <!-- Stats -->
      <div class="row q-gutter-lg q-mt-xl animate-fade-up delay-3">
        <div v-for="stat in stats" :key="stat.label" class="text-center">
          <div class="text-h5 text-weight-bold">{{ stat.value }}</div>
          <div class="text-caption opacity-80">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Scroll Hint -->
    <div class="absolute-bottom flex justify-center q-pb-lg" style="z-index: 3">
      <q-icon name="keyboard_arrow_down" size="36px" color="white" class="scroll-bounce opacity-60" />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';

const heroStats = ref({
  totalKajian: 0,
  totalPemateri: 0,
  totalProgram: 0,
});

const stats = computed(() => [
  { value: '2012', label: 'Tahun Berdiri' },
  { value: `${heroStats.value.totalKajian || 0}+`, label: 'Total Kajian Rutin' },
  { value: `${heroStats.value.totalPemateri || 0}+`, label: 'Total Pemateri Kajian Rutin' },
  { value: `${heroStats.value.totalProgram || 0}+`, label: 'Total Program' },
]);

const banners = ref([]);
const current = ref(0);
const prev = ref(-1);
const parallaxY = ref(0);
const heroRef = ref(null);

let timer = null;

async function fetchBanners() {
  try {
    const res = await axios.get('/api/hero-banner/public');
    banners.value = res.data.data || [];
  } catch {
    banners.value = [];
  }
}

async function fetchHeroStats() {
  try {
    const res = await axios.get('/api/profil/hero-stats');
    heroStats.value = res.data.data || heroStats.value;
  } catch {
    // keep defaults
  }
}

function goTo(idx) {
  if (idx === current.value) return;
  prev.value = current.value;
  current.value = idx;
  resetTimer();
}

function nextSlide() {
  if (banners.value.length <= 1) return;
  prev.value = current.value;
  current.value = (current.value + 1) % banners.value.length;
}

function resetTimer() {
  clearInterval(timer);
  timer = setInterval(nextSlide, 6000);
}

function onScroll() {
  if (!heroRef.value) return;
  const rect = heroRef.value.getBoundingClientRect();
  if (rect.bottom > 0) {
    parallaxY.value = -window.scrollY * 0.35;
  }
}

onMounted(async () => {
  await Promise.all([fetchBanners(), fetchHeroStats()]);
  resetTimer();
  window.addEventListener('scroll', onScroll, { passive: true });
});

onBeforeUnmount(() => {
  clearInterval(timer);
  window.removeEventListener('scroll', onScroll);
});
</script>

<style scoped>
.hero-section {
  position: relative;
  overflow: hidden;
}

/* ─── Background slides ─────────────────────────────────────────────── */
.hero-bg-layers {
  position: absolute;
  inset: -60px 0 0 0;
  z-index: 0;
}
.hero-bg-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1.6s ease-in-out;
  will-change: opacity, transform;
}
.hero-bg-slide.active {
  opacity: 1;
}
.hero-bg-slide.prev {
  opacity: 0;
}

/* ─── Multi-layer gradient overlay ───────────────────────────────────── */
.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(27, 122, 74, 0.82) 0%, rgba(10, 60, 35, 0.65) 50%, rgba(0, 0, 0, 0.55) 100%);
  z-index: 1;
}
.hero-overlay-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.4) 100%);
  z-index: 1;
}

/* ─── Slide indicators ───────────────────────────────────────────────── */
.hero-indicators {
  position: absolute;
  bottom: 60px;
  right: 32px;
  display: flex;
  gap: 8px;
  z-index: 4;
}
.hero-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.7);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}
.hero-dot.active {
  background: #fff;
  transform: scale(1.3);
}

/* ─── Content ────────────────────────────────────────────────────────── */
.hero-content {
  width: 100%;
  padding-top: 80px;
  padding-bottom: 80px;
}
.bismillah {
  font-family: 'Amiri', 'Scheherazade New', serif;
}

/* ─── Fade-in animations ─────────────────────────────────────────────── */
.animate-fade-up {
  animation: fadeUp 1s ease-out both;
}
.animate-fade-down {
  animation: fadeDown 1s ease-out both;
}
.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }
.delay-3 { animation-delay: 0.6s; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Button hover glow ──────────────────────────────────────────────── */
.hero-btn {
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.hero-btn:hover {
  box-shadow: 0 0 24px rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
}

/* ─── Scroll bounce ──────────────────────────────────────────────────── */
.scroll-bounce {
  animation: bounce 2s infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(10px); }
}
</style>
