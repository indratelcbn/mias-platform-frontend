<template>
  <q-page class="flex flex-center bg-grey-1" style="min-height:100vh">
    <q-card flat bordered style="width:100%; max-width:480px; border-radius:16px" class="q-ma-md">
      <!-- Header -->
      <div
        class="q-pa-lg text-center"
        :class="hasilData?.isPassed ? 'bg-positive' : (hasilData ? 'bg-negative' : 'bg-primary')"
        style="border-radius:16px 16px 0 0"
      >
        <q-icon
          :name="hasilData?.isPassed ? 'emoji_events' : (hasilData ? 'cancel' : 'quiz')"
          color="white"
          size="52px"
        />
        <div class="text-h5 text-white text-weight-bold q-mt-sm">
          {{ hasilData?.isPassed ? 'Selamat, Lulus!' : (hasilData ? 'Belum Lulus' : 'Hasil Ujian') }}
        </div>
      </div>

      <q-card-section class="q-pa-lg">
        <!-- Loading -->
        <div v-if="loading" class="text-center q-py-xl">
          <q-spinner color="primary" size="36px" />
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-center">
          <q-icon name="info" color="grey-5" size="36px" />
          <div class="text-body1 q-mt-sm text-grey-7">{{ error }}</div>
        </div>

        <!-- Hasil -->
        <template v-else-if="hasilData">
          <div class="q-mb-md text-center">
            <div class="text-caption text-grey-6">Peserta</div>
            <div class="text-h6">{{ hasilData.namaLengkap }}</div>
          </div>

          <div class="text-center q-mb-lg">
            <div class="text-caption text-grey-6">Ujian</div>
            <div class="text-weight-medium"><arabic-text :text="hasilData.judul" /></div>
          </div>

          <template v-if="hasilData.tampilNilai">
            <div class="text-center q-mb-md">
              <div class="text-caption text-grey-6 q-mb-xs">Nilai</div>
              <div class="text-h2 text-weight-bold" :class="hasilData.isPassed ? 'text-positive' : 'text-negative'">
                {{ hasilData.score?.toFixed(1) }}
              </div>
              <div class="text-caption text-grey-6">Nilai kelulusan: {{ hasilData.passingGrade }}</div>
            </div>

            <q-separator class="q-my-md" />

            <div class="text-center">
              <q-badge
                :color="hasilData.isPassed ? 'positive' : 'negative'"
                :label="hasilData.isPassed ? 'LULUS' : 'TIDAK LULUS'"
                style="font-size:16px; padding:8px 24px; border-radius:20px"
              />
            </div>
          </template>

          <template v-else>
            <div class="text-center text-grey-6 q-py-md">
              <q-icon name="lock" size="32px" />
              <div class="q-mt-sm">Nilai tidak ditampilkan. Hubungi penyelenggara ujian.</div>
            </div>
          </template>

          <div class="text-caption text-grey-5 text-center q-mt-md">
            Selesai: {{ hasilData.finishedAt ? new Date(hasilData.finishedAt).toLocaleString('id-ID') : '–' }}
          </div>
        </template>
      </q-card-section>

      <q-card-actions class="q-pa-md">
        <q-btn outline color="primary" label="Kembali ke Halaman Ujian" class="full-width" :to="{ name: 'ujian' }" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from 'src/boot/axios';
import ArabicText from 'components/ArabicText.vue';

const route = useRoute();
const loading = ref(true);
const hasilData = ref(null);
const error = ref('');

onMounted(async () => {
  try {
    const { data } = await api.get(`/ujian/sesi/${route.params.pesertaId}/hasil`);
    if (data.success) hasilData.value = data.data;
    else error.value = data.message;
  } catch (err) {
    error.value = err.response?.data?.message || 'Gagal memuat hasil ujian.';
  } finally {
    loading.value = false;
  }
});
</script>
