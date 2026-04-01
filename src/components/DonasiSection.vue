<template>
  <section class="donasi-section text-white q-py-xl text-center">
    <div class="q-px-md" style="max-width: 700px; margin: 0 auto">
      <q-icon name="volunteer_activism" size="56px" class="q-mb-md" style="opacity: 0.9" />
      <h2 class="text-h4 text-weight-bold q-mb-md">Dukung Pembangunan Masjid</h2>
      <p class="text-body1 q-mb-xl opacity-85" style="line-height: 1.8">
        "Barang siapa membangun masjid karena Allah, maka Allah akan membangunkan untuknya yang semisalnya di Surga."
        <br />
        <em style="opacity: 0.8">– HR. Bukhari &amp; Muslim</em>
      </p>

      <div class="row q-gutter-md justify-center q-mb-xl">
        <q-btn
          unelevated size="lg" no-caps label="Donasi Sekarang" to="/donasi"
          color="white" text-color="primary" class="q-px-xl"
          style="border-radius: 10px; font-weight: 700" icon="volunteer_activism"
        />
        <q-btn
          outline size="lg" no-caps label="Lihat Progress" color="white" to="/donasi"
          class="q-px-xl" style="border-radius: 10px"
        />
      </div>

      <!-- Program Donasi dari API -->
      <template v-if="programs.length">
        <q-card
          v-for="prog in programs"
          :key="prog.id"
          flat class="rounded-xl bg-white text-dark q-pa-lg q-mb-md"
        >
          <div class="row items-center justify-between q-mb-sm">
            <span class="text-subtitle2 text-weight-bold text-primary">{{ prog.judul }}</span>
            <span class="text-caption text-grey-6">{{ progressPercent(prog) }}%</span>
          </div>
          <q-linear-progress
            rounded size="12px"
            :value="progressValue(prog)"
            color="primary" track-color="grey-3"
          />
          <div class="row justify-between q-mt-sm">
            <span class="text-caption text-grey-6">Terkumpul: {{ formatCurrency(prog.terkumpul) }}</span>
            <span class="text-caption text-grey-6">Target: {{ formatCurrency(prog.target) }}</span>
          </div>
          <div v-if="prog.deskripsi" class="text-caption text-grey-7 q-mt-xs text-left">{{ prog.deskripsi }}</div>
        </q-card>
      </template>

      <!-- Fallback jika belum ada program -->
      <q-card v-else flat class="rounded-xl bg-white text-dark q-pa-lg">
        <div class="row items-center justify-between q-mb-sm">
          <span class="text-subtitle2 text-weight-bold text-primary">Program Donasi</span>
          <span class="text-caption text-grey-6">-</span>
        </div>
        <q-linear-progress rounded size="12px" :value="0" color="primary" track-color="grey-3" />
        <div class="row justify-between q-mt-sm">
          <span class="text-caption text-grey-6">Belum ada program aktif</span>
        </div>
      </q-card>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from 'src/boot/axios';

const programs = ref([]);

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const progressValue = (prog) =>
  prog.target > 0 ? Math.min(Number(prog.terkumpul) / Number(prog.target), 1) : 0;

const progressPercent = (prog) =>
  prog.target > 0 ? Math.min(Math.round((Number(prog.terkumpul) / Number(prog.target)) * 100), 100) : 0;

onMounted(async () => {
  try {
    const { data } = await api.get('/donasi/program');
    programs.value = data.data;
  } catch {
    // tampilkan fallback
  }
});
</script>

<style scoped>
.donasi-section {
  background: linear-gradient(135deg, #1B7A4A 0%, #D4AF37 100%);
  padding: 80px 0;
}
</style>

