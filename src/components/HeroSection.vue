<template>
  <section
    class="hero-section flex items-center"
    :style="{ minHeight: '100vh' }"
  >
    <div class="hero-overlay" />
    <div class="hero-content q-px-md text-white" style="max-width: 900px; margin: 0 auto; position: relative; z-index: 2">
      <!-- Bismillah -->
      <div class="bismillah text-center q-mb-lg" style="font-size: clamp(20px, 4vw, 32px); font-family: 'Amiri', serif; opacity: 0.9">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </div>

      <h1
        class="text-weight-bold q-mb-md"
        style="font-size: clamp(28px, 5vw, 56px); line-height: 1.2; text-shadow: 0 2px 8px rgba(0,0,0,0.3)"
      >
        Masjid Imam Asy Syafi'i
      </h1>

      <p
        class="q-mb-xl opacity-85"
        style="font-size: clamp(14px, 2vw, 20px); max-width: 600px; line-height: 1.8"
      >
        Pusat ibadah, dakwah, dan pendidikan Islam yang memakmurkan umat
        di Kota Depok, Jawa Barat.
      </p>

      <div class="row q-gutter-md">
        <q-btn
          unelevated
          size="lg"
          no-caps
          label="Lihat Kajian"
          to="/kajian"
          color="white"
          text-color="primary"
          class="q-px-xl"
          style="border-radius: 10px; font-weight: 600"
        />
        <q-btn
          outline
          size="lg"
          no-caps
          label="Donasi"
          to="/donasi"
          color="white"
          class="q-px-xl"
          style="border-radius: 10px; font-weight: 600"
        />
      </div>

      <!-- Stats -->
      <div class="row q-gutter-lg q-mt-xl">
        <div v-for="stat in stats" :key="stat.label" class="text-center">
          <div class="text-h5 text-weight-bold">{{ stat.value }}</div>
          <div class="text-caption opacity-80">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Scroll Hint -->
    <div class="absolute-bottom flex justify-center q-pb-lg" style="z-index: 2">
      <q-icon name="keyboard_arrow_down" size="36px" color="white" class="scroll-bounce opacity-60" />
    </div>
  </section>
</template>

<script setup>
const stats = [
  { value: '15+', label: 'Tahun Berdiri' },
  { value: '500+', label: 'Jamaah Tetap' },
  { value: '50+', label: 'Program Tahunan' },
  { value: '200+', label: 'Santri Tahfizh' },
];
</script>

<style scoped>
.hero-section {
  background-image: url('/images/hero-masjid.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(27, 122, 74, 0.85) 0%, rgba(0, 0, 0, 0.6) 100%);
  z-index: 1;
}
.hero-content {
  width: 100%;
  padding-top: 80px;
  padding-bottom: 80px;
}
.bismillah {
  font-family: 'Amiri', 'Scheherazade New', serif;
}
.scroll-bounce {
  animation: bounce 2s infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(10px); }
}
</style>
