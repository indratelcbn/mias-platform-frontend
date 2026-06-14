<template>
  <section class="donasi-section text-white q-py-xl text-center">
    <div class="q-px-md" style="max-width: 700px; margin: 0 auto">
      <q-icon name="volunteer_activism" size="56px" class="q-mb-md" style="opacity: 0.9" />
      <h2 class="text-h4 text-weight-bold q-mb-md">Dukung Pembangunan Masjid</h2>
      <p class="text-body1 q-mb-sm opacity-85" style="line-height: 1.8">
        "Barang siapa membangun masjid karena Allah, maka Allah akan membangunkan untuknya yang semisalnya di Surga."
        <br />
        <em style="opacity: 0.8">– HR. Bukhari &amp; Muslim</em>
      </p>

      <!-- Jumlah program aktif -->
      <div v-if="!loading && totalProgram > 0" class="text-caption q-mb-xl" style="opacity: 0.75">
        {{ totalProgram }} program aktif saat ini
      </div>
      <div v-else class="q-mb-xl" />

      <div class="row q-gutter-md justify-center q-mb-xl">
        <q-btn
          unelevated size="lg" no-caps label="Infaq Sekarang" to="/donasi"
          color="white" text-color="primary" class="q-px-xl"
          style="border-radius: 10px; font-weight: 700" icon="volunteer_activism"
        />
      </div>

      <!-- Skeleton loading -->
      <template v-if="loading">
        <q-skeleton type="text" width="120px" class="q-mx-auto q-mb-sm" dark />
        <q-skeleton v-for="i in 2" :key="'sk-' + i" height="130px" class="rounded-xl q-mb-md" dark />
      </template>

      <!-- Error state -->
      <q-banner v-else-if="fetchError" rounded class="bg-red-8 text-white q-mb-md">
        <template #avatar><q-icon name="error_outline" /></template>
        Gagal memuat data program. Silakan muat ulang halaman.
      </q-banner>

      <template v-else>
        <!-- Program Infaq dari API -->
        <template v-if="programs.length">
          <div class="text-subtitle1 text-weight-bold q-mb-sm" style="opacity: 0.9">
            <q-icon name="volunteer_activism" size="18px" class="q-mr-xs" />Program Infaq
          </div>
          <q-card
            v-for="prog in programs"
            :key="prog.id"
            flat class="rounded-xl bg-white text-dark q-pa-lg q-mb-md"
          >
            <!-- Header: judul + kode + persen -->
            <div class="row items-start justify-between q-mb-xs">
              <div class="text-left">
                <div class="row items-center q-gutter-xs q-mb-xs">
                  <q-badge v-if="prog.kode" color="primary" :label="prog.kode" />
                  <q-badge v-if="prog.divisi" outline color="grey-6" :label="prog.divisi.nama" />
                </div>
                <span class="text-subtitle2 text-weight-bold text-primary">{{ prog.judul }}</span>
              </div>
              <q-chip dense color="primary" text-color="white" size="sm" class="q-ml-sm">
                {{ progressPercent(prog) }}%
              </q-chip>
            </div>
            <q-linear-progress
              rounded size="12px"
              :value="progressValue(prog)"
              color="primary" track-color="grey-3"
              class="q-mb-sm"
            />
            <div class="row justify-between q-mt-xs">
              <span class="text-caption text-grey-6">Terkumpul: <strong>{{ formatCurrency(prog.terkumpul) }}</strong></span>
              <span class="text-caption text-grey-6">Target: {{ formatCurrency(prog.target) }}</span>
            </div>
            <div v-if="Number(prog.target) > Number(prog.terkumpul)" class="text-caption text-orange-8 q-mt-xs text-right">
              Sisa: {{ formatCurrency(Number(prog.target) - Number(prog.terkumpul)) }}
            </div>
            <div v-if="prog.deskripsi" class="text-caption text-grey-7 q-mt-xs text-left">{{ prog.deskripsi }}</div>
            <div class="text-right q-mt-sm">
              <q-btn
                unelevated dense no-caps size="sm"
                label="Infaq Program Ini" icon="volunteer_activism"
                color="primary" class="q-px-md"
                :to="`/donasi${prog.kode ? '?program=' + prog.kode : ''}`"
              />
            </div>
          </q-card>
        </template>

        <!-- Program Wakaf dari API -->
        <template v-if="wakafPrograms.length">
          <div class="text-subtitle1 text-weight-bold q-mb-sm q-mt-lg" style="opacity: 0.9">
            <q-icon name="mosque" size="18px" class="q-mr-xs" />Program Wakaf
          </div>
          <q-card
            v-for="prog in wakafPrograms"
            :key="prog.id"
            flat class="rounded-xl bg-white text-dark q-pa-lg q-mb-md"
          >
            <!-- Header: kegiatan + kode + persen -->
            <div class="row items-start justify-between q-mb-xs">
              <div class="text-left">
                <div class="row items-center q-gutter-xs q-mb-xs">
                  <q-badge v-if="prog.kode" color="teal" :label="prog.kode" />
                  <q-badge v-if="prog.divisi" outline color="grey-6" :label="prog.divisi.nama" />
                </div>
                <span class="text-subtitle2 text-weight-bold text-teal">{{ prog.kegiatan }}</span>
              </div>
              <q-chip dense color="teal" text-color="white" size="sm" class="q-ml-sm">
                {{ progressPercent(prog) }}%
              </q-chip>
            </div>
            <q-linear-progress
              rounded size="12px"
              :value="progressValue(prog)"
              color="teal" track-color="grey-3"
              class="q-mb-sm"
            />
            <div class="row justify-between q-mt-xs">
              <span class="text-caption text-grey-6">Terkumpul: <strong>{{ formatCurrency(prog.terkumpul) }}</strong></span>
              <span class="text-caption text-grey-6">Target: {{ formatCurrency(prog.target) }}</span>
            </div>
            <div v-if="Number(prog.target) > Number(prog.terkumpul)" class="text-caption text-orange-8 q-mt-xs text-right">
              Sisa: {{ formatCurrency(Number(prog.target) - Number(prog.terkumpul)) }}
            </div>
            <div v-if="prog.deskripsi" class="text-caption text-grey-7 q-mt-xs text-left">{{ prog.deskripsi }}</div>
            <div class="text-right q-mt-sm">
              <q-btn
                unelevated dense no-caps size="sm"
                label="Wakaf Sekarang" icon="mosque"
                color="teal" class="q-px-md"
                :to="`/donasi${prog.kode ? '?program=' + prog.kode : ''}`"
              />
            </div>
          </q-card>
        </template>

        <!-- Fallback jika belum ada program -->
        <q-card v-if="!programs.length && !wakafPrograms.length" flat class="rounded-xl bg-white text-dark q-pa-lg">
          <q-icon name="info_outline" color="grey-5" size="32px" class="q-mb-sm" />
          <div class="text-subtitle2 text-grey-6">Belum ada program aktif saat ini.</div>
          <div class="text-caption text-grey-5 q-mt-xs">Silakan cek kembali nanti.</div>
        </q-card>
      </template>

      <!-- Catatan transparansi -->
      <div class="q-mt-xl text-caption text-center" style="opacity: 0.65; line-height: 1.7; max-width: 560px; margin: 0 auto">
        <q-icon name="info" size="14px" class="q-mr-xs" />
        Jumlah infaq/wakaf yang tertera di atas hanya mencakup infaq/wakaf yang telah dikonfirmasi melalui aplikasi website ini.
        Infaq/wakaf yang belum melakukan konfirmasi belum tercatat dalam total tersebut.
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from 'src/boot/axios';

const programs = ref([]);
const wakafPrograms = ref([]);
const loading = ref(true);
const fetchError = ref(false);

const totalProgram = computed(() => programs.value.length + wakafPrograms.value.length);

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const progressValue = (prog) =>
  prog.target > 0 ? Math.min(Number(prog.terkumpul) / Number(prog.target), 1) : 0;

const progressPercent = (prog) =>
  prog.target > 0 ? Math.min(Math.round((Number(prog.terkumpul) / Number(prog.target)) * 100), 100) : 0;

onMounted(async () => {
  try {
    const [donasiRes, wakafRes] = await Promise.all([
      api.get('/donasi/program'),
      api.get('/donasi/wakaf'),
    ]);
    programs.value = donasiRes.data.data;
    wakafPrograms.value = wakafRes.data.data;
  } catch {
    fetchError.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.donasi-section {
  background: linear-gradient(135deg, #1B7A4A 0%, #D4AF37 100%);
  padding: 80px 0;
}
</style>

